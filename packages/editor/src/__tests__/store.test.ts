import { describe, it, expect, beforeEach } from 'vitest'
import { useEditorStore } from '../store/editorStore'

describe('Editor Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useEditorStore.getState().reset()
  })

  describe('Initialization', () => {
    it('should initialize with empty state', () => {
      const state = useEditorStore.getState()

      expect(state.mindmap).toBeNull()
      expect(state.nodes).toEqual([])
      expect(state.edges).toEqual([])
      expect(state.ui.selectedNodeId).toBeNull()
      expect(state.ui.editingNodeId).toBeNull()
      expect(state.history).toEqual([])
      expect(state.historyIndex).toBe(-1)
    })
  })

  describe('Create Mindmap', () => {
    it('should create a new mindmap with root node', () => {
      const { createMindmap } = useEditorStore.getState()

      createMindmap('Test Mindmap', 'Test description')

      const state = useEditorStore.getState()
      expect(state.mindmap?.metadata.title).toBe('Test Mindmap')
      expect(state.mindmap?.metadata.description).toBe('Test description')
      expect(state.nodes).toHaveLength(1)
      expect(state.nodes[0].content.text).toBe('Test Mindmap')
      expect(state.ui.selectedNodeId).toBe(state.nodes[0].nodeId)
    })
  })

  describe('Add Child', () => {
    it('should add a child node to selected node', () => {
      const { createMindmap, addChild } = useEditorStore.getState()

      createMindmap('Root')
      const rootId = useEditorStore.getState().nodes[0].nodeId

      addChild(rootId)

      const state = useEditorStore.getState()
      expect(state.nodes).toHaveLength(2)
      expect(state.edges).toHaveLength(1)
      expect(state.edges[0].from).toBe(rootId)
      expect(state.ui.editingNodeId).toBe(state.nodes[1].nodeId)
      expect(state.ui.focusMode).toBe('editing')
    })
  })

  describe('Add Sibling', () => {
    it('should add a sibling node', () => {
      const { createMindmap, addChild, addSibling } = useEditorStore.getState()

      createMindmap('Root')
      const rootId = useEditorStore.getState().nodes[0].nodeId

      addChild(rootId)
      const child1Id = useEditorStore.getState().nodes[1].nodeId

      addSibling(child1Id)

      const state = useEditorStore.getState()
      expect(state.nodes).toHaveLength(3)
      expect(state.edges).toHaveLength(2)
      // Both children should have same parent
      expect(state.edges[0].from).toBe(rootId)
      expect(state.edges[1].from).toBe(rootId)
    })
  })

  describe('Update Node', () => {
    it('should update node content', () => {
      const { createMindmap, updateNode } = useEditorStore.getState()

      createMindmap('Root')
      const rootId = useEditorStore.getState().nodes[0].nodeId

      updateNode(rootId, { text: 'Updated Root' })

      const state = useEditorStore.getState()
      expect(state.nodes[0].content.text).toBe('Updated Root')
    })
  })

  describe('Remove Node', () => {
    it('should remove a node and its descendants', () => {
      const { createMindmap, addChild, removeNode } = useEditorStore.getState()

      createMindmap('Root')
      const rootId = useEditorStore.getState().nodes[0].nodeId

      addChild(rootId)
      const child1Id = useEditorStore.getState().nodes[1].nodeId

      addChild(child1Id)
      // Now we have: Root -> Child1 -> Grandchild

      removeNode(child1Id)

      const state = useEditorStore.getState()
      expect(state.nodes).toHaveLength(1) // Only root remains
      expect(state.nodes[0].nodeId).toBe(rootId)
      expect(state.edges).toHaveLength(0)
    })
  })

  describe('Selection and Editing', () => {
    it('should select a node', () => {
      const { createMindmap, selectNode } = useEditorStore.getState()

      createMindmap('Root')
      const rootId = useEditorStore.getState().nodes[0].nodeId

      selectNode(rootId)

      const state = useEditorStore.getState()
      expect(state.ui.selectedNodeId).toBe(rootId)
      expect(state.ui.focusMode).toBe('canvas')
    })

    it('should start and stop editing', () => {
      const { createMindmap, startEditing, stopEditing } = useEditorStore.getState()

      createMindmap('Root')
      const rootId = useEditorStore.getState().nodes[0].nodeId

      startEditing(rootId)
      let state = useEditorStore.getState()
      expect(state.ui.editingNodeId).toBe(rootId)
      expect(state.ui.focusMode).toBe('editing')

      stopEditing()
      state = useEditorStore.getState()
      expect(state.ui.editingNodeId).toBeNull()
      expect(state.ui.focusMode).toBe('canvas')
    })
  })

  describe('Collapse/Expand', () => {
    it('should toggle node collapse state', () => {
      const { createMindmap, toggleCollapse } = useEditorStore.getState()

      createMindmap('Root')
      const rootId = useEditorStore.getState().nodes[0].nodeId

      toggleCollapse(rootId)
      let state = useEditorStore.getState()
      expect(state.ui.collapsedNodeIds.has(rootId)).toBe(true)

      toggleCollapse(rootId)
      state = useEditorStore.getState()
      expect(state.ui.collapsedNodeIds.has(rootId)).toBe(false)
    })
  })

  describe('Undo/Redo', () => {
    it('should undo and redo changes', () => {
      const { createMindmap, updateNode, undo, redo } = useEditorStore.getState()

      createMindmap('Root')
      const rootId = useEditorStore.getState().nodes[0].nodeId

      updateNode(rootId, { text: 'Updated' })
      expect(useEditorStore.getState().nodes[0].content.text).toBe('Updated')

      undo()
      expect(useEditorStore.getState().nodes[0].content.text).toBe('Root')

      redo()
      expect(useEditorStore.getState().nodes[0].content.text).toBe('Updated')
    })
  })
})

