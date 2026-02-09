/**
 * Calculation result types
 *
 * Types for pressure/flow calculation results.
 */

export type PressureStatus = 'good' | 'ok' | 'low'

/**
 * Calculated state for a single node
 */
export interface NodeCalculation {
  nodeId: string
  pressure: number         // Pressure at this node (bar)
  flow: number            // Flow at this node (l/min)
  pressureLoss: number    // Pressure lost getting to this node (bar)
  elevationLoss: number   // Loss from elevation change (bar)
  frictionLoss: number    // Loss from hose friction (bar)
  status: PressureStatus  // Visual status indicator
}

/**
 * Calculation result for a path from pump to terminal
 */
export interface PathCalculation {
  pathId: string
  nodeIds: string[]        // Ordered list of node IDs in the path
  totalPressureLoss: number
  totalElevationLoss: number
  totalFrictionLoss: number
  terminalPressure: number
  terminalStatus: PressureStatus
}

/**
 * Complete calculation results for the layout
 */
export interface CalculationResult {
  isValid: boolean
  errors: CalculationError[]
  nodes: Map<string, NodeCalculation>
  paths: PathCalculation[]
}

/**
 * Calculation error
 */
export interface CalculationError {
  type: 'no_pump' | 'no_path' | 'pressure_low' | 'flow_exceeded' | 'invalid_connection'
  message: string
  nodeIds?: string[]
}

/**
 * Get pressure status based on thresholds
 */
export function getPressureStatus(pressure: number, minRequired: number = 6): PressureStatus {
  if (pressure >= minRequired + 2) return 'good'
  if (pressure >= minRequired) return 'ok'
  return 'low'
}
