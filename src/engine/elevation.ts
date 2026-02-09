/**
 * Elevation loss calculation
 *
 * Calculates pressure loss/gain due to elevation changes.
 * Rule: 1 bar per 10 meters of elevation change
 *
 * Positive elevation change (going uphill) = pressure loss
 * Negative elevation change (going downhill) = pressure gain
 */

/**
 * Calculate pressure change due to elevation difference
 * @param fromElevation - Starting elevation in meters (moh)
 * @param toElevation - Ending elevation in meters (moh)
 * @returns Pressure change in bar (negative = loss, positive = gain)
 */
export function calculateElevationPressureChange(
  fromElevation: number,
  toElevation: number
): number {
  const elevationDelta = toElevation - fromElevation
  // 1 bar per 10m elevation change
  // Going up (positive delta) = pressure loss (negative return)
  // Going down (negative delta) = pressure gain (positive return)
  return -elevationDelta / 10
}

/**
 * Calculate pressure loss due to elevation increase
 * @param fromElevation - Starting elevation in meters (moh)
 * @param toElevation - Ending elevation in meters (moh)
 * @returns Pressure loss in bar (always positive or zero)
 */
export function calculateElevationLoss(
  fromElevation: number,
  toElevation: number
): number {
  const pressureChange = calculateElevationPressureChange(fromElevation, toElevation)
  // Return only the loss (positive value), or 0 if there's a gain
  return Math.max(0, -pressureChange)
}

/**
 * Calculate the maximum elevation that can be reached from a given pressure
 * @param availablePressure - Available pressure in bar
 * @param currentElevation - Current elevation in meters (moh)
 * @returns Maximum reachable elevation in meters (moh)
 */
export function calculateMaxReachableElevation(
  availablePressure: number,
  currentElevation: number
): number {
  // Each bar can lift water 10 meters
  return currentElevation + (availablePressure * 10)
}

/**
 * Calculate the pressure required to reach a target elevation
 * @param fromElevation - Starting elevation in meters (moh)
 * @param toElevation - Target elevation in meters (moh)
 * @returns Required pressure in bar (positive if going up, negative if going down)
 */
export function calculateRequiredPressureForElevation(
  fromElevation: number,
  toElevation: number
): number {
  const elevationDelta = toElevation - fromElevation
  return elevationDelta / 10
}
