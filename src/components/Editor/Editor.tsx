/**
 * Visual Editor Component
 *
 * React Flow wrapper for building equipment layouts.
 * Mobile-optimized with touch support.
 */

import { useCallback, useEffect, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type IsValidConnection,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useLayoutStore } from '../../store'
import { getEquipmentById, type EquipmentCategory, type HoseEquipment, type ConnectorEquipment, type TerminalEquipment, type PumpEquipment } from '../../models'
import type { NodeCalculation } from '../../models/calculation'
import { calculateLayout } from '../../engine'
import { t } from '../../i18n'
import {
  SourceNode,
  PumpNode,
  HoseNode,
  SplitterNode,
  TerminalNode,
  type BaseNodeData,
} from './nodes'
import { Warnings } from '../Warnings'
import './Editor.css'

// Register custom node types
const nodeTypes = {
  source: SourceNode,
  pump: PumpNode,
  hose: HoseNode,
  connector: SplitterNode,
  terminal: TerminalNode,
}

/**
 * Connection validation rules:
 * - Source can only output (no inputs)
 * - Terminal can only input (no outputs)
 * - Cannot connect node to itself
 * - Cannot create duplicate connections
 */
const validConnections: Record<EquipmentCategory, EquipmentCategory[]> = {
  source: ['pump', 'hose'],
  pump: ['hose', 'connector', 'terminal'],
  hose: ['hose', 'pump', 'connector', 'terminal'],
  connector: ['hose', 'terminal'],
  terminal: [], // terminals cannot output
}

// Convert our layout node to React Flow node
function toFlowNode(
  layoutNode: { id: string; equipmentId: string; position: { x: number; y: number }; elevation: number },
  onDelete: (nodeId: string) => void,
  calculation?: NodeCalculation
): Node {
  const equipment = getEquipmentById(layoutNode.equipmentId)
  if (!equipment) {
    throw new Error(`Unknown equipment: ${layoutNode.equipmentId}`)
  }

  const baseData: BaseNodeData = {
    label: t.equipment[equipment.nameKey.split('.')[1] as keyof typeof t.equipment] || equipment.id,
    elevation: layoutNode.elevation,
    pressure: calculation?.pressure,
    status: calculation?.status,
    equipmentId: equipment.id,
    onDelete: () => onDelete(layoutNode.id),
  }

  // Add type-specific data
  switch (equipment.type) {
    case 'pump':
      return {
        id: layoutNode.id,
        type: equipment.type,
        position: layoutNode.position,
        data: { ...baseData, maxFlow: (equipment as PumpEquipment).maxFlow },
      }
    case 'hose':
      return {
        id: layoutNode.id,
        type: equipment.type,
        position: layoutNode.position,
        data: { ...baseData, diameterLabel: (equipment as HoseEquipment).diameterLabel },
      }
    case 'connector':
      return {
        id: layoutNode.id,
        type: equipment.type,
        position: layoutNode.position,
        data: { ...baseData, outputs: (equipment as ConnectorEquipment).outputs },
      }
    case 'terminal':
      return {
        id: layoutNode.id,
        type: equipment.type,
        position: layoutNode.position,
        data: { ...baseData, minPressure: (equipment as TerminalEquipment).minPressure },
      }
    default:
      return {
        id: layoutNode.id,
        type: equipment.type,
        position: layoutNode.position,
        data: baseData,
      }
  }
}

// Convert our layout edge to React Flow edge
function toFlowEdge(layoutEdge: { id: string; sourceId: string; targetId: string; sourceHandle?: string }): Edge {
  return {
    id: layoutEdge.id,
    source: layoutEdge.sourceId,
    target: layoutEdge.targetId,
    sourceHandle: layoutEdge.sourceHandle,
    type: 'default',
  }
}

export function Editor() {
  const { layout, addEdge: addLayoutEdge, updateNode, removeNode, removeEdge } = useLayoutStore()

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  // Calculate pressure at each node whenever layout changes
  const calculationResult = useMemo(() => {
    return calculateLayout(layout)
  }, [layout])

  // Sync nodes/edges when layout or calculations change
  useEffect(() => {
    setNodes(layout.nodes.map(node => {
      const calculation = calculationResult.nodes.get(node.id)
      return toFlowNode(node, removeNode, calculation)
    }))
    setEdges(layout.edges.map(toFlowEdge))
  }, [layout.nodes, layout.edges, calculationResult, setNodes, setEdges, removeNode])

  // Validate connections based on equipment type rules
  const isValidConnection = useCallback<IsValidConnection>(
    (connection) => {
      // Cannot connect to self
      if (connection.source === connection.target) return false

      // Find source and target nodes
      const sourceNode = layout.nodes.find(n => n.id === connection.source)
      const targetNode = layout.nodes.find(n => n.id === connection.target)
      if (!sourceNode || !targetNode) return false

      // Get equipment types
      const sourceEquipment = getEquipmentById(sourceNode.equipmentId)
      const targetEquipment = getEquipmentById(targetNode.equipmentId)
      if (!sourceEquipment || !targetEquipment) return false

      // Check if connection is allowed based on equipment types
      const allowedTargets = validConnections[sourceEquipment.type]
      if (!allowedTargets.includes(targetEquipment.type)) return false

      // Check for duplicate connections
      const isDuplicate = layout.edges.some(
        e => e.sourceId === connection.source && e.targetId === connection.target
      )
      if (isDuplicate) return false

      return true
    },
    [layout.nodes, layout.edges]
  )

  // Sync React Flow state with Zustand store
  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        const edge = addLayoutEdge(connection.source, connection.target, connection.sourceHandle ?? undefined)
        if (edge) {
          setEdges((eds) => addEdge(connection, eds))
        }
      }
    },
    [addLayoutEdge, setEdges]
  )

  // Handle node position changes
  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      updateNode(node.id, { position: node.position })
    },
    [updateNode]
  )

  // Handle edge deletion
  const onEdgesDelete = useCallback(
    (deletedEdges: Edge[]) => {
      deletedEdges.forEach((edge) => removeEdge(edge.id))
    },
    [removeEdge]
  )

  return (
    <div className="editor">
      <Warnings errors={calculationResult.errors} />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onEdgesDelete={onEdgesDelete}
        isValidConnection={isValidConnection}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[20, 20]}
        minZoom={0.3}
        maxZoom={2}
        // Mobile touch optimizations
        panOnScroll={false}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={false}
        selectNodesOnDrag={false}
        selectionOnDrag={false}
        // Larger connection radius for touch
        connectionRadius={30}
        // Prevent accidental selections
        selectionKeyCode={null}
        multiSelectionKeyCode={null}
        deleteKeyCode="Delete"
      >
        <Background gap={20} size={1} />
        <Controls
          showInteractive={false}
          showFitView={true}
          showZoom={true}
          position="top-right"
        />
        <MiniMap
          nodeStrokeWidth={3}
          pannable
          zoomable
          className="editor-minimap"
        />
      </ReactFlow>
    </div>
  )
}
