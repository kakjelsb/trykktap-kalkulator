/**
 * Layout store using Zustand
 *
 * Manages the application state for the layout editor.
 */

import { create } from 'zustand'
import {
  type Layout,
  type LayoutNode,
  type LayoutEdge,
  type Position,
  type Equipment,
  createEmptyLayout,
  createNode,
  createEdge,
  getEquipmentById,
} from '../models'

// Default positions for initial nodes
const DEFAULT_SOURCE_POSITION = { x: 100, y: 150 }
const DEFAULT_TERMINAL_POSITION = { x: 500, y: 150 }
const DEFAULT_SOURCE_ELEVATION = 0
const DEFAULT_TERMINAL_ELEVATION = 100

/**
 * Create a layout with default source and terminal nodes
 */
function createInitialLayout(): Layout {
  const layout = createEmptyLayout()
  const now = Date.now()

  // Add source node
  const sourceEquipment = getEquipmentById('source')
  if (sourceEquipment) {
    const sourceNode = createNode(sourceEquipment, DEFAULT_SOURCE_POSITION, DEFAULT_SOURCE_ELEVATION)
    layout.nodes.push(sourceNode)
  }

  // Add terminal node (water cannon)
  const terminalEquipment = getEquipmentById('terminal-cannon')
  if (terminalEquipment) {
    const terminalNode = createNode(terminalEquipment, DEFAULT_TERMINAL_POSITION, DEFAULT_TERMINAL_ELEVATION)
    layout.nodes.push(terminalNode)
  }

  layout.updatedAt = now
  return layout
}

interface LayoutState {
  // Current layout
  layout: Layout

  // Selected node (for editing)
  selectedNodeId: string | null

  // Actions
  addNode: (equipment: Equipment, position: Position, elevation?: number) => LayoutNode
  removeNode: (nodeId: string) => void
  updateNode: (nodeId: string, updates: Partial<Pick<LayoutNode, 'position' | 'elevation'>>) => void

  addEdge: (sourceId: string, targetId: string, sourceHandle?: string, targetHandle?: string) => LayoutEdge | null
  removeEdge: (edgeId: string) => void

  selectNode: (nodeId: string | null) => void

  clearLayout: () => void
  loadLayout: (layout: Layout) => void

  // For persistence
  getLayoutJson: () => string
  loadLayoutFromJson: (json: string) => boolean
}

export const useLayoutStore = create<LayoutState>((set, get) => ({
  layout: createInitialLayout(),
  selectedNodeId: null,

  addNode: (equipment, position, elevation = 0) => {
    const node = createNode(equipment, position, elevation)
    set((state) => ({
      layout: {
        ...state.layout,
        nodes: [...state.layout.nodes, node],
        updatedAt: Date.now(),
      },
    }))
    return node
  },

  removeNode: (nodeId) => {
    set((state) => ({
      layout: {
        ...state.layout,
        nodes: state.layout.nodes.filter((n) => n.id !== nodeId),
        // Also remove any edges connected to this node
        edges: state.layout.edges.filter(
          (e) => e.sourceId !== nodeId && e.targetId !== nodeId
        ),
        updatedAt: Date.now(),
      },
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
    }))
  },

  updateNode: (nodeId, updates) => {
    set((state) => ({
      layout: {
        ...state.layout,
        nodes: state.layout.nodes.map((n) =>
          n.id === nodeId ? { ...n, ...updates } : n
        ),
        updatedAt: Date.now(),
      },
    }))
  },

  addEdge: (sourceId, targetId, sourceHandle, targetHandle) => {
    const { layout } = get()

    // Check if edge already exists
    const exists = layout.edges.some(
      (e) => e.sourceId === sourceId && e.targetId === targetId
    )
    if (exists) return null

    // Check if nodes exist
    const sourceExists = layout.nodes.some((n) => n.id === sourceId)
    const targetExists = layout.nodes.some((n) => n.id === targetId)
    if (!sourceExists || !targetExists) return null

    const edge = createEdge(sourceId, targetId, sourceHandle, targetHandle)
    set((state) => ({
      layout: {
        ...state.layout,
        edges: [...state.layout.edges, edge],
        updatedAt: Date.now(),
      },
    }))
    return edge
  },

  removeEdge: (edgeId) => {
    set((state) => ({
      layout: {
        ...state.layout,
        edges: state.layout.edges.filter((e) => e.id !== edgeId),
        updatedAt: Date.now(),
      },
    }))
  },

  selectNode: (nodeId) => {
    set({ selectedNodeId: nodeId })
  },

  clearLayout: () => {
    set({
      layout: createInitialLayout(),
      selectedNodeId: null,
    })
  },

  loadLayout: (layout) => {
    set({
      layout,
      selectedNodeId: null,
    })
  },

  getLayoutJson: () => {
    return JSON.stringify(get().layout, null, 2)
  },

  loadLayoutFromJson: (json) => {
    try {
      const layout = JSON.parse(json) as Layout
      // Basic validation
      if (!layout.id || !Array.isArray(layout.nodes) || !Array.isArray(layout.edges)) {
        return false
      }
      set({
        layout,
        selectedNodeId: null,
      })
      return true
    } catch {
      return false
    }
  },
}))
