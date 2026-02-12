import { describe, it, expect } from 'vitest'
import type {
  Mindmap,
  MindmapMetadata,
  MindmapStatus,
  MindmapNode,
  NodeContent,
  NodePosition,
  NodeMetadata,
  MindmapTree,
  NodeEdge,
  EdgeType,
  Flashcard,
  SRSMetadata,
  Comment,
  ModerationStatus,
} from '../../index'

describe('Type Exports', () => {
  describe('Mindmap types export', () => {
    it('should export all mindmap types', () => {
      // TypeScript compilation validates that these types are exported
      // If they weren't exported, this file would fail to compile
      const mockMindmap: Mindmap = {
        id: '1',
        metadata: {
          title: 'Test',
          description: '',
          created: new Date(),
          updated: new Date(),
        },
        status: 'draft',
        ownerId: 'user-1',
      }

      const mockMetadata: MindmapMetadata = {
        title: 'Test',
        description: '',
        created: new Date(),
        updated: new Date(),
      }

      const mockStatus: MindmapStatus = 'published'

      expect(mockMindmap).toBeDefined()
      expect(mockMetadata).toBeDefined()
      expect(mockStatus).toBeDefined()
    })
  })

  describe('Node types export', () => {
    it('should export all node types', () => {
      const mockNode: MindmapNode = {
        nodeId: 'node-1',
        content: { text: 'Test' },
        position: { x: 0, y: 0 },
        metadata: {
          created: new Date(),
          updated: new Date(),
          author: 'user-1',
        },
      }

      const mockContent: NodeContent = { text: 'Test' }
      const mockPosition: NodePosition = { x: 0, y: 0 }
      const mockMetadata: NodeMetadata = {
        created: new Date(),
        updated: new Date(),
        author: 'user-1',
      }

      expect(mockNode).toBeDefined()
      expect(mockContent).toBeDefined()
      expect(mockPosition).toBeDefined()
      expect(mockMetadata).toBeDefined()
    })
  })

  describe('Tree types export', () => {
    it('should export all tree types', () => {
      const mockTree: MindmapTree = {
        nodes: [],
        edges: [],
        rootId: 'root',
      }

      const mockEdge: NodeEdge = {
        from: 'a',
        to: 'b',
        type: 'parent-child',
      }

      const mockEdgeType: EdgeType = 'reference'

      expect(mockTree).toBeDefined()
      expect(mockEdge).toBeDefined()
      expect(mockEdgeType).toBeDefined()
    })
  })

  describe('Learning types export', () => {
    it('should export all learning types', () => {
      const mockFlashcard: Flashcard = {
        id: 'fc-1',
        nodeId: 'node-1',
        question: 'Q',
        answer: 'A',
      }

      const mockSRS: SRSMetadata = {
        interval: 1,
        ease: 2.5,
        nextReview: new Date(),
      }

      expect(mockFlashcard).toBeDefined()
      expect(mockSRS).toBeDefined()
    })
  })

  describe('Community types export', () => {
    it('should export all community types', () => {
      const mockComment: Comment = {
        id: 'c-1',
        nodeId: 'node-1',
        content: 'Test',
        author: 'user-1',
        status: 'pending',
      }

      const mockStatus: ModerationStatus = 'approved'

      expect(mockComment).toBeDefined()
      expect(mockStatus).toBeDefined()
    })
  })

  describe('Type compatibility', () => {
    it('should allow using all types together', () => {
      // This test validates that all types work together correctly
      const node: MindmapNode = {
        nodeId: 'node-123',
        content: { text: 'Learning TypeScript' },
        position: { x: 100, y: 200 },
        metadata: {
          created: new Date(),
          updated: new Date(),
          author: 'user-1',
        },
      }

      const flashcard: Flashcard = {
        id: 'fc-1',
        nodeId: node.nodeId, // References the node's stable ID
        question: 'What is TypeScript?',
        answer: 'A typed superset of JavaScript',
      }

      const comment: Comment = {
        id: 'c-1',
        nodeId: node.nodeId, // References the same node
        content: 'Great explanation!',
        author: 'user-2',
        status: 'approved',
      }

      expect(flashcard.nodeId).toBe(node.nodeId)
      expect(comment.nodeId).toBe(node.nodeId)
    })
  })
})
