/**
 * Graph traversal algorithm for pressure calculations
 *
 * Traverses the layout graph from sources/pumps to terminals,
 * calculating pressure at each node based on:
 * - Pump output pressure (resets to max)
 * - Elevation changes
 * - Friction losses in hoses
 * - Connector losses
 */

import type { Layout, LayoutNode, LayoutEdge } from '../models/layout'
import type {
  CalculationResult,
  NodeCalculation,
  PathCalculation,
  CalculationError,
  PressureStatus
} from '../models/calculation'
import { getPressureStatus } from '../models/calculation'
import {
  getEquipmentById,
  type Equipment,
  type PumpEquipment,
  type HoseEquipment,
  type ConnectorEquipment,
  type TerminalEquipment
} from '../models/equipment'
import { calculateElevationPressureChange } from './elevation'
import { calculateSimplifiedFrictionLoss, getTypicalFlowRate } from './friction'

/** Default flow rate for calculations when not specified */
const DEFAULT_FLOW_RATE = 500 // l/min

/**
 * Build adjacency list from layout edges
 * Maps each node ID to its downstream (target) connections
 */
function buildAdjacencyList(edges: LayoutEdge[]): Map<string, LayoutEdge[]> {
  const adjacency = new Map<string, LayoutEdge[]>()

  for (const edge of edges) {
    const existing = adjacency.get(edge.sourceId) || []
    existing.push(edge)
    adjacency.set(edge.sourceId, existing)
  }

  return adjacency
}

/**
 * Find all starting nodes (sources and pumps without incoming edges)
 */
function findStartNodes(layout: Layout): LayoutNode[] {
  const nodesWithIncoming = new Set<string>()

  for (const edge of layout.edges) {
    nodesWithIncoming.add(edge.targetId)
  }

  return layout.nodes.filter(node => {
    const equipment = getEquipmentById(node.equipmentId)
    if (!equipment) return false

    // Sources are always start nodes
    if (equipment.type === 'source') return true

    // Pumps without incoming connections are start nodes
    if (equipment.type === 'pump' && !nodesWithIncoming.has(node.id)) return true

    return false
  })
}

/**
 * Calculate pressure loss for a single node based on equipment type
 */
function calculateNodePressureLoss(
  equipment: Equipment,
  fromElevation: number,
  toElevation: number,
  flowRate: number
): { elevationLoss: number; frictionLoss: number; totalLoss: number } {
  let elevationLoss = 0
  let frictionLoss = 0

  // Calculate elevation loss (can be negative if going downhill)
  const elevationChange = calculateElevationPressureChange(fromElevation, toElevation)
  elevationLoss = -elevationChange // Convert to loss (positive when going up)

  // Calculate friction/equipment loss based on type
  switch (equipment.type) {
    case 'hose': {
      const hose = equipment as HoseEquipment
      frictionLoss = calculateSimplifiedFrictionLoss(hose.frictionCoefficient, flowRate)
      break
    }
    case 'connector': {
      const connector = equipment as ConnectorEquipment
      frictionLoss = connector.pressureLoss
      break
    }
    // Sources and terminals don't cause friction loss
    // Pumps reset pressure, handled separately
  }

  return {
    elevationLoss,
    frictionLoss,
    totalLoss: elevationLoss + frictionLoss,
  }
}

/**
 * Get the minimum required pressure for a terminal
 */
function getTerminalMinPressure(equipment: Equipment): number {
  if (equipment.type === 'terminal') {
    return (equipment as TerminalEquipment).minPressure
  }
  return 6 // Default minimum
}

/**
 * Traverse the graph from a starting node, calculating pressure at each node
 */
function traverseFromNode(
  startNode: LayoutNode,
  startPressure: number,
  layout: Layout,
  adjacency: Map<string, LayoutEdge[]>,
  nodeCalculations: Map<string, NodeCalculation>,
  currentPath: string[],
  paths: PathCalculation[],
  errors: CalculationError[],
  flowRate: number,
  visited: Set<string>
): void {
  const nodeMap = new Map(layout.nodes.map(n => [n.id, n]))

  // Recursive traversal function
  function traverse(
    node: LayoutNode,
    incomingPressure: number,
    previousElevation: number,
    path: string[]
  ): void {
    // Prevent infinite loops
    if (visited.has(node.id)) {
      return
    }
    visited.add(node.id)

    const equipment = getEquipmentById(node.equipmentId)
    if (!equipment) {
      errors.push({
        type: 'invalid_connection',
        message: `Unknown equipment: ${node.equipmentId}`,
        nodeIds: [node.id],
      })
      return
    }

    let pressure = incomingPressure
    let elevationLoss = 0
    let frictionLoss = 0

    // Handle pump - resets pressure to max output
    if (equipment.type === 'pump') {
      const pump = equipment as PumpEquipment
      pressure = pump.maxPressure
      elevationLoss = 0
      frictionLoss = 0
    } else if (equipment.type !== 'source') {
      // Calculate losses for non-source, non-pump nodes
      const losses = calculateNodePressureLoss(
        equipment,
        previousElevation,
        node.elevation,
        flowRate
      )
      elevationLoss = losses.elevationLoss
      frictionLoss = losses.frictionLoss
      pressure = incomingPressure - losses.totalLoss
    }

    // Determine status based on equipment type
    let status: PressureStatus = 'good'
    if (equipment.type === 'terminal') {
      const minPressure = getTerminalMinPressure(equipment)
      status = getPressureStatus(pressure, minPressure)

      if (status === 'low') {
        errors.push({
          type: 'pressure_low',
          message: `Insufficient pressure at terminal: ${pressure.toFixed(1)} bar (requires ${minPressure} bar)`,
          nodeIds: [node.id],
        })
      }
    } else {
      // For non-terminals, warn if pressure drops below 2 bar
      status = getPressureStatus(pressure, 2)
    }

    // Store calculation result
    const calculation: NodeCalculation = {
      nodeId: node.id,
      pressure: Math.max(0, pressure), // Don't show negative pressure
      flow: flowRate,
      pressureLoss: elevationLoss + frictionLoss,
      elevationLoss,
      frictionLoss,
      status,
    }
    nodeCalculations.set(node.id, calculation)

    // Update path
    const currentPath = [...path, node.id]

    // If this is a terminal, record the complete path
    if (equipment.type === 'terminal') {
      const pathCalc: PathCalculation = {
        pathId: crypto.randomUUID(),
        nodeIds: currentPath,
        totalPressureLoss: startPressure - pressure,
        totalElevationLoss: currentPath.reduce((sum, id) => {
          const calc = nodeCalculations.get(id)
          return sum + (calc?.elevationLoss || 0)
        }, 0),
        totalFrictionLoss: currentPath.reduce((sum, id) => {
          const calc = nodeCalculations.get(id)
          return sum + (calc?.frictionLoss || 0)
        }, 0),
        terminalPressure: pressure,
        terminalStatus: status,
      }
      paths.push(pathCalc)
      return
    }

    // Continue to downstream nodes
    const outgoingEdges = adjacency.get(node.id) || []
    for (const edge of outgoingEdges) {
      const targetNode = nodeMap.get(edge.targetId)
      if (targetNode) {
        traverse(targetNode, pressure, node.elevation, currentPath)
      }
    }
  }

  // Start traversal
  traverse(startNode, startPressure, startNode.elevation, currentPath)
}

/**
 * Calculate pressure throughout the entire layout
 * @param layout - The layout to calculate
 * @param flowRate - Flow rate in l/min (optional, will estimate from terminals)
 * @returns Calculation results with pressure at each node
 */
export function calculateLayout(
  layout: Layout,
  flowRate?: number
): CalculationResult {
  const nodeCalculations = new Map<string, NodeCalculation>()
  const paths: PathCalculation[] = []
  const errors: CalculationError[] = []

  // Handle empty layout
  if (layout.nodes.length === 0) {
    return {
      isValid: true,
      errors: [],
      nodes: nodeCalculations,
      paths: [],
    }
  }

  // Build adjacency list for efficient traversal
  const adjacency = buildAdjacencyList(layout.edges)

  // Find starting nodes (sources and standalone pumps)
  const startNodes = findStartNodes(layout)

  if (startNodes.length === 0) {
    // Check if there are any pumps at all
    const hasPump = layout.nodes.some(n => {
      const eq = getEquipmentById(n.equipmentId)
      return eq?.type === 'pump'
    })

    if (!hasPump) {
      errors.push({
        type: 'no_pump',
        message: 'No pump found in the layout',
      })
    }
  }

  // Estimate flow rate from terminals if not provided
  const estimatedFlowRate = flowRate ?? estimateFlowRate(layout)

  // Traverse from each starting node
  const visited = new Set<string>()
  for (const startNode of startNodes) {
    const equipment = getEquipmentById(startNode.equipmentId)

    // Determine starting pressure
    let startPressure = 0
    if (equipment?.type === 'pump') {
      startPressure = (equipment as PumpEquipment).maxPressure
    } else if (equipment?.type === 'source') {
      // Source has no pressure, need a pump downstream
      startPressure = 0
    }

    // Set calculation for the start node itself
    nodeCalculations.set(startNode.id, {
      nodeId: startNode.id,
      pressure: startPressure,
      flow: estimatedFlowRate,
      pressureLoss: 0,
      elevationLoss: 0,
      frictionLoss: 0,
      status: startPressure > 0 ? 'good' : 'ok',
    })

    // Traverse downstream
    const outgoingEdges = adjacency.get(startNode.id) || []
    const nodeMap = new Map(layout.nodes.map(n => [n.id, n]))

    for (const edge of outgoingEdges) {
      const targetNode = nodeMap.get(edge.targetId)
      if (targetNode) {
        traverseFromNode(
          targetNode,
          startPressure,
          layout,
          adjacency,
          nodeCalculations,
          [startNode.id],
          paths,
          errors,
          estimatedFlowRate,
          visited
        )
      }
    }
  }

  // Check for nodes not reached by traversal (disconnected)
  for (const node of layout.nodes) {
    if (!nodeCalculations.has(node.id)) {
      const equipment = getEquipmentById(node.equipmentId)

      // Add a default calculation for unreached nodes
      nodeCalculations.set(node.id, {
        nodeId: node.id,
        pressure: 0,
        flow: 0,
        pressureLoss: 0,
        elevationLoss: 0,
        frictionLoss: 0,
        status: 'low',
      })

      // Only warn about disconnected terminals
      if (equipment?.type === 'terminal') {
        errors.push({
          type: 'no_path',
          message: 'Terminal is not connected to a pump',
          nodeIds: [node.id],
        })
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    nodes: nodeCalculations,
    paths,
  }
}

/**
 * Estimate total flow rate based on terminals in the layout
 */
function estimateFlowRate(layout: Layout): number {
  let totalFlow = 0
  let terminalCount = 0

  for (const node of layout.nodes) {
    const equipment = getEquipmentById(node.equipmentId)
    if (equipment?.type === 'terminal') {
      totalFlow += getTypicalFlowRate(equipment.id)
      terminalCount++
    }
  }

  // If no terminals, use default
  if (terminalCount === 0) {
    return DEFAULT_FLOW_RATE
  }

  return totalFlow
}

/**
 * Get downstream nodes from a given node
 */
export function getDownstreamNodes(
  nodeId: string,
  layout: Layout
): LayoutNode[] {
  const adjacency = buildAdjacencyList(layout.edges)
  const nodeMap = new Map(layout.nodes.map(n => [n.id, n]))
  const edges = adjacency.get(nodeId) || []

  return edges
    .map(e => nodeMap.get(e.targetId))
    .filter((n): n is LayoutNode => n !== undefined)
}

/**
 * Get upstream nodes (nodes that connect to this node)
 */
export function getUpstreamNodes(
  nodeId: string,
  layout: Layout
): LayoutNode[] {
  const nodeMap = new Map(layout.nodes.map(n => [n.id, n]))
  const upstreamEdges = layout.edges.filter(e => e.targetId === nodeId)

  return upstreamEdges
    .map(e => nodeMap.get(e.sourceId))
    .filter((n): n is LayoutNode => n !== undefined)
}
