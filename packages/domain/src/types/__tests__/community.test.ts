import { describe, it, expect } from 'vitest'
import type { Comment, ModerationStatus } from '../community'

describe('Community Types', () => {
  describe('Comment', () => {
    it('should have required fields', () => {
      const mockComment: Comment = {
        id: 'comment-123',
        nodeId: 'node-456',
        content: 'This is a great mindmap!',
        author: 'user-789',
        status: 'pending',
      }

      expect(mockComment.id).toBeDefined()
      expect(mockComment.nodeId).toBeDefined()
      expect(mockComment.content).toBeDefined()
      expect(mockComment.author).toBeDefined()
      expect(mockComment.status).toBeDefined()
    })

    it('should reference node via nodeId', () => {
      const mockComment: Comment = {
        id: 'c-1',
        nodeId: 'stable-node-id-123',
        content: 'Comment text',
        author: 'user-1',
        status: 'approved',
      }

      expect(mockComment.nodeId).toBeDefined()
      expect(typeof mockComment.nodeId).toBe('string')
    })

    it('nodeId reference should be stable (string type)', () => {
      // The nodeId is a stable reference to a MindmapNode
      // It should be a string that never changes
      const comment: Comment = {
        id: 'c-2',
        nodeId: 'immutable-node-reference',
        content: 'Test comment',
        author: 'user-2',
        status: 'rejected',
      }

      const nodeIdReference = comment.nodeId
      expect(typeof nodeIdReference).toBe('string')
      expect(nodeIdReference).toBe('immutable-node-reference')
    })

    it('should accept all ModerationStatus values', () => {
      const pendingComment: Comment = {
        id: '1',
        nodeId: 'n1',
        content: 'Pending',
        author: 'u1',
        status: 'pending',
      }

      const approvedComment: Comment = {
        id: '2',
        nodeId: 'n2',
        content: 'Approved',
        author: 'u2',
        status: 'approved',
      }

      const rejectedComment: Comment = {
        id: '3',
        nodeId: 'n3',
        content: 'Rejected',
        author: 'u3',
        status: 'rejected',
      }

      expect(pendingComment.status).toBe('pending')
      expect(approvedComment.status).toBe('approved')
      expect(rejectedComment.status).toBe('rejected')
    })
  })

  describe('ModerationStatus', () => {
    it('should be valid enum values', () => {
      const pending: ModerationStatus = 'pending'
      const approved: ModerationStatus = 'approved'
      const rejected: ModerationStatus = 'rejected'

      expect(pending).toBe('pending')
      expect(approved).toBe('approved')
      expect(rejected).toBe('rejected')
    })
  })
})
