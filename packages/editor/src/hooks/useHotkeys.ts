import { useEffect } from 'react'
import { useEditorStore } from '../store/editorStore'

/**
 * useHotkeys Hook
 *
 * Implements all keyboard shortcuts for the mindmap editor.
 * Follows the Hotkey Canon from docs/CONTEXT.md.
 *
 * Hotkeys:
 * - Tab: Add child node
 * - Enter: Add sibling node
 * - Arrow keys: Navigate tree
 * - F: Collapse/expand node
 * - Esc: Exit edit mode → center root
 * - Ctrl/Cmd + Z: Undo
 * - Ctrl/Cmd + Shift + Z: Redo
 * - Ctrl/Cmd + S: Save to CMS
 * - Ctrl/Cmd + +/-: Zoom
 */
export const useHotkeys = () => {
  const {
    ui,
    addChild,
    addSibling,
    toggleCollapse,
    stopEditing,
    undo,
    redo,
    setZoom,
    triggerSave,
    setCenter,
  } = useEditorStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { selectedNodeId, editingNodeId, focusMode } = ui

      // Don't handle hotkeys when editing (except Esc)
      if (editingNodeId && e.key !== 'Escape') {
        return
      }

      // Tab: Add child node
      if (e.key === 'Tab' && selectedNodeId) {
        e.preventDefault()
        addChild(selectedNodeId)
        return
      }

      // Enter: Add sibling node
      if (e.key === 'Enter' && selectedNodeId) {
        e.preventDefault()
        addSibling(selectedNodeId)
        return
      }

      // F: Collapse/expand node
      if (e.key === 'f' && selectedNodeId && !editingNodeId) {
        e.preventDefault()
        toggleCollapse(selectedNodeId)
        return
      }

      // Esc: Exit edit mode → center root
      if (e.key === 'Escape') {
        e.preventDefault()
        if (editingNodeId) {
          stopEditing()
        } else {
          // Center on root (0, 0)
          setCenter(0, 0)
        }
        return
      }

      // Ctrl/Cmd + Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }

      // Ctrl/Cmd + Shift + Z: Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        redo()
        return
      }

      // Ctrl/Cmd + S: Save to CMS
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        triggerSave()
        return
      }

      // Ctrl/Cmd + +: Zoom in
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault()
        setZoom(ui.zoom * 1.1)
        return
      }

      // Ctrl/Cmd + -: Zoom out
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault()
        setZoom(ui.zoom * 0.9)
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    ui,
    addChild,
    addSibling,
    toggleCollapse,
    stopEditing,
    undo,
    redo,
    setZoom,
    setCenter,
  ])
}

