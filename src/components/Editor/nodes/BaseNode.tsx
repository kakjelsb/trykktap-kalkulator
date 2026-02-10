/**
 * Base node component with shared styling and functionality
 */

import { Handle, Position } from '@xyflow/react'
import { useState, type ReactNode } from 'react'
import type { PressureStatus } from '../../../models'
import { t } from '../../../i18n'
import './BaseNode.css'

export interface BaseNodeData extends Record<string, unknown> {
  label: string
  elevation: number
  pressure?: number
  status?: PressureStatus
  equipmentId: string
  onDelete?: () => void
  onElevationChange?: (elevation: number) => void
}

interface BaseNodeProps {
  children?: ReactNode
  icon: ReactNode
  data: BaseNodeData
  showSourceHandle?: boolean
  showTargetHandle?: boolean
  sourceHandleCount?: number
  color: string
}

export function BaseNode({
  children,
  icon,
  data,
  showSourceHandle = true,
  showTargetHandle = true,
  sourceHandleCount = 1,
  color,
}: BaseNodeProps) {
  const [isEditingElevation, setIsEditingElevation] = useState(false)
  const [elevationInput, setElevationInput] = useState(String(data.elevation))

  const statusClass = data.status ? `node-status-${data.status}` : ''

  const handleElevationClick = () => {
    if (data.onElevationChange) {
      setElevationInput(String(data.elevation))
      setIsEditingElevation(true)
    }
  }

  const handleElevationSubmit = () => {
    const newElevation = parseFloat(elevationInput)
    if (!isNaN(newElevation) && data.onElevationChange) {
      data.onElevationChange(newElevation)
    }
    setIsEditingElevation(false)
  }

  const handleElevationKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleElevationSubmit()
    } else if (e.key === 'Escape') {
      setIsEditingElevation(false)
    }
  }

  return (
    <div className={`base-node ${statusClass}`} style={{ '--node-color': color } as React.CSSProperties}>
      {data.onDelete && (
        <button
          className="node-delete-btn"
          onClick={data.onDelete}
          aria-label={t.actions.delete}
        >
          ✕
        </button>
      )}

      {/* Input handle - left side with arrow */}
      {showTargetHandle && (
        <div className="node-handle-wrapper node-handle-left">
          <span className="node-handle-arrow">▶</span>
          <Handle type="target" position={Position.Left} className="node-handle" />
        </div>
      )}

      <div className="node-body">
        <div className="node-icon">{icon}</div>
        <div className="node-content">
          <div className="node-label">{data.label}</div>

          {/* Editable elevation */}
          {isEditingElevation ? (
            <div className="node-elevation-edit">
              <input
                type="number"
                value={elevationInput}
                onChange={(e) => setElevationInput(e.target.value)}
                onBlur={handleElevationSubmit}
                onKeyDown={handleElevationKeyDown}
                autoFocus
                className="node-elevation-input"
              />
              <span className="node-elevation-unit">moh</span>
            </div>
          ) : (
            <button
              className="node-elevation-btn"
              onClick={handleElevationClick}
              title={data.onElevationChange ? t.actions.edit : undefined}
            >
              {data.elevation} moh
            </button>
          )}

          {data.pressure !== undefined && (
            <div className="node-pressure">{data.pressure.toFixed(1)} bar</div>
          )}
          {children}
        </div>
      </div>

      {/* Output handle(s) - right side with arrow */}
      {showSourceHandle && sourceHandleCount === 1 && (
        <div className="node-handle-wrapper node-handle-right">
          <Handle type="source" position={Position.Right} className="node-handle" />
          <span className="node-handle-arrow">▶</span>
        </div>
      )}

      {showSourceHandle && sourceHandleCount > 1 && (
        <div className="node-handles-right">
          {Array.from({ length: sourceHandleCount }).map((_, i) => (
            <div key={i} className="node-handle-wrapper node-handle-right">
              <Handle
                type="source"
                position={Position.Right}
                id={`out-${i}`}
                className="node-handle"
                style={{ top: `${((i + 1) / (sourceHandleCount + 1)) * 100}%` }}
              />
              <span className="node-handle-arrow">▶</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
