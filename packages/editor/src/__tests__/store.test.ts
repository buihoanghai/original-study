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

  describe('Drag & Drop', () => {
    it('should update node position via store action', () => {
      const { createMindmap, updateNodePosition } = useEditorStore.getState()

      createMindmap('Root')
      const rootId = useEditorStore.getState().nodes[0].nodeId
      const originalPosition = useEditorStore.getState().nodes[0].position

      updateNodePosition(rootId, { x: 500, y: 300 })

      const state = useEditorStore.getState()
      expect(state.nodes[0].position).toEqual({ x: 500, y: 300 })
      expect(state.nodes[0].position).not.toEqual(originalPosition)
    })

    it('should preserve node content when updating position', () => {
      const { createMindmap, updateNode, updateNodePosition } = useEditorStore.getState()

      createMindmap('Root')
      const rootId = useEditorStore.getState().nodes[0].nodeId

      updateNode(rootId, { text: 'Test Content' })
      updateNodePosition(rootId, { x: 500, y: 300 })

      const state = useEditorStore.getState()
      expect(state.nodes[0].content.text).toBe('Test Content')
      expect(state.nodes[0].position).toEqual({ x: 500, y: 300 })
    })

    it('should support undo/redo for position changes', () => {
      const { createMindmap, updateNodePosition, saveHistory, undo, redo } = useEditorStore.getState()

      createMindmap('Root')
      const rootId = useEditorStore.getState().nodes[0].nodeId
      const originalPos = useEditorStore.getState().nodes[0].position

      updateNodePosition(rootId, { x: 500, y: 300 })
      saveHistory() // Simulate what onNodesChange does
      expect(useEditorStore.getState().nodes[0].position).toEqual({ x: 500, y: 300 })

      undo()
      expect(useEditorStore.getState().nodes[0].position).toEqual(originalPos)

      redo()
      expect(useEditorStore.getState().nodes[0].position).toEqual({ x: 500, y: 300 })
    })

    it('should update position for multiple nodes independently', () => {
      const { createMindmap, addChild, updateNodePosition } = useEditorStore.getState()

      createMindmap('Root')
      const rootId = useEditorStore.getState().nodes[0].nodeId
      addChild(rootId)
      const childId = useEditorStore.getState().nodes[1].nodeId

      updateNodePosition(rootId, { x: 100, y: 100 })
      updateNodePosition(childId, { x: 300, y: 300 })

      const state = useEditorStore.getState()
      expect(state.nodes[0].position).toEqual({ x: 100, y: 100 })
      expect(state.nodes[1].position).toEqual({ x: 300, y: 300 })
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

  describe('Sticky Notes', () => {
    it('should add a sticky note at canvas center', () => {
      const { addStickyNote, setCenter } = useEditorStore.getState()

      // Set canvas center
      setCenter(100, 200)

      addStickyNote()

      const state = useEditorStore.getState()
      expect(state.nodes).toHaveLength(1)

      const stickyNote = state.nodes[0]
      expect(stickyNote.content.text).toBe('Double-click to edit')
      expect(stickyNote.content.nodeType).toBe('stickyNote')
      expect(stickyNote.position.x).toBe(100)
      expect(stickyNote.position.y).toBe(200)
    })

    it('should select the newly created sticky note', () => {
      const { addStickyNote } = useEditorStore.getState()

      addStickyNote()

      const state = useEditorStore.getState()
      const stickyNote = state.nodes[0]
      expect(state.ui.selectedNodeId).toBe(stickyNote.nodeId)
    })

    it('should not create edges for sticky notes', () => {
      const { addStickyNote } = useEditorStore.getState()

      addStickyNote()

      const state = useEditorStore.getState()
      expect(state.edges).toHaveLength(0)
    })

    it('should add sticky note to history', () => {
      const { addStickyNote } = useEditorStore.getState()

      addStickyNote()

      const state = useEditorStore.getState()
      expect(state.history.length).toBeGreaterThan(0)
    })

    it('should create multiple sticky notes independently', () => {
      const { addStickyNote, setCenter } = useEditorStore.getState()

      setCenter(0, 0)
      addStickyNote()

      setCenter(100, 100)
      addStickyNote()

      const state = useEditorStore.getState()
      expect(state.nodes).toHaveLength(2)
      expect(state.edges).toHaveLength(0)

      // Both should be sticky notes
      expect(state.nodes[0].content.nodeType).toBe('stickyNote')
      expect(state.nodes[1].content.nodeType).toBe('stickyNote')

      // Different positions
      expect(state.nodes[0].position).toEqual({ x: 0, y: 0 })
      expect(state.nodes[1].position).toEqual({ x: 100, y: 100 })
    })

    it('should not interfere with regular mindmap nodes', () => {
      const { createMindmap, addChild, addStickyNote } = useEditorStore.getState()

      // Create mindmap with nodes
      createMindmap('Test')
      const rootId = useEditorStore.getState().nodes[0].nodeId
      addChild(rootId)

      // Add sticky note
      addStickyNote()

      const state = useEditorStore.getState()
      expect(state.nodes).toHaveLength(3) // root + child + sticky
      expect(state.edges).toHaveLength(1) // only parent-child edge

      // Verify sticky note is separate
      const stickyNote = state.nodes.find((n) => n.content.nodeType === 'stickyNote')
      expect(stickyNote).toBeDefined()
      expect(state.edges.some((e) => e.from === stickyNote?.nodeId || e.to === stickyNote?.nodeId)).toBe(false)
    })
  })
})

