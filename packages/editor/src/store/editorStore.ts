import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { enableMapSet } from 'immer'
import type { EditorState, HistoryEntry } from '../types'
import type { MindmapNode, NodeEdge, NodeContent, Mindmap } from '@mindmap/domain'
import { addChildNode, addSiblingNode, updateNodeContent, deleteNode, createNode } from '../operations/tree'
import { applyTreeLayout } from '../operations/layout'

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

  // Sticky notes (annotations)
  addStickyNote: () => void

  // Selection and editing
  selectNode: (nodeId: string | null) => void
  startEditing: (nodeId: string) => void
  stopEditing: () => void

  // Collapse/expand
  toggleCollapse: (nodeId: string) => void

  // Focus (URL-based navigation)
  focusOnNode: (nodeId: string | null) => void

  // History
  undo: () => void
  redo: () => void
  saveHistory: () => void

  // Mindmap management
  createMindmap: (title: string, description?: string) => void
  loadMindmap: (mindmap: Mindmap, nodes: MindmapNode[], edges: NodeEdge[]) => void
  updateMindmap: (mindmap: Mindmap) => void

  // Sync
  setSyncing: (isSyncing: boolean) => void
  setSyncError: (error: string | null) => void
  setLastSyncedAt: (date: Date) => void
  setSaveCallback: (callback: (() => Promise<void>) | null) => void
  triggerSave: () => Promise<void>

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
  focusedNodeId: null,
  visibleNodeIds: null,
  history: [],
  historyIndex: -1,
  isSyncing: false,
  lastSyncedAt: null,
  syncError: null,
  saveCallback: null,
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

    // Sticky notes (annotations)
    addStickyNote: () => {
      const { ui } = get()
      // Create sticky note at canvas center with special nodeType marker
      const stickyNote = createNode(
        { text: 'Double-click to edit', nodeType: 'stickyNote' },
        { x: ui.center.x, y: ui.center.y }
      )

      set((state) => {
        state.nodes = [...state.nodes, stickyNote]
        state.ui.selectedNodeId = stickyNote.nodeId
      })
      get().saveHistory()
    },

    // Selection and editing
    selectNode: (nodeId: string | null) => {
      console.log('[editorStore] selectNode called with:', nodeId)
      set((state) => {
        state.ui.selectedNodeId = nodeId
        state.ui.focusMode = nodeId ? 'canvas' : 'none'
        console.log('[editorStore] selectedNodeId updated to:', state.ui.selectedNodeId)
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

    // Focus (URL-based navigation)
    focusOnNode: (nodeId: string | null) => {
      const { nodes, edges } = get()

      if (!nodeId) {
        // Show all nodes
        set((state) => {
          state.focusedNodeId = null
          state.visibleNodeIds = null
        })
        return
      }

      // Calculate visible nodes: current + children + parent
      const visibleIds = new Set<string>([nodeId])

      // Add children
      const children = edges
        .filter((e) => e.from === nodeId && e.type === 'parent-child')
        .map((e) => e.to)
      children.forEach((id) => visibleIds.add(id))

      // Add parent
      const parentEdge = edges.find((e) => e.to === nodeId && e.type === 'parent-child')
      if (parentEdge) {
        visibleIds.add(parentEdge.from)
      }

      set((state) => {
        state.focusedNodeId = nodeId
        state.visibleNodeIds = visibleIds
        state.ui.selectedNodeId = nodeId
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
      console.log('[editorStore] loadMindmap called')
      console.log('[editorStore] - Mindmap:', mindmap.metadata.title)
      console.log('[editorStore] - Nodes count:', nodes.length)
      console.log('[editorStore] - Edges count:', edges.length)
      console.log('[editorStore] - Edges:', edges)

      // Apply hierarchical tree layout
      const layoutedNodes = applyTreeLayout(nodes, edges, {
        direction: 'LR', // Left to right
        nodeSpacing: 100,
        rankSpacing: 250,
      })

      set((state) => {
        state.mindmap = mindmap
        state.nodes = layoutedNodes
        state.edges = edges
        state.ui.selectedNodeId = layoutedNodes[0]?.nodeId || null
        state.history = []
        state.historyIndex = -1
        console.log('[editorStore] - Initial selectedNodeId:', state.ui.selectedNodeId)
      })
      get().saveHistory()
    },

    updateMindmap: (mindmap: Mindmap) => {
      set((state) => {
        state.mindmap = mindmap
      })
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

    setSaveCallback: (callback: (() => Promise<void>) | null) => {
      set((state) => {
        state.saveCallback = callback
      })
    },

    triggerSave: async () => {
      const { saveCallback } = get()
      if (saveCallback) {
        await saveCallback()
      } else {
        console.warn('No save callback registered')
      }
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

