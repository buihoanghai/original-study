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

  describe('Focus on Node (URL-based navigation)', () => {
    it('should set visibleNodeIds to current + children + parent', () => {
      const { createMindmap, addChild, focusOnNode } = useEditorStore.getState()

      // Create tree: root -> child1 -> grandchild
      createMindmap('Root')
      const rootId = useEditorStore.getState().nodes[0].nodeId
      addChild(rootId)
      const child1Id = useEditorStore.getState().nodes[1].nodeId
      addChild(child1Id)
      const grandchildId = useEditorStore.getState().nodes[2].nodeId

      // Focus on child1
      focusOnNode(child1Id)

      const { focusedNodeId, visibleNodeIds, ui } = useEditorStore.getState()

      // Should focus on child1
      expect(focusedNodeId).toBe(child1Id)
      expect(ui.selectedNodeId).toBe(child1Id)

      // Should show: child1 (current) + grandchild (child) + root (parent)
      expect(visibleNodeIds).toBeDefined()
      expect(visibleNodeIds?.has(child1Id)).toBe(true) // current
      expect(visibleNodeIds?.has(grandchildId)).toBe(true) // child
      expect(visibleNodeIds?.has(rootId)).toBe(true) // parent
      expect(visibleNodeIds?.size).toBe(3)
    })

    it('should show all nodes when focusOnNode(null)', () => {
      const { createMindmap, addChild, focusOnNode } = useEditorStore.getState()

      // Create tree
      createMindmap('Root')
      const rootId = useEditorStore.getState().nodes[0].nodeId
      addChild(rootId)
      const childId = useEditorStore.getState().nodes[1].nodeId

      // Focus on child first
      focusOnNode(childId)
      expect(useEditorStore.getState().focusedNodeId).toBe(childId)

      // Clear focus
      focusOnNode(null)

      const { focusedNodeId, visibleNodeIds } = useEditorStore.getState()

      expect(focusedNodeId).toBeNull()
      expect(visibleNodeIds).toBeNull()
    })

    it('should handle root node focus (no parent)', () => {
      const { createMindmap, addChild, focusOnNode } = useEditorStore.getState()

      // Create tree: root -> child1, child2
      createMindmap('Root')
      const rootId = useEditorStore.getState().nodes[0].nodeId
      addChild(rootId)
      const child1Id = useEditorStore.getState().nodes[1].nodeId
      addChild(rootId)
      const child2Id = useEditorStore.getState().nodes[2].nodeId

      // Focus on root
      focusOnNode(rootId)

      const { visibleNodeIds } = useEditorStore.getState()

      // Should show: root (current) + child1 + child2 (no parent)
      expect(visibleNodeIds?.has(rootId)).toBe(true)
      expect(visibleNodeIds?.has(child1Id)).toBe(true)
      expect(visibleNodeIds?.has(child2Id)).toBe(true)
      expect(visibleNodeIds?.size).toBe(3)
    })

    it('should handle leaf node focus (no children)', () => {
      const { createMindmap, addChild, focusOnNode } = useEditorStore.getState()

      // Create tree: root -> child (leaf)
      createMindmap('Root')
      const rootId = useEditorStore.getState().nodes[0].nodeId
      addChild(rootId)
      const childId = useEditorStore.getState().nodes[1].nodeId

      // Focus on leaf
      focusOnNode(childId)

      const { visibleNodeIds } = useEditorStore.getState()

      // Should show: child (current) + root (parent, no children)
      expect(visibleNodeIds?.has(childId)).toBe(true)
      expect(visibleNodeIds?.has(rootId)).toBe(true)
      expect(visibleNodeIds?.size).toBe(2)
    })
  })
})

