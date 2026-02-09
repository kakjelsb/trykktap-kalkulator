/**
 * Equipment icons - single source of truth
 * Used by both Palette and node components
 */

export const equipmentIcons: Record<string, string> = {
  // Source
  'source': '💧',

  // Pumps
  'pump-ziegler': '⛽',
  'pump-otter': '⛽',

  // Hoses
  'hose-1.5': '〰️',
  'hose-2.5': '〰️',
  'hose-4': '〰️',

  // Connectors
  'splitter-2': '🔀',
  'splitter-3': '🔀',

  // Terminals
  'terminal-cannon': '🚿',
  'terminal-wall': '🧱',
}

/** Get equipment icon by ID, with fallback */
export function getEquipmentIcon(equipmentId: string): string {
  return equipmentIcons[equipmentId] || '📦'
}

/** Equipment type to color mapping */
export const equipmentColors: Record<string, string> = {
  'source': '#3b82f6',
  'pump': '#dc2626',
  'hose': '#f59e0b',
  'connector': '#8b5cf6',
  'terminal': '#10b981',
}

/** Get color for equipment type */
export function getEquipmentColor(equipmentType: string): string {
  return equipmentColors[equipmentType] || '#6b7280'
}
