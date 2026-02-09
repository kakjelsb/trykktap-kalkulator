/**
 * Source node - water source point
 */

import type { Node, NodeProps } from '@xyflow/react'
import { BaseNode, type BaseNodeData } from './BaseNode'

type SourceNode = Node<BaseNodeData, 'source'>

export function SourceNode({ data }: NodeProps<SourceNode>) {
  return (
    <BaseNode
      data={data}
      icon="💧"
      color="#3b82f6"
      showTargetHandle={false}
    />
  )
}
