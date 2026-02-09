/**
 * Pump node - pressure source (can be mid-chain for relay pumping)
 */

import type { Node, NodeProps } from '@xyflow/react'
import { BaseNode, type BaseNodeData } from './BaseNode'

interface PumpNodeData extends BaseNodeData {
  maxFlow: number
}

type PumpNode = Node<PumpNodeData, 'pump'>

export function PumpNode({ data }: NodeProps<PumpNode>) {
  return (
    <BaseNode
      data={data}
      icon="⛽"
      color="#dc2626"
      showTargetHandle={true}
      showSourceHandle={true}
    />
  )
}
