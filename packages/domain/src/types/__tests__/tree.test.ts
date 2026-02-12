import { describe, it, expect } from 'vitest'
import type { MindmapTree, NodeEdge, EdgeType } from '../tree'

describe('Tree Types', () => {
  describe('MindmapTree', () => {
    it('should have nodes and edges', () => {
      const mockTree: MindmapTree = {
        nodes: [
          {
            nodeId: 'root',
            content: { text: 'Root' },
            position: { x: 0, y: 0 },
            metadata: {
              created: new Date(),
              updated: new Date(),
              author: 'user-1',
            },
          },
        ],
        edges: [
          {
            from: 'root',
            to: 'child-1',
            type: 'parent-child',
          },
        ],
        rootId: 'root',
      }

      expect(mockTree.nodes).toBeDefined()
      expect(mockTree.edges).toBeDefined()
      expect(mockTree.rootId).toBeDefined()
      expect(Array.isArray(mockTree.nodes)).toBe(true)
      expect(Array.isArray(mockTree.edges)).toBe(true)
    })
  })

  describe('NodeEdge', () => {
    it('should have from and to references', () => {
      const mockEdge: NodeEdge = {
        from: 'node-1',
        to: 'node-2',
        type: 'parent-child',
      }

      expect(mockEdge.from).toBeDefined()
      expect(mockEdge.to).toBeDefined()
      expect(mockEdge.type).toBeDefined()
    })

    it('should reference nodes by nodeId (string type)', () => {
      const mockEdge: NodeEdge = {
        from: 'parent-node-id',
        to: 'child-node-id',
        type: 'parent-child',
      }

      expect(typeof mockEdge.from).toBe('string')
      expect(typeof mockEdge.to).toBe('string')
    })
  })

  describe('EdgeType', () => {
    it('should be parent-child or reference', () => {
      const parentChild: EdgeType = 'parent-child'
      const reference: EdgeType = 'reference'

      expect(parentChild).toBe('parent-child')
      expect(reference).toBe('reference')
    })

    it('should work in NodeEdge type field', () => {
      const parentChildEdge: NodeEdge = {
        from: 'a',
        to: 'b',
        type: 'parent-child',
      }

      const referenceEdge: NodeEdge = {
        from: 'c',
        to: 'd',
        type: 'reference',
      }

      expect(parentChildEdge.type).toBe('parent-child')
      expect(referenceEdge.type).toBe('reference')
    })
  })
})
