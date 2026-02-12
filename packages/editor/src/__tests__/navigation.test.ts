import { describe, it, expect, beforeEach } from 'vitest'
import { useEditorStore } from '../store/editorStore'

describe('Navigation', () => {
  beforeEach(() => {
    useEditorStore.getState().reset()
  })

  describe('Arrow Key Navigation', () => {
    it('should navigate to first child with ArrowRight', () => {
      const { createMindmap, addChild, selectNode } = useEditorStore.getState()

      // Create mindmap with root and child
      createMindmap('Root')
      const rootId = useEditorStore.getState().nodes[0].nodeId
      addChild(rootId)
      const childId = useEditorStore.getState().nodes[1].nodeId

      // Select root
      selectNode(rootId)
      expect(useEditorStore.getState().ui.selectedNodeId).toBe(rootId)

      // Navigate right should select child
      const { edges } = useEditorStore.getState()
      const firstChild = edges.find((e) => e.from === rootId)?.to
      expect(firstChild).toBe(childId)
    })

    it('should navigate to parent with ArrowLeft', () => {
      const { createMindmap, addChild, selectNode } = useEditorStore.getState()

      // Create mindmap with root and child
      createMindmap('Root')
      const rootId = useEditorStore.getState().nodes[0].nodeId
      addChild(rootId)
      const childId = useEditorStore.getState().nodes[1].nodeId

      // Select child
      selectNode(childId)

      // Find parent
      const { edges } = useEditorStore.getState()
      const parent = edges.find((e) => e.to === childId)?.from
      expect(parent).toBe(rootId)
    })

    it('should navigate to next sibling with ArrowDown', () => {
      const { createMindmap, addChild, addSibling, selectNode } = useEditorStore.getState()

      // Create mindmap with root and two children
      createMindmap('Root')
      const rootId = useEditorStore.getState().nodes[0].nodeId
      addChild(rootId)
      const child1Id = useEditorStore.getState().nodes[1].nodeId
      addSibling(child1Id)
      const child2Id = useEditorStore.getState().nodes[2].nodeId

      // Select first child
      selectNode(child1Id)

      // Find siblings
      const { edges } = useEditorStore.getState()
      const siblings = edges.filter((e) => e.from === rootId).map((e) => e.to)
      expect(siblings).toContain(child1Id)
      expect(siblings).toContain(child2Id)
    })

    it('should navigate to previous sibling with ArrowUp', () => {
      const { createMindmap, addChild, addSibling, selectNode } = useEditorStore.getState()

      // Create mindmap with root and two children
      createMindmap('Root')
      const rootId = useEditorStore.getState().nodes[0].nodeId
      addChild(rootId)
      const child1Id = useEditorStore.getState().nodes[1].nodeId
      addSibling(child1Id)
      const child2Id = useEditorStore.getState().nodes[2].nodeId

      // Select second child
      selectNode(child2Id)

      // Find siblings
      const { edges } = useEditorStore.getState()
      const siblings = edges.filter((e) => e.from === rootId).map((e) => e.to)
      const currentIndex = siblings.indexOf(child2Id)
      expect(currentIndex).toBeGreaterThan(0)
      expect(siblings[currentIndex - 1]).toBe(child1Id)
    })
  })

  describe('Tree Structure', () => {
    it('should maintain parent-child relationships', () => {
      const { createMindmap, addChild } = useEditorStore.getState()

      createMindmap('Root')
      const rootId = useEditorStore.getState().nodes[0].nodeId
      addChild(rootId)

      const { edges } = useEditorStore.getState()
      const childEdge = edges.find((e) => e.from === rootId)

      expect(childEdge).toBeDefined()
      expect(childEdge?.type).toBe('parent-child')
    })

    it('should maintain sibling relationships', () => {
      const { createMindmap, addChild, addSibling } = useEditorStore.getState()

      createMindmap('Root')
      const rootId = useEditorStore.getState().nodes[0].nodeId
      addChild(rootId)
      const child1Id = useEditorStore.getState().nodes[1].nodeId
      addSibling(child1Id)

      const { edges } = useEditorStore.getState()
      const siblings = edges.filter((e) => e.from === rootId && e.type === 'parent-child')

      expect(siblings).toHaveLength(2)
    })
  })
})

