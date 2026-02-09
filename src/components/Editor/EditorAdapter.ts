/**
 * Editor Adapter Interface
 *
 * Abstraction layer for the visual editor, allowing the underlying
 * library (React Flow) to be swapped without changing business logic.
 */

import type { Layout, LayoutNode, LayoutEdge, Equipment, Position } from '../../models'

export interface EditorAdapter {
  /** Add a new node to the canvas */
  addNode(equipment: Equipment, position: Position, elevation?: number): LayoutNode

  /** Remove a node and its connected edges */
  removeNode(nodeId: string): void

  /** Update node properties */
  updateNode(nodeId: string, updates: Partial<Pick<LayoutNode, 'position' | 'elevation'>>): void

  /** Connect two nodes */
  connect(sourceId: string, targetId: string, sourceHandle?: string): LayoutEdge | null

  /** Disconnect an edge */
  disconnect(edgeId: string): void

  /** Get the current layout */
  getLayout(): Layout

  /** Load a layout */
  setLayout(layout: Layout): void

  /** Clear the layout */
  clear(): void
}
