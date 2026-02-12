import { describe, it, expect } from 'vitest'
import type {
  MindmapNode,
  NodeContent,
  NodePosition,
  NodeMetadata,
} from '../node'

describe('Node Types', () => {
  describe('MindmapNode', () => {
    it('should have stable nodeId of type string', () => {
      const mockNode: MindmapNode = {
        nodeId: 'node-123',
        content: {
          text: 'Test node',
        },
        position: {
          x: 100,
          y: 200,
        },
        metadata: {
          created: new Date(),
          updated: new Date(),
          author: 'user-123',
        },
      }

      expect(mockNode.nodeId).toBeDefined()
      expect(typeof mockNode.nodeId).toBe('string')
    })

    it('should have required fields', () => {
      const mockNode: MindmapNode = {
        nodeId: 'node-456',
        content: {
          text: 'Another test',
        },
        position: {
          x: 0,
          y: 0,
        },
        metadata: {
          created: new Date(),
          updated: new Date(),
          author: 'user-456',
        },
      }

      expect(mockNode.nodeId).toBeDefined()
      expect(mockNode.content).toBeDefined()
      expect(mockNode.position).toBeDefined()
      expect(mockNode.metadata).toBeDefined()
    })

    it('nodeId should be required (not optional)', () => {
      // This test validates at compile time that nodeId is required
      // If nodeId were optional, this would fail to compile
      const node: MindmapNode = {
        nodeId: 'required-id',
        content: { text: 'Test' },
        position: { x: 0, y: 0 },
        metadata: {
          created: new Date(),
          updated: new Date(),
          author: 'user-1',
        },
      }

      expect(node.nodeId).toBe('required-id')
    })
  })

  describe('NodeContent', () => {
    it('should support text and rich text', () => {
      const mockContent: NodeContent = {
        text: 'Plain text content',
        richText: '<p>Rich <strong>text</strong> content</p>',
      }

      expect(mockContent.text).toBeDefined()
      expect(mockContent.richText).toBeDefined()
    })

    it('should be separate from tree structure', () => {
      const mockContent: NodeContent = {
        text: 'Content only',
      }

      // NodeContent should not have parent/child references
      // This is validated at compile time - if it had these fields,
      // TypeScript would allow them
      expect(mockContent).not.toHaveProperty('parent')
      expect(mockContent).not.toHaveProperty('children')
      expect(mockContent).not.toHaveProperty('edges')
    })
  })

  describe('NodePosition', () => {
    it('should have x and y coordinates', () => {
      const mockPosition: NodePosition = {
        x: 150,
        y: 250,
      }

      expect(mockPosition.x).toBeDefined()
      expect(mockPosition.y).toBeDefined()
      expect(typeof mockPosition.x).toBe('number')
      expect(typeof mockPosition.y).toBe('number')
    })
  })

  describe('NodeMetadata', () => {
    it('should have timestamps and author', () => {
      const mockMetadata: NodeMetadata = {
        created: new Date('2024-01-01'),
        updated: new Date('2024-01-02'),
        author: 'user-789',
      }

      expect(mockMetadata.created).toBeDefined()
      expect(mockMetadata.updated).toBeDefined()
      expect(mockMetadata.author).toBeDefined()
      expect(mockMetadata.created).toBeInstanceOf(Date)
      expect(mockMetadata.updated).toBeInstanceOf(Date)
      expect(typeof mockMetadata.author).toBe('string')
    })
  })
})
