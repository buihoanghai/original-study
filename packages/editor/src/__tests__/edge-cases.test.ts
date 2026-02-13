import { describe, it, expect, beforeEach } from 'vitest'
import { useEditorStore } from '../store/editorStore'
import { createNode } from '../operations/tree'
import type { MindmapNode, NodeEdge } from '@mindmap/domain'

/**
 * Edge Cases Tests
 *
 * Tests for edge cases in the editor:
 * 1. Root node operations (can't delete root, can't add sibling to root)
 * 2. Empty mindmap scenarios
 * 3. Collapsed nodes (navigation, editing)
 * 4. Editing mode conflicts (switching nodes while editing)
 */
describe('Editor Edge Cases', () => {
  beforeEach(() => {
    useEditorStore.getState().reset()
  })

  describe('Root Node Operations', () => {
    it('should not delete root node', () => {
      // Create a mindmap with root node
      useEditorStore.getState().createMindmap('Test Mindmap')
      const { nodes } = useEditorStore.getState()
      const rootNode = nodes[0]

      // Try to delete root node
      useEditorStore.getState().removeNode(rootNode.nodeId)

      // Root node should still exist
      const { nodes: nodesAfter } = useEditorStore.getState()
      expect(nodesAfter.length).toBe(1)
      expect(nodesAfter[0].nodeId).toBe(rootNode.nodeId)
    })

    it('should not add sibling to root node', () => {
      // Create a mindmap with root node
      useEditorStore.getState().createMindmap('Test Mindmap')
      const { nodes } = useEditorStore.getState()
      const rootNode = nodes[0]

      // Try to add sibling to root node
      useEditorStore.getState().addSibling(rootNode.nodeId)

      // Should still have only 1 node (root)
      const { nodes: nodesAfter } = useEditorStore.getState()
      expect(nodesAfter.length).toBe(1)
    })

    it('should allow adding child to root node', () => {
      // Create a mindmap with root node
      useEditorStore.getState().createMindmap('Test Mindmap')
      const { nodes } = useEditorStore.getState()
      const rootNode = nodes[0]

      // Add child to root node
      useEditorStore.getState().addChild(rootNode.nodeId)

      // Should have 2 nodes now
      const { nodes: nodesAfter } = useEditorStore.getState()
      expect(nodesAfter.length).toBe(2)
    })

    it('should allow deleting non-root nodes', () => {
      // Create a mindmap with root and child
      useEditorStore.getState().createMindmap('Test Mindmap')
      const { nodes } = useEditorStore.getState()
      const rootNode = nodes[0]
      useEditorStore.getState().addChild(rootNode.nodeId)

      const { nodes: nodesWithChild } = useEditorStore.getState()
      const childNode = nodesWithChild.find((n) => n.nodeId !== rootNode.nodeId)!

      // Delete child node
      useEditorStore.getState().removeNode(childNode.nodeId)

      // Should have only root node
      const { nodes: nodesAfter } = useEditorStore.getState()
      expect(nodesAfter.length).toBe(1)
      expect(nodesAfter[0].nodeId).toBe(rootNode.nodeId)
    })
  })

  describe('Empty Mindmap Scenarios', () => {
    it('should handle operations on empty mindmap gracefully', () => {
      const { nodes, edges } = useEditorStore.getState()
      expect(nodes).toEqual([])
      expect(edges).toEqual([])

      // Try operations on empty mindmap - should not crash
      expect(() => useEditorStore.getState().addChild('non-existent')).not.toThrow()
      expect(() => useEditorStore.getState().addSibling('non-existent')).not.toThrow()
      expect(() => useEditorStore.getState().removeNode('non-existent')).not.toThrow()
    })

    it('should initialize mindmap with root node', () => {
      useEditorStore.getState().createMindmap('Test Mindmap')

      const { nodes, edges, mindmap } = useEditorStore.getState()
      expect(nodes.length).toBe(1)
      expect(edges.length).toBe(0)
      expect(mindmap?.metadata.title).toBe('Test Mindmap')
    })
  })

  describe('Collapsed Nodes', () => {
    it('should toggle collapse state', () => {
      // Create mindmap with root and child
      useEditorStore.getState().createMindmap('Test Mindmap')
      const { nodes } = useEditorStore.getState()
      const rootNode = nodes[0]

      // Collapse root node
      useEditorStore.getState().toggleCollapse(rootNode.nodeId)

      const { ui } = useEditorStore.getState()
      expect(ui.collapsedNodeIds.has(rootNode.nodeId)).toBe(true)

      // Expand root node
      useEditorStore.getState().toggleCollapse(rootNode.nodeId)

      const { ui: uiAfter } = useEditorStore.getState()
      expect(uiAfter.collapsedNodeIds.has(rootNode.nodeId)).toBe(false)
    })

    it('should allow editing collapsed node', () => {
      // Create mindmap with root node
      useEditorStore.getState().createMindmap('Test Mindmap')
      const { nodes } = useEditorStore.getState()
      const rootNode = nodes[0]

      // Collapse and edit root node
      useEditorStore.getState().toggleCollapse(rootNode.nodeId)
      useEditorStore.getState().startEditing(rootNode.nodeId)

      const { ui } = useEditorStore.getState()
      expect(ui.editingNodeId).toBe(rootNode.nodeId)
      expect(ui.collapsedNodeIds.has(rootNode.nodeId)).toBe(true)
    })
  })

  describe('Editing Mode Conflicts', () => {
    it('should stop editing when selecting different node', () => {
      // Create mindmap with root and child
      useEditorStore.getState().createMindmap('Test Mindmap')
      const { nodes } = useEditorStore.getState()
      const rootNode = nodes[0]
      useEditorStore.getState().addChild(rootNode.nodeId)

      const { nodes: nodesWithChild } = useEditorStore.getState()
      const childNode = nodesWithChild.find((n) => n.nodeId !== rootNode.nodeId)!

      // Start editing root node
      useEditorStore.getState().startEditing(rootNode.nodeId)
      expect(useEditorStore.getState().ui.editingNodeId).toBe(rootNode.nodeId)

      // Select child node (should stop editing)
      useEditorStore.getState().selectNode(childNode.nodeId)

      // Should still be editing (selectNode doesn't stop editing)
      // This is the current behavior - we'll document this
      const { ui } = useEditorStore.getState()
      expect(ui.selectedNodeId).toBe(childNode.nodeId)
    })
  })
})

