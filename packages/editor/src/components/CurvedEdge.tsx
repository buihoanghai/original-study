import React from 'react'
import { EdgeProps, getBezierPath } from '@xyflow/react'

/**
 * CurvedEdge Component
 *
 * Custom edge component for XMind-like smooth curved connections.
 * Features:
 * - Smooth bezier curves with correct anchor points based on side
 * - Horizontal-first routing
 * - Adaptive curvature based on distance
 * - Symmetric curves for left and right subtrees
 * - Clean, minimal styling
 */
export const CurvedEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) => {
  // Determine if target is to the left or right of source
  const isLeft = targetX < sourceX

  // Calculate horizontal distance for curvature
  const dx = Math.abs(targetX - sourceX)

  // Adaptive curvature: proportional to distance, clamped to reasonable range
  // Using 0.35 factor as specified in requirements
  const curvature = Math.max(Math.min(dx * 0.35, 160), 40)

  // Side sign: -1 for left, +1 for right
  const sideSign = isLeft ? -1 : 1

  // Control points for smooth horizontal-first curve
  // For left side: curve goes left from source, then to target
  // For right side: curve goes right from source, then to target
  const controlPoint1X = sourceX + sideSign * curvature
  const controlPoint1Y = sourceY

  const controlPoint2X = targetX - sideSign * curvature
  const controlPoint2Y = targetY

  // Custom bezier path with symmetric curves
  const customPath = `M ${sourceX},${sourceY} C ${controlPoint1X},${controlPoint1Y} ${controlPoint2X},${controlPoint2Y} ${targetX},${targetY}`

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={customPath}
        style={{
          stroke: '#94a3b8',
          strokeWidth: 2,
          fill: 'none',
          ...style,
        }}
        markerEnd={markerEnd}
      />
    </>
  )
}

