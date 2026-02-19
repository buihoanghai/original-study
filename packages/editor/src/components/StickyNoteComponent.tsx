import React, { useState, useRef, useEffect } from 'react'
import type { NodeProps } from '@xyflow/react'

/**
 * Sticky note colors for cycling through
 */
const STICKY_COLORS = [
  { bg: '#fef3c7', border: '#fde047' }, // Yellow
  { bg: '#fce7f3', border: '#f9a8d4' }, // Pink
  { bg: '#dbeafe', border: '#93c5fd' }, // Blue
  { bg: '#d1fae5', border: '#6ee7b7' }, // Green
]

/**
 * StickyNoteComponent
 *
 * A sticky note annotation component for brainstorming and notes.
 * Features:
 * - Handwriting-style font
 * - Slight rotation for paper effect
 * - Color cycling (yellow, pink, blue, green)
 * - Double-click to edit
 * - No connection handles (annotations only)
 */
export const StickyNoteComponent: React.FC<NodeProps> = ({ id, data, selected }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState<string>((data as any).text || 'Double-click to edit')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Get color based on node ID (deterministic cycling)
  const lastPart = id.split('-').pop() || '0'
  const parsed = parseInt(lastPart, 36) // Use base 36 to handle alphanumeric IDs
  const colorIndex = (isNaN(parsed) ? 0 : parsed) % STICKY_COLORS.length
  const color = STICKY_COLORS[colorIndex]

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleDoubleClick = () => {
    setIsEditing(true)
  }

  const handleBlur = () => {
    setIsEditing(false)
    // TODO: Save to store when we implement sticky note state management
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false)
    }
  }

  return (
    <div
      data-testid={`sticky-note-${id}`}
      onDoubleClick={handleDoubleClick}
      style={{
        width: '200px',
        height: '200px',
        padding: '20px',
        background: color.bg,
        border: `2px solid ${color.border}`,
        borderRadius: '4px',
        boxShadow: selected
          ? '0 8px 16px rgba(0, 0, 0, 0.15)'
          : '0 4px 8px rgba(0, 0, 0, 0.1)',
        transform: 'rotate(-2deg)',
        transition: 'all 0.2s',
        cursor: isEditing ? 'text' : 'pointer',
        fontFamily: "'Indie Flower', 'Comic Sans MS', cursive",
        fontSize: '16px',
        lineHeight: '1.5',
        color: '#374151',
        position: 'relative',
      }}
    >
      {isEditing ? (
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            height: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit',
            color: 'inherit',
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            wordWrap: 'break-word',
          }}
        >
          {text}
        </div>
      )}

      {/* Small indicator in corner */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          fontSize: '10px',
          opacity: 0.5,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        📌
      </div>
    </div>
  )
}

