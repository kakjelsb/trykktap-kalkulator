/**
 * Splitter node - splits flow to multiple outputs
 */

import type { Node, NodeProps } from '@xyflow/react'
import { BaseNode, type BaseNodeData } from './BaseNode'

interface SplitterNodeData extends BaseNodeData {
  outputs: number
}

type SplitterNode = Node<SplitterNodeData, 'connector'>

export function SplitterNode({ data }: NodeProps<SplitterNode>) {
  return (
    <BaseNode
      data={data}
      icon="🔀"
      color="#8b5cf6"
      sourceHandleCount={data.outputs}
    />
  )
}
