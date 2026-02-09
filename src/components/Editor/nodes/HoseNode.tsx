/**
 * Hose node - 20m section with friction loss
 */

import type { Node, NodeProps } from '@xyflow/react'
import { BaseNode, type BaseNodeData } from './BaseNode'

interface HoseNodeData extends BaseNodeData {
  diameterLabel: string
}

type HoseNode = Node<HoseNodeData, 'hose'>

export function HoseNode({ data }: NodeProps<HoseNode>) {
  return (
    <BaseNode
      data={data}
      icon="〰️"
      color="#f59e0b"
    >
      <div className="node-diameter">{data.diameterLabel}</div>
    </BaseNode>
  )
}
