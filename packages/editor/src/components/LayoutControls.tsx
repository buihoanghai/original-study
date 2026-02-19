import React from 'react'
import { useEditorStore } from '../store/editorStore'

/**
 * LayoutControls Component
 *
 * UI controls for selecting and configuring mindmap layout.
 * Features:
 * - Layout mode selector (Dagre, Balanced, Manual)
 * - Compact mode toggle
 * - Re-layout button
 */
export const LayoutControls: React.FC = () => {
  const { ui, setLayoutMode, setCompactLayout, applyLayout } = useEditorStore()

  return (
    <div
      style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 10,
        minWidth: '200px',
      }}
    >
      <div style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
        Layout
      </div>

      {/* Layout Mode Selector */}
      <div>
        <label
          htmlFor="layout-mode"
          style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '4px' }}
        >
          Mode
        </label>
        <select
          id="layout-mode"
          value={ui.layoutMode}
          onChange={(e) => setLayoutMode(e.target.value as 'dagre' | 'balanced' | 'manual')}
          style={{
            width: '100%',
            padding: '6px 8px',
            fontSize: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            background: 'white',
            cursor: 'pointer',
          }}
        >
          <option value="balanced">Balanced (XMind-like)</option>
          <option value="dagre">Dagre (Hierarchical)</option>
          <option value="manual">Manual (No Auto-layout)</option>
        </select>
      </div>

      {/* Compact Mode Toggle */}
      {ui.layoutMode !== 'manual' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            id="compact-mode"
            checked={ui.compactLayout}
            onChange={(e) => setCompactLayout(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <label
            htmlFor="compact-mode"
            style={{ fontSize: '11px', color: '#374151', cursor: 'pointer' }}
          >
            Compact spacing
          </label>
        </div>
      )}

      {/* Re-layout Button */}
      {ui.layoutMode !== 'manual' && (
        <button
          onClick={applyLayout}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#2563eb'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#3b82f6'
          }}
        >
          Re-layout
        </button>
      )}

      {/* Layout Info */}
      <div
        style={{
          fontSize: '10px',
          color: '#9ca3af',
          marginTop: '4px',
          paddingTop: '8px',
          borderTop: '1px solid #e5e7eb',
        }}
      >
        {ui.layoutMode === 'balanced' && (
          <>
            Root centered, branches balanced left/right
          </>
        )}
        {ui.layoutMode === 'dagre' && (
          <>
            Hierarchical left-to-right layout
          </>
        )}
        {ui.layoutMode === 'manual' && (
          <>
            Drag nodes to position manually
          </>
        )}
      </div>
    </div>
  )
}

