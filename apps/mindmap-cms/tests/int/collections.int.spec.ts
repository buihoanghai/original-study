import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload
let user1: any
let user2: any

describe('CMS Collections Integration Tests', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    // Clean up any existing test users
    await payload.delete({
      collection: 'users',
      where: {
        email: {
          in: ['test-user-1@example.com', 'test-user-2@example.com'],
        },
      },
    })

    // Create two test users for access control testing
    user1 = await payload.create({
      collection: 'users',
      data: {
        email: 'test-user-1@example.com',
        password: 'password123',
      },
    })

    user2 = await payload.create({
      collection: 'users',
      data: {
        email: 'test-user-2@example.com',
        password: 'password123',
      },
    })
  })

  afterAll(async () => {
    // Clean up test data
    await payload.delete({
      collection: 'mindmaps',
      where: {
        owner: {
          in: [user1.id, user2.id],
        },
      },
    })

    await payload.delete({
      collection: 'users',
      where: {
        email: {
          in: ['test-user-1@example.com', 'test-user-2@example.com'],
        },
      },
    })
  })

  describe('Mindmaps Collection', () => {
    it('should create mindmap with owner', async () => {
      const mindmap = await payload.create({
        collection: 'mindmaps',
        data: {
          title: 'Test Mindmap',
          description: 'A test mindmap',
          status: 'draft',
          owner: user1.id,
        },
        user: user1,
      })

      expect(mindmap).toBeDefined()
      expect(mindmap.title).toBe('Test Mindmap')
      // Owner can be either ID or populated object
      const ownerId = typeof mindmap.owner === 'string' ? mindmap.owner : mindmap.owner.id
      expect(ownerId).toBe(user1.id)
      expect(mindmap.status).toBe('draft')
    })

    it('should enforce owner access control - user can read own mindmaps', async () => {
      // Create mindmap as user1
      const mindmap = await payload.create({
        collection: 'mindmaps',
        data: {
          title: 'User 1 Mindmap',
          status: 'draft',
          owner: user1.id,
        },
        user: user1,
      })

      // User1 should be able to read their own mindmap
      const result = await payload.find({
        collection: 'mindmaps',
        where: {
          id: {
            equals: mindmap.id,
          },
        },
        user: user1,
      })

      expect(result.docs).toHaveLength(1)
      expect(result.docs[0].id).toBe(mindmap.id)
    })

    it('should prevent access to other users mindmaps', async () => {
      // Create mindmap as user1
      const mindmap = await payload.create({
        collection: 'mindmaps',
        data: {
          title: 'User 1 Private Mindmap',
          status: 'draft',
          owner: user1.id,
        },
        user: user1,
      })

      // User2 should NOT be able to read user1's mindmap
      const result = await payload.find({
        collection: 'mindmaps',
        where: {
          id: {
            equals: mindmap.id,
          },
        },
        user: user2,
        overrideAccess: false,
      })

      expect(result.docs).toHaveLength(0)
    })

    it('should validate required fields', async () => {
      await expect(
        payload.create({
          collection: 'mindmaps',
          data: {
            // Missing required 'title' field
            description: 'No title',
            status: 'draft',
            owner: user1.id,
          },
          user: user1,
        })
      ).rejects.toThrow()
    })

    it('should handle status transitions', async () => {
      const mindmap = await payload.create({
        collection: 'mindmaps',
        data: {
          title: 'Status Test Mindmap',
          status: 'draft',
          owner: user1.id,
        },
        user: user1,
      })

      // Update to published
      const updated = await payload.update({
        collection: 'mindmaps',
        id: mindmap.id,
        data: {
          status: 'published',
        },
        user: user1,
      })

      expect(updated.status).toBe('published')

      // Update to archived
      const archived = await payload.update({
        collection: 'mindmaps',
        id: mindmap.id,
        data: {
          status: 'archived',
        },
        user: user1,
      })

      expect(archived.status).toBe('archived')
    })

    it('should prevent user from updating other users mindmaps', async () => {
      // Create mindmap as user1
      const mindmap = await payload.create({
        collection: 'mindmaps',
        data: {
          title: 'User 1 Mindmap',
          status: 'draft',
          owner: user1.id,
        },
        user: user1,
      })

      // User2 should NOT be able to update user1's mindmap
      await expect(
        payload.update({
          collection: 'mindmaps',
          id: mindmap.id,
          data: {
            title: 'Hacked Title',
          },
          user: user2,
          overrideAccess: false,
        })
      ).rejects.toThrow()
    })

    it('should prevent user from deleting other users mindmaps', async () => {
      // Create mindmap as user1
      const mindmap = await payload.create({
        collection: 'mindmaps',
        data: {
          title: 'User 1 Mindmap to Delete',
          status: 'draft',
          owner: user1.id,
        },
        user: user1,
      })

      // User2 should NOT be able to delete user1's mindmap
      await expect(
        payload.delete({
          collection: 'mindmaps',
          id: mindmap.id,
          user: user2,
          overrideAccess: false,
        })
      ).rejects.toThrow()
    })
  })

  describe('MindmapNodes Collection', () => {
    let testMindmap: any

    beforeAll(async () => {
      // Create a test mindmap for node tests
      testMindmap = await payload.create({
        collection: 'mindmaps',
        data: {
          title: 'Test Mindmap for Nodes',
          status: 'draft',
          owner: user1.id,
        },
        user: user1,
      })
    })

    it('should auto-generate nodeId on creation', async () => {
      const node = await payload.create({
        collection: 'mindmap-nodes',
        data: {
          mindmap: testMindmap.id,
          content: {
            text: 'Test Node',
          },
          position: {
            x: 0,
            y: 0,
          },
        },
        user: user1,
      })

      expect(node).toBeDefined()
      expect(node.nodeId).toBeDefined()
      expect(typeof node.nodeId).toBe('string')
      expect(node.nodeId.length).toBeGreaterThan(0)
    })

    it('should enforce nodeId immutability', async () => {
      // Create node with auto-generated nodeId
      const node = await payload.create({
        collection: 'mindmap-nodes',
        data: {
          mindmap: testMindmap.id,
          content: {
            text: 'Immutable Node',
          },
          position: {
            x: 0,
            y: 0,
          },
        },
        user: user1,
      })

      const originalNodeId = node.nodeId

      // Attempt to change nodeId should fail
      await expect(
        payload.update({
          collection: 'mindmap-nodes',
          id: node.id,
          data: {
            nodeId: 'new-node-id-attempt',
            content: {
              text: 'Updated content',
            },
          },
          user: user1,
        })
      ).rejects.toThrow(/nodeId cannot be changed/)

      // Verify nodeId is still the same
      const unchanged = await payload.findByID({
        collection: 'mindmap-nodes',
        id: node.id,
        overrideAccess: true,
      })

      expect(unchanged.nodeId).toBe(originalNodeId)
    })

    it('should allow updating other fields while preserving nodeId', async () => {
      const node = await payload.create({
        collection: 'mindmap-nodes',
        data: {
          mindmap: testMindmap.id,
          content: {
            text: 'Original Text',
          },
          position: {
            x: 0,
            y: 0,
          },
        },
        user: user1,
      })

      const originalNodeId = node.nodeId

      // Update content and position (not nodeId)
      const updated = await payload.update({
        collection: 'mindmap-nodes',
        id: node.id,
        data: {
          content: {
            text: 'Updated Text',
          },
          position: {
            x: 100,
            y: 200,
          },
        },
        user: user1,
      })

      expect(updated.nodeId).toBe(originalNodeId)
      expect(updated.content.text).toBe('Updated Text')
      expect(updated.position.x).toBe(100)
      expect(updated.position.y).toBe(200)
    })

    it('should inherit access from parent mindmap', async () => {
      // Create node in user1's mindmap
      const node = await payload.create({
        collection: 'mindmap-nodes',
        data: {
          mindmap: testMindmap.id,
          content: {
            text: 'User 1 Node',
          },
          position: {
            x: 0,
            y: 0,
          },
        },
        user: user1,
      })

      // User1 should be able to update their node
      const updated = await payload.update({
        collection: 'mindmap-nodes',
        id: node.id,
        data: {
          content: {
            text: 'Updated by User 1',
          },
        },
        user: user1,
      })

      expect(updated.content.text).toBe('Updated by User 1')

      // User2 should NOT be able to update user1's node
      await expect(
        payload.update({
          collection: 'mindmap-nodes',
          id: node.id,
          data: {
            content: {
              text: 'Hacked by User 2',
            },
          },
          user: user2,
          overrideAccess: false,
        })
      ).rejects.toThrow()
    })

    it('should validate required fields', async () => {
      // Missing mindmap relationship
      await expect(
        payload.create({
          collection: 'mindmap-nodes',
          data: {
            content: {
              text: 'No mindmap',
            },
            position: {
              x: 0,
              y: 0,
            },
          },
          user: user1,
        })
      ).rejects.toThrow()

      // Missing position
      await expect(
        payload.create({
          collection: 'mindmap-nodes',
          data: {
            mindmap: testMindmap.id,
            content: {
              text: 'No position',
            },
          },
          user: user1,
        })
      ).rejects.toThrow()
    })

    it('should validate relationship to mindmap', async () => {
      const node = await payload.create({
        collection: 'mindmap-nodes',
        data: {
          mindmap: testMindmap.id,
          content: {
            text: 'Test Node',
          },
          position: {
            x: 0,
            y: 0,
          },
        },
        user: user1,
      })

      // Mindmap can be either ID or populated object
      const mindmapId = typeof node.mindmap === 'string' ? node.mindmap : node.mindmap.id
      expect(mindmapId).toBe(testMindmap.id)

      // Verify relationship works
      const fetchedNode = await payload.findByID({
        collection: 'mindmap-nodes',
        id: node.id,
        overrideAccess: true,
      })

      expect(fetchedNode.mindmap).toBeDefined()
    })
  })

  describe('Flashcards Collection', () => {
    let testMindmap: any
    let testNode: any

    beforeAll(async () => {
      // Create test mindmap and node
      testMindmap = await payload.create({
        collection: 'mindmaps',
        data: {
          title: 'Test Mindmap for Flashcards',
          status: 'draft',
          owner: user1.id,
        },
        user: user1,
      })

      testNode = await payload.create({
        collection: 'mindmap-nodes',
        data: {
          mindmap: testMindmap.id,
          content: {
            text: 'Test Node for Flashcard',
          },
          position: {
            x: 0,
            y: 0,
          },
        },
        user: user1,
      })
    })

    it('should create flashcard with initial SRS metadata', async () => {
      const flashcard = await payload.create({
        collection: 'flashcards',
        data: {
          nodeId: testNode.nodeId,
          question: 'What is this?',
          answer: 'This is a test',
          owner: user1.id,
        },
        user: user1,
      })

      expect(flashcard).toBeDefined()
      expect(flashcard.nodeId).toBe(testNode.nodeId)
      expect(flashcard.question).toBe('What is this?')
      expect(flashcard.answer).toBe('This is a test')
      expect(flashcard.srs).toBeDefined()
      expect(flashcard.srs.interval).toBe(1)
      expect(flashcard.srs.ease).toBe(2.5)
    })

    it('should update SRS metadata on review', async () => {
      const flashcard = await payload.create({
        collection: 'flashcards',
        data: {
          nodeId: testNode.nodeId,
          question: 'Test Question',
          answer: 'Test Answer',
          owner: user1.id,
        },
        user: user1,
      })

      // Simulate review - update SRS metadata
      const nextReviewDate = new Date()
      nextReviewDate.setDate(nextReviewDate.getDate() + 3)

      const updated = await payload.update({
        collection: 'flashcards',
        id: flashcard.id,
        data: {
          srs: {
            interval: 3,
            ease: 2.6,
            nextReview: nextReviewDate.toISOString(),
          },
        },
        user: user1,
      })

      expect(updated.srs.interval).toBe(3)
      expect(updated.srs.ease).toBe(2.6)
      expect(updated.srs.nextReview).toBeDefined()
    })

    it('should filter flashcards by nextReview date', async () => {
      const today = new Date()
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)

      // Create flashcard due today
      const flashcard1 = await payload.create({
        collection: 'flashcards',
        data: {
          nodeId: testNode.nodeId,
          question: 'Due Today',
          answer: 'Answer 1',
          owner: user1.id,
          srs: {
            interval: 1,
            ease: 2.5,
            nextReview: today.toISOString(),
          },
        },
        user: user1,
      })

      // Create flashcard due next week
      const flashcard2 = await payload.create({
        collection: 'flashcards',
        data: {
          nodeId: testNode.nodeId,
          question: 'Due Next Week',
          answer: 'Answer 2',
          owner: user1.id,
          srs: {
            interval: 7,
            ease: 2.5,
            nextReview: nextWeek.toISOString(),
          },
        },
        user: user1,
      })

      // Query for flashcards due before tomorrow
      const dueCards = await payload.find({
        collection: 'flashcards',
        where: {
          'srs.nextReview': {
            less_than: tomorrow.toISOString(),
          },
        },
        user: user1,
      })

      // Should only include flashcard1
      const dueIds = dueCards.docs.map((card) => card.id)
      expect(dueIds).toContain(flashcard1.id)
      expect(dueIds).not.toContain(flashcard2.id)
    })

    it('should enforce owner access control', async () => {
      // Create flashcard as user1
      const flashcard = await payload.create({
        collection: 'flashcards',
        data: {
          nodeId: testNode.nodeId,
          question: 'User 1 Flashcard',
          answer: 'Private Answer',
          owner: user1.id,
        },
        user: user1,
      })

      // User1 should be able to read their flashcard
      const result1 = await payload.find({
        collection: 'flashcards',
        where: {
          id: {
            equals: flashcard.id,
          },
        },
        user: user1,
      })

      expect(result1.docs).toHaveLength(1)

      // User2 should NOT be able to read user1's flashcard
      const result2 = await payload.find({
        collection: 'flashcards',
        where: {
          id: {
            equals: flashcard.id,
          },
        },
        user: user2,
        overrideAccess: false,
      })

      expect(result2.docs).toHaveLength(0)
    })

    it('should validate required fields', async () => {
      // Missing question
      await expect(
        payload.create({
          collection: 'flashcards',
          data: {
            nodeId: testNode.nodeId,
            answer: 'Answer without question',
            owner: user1.id,
          },
          user: user1,
        })
      ).rejects.toThrow()

      // Missing answer
      await expect(
        payload.create({
          collection: 'flashcards',
          data: {
            nodeId: testNode.nodeId,
            question: 'Question without answer',
            owner: user1.id,
          },
          user: user1,
        })
      ).rejects.toThrow()

      // Missing nodeId
      await expect(
        payload.create({
          collection: 'flashcards',
          data: {
            question: 'Question',
            answer: 'Answer',
            owner: user1.id,
          },
          user: user1,
        })
      ).rejects.toThrow()
    })
  })

  describe('Comments Collection', () => {
    let testMindmap: any
    let testNode: any

    beforeAll(async () => {
      // Create test mindmap and node
      testMindmap = await payload.create({
        collection: 'mindmaps',
        data: {
          title: 'Test Mindmap for Comments',
          status: 'draft',
          owner: user1.id,
        },
        user: user1,
      })

      testNode = await payload.create({
        collection: 'mindmap-nodes',
        data: {
          mindmap: testMindmap.id,
          content: {
            text: 'Test Node for Comments',
          },
          position: {
            x: 0,
            y: 0,
          },
        },
        user: user1,
      })
    })

    it('should create comment with pending status', async () => {
      const comment = await payload.create({
        collection: 'comments',
        data: {
          nodeId: testNode.nodeId,
          content: 'This is a test comment',
          author: user1.id,
        },
        user: user1,
      })

      expect(comment).toBeDefined()
      expect(comment.nodeId).toBe(testNode.nodeId)
      expect(comment.content).toBe('This is a test comment')
      // Author can be either ID or populated object
      const authorId = typeof comment.author === 'string' ? comment.author : comment.author.id
      expect(authorId).toBe(user1.id)
      expect(comment.status).toBe('pending')
    })

    it('should enforce moderation workflow', async () => {
      const comment = await payload.create({
        collection: 'comments',
        data: {
          nodeId: testNode.nodeId,
          content: 'Comment to moderate',
          author: user1.id,
        },
        user: user1,
      })

      expect(comment.status).toBe('pending')

      // Update to approved
      const approved = await payload.update({
        collection: 'comments',
        id: comment.id,
        data: {
          status: 'approved',
        },
        user: user1,
      })

      expect(approved.status).toBe('approved')

      // Update to rejected
      const rejected = await payload.update({
        collection: 'comments',
        id: comment.id,
        data: {
          status: 'rejected',
        },
        user: user1,
      })

      expect(rejected.status).toBe('rejected')
    })

    it('should enforce author access control', async () => {
      // Create comment as user1
      const comment = await payload.create({
        collection: 'comments',
        data: {
          nodeId: testNode.nodeId,
          content: 'User 1 Comment',
          author: user1.id,
        },
        user: user1,
      })

      // User1 should be able to update their comment
      const updated = await payload.update({
        collection: 'comments',
        id: comment.id,
        data: {
          content: 'Updated by User 1',
        },
        user: user1,
      })

      expect(updated.content).toBe('Updated by User 1')

      // User2 should NOT be able to update user1's comment
      await expect(
        payload.update({
          collection: 'comments',
          id: comment.id,
          data: {
            content: 'Hacked by User 2',
          },
          user: user2,
          overrideAccess: false,
        })
      ).rejects.toThrow()
    })

    it('should validate required fields', async () => {
      // Missing content
      await expect(
        payload.create({
          collection: 'comments',
          data: {
            nodeId: testNode.nodeId,
            author: user1.id,
          },
          user: user1,
        })
      ).rejects.toThrow()

      // Missing nodeId
      await expect(
        payload.create({
          collection: 'comments',
          data: {
            content: 'Comment without nodeId',
            author: user1.id,
          },
          user: user1,
        })
      ).rejects.toThrow()
    })
  })
})


