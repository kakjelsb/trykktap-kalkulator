/**
 * Terminal node - end point (water cannon, fire wall)
 */

import type { Node, NodeProps } from '@xyflow/react'
import { BaseNode, type BaseNodeData } from './BaseNode'

interface TerminalNodeData extends BaseNodeData {
  minPressure: number
}

type TerminalNode = Node<TerminalNodeData, 'terminal'>

export function TerminalNode({ data }: NodeProps<TerminalNode>) {
  const icon = data.equipmentId === 'terminal-cannon' ? '🚿' : '🧱'

  return (
    <BaseNode
      data={data}
      icon={icon}
      color="#10b981"
      showSourceHandle={false}
    >
      <div className="node-required">min {data.minPressure} bar</div>
    </BaseNode>
  )
}
