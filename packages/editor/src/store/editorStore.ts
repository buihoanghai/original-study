import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { enableMapSet } from 'immer'
import type { EditorState, HistoryEntry } from '../types'
import type { MindmapNode, NodeEdge, NodeContent, Mindmap } from '@mindmap/domain'
import { addChildNode, addSiblingNode, updateNodeContent, deleteNode, createNode } from '../operations/tree'

// Enable Map/Set support in Immer
enableMapSet()

/**
 * Editor Store Actions
 */
interface EditorActions {
  // Tree operations
  addChild: (parentId: string) => void
  addSibling: (nodeId: string) => void
  updateNode: (nodeId: string, content: NodeContent) => void
  removeNode: (nodeId: string) => void

  // Selection and editing
  selectNode: (nodeId: string | null) => void
  startEditing: (nodeId: string) => void
  stopEditing: () => void

  // Collapse/expand
  toggleCollapse: (nodeId: string) => void

  // History
  undo: () => void
  redo: () => void
  saveHistory: () => void

  // Mindmap management
  createMindmap: (title: string, description?: string) => void
  loadMindmap: (mindmap: Mindmap, nodes: MindmapNode[], edges: NodeEdge[]) => void

  // Sync
  setSyncing: (isSyncing: boolean) => void
  setSyncError: (error: string | null) => void
  setLastSyncedAt: (date: Date) => void

  // UI
  setZoom: (zoom: number) => void
  setCenter: (x: number, y: number) => void

  // Reset
  reset: () => void
}

/**
 * Initial editor state
 */
const initialState: EditorState = {
  mindmap: null,
  nodes: [],
  edges: [],
  ui: {
    selectedNodeId: null,
    editingNodeId: null,
    collapsedNodeIds: new Set(),
    focusMode: 'canvas',
    zoom: 1,
    center: { x: 0, y: 0 },
  },
  history: [],
  historyIndex: -1,
  isSyncing: false,
  lastSyncedAt: null,
  syncError: null,
}

/**
 * Editor Store
 *
 * Manages the complete state of the mindmap editor using Zustand with Immer.
 */
export const useEditorStore = create<EditorState & EditorActions>()(
  immer((set, get) => ({
    ...initialState,

    // Tree operations
    addChild: (parentId: string) => {
      const { nodes, edges } = get()
      try {
        const result = addChildNode(nodes, edges, parentId)
        set((state) => {
          state.nodes = result.nodes
          state.edges = result.edges
          state.ui.selectedNodeId = result.newNodeId
          state.ui.editingNodeId = result.newNodeId
          state.ui.focusMode = 'editing'
        })
        get().saveHistory()
      } catch (error) {
        console.error('Failed to add child:', error)
      }
    },

    addSibling: (nodeId: string) => {
      const { nodes, edges } = get()
      try {
        const result = addSiblingNode(nodes, edges, nodeId)
        set((state) => {
          state.nodes = result.nodes
          state.edges = result.edges
          state.ui.selectedNodeId = result.newNodeId
          state.ui.editingNodeId = result.newNodeId
          state.ui.focusMode = 'editing'
        })
        get().saveHistory()
      } catch (error) {
        console.error('Failed to add sibling:', error)
      }
    },

    updateNode: (nodeId: string, content: NodeContent) => {
      const { nodes } = get()
      set((state) => {
        state.nodes = updateNodeContent(nodes, nodeId, content)
      })
      get().saveHistory()
    },

    removeNode: (nodeId: string) => {
      const { nodes, edges } = get()
      try {
        const result = deleteNode(nodes, edges, nodeId)
        set((state) => {
          state.nodes = result.nodes
          state.edges = result.edges
          state.ui.selectedNodeId = null
          state.ui.editingNodeId = null
        })
        get().saveHistory()
      } catch (error) {
        console.error('Failed to remove node:', error)
      }
    },

    // Selection and editing
    selectNode: (nodeId: string | null) => {
      set((state) => {
        state.ui.selectedNodeId = nodeId
        state.ui.focusMode = nodeId ? 'canvas' : 'none'
      })
    },

    startEditing: (nodeId: string) => {
      set((state) => {
        state.ui.editingNodeId = nodeId
        state.ui.selectedNodeId = nodeId
        state.ui.focusMode = 'editing'
      })
    },

    stopEditing: () => {
      set((state) => {
        state.ui.editingNodeId = null
        state.ui.focusMode = 'canvas'
      })
    },

    // Collapse/expand
    toggleCollapse: (nodeId: string) => {
      set((state) => {
        if (state.ui.collapsedNodeIds.has(nodeId)) {
          state.ui.collapsedNodeIds.delete(nodeId)
        } else {
          state.ui.collapsedNodeIds.add(nodeId)
        }
      })
    },

    // History
    saveHistory: () => {
      const { nodes, edges, history, historyIndex } = get()
      const entry: HistoryEntry = {
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges)),
        timestamp: Date.now(),
      }

      set((state) => {
        // Remove any history after current index
        state.history = state.history.slice(0, state.historyIndex + 1)
        // Add new entry
        state.history.push(entry)
        // Limit history to 50 entries
        if (state.history.length > 50) {
          state.history.shift()
        } else {
          state.historyIndex++
        }
      })
    },

    undo: () => {
      const { history, historyIndex } = get()
      if (historyIndex > 0) {
        const entry = history[historyIndex - 1]
        set((state) => {
          state.nodes = entry.nodes
          state.edges = entry.edges
          state.historyIndex--
        })
      }
    },

    redo: () => {
      const { history, historyIndex } = get()
      if (historyIndex < history.length - 1) {
        const entry = history[historyIndex + 1]
        set((state) => {
          state.nodes = entry.nodes
          state.edges = entry.edges
          state.historyIndex++
        })
      }
    },

    // Mindmap management
    createMindmap: (title: string, description = '') => {
      const rootNode = createNode({ text: title }, { x: 0, y: 0 })

      set((state) => {
        state.mindmap = {
          id: '', // Will be set after first sync
          metadata: {
            title,
            description,
            created: new Date(),
            updated: new Date(),
          },
          status: 'draft',
          ownerId: 'current-user', // TODO: Get from auth
        }
        state.nodes = [rootNode]
        state.edges = []
        state.ui.selectedNodeId = rootNode.nodeId
        state.history = []
        state.historyIndex = -1
      })
      get().saveHistory()
    },

    loadMindmap: (mindmap: Mindmap, nodes: MindmapNode[], edges: NodeEdge[]) => {
      set((state) => {
        state.mindmap = mindmap
        state.nodes = nodes
        state.edges = edges
        state.ui.selectedNodeId = nodes[0]?.nodeId || null
        state.history = []
        state.historyIndex = -1
      })
      get().saveHistory()
    },

    // Sync
    setSyncing: (isSyncing: boolean) => {
      set((state) => {
        state.isSyncing = isSyncing
      })
    },

    setSyncError: (error: string | null) => {
      set((state) => {
        state.syncError = error
      })
    },

    setLastSyncedAt: (date: Date) => {
      set((state) => {
        state.lastSyncedAt = date
      })
    },

    // UI
    setZoom: (zoom: number) => {
      set((state) => {
        state.ui.zoom = Math.max(0.1, Math.min(2, zoom))
      })
    },

    setCenter: (x: number, y: number) => {
      set((state) => {
        state.ui.center = { x, y }
      })
    },

    // Reset
    reset: () => {
      set(initialState)
    },
  }))
)

