import { describe, it, expect } from 'vitest'
import { createNode, addChildNode, addSiblingNode, updateNodeContent, deleteNode } from '../operations/tree'
import type { MindmapNode, NodeEdge } from '@mindmap/domain'

describe('Tree Operations', () => {
  describe('createNode', () => {
    it('should create a node with default values', () => {
      const node = createNode()

      expect(node.nodeId).toBeDefined()
      expect(node.content.text).toBe('')
      expect(node.position).toEqual({ x: 0, y: 0 })
      expect(node.metadata.created).toBeInstanceOf(Date)
      expect(node.metadata.updated).toBeInstanceOf(Date)
    })

    it('should create a node with custom content and position', () => {
      const node = createNode({ text: 'Test' }, { x: 100, y: 200 })

      expect(node.content.text).toBe('Test')
      expect(node.position).toEqual({ x: 100, y: 200 })
    })
  })

  describe('addChildNode', () => {
    it('should add a child node to a parent', () => {
      const parent = createNode({ text: 'Parent' }, { x: 0, y: 0 })
      const nodes: MindmapNode[] = [parent]
      const edges: NodeEdge[] = []

      const result = addChildNode(nodes, edges, parent.nodeId)

      expect(result.nodes).toHaveLength(2)
      expect(result.edges).toHaveLength(1)
      expect(result.edges[0].from).toBe(parent.nodeId)
      expect(result.edges[0].to).toBe(result.newNodeId)
      expect(result.edges[0].type).toBe('parent-child')
    })

    it('should position child nodes vertically', () => {
      const parent = createNode({ text: 'Parent' }, { x: 0, y: 0 })
      let nodes: MindmapNode[] = [parent]
      let edges: NodeEdge[] = []

      // Add first child
      const result1 = addChildNode(nodes, edges, parent.nodeId)
      nodes = result1.nodes
      edges = result1.edges

      // Add second child
      const result2 = addChildNode(nodes, edges, parent.nodeId)

      const child1 = result2.nodes.find((n) => n.nodeId === result1.newNodeId)
      const child2 = result2.nodes.find((n) => n.nodeId === result2.newNodeId)

      expect(child1?.position.y).toBe(0)
      expect(child2?.position.y).toBe(80) // 80px spacing
    })

    it('should throw error if parent not found', () => {
      const nodes: MindmapNode[] = []
      const edges: NodeEdge[] = []

      expect(() => addChildNode(nodes, edges, 'nonexistent')).toThrow('Parent node nonexistent not found')
    })
  })

  describe('addSiblingNode', () => {
    it('should add a sibling node at the same level', () => {
      const root = createNode({ text: 'Root' }, { x: 0, y: 0 })
      const child1 = createNode({ text: 'Child 1' }, { x: 200, y: 0 })
      const nodes: MindmapNode[] = [root, child1]
      const edges: NodeEdge[] = [
        { from: root.nodeId, to: child1.nodeId, type: 'parent-child' },
      ]

      const result = addSiblingNode(nodes, edges, child1.nodeId)

      expect(result.nodes).toHaveLength(3)
      expect(result.edges).toHaveLength(2)

      // New sibling should have same parent as reference node
      const newSiblingEdge = result.edges.find((e) => e.to === result.newNodeId)
      expect(newSiblingEdge?.from).toBe(root.nodeId)
    })

    it('should throw error for root node', () => {
      const root = createNode({ text: 'Root' }, { x: 0, y: 0 })
      const nodes: MindmapNode[] = [root]
      const edges: NodeEdge[] = []

      expect(() => addSiblingNode(nodes, edges, root.nodeId)).toThrow('Cannot add sibling to root node')
    })
  })

  describe('updateNodeContent', () => {
    it('should update node content and timestamp', () => {
      const node = createNode({ text: 'Original' }, { x: 0, y: 0 })
      const nodes: MindmapNode[] = [node]

      const updatedNodes = updateNodeContent(nodes, node.nodeId, { text: 'Updated' })

      expect(updatedNodes[0].content.text).toBe('Updated')
      expect(updatedNodes[0].metadata.updated.getTime()).toBeGreaterThanOrEqual(node.metadata.updated.getTime())
    })

    it('should not modify other nodes', () => {
      const node1 = createNode({ text: 'Node 1' }, { x: 0, y: 0 })
      const node2 = createNode({ text: 'Node 2' }, { x: 100, y: 0 })
      const nodes: MindmapNode[] = [node1, node2]

      const updatedNodes = updateNodeContent(nodes, node1.nodeId, { text: 'Updated' })

      expect(updatedNodes[0].content.text).toBe('Updated')
      expect(updatedNodes[1].content.text).toBe('Node 2')
    })
  })

  describe('deleteNode', () => {
    it('should delete a node and its edges', () => {
      const root = createNode({ text: 'Root' }, { x: 0, y: 0 })
      const child = createNode({ text: 'Child' }, { x: 200, y: 0 })
      const nodes: MindmapNode[] = [root, child]
      const edges: NodeEdge[] = [
        { from: root.nodeId, to: child.nodeId, type: 'parent-child' },
      ]

      const result = deleteNode(nodes, edges, child.nodeId)

      expect(result.nodes).toHaveLength(1)
      expect(result.nodes[0].nodeId).toBe(root.nodeId)
      expect(result.edges).toHaveLength(0)
    })

    it('should delete a node and all its descendants', () => {
      const root = createNode({ text: 'Root' }, { x: 0, y: 0 })
      const child = createNode({ text: 'Child' }, { x: 200, y: 0 })
      const grandchild = createNode({ text: 'Grandchild' }, { x: 400, y: 0 })
      const nodes: MindmapNode[] = [root, child, grandchild]
      const edges: NodeEdge[] = [
        { from: root.nodeId, to: child.nodeId, type: 'parent-child' },
        { from: child.nodeId, to: grandchild.nodeId, type: 'parent-child' },
      ]

      const result = deleteNode(nodes, edges, child.nodeId)

      expect(result.nodes).toHaveLength(1)
      expect(result.nodes[0].nodeId).toBe(root.nodeId)
      expect(result.edges).toHaveLength(0)
    })

    it('should throw error when deleting root node', () => {
      const root = createNode({ text: 'Root' }, { x: 0, y: 0 })
      const nodes: MindmapNode[] = [root]
      const edges: NodeEdge[] = []

      expect(() => deleteNode(nodes, edges, root.nodeId)).toThrow('Cannot delete root node')
    })
  })
})

