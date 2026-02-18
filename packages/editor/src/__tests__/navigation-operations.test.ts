import { describe, it, expect } from 'vitest'
import { getAncestorPath, getChildren, buildBreadcrumb } from '../operations/navigation'
import type { MindmapNode, NodeEdge } from '@mindmap/domain'

describe('Navigation Operations', () => {
  // Test data: root -> parent -> child
  const nodes: MindmapNode[] = [
    {
      nodeId: 'root',
      content: { text: 'Foundation' },
      position: { x: 0, y: 0 },
      metadata: {
        created: new Date(),
        updated: new Date(),
        author: 'test-user',
      },
    },
    {
      nodeId: 'parent',
      content: { text: 'Programming' },
      position: { x: 200, y: 0 },
      metadata: {
        created: new Date(),
        updated: new Date(),
        author: 'test-user',
      },
    },
    {
      nodeId: 'child',
      content: { text: 'Variables' },
      position: { x: 400, y: 0 },
      metadata: {
        created: new Date(),
        updated: new Date(),
        author: 'test-user',
      },
    },
  ]

  const edges: NodeEdge[] = [
    { from: 'root', to: 'parent', type: 'parent-child' },
    { from: 'parent', to: 'child', type: 'parent-child' },
  ]

  describe('getAncestorPath', () => {
    it('should return path from node to root', () => {
      const path = getAncestorPath(edges, 'child')
      expect(path).toEqual(['child', 'parent', 'root'])
    })

    it('should return single item for root node', () => {
      const path = getAncestorPath(edges, 'root')
      expect(path).toEqual(['root'])
    })

    it('should return path for middle node', () => {
      const path = getAncestorPath(edges, 'parent')
      expect(path).toEqual(['parent', 'root'])
    })

    it('should handle node with no edges', () => {
      const path = getAncestorPath([], 'orphan')
      expect(path).toEqual(['orphan'])
    })
  })

  describe('getChildren', () => {
    it('should return direct children only', () => {
      const children = getChildren(edges, 'root')
      expect(children).toEqual(['parent'])
    })

    it('should return empty array for leaf node', () => {
      const children = getChildren(edges, 'child')
      expect(children).toEqual([])
    })

    it('should return multiple children', () => {
      const edgesWithMultipleChildren: NodeEdge[] = [
        { from: 'root', to: 'child1', type: 'parent-child' },
        { from: 'root', to: 'child2', type: 'parent-child' },
        { from: 'root', to: 'child3', type: 'parent-child' },
      ]
      const children = getChildren(edgesWithMultipleChildren, 'root')
      expect(children).toEqual(['child1', 'child2', 'child3'])
    })

    it('should not include reference edges', () => {
      const edgesWithReference: NodeEdge[] = [
        { from: 'root', to: 'child1', type: 'parent-child' },
        { from: 'root', to: 'child2', type: 'reference' },
      ]
      const children = getChildren(edgesWithReference, 'root')
      expect(children).toEqual(['child1'])
    })
  })

  describe('buildBreadcrumb', () => {
    it('should build breadcrumb from root to current node', () => {
      const breadcrumb = buildBreadcrumb(nodes, edges, 'child')
      expect(breadcrumb).toEqual([
        { nodeId: 'root', title: 'Foundation' },
        { nodeId: 'parent', title: 'Programming' },
        { nodeId: 'child', title: 'Variables' },
      ])
    })

    it('should handle root node', () => {
      const breadcrumb = buildBreadcrumb(nodes, edges, 'root')
      expect(breadcrumb).toEqual([
        { nodeId: 'root', title: 'Foundation' },
      ])
    })

    it('should use "Untitled" for nodes without text', () => {
      const nodesWithoutText: MindmapNode[] = [
        {
          nodeId: 'node1',
          content: {},
          position: { x: 0, y: 0 },
          metadata: {
            created: new Date(),
            updated: new Date(),
            author: 'test-user',
          },
        },
      ]
      const breadcrumb = buildBreadcrumb(nodesWithoutText, [], 'node1')
      expect(breadcrumb).toEqual([
        { nodeId: 'node1', title: 'Untitled' },
      ])
    })
  })
})

