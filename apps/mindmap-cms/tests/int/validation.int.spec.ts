import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Payload } from 'payload'

/**
 * Data Validation Integration Tests
 *
 * Tests validation rules across all collections:
 * - Required field validation
 * - Field length limits
 * - Data type validation
 * - Relationship integrity
 * - Unique constraints
 * - nodeId immutability
 */

describe('Data Validation Tests', () => {
  let payload: Payload
  let testUserId: string

  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    // Create test user
    const user = await payload.create({
      collection: 'users',
      data: {
        email: `validation-test-${Date.now()}@example.com`,
        password: 'test123456',
      },
    })
    testUserId = user.id
  }, 60000)

  afterAll(async () => {
    // Cleanup test user
    if (testUserId) {
      await payload.delete({
        collection: 'users',
        where: { id: { equals: testUserId } },
      })
    }
  })

  describe('Mindmaps Collection - Required Fields', () => {
    it('should require title field', async () => {
      await expect(
        payload.create({
          collection: 'mindmaps',
          data: {
            // Missing title
            status: 'draft',
            owner: testUserId,
          } as any,
        })
      ).rejects.toThrow()
    })

    it('should use default status value when not provided', async () => {
      const mindmap = await payload.create({
        collection: 'mindmaps',
        data: {
          title: 'Test Mindmap',
          // Missing status - should default to 'draft'
          owner: testUserId,
        },
      })

      expect(mindmap.status).toBe('draft')

      // Cleanup
      await payload.delete({
        collection: 'mindmaps',
        id: mindmap.id,
      })
    })

    it('should require owner field', async () => {
      await expect(
        payload.create({
          collection: 'mindmaps',
          data: {
            title: 'Test Mindmap',
            status: 'draft',
            // Missing owner
          } as any,
        })
      ).rejects.toThrow()
    })

    it('should allow optional description field', async () => {
      const mindmap = await payload.create({
        collection: 'mindmaps',
        data: {
          title: 'Test Mindmap',
          status: 'draft',
          owner: testUserId,
          // description is optional
        },
      })

      expect(mindmap.title).toBe('Test Mindmap')
      expect(mindmap.description).toBeUndefined()

      // Cleanup
      await payload.delete({
        collection: 'mindmaps',
        id: mindmap.id,
      })
    })
  })

  describe('Mindmaps Collection - Data Types', () => {
    it('should validate status enum values', async () => {
      await expect(
        payload.create({
          collection: 'mindmaps',
          data: {
            title: 'Test Mindmap',
            status: 'invalid-status' as any,
            owner: testUserId,
          },
        })
      ).rejects.toThrow()
    })

    it('should accept valid status values', async () => {
      const statuses = ['draft', 'published', 'archived']

      for (const status of statuses) {
        const mindmap = await payload.create({
          collection: 'mindmaps',
          data: {
            title: `Test Mindmap ${status}`,
            status: status as any,
            owner: testUserId,
          },
        })

        expect(mindmap.status).toBe(status)

        // Cleanup
        await payload.delete({
          collection: 'mindmaps',
          id: mindmap.id,
        })
      }
    })
  })

  describe('Mindmaps Collection - Relationship Integrity', () => {
    it('should reject invalid owner relationship', async () => {
      await expect(
        payload.create({
          collection: 'mindmaps',
          data: {
            title: 'Test Mindmap',
            status: 'draft',
            owner: 'non-existent-user-id',
          },
        })
      ).rejects.toThrow()
    })
  })

  describe('MindmapNodes Collection - nodeId Immutability', () => {
    it('should auto-generate nodeId on creation if not provided', async () => {
      // Create mindmap first
      const mindmap = await payload.create({
        collection: 'mindmaps',
        data: {
          title: 'Test Mindmap',
          status: 'draft',
          owner: testUserId,
        },
      })

      const node = await payload.create({
        collection: 'mindmap-nodes',
        data: {
          // nodeId not provided - should be auto-generated
          mindmap: mindmap.id,
          content: { text: 'Test Node' },
          position: { x: 0, y: 0 },
        },
      })

      expect(node.nodeId).toBeDefined()
      expect(typeof node.nodeId).toBe('string')
      expect(node.nodeId.length).toBeGreaterThan(0)

      // Cleanup
      await payload.delete({ collection: 'mindmap-nodes', id: node.id })
      await payload.delete({ collection: 'mindmaps', id: mindmap.id })
    })

    it('should preserve provided nodeId on creation', async () => {
      const mindmap = await payload.create({
        collection: 'mindmaps',
        data: {
          title: 'Test Mindmap',
          status: 'draft',
          owner: testUserId,
        },
      })

      const customNodeId = 'custom-node-id-123'
      const node = await payload.create({
        collection: 'mindmap-nodes',
        data: {
          nodeId: customNodeId,
          mindmap: mindmap.id,
          content: { text: 'Test Node' },
          position: { x: 0, y: 0 },
        },
      })

      expect(node.nodeId).toBe(customNodeId)

      // Cleanup
      await payload.delete({ collection: 'mindmap-nodes', id: node.id })
      await payload.delete({ collection: 'mindmaps', id: mindmap.id })
    })

    it('should prevent nodeId modification on update', async () => {
      const mindmap = await payload.create({
        collection: 'mindmaps',
        data: {
          title: 'Test Mindmap',
          status: 'draft',
          owner: testUserId,
        },
      })

      const node = await payload.create({
        collection: 'mindmap-nodes',
        data: {
          nodeId: 'original-node-id',
          mindmap: mindmap.id,
          content: { text: 'Test Node' },
          position: { x: 0, y: 0 },
        },
      })

      // Attempt to change nodeId should throw error
      await expect(
        payload.update({
          collection: 'mindmap-nodes',
          id: node.id,
          data: {
            nodeId: 'modified-node-id',
          },
        })
      ).rejects.toThrow(/nodeId cannot be changed/)

      // Cleanup
      await payload.delete({ collection: 'mindmap-nodes', id: node.id })
      await payload.delete({ collection: 'mindmaps', id: mindmap.id })
    })

    it('should preserve nodeId even if removed from update data', async () => {
      const mindmap = await payload.create({
        collection: 'mindmaps',
        data: {
          title: 'Test Mindmap',
          status: 'draft',
          owner: testUserId,
        },
      })

      const originalNodeId = 'stable-node-id'
      const node = await payload.create({
        collection: 'mindmap-nodes',
        data: {
          nodeId: originalNodeId,
          mindmap: mindmap.id,
          content: { text: 'Test Node' },
          position: { x: 0, y: 0 },
        },
      })

      // Update without nodeId in data
      const updated = await payload.update({
        collection: 'mindmap-nodes',
        id: node.id,
        data: {
          content: { text: 'Updated Node' },
        },
      })

      expect(updated.nodeId).toBe(originalNodeId)

      // Cleanup
      await payload.delete({ collection: 'mindmap-nodes', id: node.id })
      await payload.delete({ collection: 'mindmaps', id: mindmap.id })
    })
  })

  describe('MindmapNodes Collection - Required Fields', () => {
    it('should require mindmap relationship', async () => {
      await expect(
        payload.create({
          collection: 'mindmap-nodes',
          data: {
            nodeId: 'test-node',
            // Missing mindmap
            content: { text: 'Test' },
            position: { x: 0, y: 0 },
          } as any,
        })
      ).rejects.toThrow()
    })
  })

  describe('Flashcards Collection - Required Fields', () => {
    it('should require nodeId field', async () => {
      await expect(
        payload.create({
          collection: 'flashcards',
          data: {
            // Missing nodeId
            question: 'What is this?',
            answer: 'This is a test',
            owner: testUserId,
          } as any,
        })
      ).rejects.toThrow()
    })

    it('should require question field', async () => {
      await expect(
        payload.create({
          collection: 'flashcards',
          data: {
            nodeId: 'test-node-id',
            // Missing question
            answer: 'This is a test',
            owner: testUserId,
          } as any,
        })
      ).rejects.toThrow()
    })

    it('should require answer field', async () => {
      await expect(
        payload.create({
          collection: 'flashcards',
          data: {
            nodeId: 'test-node-id',
            question: 'What is this?',
            // Missing answer
            owner: testUserId,
          } as any,
        })
      ).rejects.toThrow()
    })

    it('should require owner field', async () => {
      await expect(
        payload.create({
          collection: 'flashcards',
          data: {
            nodeId: 'test-node-id',
            question: 'What is this?',
            answer: 'This is a test',
            // Missing owner
          } as any,
        })
      ).rejects.toThrow()
    })

    it('should create flashcard with valid data', async () => {
      const flashcard = await payload.create({
        collection: 'flashcards',
        data: {
          nodeId: 'test-node-id',
          question: 'What is this?',
          answer: 'This is a test',
          owner: testUserId,
        },
      })

      expect(flashcard.nodeId).toBe('test-node-id')
      expect(flashcard.question).toBe('What is this?')
      expect(flashcard.answer).toBe('This is a test')

      // Cleanup
      await payload.delete({ collection: 'flashcards', id: flashcard.id })
    })
  })

  describe('Flashcards Collection - SRS Metadata', () => {
    it('should have default SRS values', async () => {
      const flashcard = await payload.create({
        collection: 'flashcards',
        data: {
          nodeId: 'test-node-id',
          question: 'What is this?',
          answer: 'This is a test',
          owner: testUserId,
        },
      })

      expect(flashcard.srs).toBeDefined()
      expect(flashcard.srs.interval).toBe(1)
      expect(flashcard.srs.ease).toBe(2.5)

      // Cleanup
      await payload.delete({ collection: 'flashcards', id: flashcard.id })
    })

    it('should validate SRS number fields', async () => {
      const flashcard = await payload.create({
        collection: 'flashcards',
        data: {
          nodeId: 'test-node-id',
          question: 'What is this?',
          answer: 'This is a test',
          owner: testUserId,
          srs: {
            interval: 7,
            ease: 2.8,
            nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      })

      expect(flashcard.srs.interval).toBe(7)
      expect(flashcard.srs.ease).toBe(2.8)
      expect(flashcard.srs.nextReview).toBeDefined()

      // Cleanup
      await payload.delete({ collection: 'flashcards', id: flashcard.id })
    })
  })

  describe('Comments Collection - Required Fields', () => {
    it('should require nodeId field', async () => {
      await expect(
        payload.create({
          collection: 'comments',
          data: {
            // Missing nodeId
            content: 'This is a comment',
            author: testUserId,
            status: 'pending',
          } as any,
        })
      ).rejects.toThrow()
    })

    it('should require content field', async () => {
      await expect(
        payload.create({
          collection: 'comments',
          data: {
            nodeId: 'test-node-id',
            // Missing content
            author: testUserId,
            status: 'pending',
          } as any,
        })
      ).rejects.toThrow()
    })

    it('should require author field', async () => {
      await expect(
        payload.create({
          collection: 'comments',
          data: {
            nodeId: 'test-node-id',
            content: 'This is a comment',
            // Missing author
            status: 'pending',
          } as any,
        })
      ).rejects.toThrow()
    })

    it('should use default status value when not provided', async () => {
      const comment = await payload.create({
        collection: 'comments',
        data: {
          nodeId: 'test-node-id',
          content: 'This is a comment',
          author: testUserId,
          // Missing status - should default to 'pending'
        },
      })

      expect(comment.status).toBe('pending')

      // Cleanup
      await payload.delete({ collection: 'comments', id: comment.id })
    })
  })

  describe('Comments Collection - Data Types', () => {
    it('should validate status enum values', async () => {
      await expect(
        payload.create({
          collection: 'comments',
          data: {
            nodeId: 'test-node-id',
            content: 'This is a comment',
            author: testUserId,
            status: 'invalid-status' as any,
          },
        })
      ).rejects.toThrow()
    })

    it('should accept valid status values', async () => {
      const statuses = ['pending', 'approved', 'rejected']

      for (const status of statuses) {
        const comment = await payload.create({
          collection: 'comments',
          data: {
            nodeId: 'test-node-id',
            content: `Comment with ${status} status`,
            author: testUserId,
            status: status as any,
          },
        })

        expect(comment.status).toBe(status)

        // Cleanup
        await payload.delete({ collection: 'comments', id: comment.id })
      }
    })
  })
})

