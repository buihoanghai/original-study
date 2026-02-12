import type { MindmapNode, NodeEdge, Mindmap } from '@mindmap/domain'

/**
 * Editor-specific types
 *
 * These types extend domain types with editor-specific UI state.
 */

/**
 * Focus mode for the editor
 */
export type FocusMode = 'canvas' | 'editing' | 'none'

/**
 * Editor UI state
 */
export interface EditorUIState {
  /** Currently selected node ID */
  selectedNodeId: string | null

  /** Node currently being edited */
  editingNodeId: string | null

  /** Set of collapsed node IDs */
  collapsedNodeIds: Set<string>

  /** Current focus mode */
  focusMode: FocusMode

  /** Zoom level (0.1 to 2.0) */
  zoom: number

  /** Canvas center position */
  center: { x: number; y: number }
}

/**
 * History entry for undo/redo
 */
export interface HistoryEntry {
  nodes: MindmapNode[]
  edges: NodeEdge[]
  timestamp: number
}

/**
 * Complete editor state
 */
export interface EditorState {
  // Mindmap data
  mindmap: Mindmap | null
  nodes: MindmapNode[]
  edges: NodeEdge[]

  // UI state
  ui: EditorUIState

  // History for undo/redo
  history: HistoryEntry[]
  historyIndex: number

  // Sync state
  isSyncing: boolean
  lastSyncedAt: Date | null
  syncError: string | null
}

/**
 * Tree operation result
 */
export interface OperationResult {
  success: boolean
  error?: string
  nodeId?: string
}

