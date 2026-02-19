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
  const { updateNode, stopEditing, addSibling, addChild } = useEditorStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const isCreatingNodeRef = useRef(false)

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      // Use a small delay to ensure focus happens after React Flow's event handling
      // and DOM is fully rendered. 50ms is enough for React Flow to settle.
      const timeoutId = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
          inputRef.current.select()
        }
      }, 50)
      return () => clearTimeout(timeoutId)
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
    // Don't stop editing if we're creating a new node
    // The new node will automatically enter editing mode
    if (!isCreatingNodeRef.current) {
      stopEditing()
    }
    // Reset the flag
    isCreatingNodeRef.current = false
  }, [stopEditing])

  // Handle key down in input
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Prevent event propagation to avoid triggering global hotkeys
      e.stopPropagation()

      if (e.key === 'Escape') {
        stopEditing()
      } else if (e.key === 'Enter') {
        // Enter while editing: create sibling and focus on it
        e.preventDefault()
        isCreatingNodeRef.current = true
        addSibling(node.nodeId)
        // Note: stopEditing is not needed here because addSibling
        // automatically sets the new node to editing mode
      } else if (e.key === 'Tab') {
        // Tab while editing: create child and focus on it
        e.preventDefault()
        isCreatingNodeRef.current = true
        addChild(node.nodeId)
        // Note: stopEditing is not needed here because addChild
        // automatically sets the new node to editing mode
      }
    },
    [stopEditing, addSibling, addChild, node.nodeId]
  )

  return (
    <div
      data-testid={`node-${node.nodeId}`}
      style={{
        padding: '12px 18px',
        borderRadius: '12px',
        border: isSelected ? '2px solid #3b82f6' : 'none',
        background: isEditing ? '#fff' : isSelected ? '#eff6ff' : '#f9fafb',
        minWidth: '120px',
        maxWidth: '300px',
        boxShadow: isSelected
          ? '0 8px 16px rgba(0, 0, 0, 0.12)'
          : '0 2px 8px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.2s',
      }}
    >
      {/* Connection handles - both sides for bidirectional connections */}
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="target" position={Position.Right} id="right" />
      <Handle type="source" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Right} id="right" />

      {/* Node content */}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={node.content.text || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          data-testid="node-input"
          autoFocus
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

