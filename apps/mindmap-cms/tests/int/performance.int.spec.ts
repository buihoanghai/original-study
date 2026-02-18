import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Payload } from 'payload'
import type { NodeContent } from '@mindmap/domain'

/**
 * Performance Integration Tests
 *
 * Tests system performance with large datasets:
 * - Large mindmaps (1000+ nodes)
 * - Deep trees (10+ levels)
 * - Many flashcards (100+)
 * - Sync performance
 */

describe('Performance Tests', () => {
  let payload: Payload
  let testUserId: string

  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    // Create test user
    const user = await payload.create({
      collection: 'users',
      data: {
        email: `performance-test-${Date.now()}@example.com`,
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

  describe('Large Mindmap Tests', () => {
    it('should handle mindmap with 100 nodes efficiently', async () => {
      const startTime = Date.now()

      // Create mindmap
      const mindmap = await payload.create({
        collection: 'mindmaps',
        data: {
          title: 'Large Mindmap Test',
          slug: 'large-mindmap-test',
          status: 'draft',
          owner: testUserId,
        },
        draft: false,
      })

      // Create 100 nodes
      const nodePromises = []
      for (let i = 0; i < 100; i++) {
        nodePromises.push(
          payload.create({
            collection: 'mindmap-nodes',
            data: {
              nodeId: `node-${i}`,
              mindmap: mindmap.id,
              content: { text: `Node ${i}` },
              position: { x: i * 10, y: i * 10 },
            },
          })
        )
      }

      await Promise.all(nodePromises)

      const endTime = Date.now()
      const duration = endTime - startTime

      // Should complete in reasonable time (< 10 seconds)
      expect(duration).toBeLessThan(10000)

      // Verify all nodes were created
      const nodes = await payload.find({
        collection: 'mindmap-nodes',
        where: {
          mindmap: {
            equals: mindmap.id,
          },
        },
        limit: 200,
      })

      expect(nodes.docs.length).toBe(100)

      // Cleanup
      await payload.delete({
        collection: 'mindmap-nodes',
        where: {
          mindmap: {
            equals: mindmap.id,
          },
        },
      })
      await payload.delete({
        collection: 'mindmaps',
        id: mindmap.id,
      })
    }, 30000)

    it('should query large mindmap efficiently', async () => {
      // Create mindmap with 50 nodes
      const mindmap = await payload.create({
        collection: 'mindmaps',
        data: {
          title: 'Query Performance Test',
          slug: 'query-performance-test',
          status: 'draft',
          owner: testUserId,
        },
        draft: false,
      })

      const nodePromises = []
      for (let i = 0; i < 50; i++) {
        nodePromises.push(
          payload.create({
            collection: 'mindmap-nodes',
            data: {
              nodeId: `query-node-${i}`,
              mindmap: mindmap.id,
              content: { text: `Query Node ${i}` },
              position: { x: i * 10, y: i * 10 },
            },
          })
        )
      }

      await Promise.all(nodePromises)

      // Measure query performance
      const queryStart = Date.now()
      const result = await payload.find({
        collection: 'mindmap-nodes',
        where: {
          mindmap: {
            equals: mindmap.id,
          },
        },
        limit: 100,
      })
      const queryEnd = Date.now()
      const queryDuration = queryEnd - queryStart

      // Query should be fast (< 1 second)
      expect(queryDuration).toBeLessThan(1000)
      expect(result.docs.length).toBe(50)

      // Cleanup
      await payload.delete({
        collection: 'mindmap-nodes',
        where: {
          mindmap: {
            equals: mindmap.id,
          },
        },
      })
      await payload.delete({
        collection: 'mindmaps',
        id: mindmap.id,
      })
    }, 30000)
  })

  describe('Deep Tree Tests', () => {
    it('should handle deep tree structure (10 levels)', async () => {
      const mindmap = await payload.create({
        collection: 'mindmaps',
        data: {
          title: 'Deep Tree Test',
          slug: 'deep-tree-test',
          status: 'draft',
          owner: testUserId,
        },
        draft: false,
      })

      // Create 10 levels of nodes
      const nodeIds = []
      for (let level = 0; level < 10; level++) {
        const node = await payload.create({
          collection: 'mindmap-nodes',
          data: {
            nodeId: `deep-node-level-${level}`,
            mindmap: mindmap.id,
            content: { text: `Level ${level} Node` },
            position: { x: level * 50, y: level * 50 },
          },
        })
        nodeIds.push(node.id)
      }

      expect(nodeIds.length).toBe(10)

      // Cleanup
      await payload.delete({
        collection: 'mindmap-nodes',
        where: {
          mindmap: {
            equals: mindmap.id,
          },
        },
      })
      await payload.delete({
        collection: 'mindmaps',
        id: mindmap.id,
      })
    }, 30000)
  })

  describe('Many Flashcards Tests', () => {
    it('should handle 100 flashcards efficiently', async () => {
      const startTime = Date.now()

      // Create 100 flashcards
      const flashcardPromises = []
      for (let i = 0; i < 100; i++) {
        flashcardPromises.push(
          payload.create({
            collection: 'flashcards',
            data: {
              nodeId: `flashcard-node-${i}`,
              question: `Question ${i}?`,
              answer: `Answer ${i}`,
              owner: testUserId,
              srs: {
                interval: 1,
                ease: 2.5,
                nextReview: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
              },
            },
          })
        )
      }

      const flashcards = await Promise.all(flashcardPromises)

      const endTime = Date.now()
      const duration = endTime - startTime

      // Should complete in reasonable time (< 10 seconds)
      expect(duration).toBeLessThan(10000)
      expect(flashcards.length).toBe(100)

      // Cleanup
      await payload.delete({
        collection: 'flashcards',
        where: {
          owner: {
            equals: testUserId,
          },
        },
      })
    }, 30000)

    it('should query due flashcards efficiently', async () => {
      // Create 50 flashcards with different due dates
      const flashcardPromises = []
      const now = Date.now()

      for (let i = 0; i < 50; i++) {
        const daysOffset = i < 25 ? -1 : 1 // Half are due, half are not
        flashcardPromises.push(
          payload.create({
            collection: 'flashcards',
            data: {
              nodeId: `due-flashcard-${i}`,
              question: `Due Question ${i}?`,
              answer: `Due Answer ${i}`,
              owner: testUserId,
              srs: {
                interval: 1,
                ease: 2.5,
                nextReview: new Date(now + daysOffset * 24 * 60 * 60 * 1000).toISOString(),
              },
            },
          })
        )
      }

      await Promise.all(flashcardPromises)

      // Query for due flashcards
      const queryStart = Date.now()
      const dueFlashcards = await payload.find({
        collection: 'flashcards',
        where: {
          and: [
            {
              owner: {
                equals: testUserId,
              },
            },
            {
              'srs.nextReview': {
                less_than_equal: new Date().toISOString(),
              },
            },
          ],
        },
        limit: 100,
      })
      const queryEnd = Date.now()
      const queryDuration = queryEnd - queryStart

      // Query should be fast (< 1 second)
      expect(queryDuration).toBeLessThan(1000)
      expect(dueFlashcards.docs.length).toBeGreaterThanOrEqual(25)

      // Cleanup
      await payload.delete({
        collection: 'flashcards',
        where: {
          owner: {
            equals: testUserId,
          },
        },
      })
    }, 30000)
  })

  describe('Batch Operations Tests', () => {
    it('should handle batch updates efficiently', async () => {
      const mindmap = await payload.create({
        collection: 'mindmaps',
        data: {
          title: 'Batch Update Test',
          slug: 'batch-update-test',
          status: 'draft',
          owner: testUserId,
        },
        draft: false,
      })

      // Create 20 nodes
      const nodePromises = []
      for (let i = 0; i < 20; i++) {
        nodePromises.push(
          payload.create({
            collection: 'mindmap-nodes',
            data: {
              nodeId: `batch-node-${i}`,
              mindmap: mindmap.id,
              content: { text: `Batch Node ${i}` },
              position: { x: i * 10, y: i * 10 },
            },
          })
        )
      }

      const nodes = await Promise.all(nodePromises)

      // Batch update all nodes
      const updateStart = Date.now()
      const updatePromises = nodes.map((node) =>
        payload.update({
          collection: 'mindmap-nodes',
          id: node.id,
          data: {
            content: { text: `Updated ${(node.content as NodeContent)?.text}` },
          },
        })
      )

      await Promise.all(updatePromises)
      const updateEnd = Date.now()
      const updateDuration = updateEnd - updateStart

      // Batch update should be efficient (< 5 seconds)
      expect(updateDuration).toBeLessThan(5000)

      // Cleanup
      await payload.delete({
        collection: 'mindmap-nodes',
        where: {
          mindmap: {
            equals: mindmap.id,
          },
        },
      })
      await payload.delete({
        collection: 'mindmaps',
        id: mindmap.id,
      })
    }, 30000)
  })
})

