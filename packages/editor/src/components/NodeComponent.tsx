import React, { useCallback, useRef, useEffect } from 'react'
import { Handle, Position, NodeProps, Node } from '@xyflow/react'
import { useEditorStore } from '../store/editorStore'
import type { MindmapNode } from '@mindmap/domain'

export interface NodeData extends Record<string, unknown> {
  node: MindmapNode
  isSelected: boolean
  isEditing: boolean
  isCollapsed: boolean
}

/**
 * NodeComponent
 *
 * Renders a single mindmap node with editing capabilities.
 * Shows affordances only when selected.
 */
export const NodeComponent: React.FC<NodeProps<Node<NodeData>>> = ({ data }) => {
  const { node, isSelected, isEditing, isCollapsed } = data
  const { updateNode, stopEditing } = useEditorStore()
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  // Handle text change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateNode(node.nodeId, { text: e.target.value })
    },
    [node.nodeId, updateNode]
  )

  // Handle blur (exit edit mode)
  const handleBlur = useCallback(() => {
    stopEditing()
  }, [stopEditing])

  // Handle key down in input
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Prevent event propagation to avoid triggering global hotkeys
      e.stopPropagation()

      if (e.key === 'Escape') {
        stopEditing()
      }
    },
    [stopEditing]
  )

  return (
    <div
      style={{
        padding: '10px 15px',
        borderRadius: '8px',
        border: isSelected ? '2px solid #3b82f6' : '1px solid #d1d5db',
        background: isEditing ? '#fff' : isSelected ? '#eff6ff' : '#f9fafb',
        minWidth: '120px',
        maxWidth: '300px',
        boxShadow: isSelected ? '0 4px 6px rgba(0, 0, 0, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s',
      }}
    >
      {/* Connection handles */}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      {/* Node content */}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={node.content.text || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: '14px',
            fontFamily: 'inherit',
          }}
        />
      ) : (
        <div
          style={{
            fontSize: '14px',
            color: '#1f2937',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {node.content.text || 'Empty node'}
        </div>
      )}

      {/* Collapsed indicator */}
      {isCollapsed && (
        <div
          style={{
            marginTop: '4px',
            fontSize: '10px',
            color: '#6b7280',
            fontStyle: 'italic',
          }}
        >
          [collapsed]
        </div>
      )}

      {/* Selected affordances (only show when selected, not editing) */}
      {isSelected && !isEditing && (
        <div
          style={{
            marginTop: '8px',
            fontSize: '10px',
            color: '#6b7280',
            borderTop: '1px solid #e5e7eb',
            paddingTop: '4px',
          }}
        >
          Tab: child | Enter: sibling | F: collapse
        </div>
      )}
    </div>
  )
}

