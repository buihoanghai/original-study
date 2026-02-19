/**
 * @mindmap/editor
 *
 * Mindmap editor core with keyboard-first UX.
 *
 * Features:
 * - React Flow canvas
 * - Zustand state management
 * - Keyboard hotkeys (Tab, Enter, Arrow keys, F, Esc, Ctrl+Z)
 * - Undo/redo
 * - Sync integration
 */

// Store
export { useEditorStore } from './store/editorStore'

// Types
export type { EditorState, EditorUIState, FocusMode, LayoutMode, HistoryEntry, OperationResult } from './types'

// Operations
export * from './operations/tree'
export * from './operations/layout'
export * from './operations/balancedLayout'
export * from './operations/navigation'

// Components
export { MindmapEditor } from './components/MindmapEditor'
export { NodeComponent } from './components/NodeComponent'
export { StickyNoteComponent } from './components/StickyNoteComponent'
export { CurvedEdge } from './components/CurvedEdge'
export { LayoutControls } from './components/LayoutControls'

// Hooks
export { useHotkeys } from './hooks/useHotkeys'
export { useNavigation } from './hooks/useNavigation'
export { useSyncMindmap } from './hooks/useSyncMindmap'

