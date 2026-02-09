/**
 * Friction loss calculation using Hazen-Williams formula
 *
 * Calculates pressure loss due to friction in fire hoses.
 *
 * Hazen-Williams formula:
 * ΔP = (10.67 × Q^1.852 × L) / (C^1.852 × D^4.87)
 *
 * Where:
 *   Q = Flow rate (m³/s)
 *   L = Hose length (m)
 *   C = Roughness coefficient (~120 for fire hose)
 *   D = Internal diameter (m)
 *   ΔP = Pressure loss (meters of head)
 *
 * Result is converted from meters of head to bar (÷10)
 */

/** Hazen-Williams roughness coefficient for fire hose */
const HAZEN_WILLIAMS_C = 120

/** Standard hose section length in meters */
export const HOSE_SECTION_LENGTH = 20

/**
 * Calculate friction loss using Hazen-Williams formula
 * @param flowRateLpm - Flow rate in liters per minute
 * @param diameterMm - Internal hose diameter in millimeters
 * @param lengthM - Hose length in meters (default: 20m section)
 * @param c - Hazen-Williams coefficient (default: 120 for fire hose)
 * @returns Pressure loss in bar
 */
export function calculateFrictionLoss(
  flowRateLpm: number,
  diameterMm: number,
  lengthM: number = HOSE_SECTION_LENGTH,
  c: number = HAZEN_WILLIAMS_C
): number {
  // Handle edge cases
  if (flowRateLpm <= 0 || diameterMm <= 0 || lengthM <= 0) {
    return 0
  }

  // Convert units
  const flowRateM3s = flowRateLpm / 60000 // l/min to m³/s
  const diameterM = diameterMm / 1000     // mm to m

  // Hazen-Williams formula: ΔP = (10.67 × Q^1.852 × L) / (C^1.852 × D^4.87)
  // Result is in meters of head
  const pressureLossHead = (10.67 * Math.pow(flowRateM3s, 1.852) * lengthM) /
                           (Math.pow(c, 1.852) * Math.pow(diameterM, 4.87))

  // Convert meters of head to bar (1 bar ≈ 10.2m head, simplified to 10)
  const pressureLossBar = pressureLossHead / 10

  return pressureLossBar
}

/**
 * Calculate friction loss for a standard 20m hose section
 * @param flowRateLpm - Flow rate in liters per minute
 * @param diameterMm - Internal hose diameter in millimeters
 * @returns Pressure loss in bar for one 20m section
 */
export function calculateFrictionLossPerSection(
  flowRateLpm: number,
  diameterMm: number
): number {
  return calculateFrictionLoss(flowRateLpm, diameterMm, HOSE_SECTION_LENGTH)
}

/**
 * Simplified friction loss using pre-calculated coefficients
 * Uses the equipment's frictionCoefficient property at a reference flow rate
 *
 * @param frictionCoefficient - Equipment's friction coefficient (bar per section at reference flow)
 * @param flowRateLpm - Actual flow rate in liters per minute
 * @param referenceFlowLpm - Reference flow rate the coefficient was calculated at (default: 500 l/min)
 * @returns Pressure loss in bar
 */
export function calculateSimplifiedFrictionLoss(
  frictionCoefficient: number,
  flowRateLpm: number,
  referenceFlowLpm: number = 500
): number {
  if (flowRateLpm <= 0 || frictionCoefficient <= 0) {
    return 0
  }

  // Friction loss scales approximately with flow^2
  // ΔP_actual = ΔP_ref × (Q_actual / Q_ref)²
  const flowRatio = flowRateLpm / referenceFlowLpm
  return frictionCoefficient * Math.pow(flowRatio, 2)
}

/**
 * Get typical flow rate for terminal types
 * @param terminalType - Type of terminal ('terminal-cannon' or 'terminal-wall')
 * @returns Typical flow rate in l/min
 */
export function getTypicalFlowRate(terminalType: string): number {
  switch (terminalType) {
    case 'terminal-cannon':
      return 1000 // Middle of 500-2000 l/min range
    case 'terminal-wall':
      return 300  // Middle of 200-400 l/min range
    default:
      return 500  // Default reference flow
  }
}

/**
 * Calculate total friction loss for multiple hose sections
 * @param flowRateLpm - Flow rate in liters per minute
 * @param diameterMm - Internal hose diameter in millimeters
 * @param sectionCount - Number of 20m sections
 * @returns Total pressure loss in bar
 */
export function calculateTotalFrictionLoss(
  flowRateLpm: number,
  diameterMm: number,
  sectionCount: number
): number {
  return calculateFrictionLoss(flowRateLpm, diameterMm, HOSE_SECTION_LENGTH * sectionCount)
}
