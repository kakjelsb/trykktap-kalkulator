/**
 * Equipment type definitions
 *
 * Defines all equipment types used in the pressure calculator.
 * Each equipment has properties relevant to pressure/flow calculations.
 */

export type EquipmentCategory = 'source' | 'pump' | 'hose' | 'connector' | 'terminal'

export interface BaseEquipment {
  id: string
  type: EquipmentCategory
  nameKey: string      // i18n key for display name
  descKey: string      // i18n key for description
}

export interface SourceEquipment extends BaseEquipment {
  type: 'source'
}

export interface PumpEquipment extends BaseEquipment {
  type: 'pump'
  maxPressure: number  // bar (operational max = 10)
  maxFlow: number      // l/min
}

export interface HoseEquipment extends BaseEquipment {
  type: 'hose'
  diameter: number     // mm (internal)
  diameterLabel: string // Display label e.g. "1½""
  length: number       // meters (fixed 20m sections)
  frictionCoefficient: number // For Hazen-Williams calculation
}

export interface ConnectorEquipment extends BaseEquipment {
  type: 'connector'
  inputs: number       // Number of input connections
  outputs: number      // Number of output connections
  pressureLoss: number // Fixed pressure loss in bar
}

export interface TerminalEquipment extends BaseEquipment {
  type: 'terminal'
  minPressure: number  // Minimum required pressure in bar
  maxPressure: number  // Maximum operating pressure in bar
  minFlow: number      // Minimum flow rate l/min
  maxFlow: number      // Maximum flow rate l/min
}

export type Equipment =
  | SourceEquipment
  | PumpEquipment
  | HoseEquipment
  | ConnectorEquipment
  | TerminalEquipment

/**
 * Equipment catalog - all available equipment in the MVP
 */
export const equipmentCatalog: Equipment[] = [
  // Source
  {
    id: 'source',
    type: 'source',
    nameKey: 'equipment.source',
    descKey: 'equipment.sourceDesc',
  },

  // Pumps
  {
    id: 'pump-ziegler',
    type: 'pump',
    nameKey: 'equipment.ziegler',
    descKey: 'equipment.zieglerDesc',
    maxPressure: 10,
    maxFlow: 3000,
  },
  {
    id: 'pump-otter',
    type: 'pump',
    nameKey: 'equipment.otter',
    descKey: 'equipment.otterDesc',
    maxPressure: 10,
    maxFlow: 800,
  },

  // Hoses (20m sections)
  {
    id: 'hose-1.5',
    type: 'hose',
    nameKey: 'equipment.hose1_5',
    descKey: 'equipment.hose1_5Desc',
    diameter: 38,
    diameterLabel: '1½"',
    length: 20,
    frictionCoefficient: 0.5, // ~0.5 bar per 20m section at typical flow
  },
  {
    id: 'hose-2.5',
    type: 'hose',
    nameKey: 'equipment.hose2_5',
    descKey: 'equipment.hose2_5Desc',
    diameter: 65,
    diameterLabel: '2½"',
    length: 20,
    frictionCoefficient: 0.15, // ~0.15 bar per 20m section
  },
  {
    id: 'hose-4',
    type: 'hose',
    nameKey: 'equipment.hose4',
    descKey: 'equipment.hose4Desc',
    diameter: 102,
    diameterLabel: '4"',
    length: 20,
    frictionCoefficient: 0.02, // ~0.02 bar per 20m section
  },

  // Connectors
  {
    id: 'splitter-2',
    type: 'connector',
    nameKey: 'equipment.splitter2',
    descKey: 'equipment.splitter2Desc',
    inputs: 1,
    outputs: 2,
    pressureLoss: 0.2,
  },
  {
    id: 'splitter-3',
    type: 'connector',
    nameKey: 'equipment.splitter3',
    descKey: 'equipment.splitter3Desc',
    inputs: 1,
    outputs: 3,
    pressureLoss: 0.3,
  },

  // Terminals
  {
    id: 'terminal-cannon',
    type: 'terminal',
    nameKey: 'equipment.waterCannon',
    descKey: 'equipment.waterCannonDesc',
    minPressure: 6,
    maxPressure: 8,
    minFlow: 500,
    maxFlow: 2000,
  },
  {
    id: 'terminal-wall',
    type: 'terminal',
    nameKey: 'equipment.fireWall',
    descKey: 'equipment.fireWallDesc',
    minPressure: 4,
    maxPressure: 6,
    minFlow: 200,
    maxFlow: 400,
  },
]

/**
 * Get equipment by ID
 */
export function getEquipmentById(id: string): Equipment | undefined {
  return equipmentCatalog.find(e => e.id === id)
}

/**
 * Get equipment by category
 */
export function getEquipmentByCategory(category: EquipmentCategory): Equipment[] {
  return equipmentCatalog.filter(e => e.type === category)
}
