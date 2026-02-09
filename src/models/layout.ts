/**
 * Layout type definitions
 *
 * Defines the structure of a layout (nodes and connections)
 * used in the visual editor.
 */

import type { Equipment } from './equipment'

/**
 * Position on the canvas
 */
export interface Position {
  x: number
  y: number
}

/**
 * A node in the layout (placed equipment)
 */
export interface LayoutNode {
  id: string
  equipmentId: string      // Reference to equipment catalog
  position: Position       // Position on canvas
  elevation: number        // Meters above sea level (moh)

  // Calculated values (updated by engine)
  pressure?: number        // Current pressure at this point (bar)
  flow?: number           // Current flow at this point (l/min)
}

/**
 * A connection between two nodes
 */
export interface LayoutEdge {
  id: string
  sourceId: string         // Source node ID
  targetId: string         // Target node ID
  sourceHandle?: string    // For connectors with multiple outputs
  targetHandle?: string    // For connectors with multiple inputs
}

/**
 * Complete layout state
 */
export interface Layout {
  id: string
  name?: string
  nodes: LayoutNode[]
  edges: LayoutEdge[]
  createdAt: number        // Unix timestamp
  updatedAt: number        // Unix timestamp
}

/**
 * Create a new empty layout
 */
export function createEmptyLayout(id?: string): Layout {
  const now = Date.now()
  return {
    id: id ?? crypto.randomUUID(),
    nodes: [],
    edges: [],
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * Create a new layout node
 */
export function createNode(
  equipment: Equipment,
  position: Position,
  elevation: number = 0
): LayoutNode {
  return {
    id: crypto.randomUUID(),
    equipmentId: equipment.id,
    position,
    elevation,
  }
}

/**
 * Create a new edge between nodes
 */
export function createEdge(
  sourceId: string,
  targetId: string,
  sourceHandle?: string,
  targetHandle?: string
): LayoutEdge {
  return {
    id: crypto.randomUUID(),
    sourceId,
    targetId,
    sourceHandle,
    targetHandle,
  }
}
