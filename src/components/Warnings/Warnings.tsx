/**
 * Warnings Display Component
 *
 * Shows calculation warnings and errors to the user.
 */

import type { CalculationError } from '../../models/calculation'
import { t } from '../../i18n'
import './Warnings.css'

interface WarningsProps {
  errors: CalculationError[]
}

function getErrorMessage(error: CalculationError): string {
  switch (error.type) {
    case 'no_pump':
      return t.errors.noPump
    case 'pressure_low':
      return t.errors.pressureTooLow
    case 'flow_exceeded':
      return t.errors.flowExceeded
    case 'no_path':
      return error.message
    case 'invalid_connection':
      return t.errors.connectionInvalid
    default:
      return error.message
  }
}

function getErrorIcon(error: CalculationError): string {
  switch (error.type) {
    case 'pressure_low':
      return '⚠️'
    case 'no_pump':
    case 'no_path':
      return '❌'
    default:
      return '⚠️'
  }
}

export function Warnings({ errors }: WarningsProps) {
  if (errors.length === 0) {
    return null
  }

  return (
    <div className="warnings">
      {errors.map((error, index) => (
        <div key={index} className={`warning warning-${error.type}`}>
          <span className="warning-icon">{getErrorIcon(error)}</span>
          <span className="warning-message">{getErrorMessage(error)}</span>
        </div>
      ))}
    </div>
  )
}
