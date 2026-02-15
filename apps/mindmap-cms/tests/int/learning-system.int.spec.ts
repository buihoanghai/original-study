import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'

/**
 * Integration Tests for Adaptive Learning System
 *
 * Tests the following collections and hooks:
 * - NodeMastery collection
 * - LearningSessions collection
 * - autoGenerateLearningData hook (auto-creates mastery + session on node creation)
 *
 * Covers BDD Scenarios:
 * - Scenario 1.1: Node creation triggers mastery record creation
 * - Scenario 1.2: Node creation triggers initial session creation
 * - Access control for user-scoped data
 */

let payload: Payload
let testUser: any
let testMindmap: any

describe('Learning System Integration Tests', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    // Clean up any existing test data
    await payload.delete({
      collection: 'users',
      where: {
        email: { equals: 'learning-test@example.com' },
      },
    })

    // Create test user
    testUser = await payload.create({
      collection: 'users',
      data: {
        email: 'learning-test@example.com',
        password: 'password123',
      },
    })

    // Create test mindmap
    testMindmap = await payload.create({
      collection: 'mindmaps',
      data: {
        title: 'Learning Test Mindmap',
        status: 'draft',
        owner: testUser.id,
      },
      user: testUser,
    })
  })

  afterAll(async () => {
    // Clean up test data
    await payload.delete({
      collection: 'learning-sessions',
      where: {
        owner: { equals: testUser.id },
      },
    })

    await payload.delete({
      collection: 'node-mastery',
      where: {
        owner: { equals: testUser.id },
      },
    })

    await payload.delete({
      collection: 'mindmap-nodes',
      where: {
        'metadata.author': { equals: testUser.id },
      },
    })

    await payload.delete({
      collection: 'mindmaps',
      where: {
        owner: { equals: testUser.id },
      },
    })

    await payload.delete({
      collection: 'users',
      where: {
        email: { equals: 'learning-test@example.com' },
      },
    })
  })

  describe('NodeMastery Collection', () => {
    it('should create mastery record with default values', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const mastery = await payload.create({
        collection: 'node-mastery',
        data: {
          nodeId: 'test-node-123',
          level: 'new',
          confidence: 0,
          totalSessions: 0,
          successRate: 0,
          nextReviewDate: tomorrow.toISOString(),
          owner: testUser.id,
        },
        user: testUser,
      })

      expect(mastery).toBeDefined()
      expect(mastery.nodeId).toBe('test-node-123')
      expect(mastery.level).toBe('new')
      expect(mastery.confidence).toBe(0)
      expect(mastery.totalSessions).toBe(0)
      expect(mastery.successRate).toBe(0)
    })

    it('should enforce user-scoped access control', async () => {
      // Create mastery as testUser
      const mastery = await payload.create({
        collection: 'node-mastery',
        data: {
          nodeId: 'test-node-456',
          level: 'new',
          confidence: 0,
          totalSessions: 0,
          successRate: 0,
          nextReviewDate: new Date().toISOString(),
          owner: testUser.id,
        },
        user: testUser,
      })

      // User should be able to read their own mastery
      const result = await payload.find({
        collection: 'node-mastery',
        where: { nodeId: { equals: 'test-node-456' } },
        user: testUser,
        overrideAccess: false,
      })

      expect(result.docs).toHaveLength(1)
      expect(result.docs[0].id).toBe(mastery.id)
    })
  })

  describe('LearningSessions Collection', () => {
    it('should create learning session with all fields', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const session = await payload.create({
        collection: 'learning-sessions',
        data: {
          sessionId: 'session-123',
          nodeId: 'test-node-789',
          type: 'learn',
          scheduledDate: tomorrow.toISOString(),
          status: 'scheduled',
          owner: testUser.id,
        },
        user: testUser,
      })

      expect(session).toBeDefined()
      expect(session.sessionId).toBe('session-123')
      expect(session.nodeId).toBe('test-node-789')
      expect(session.type).toBe('learn')
      expect(session.status).toBe('scheduled')
    })

    it('should enforce user-scoped access control', async () => {
      const session = await payload.create({
        collection: 'learning-sessions',
        data: {
          sessionId: 'session-456',
          nodeId: 'test-node-999',
          type: 'review',
          scheduledDate: new Date().toISOString(),
          status: 'scheduled',
          owner: testUser.id,
        },
        user: testUser,
      })

      // User should be able to read their own sessions
      const result = await payload.find({
        collection: 'learning-sessions',
        where: { sessionId: { equals: 'session-456' } },
        user: testUser,
        overrideAccess: false,
      })

      expect(result.docs).toHaveLength(1)
      expect(result.docs[0].id).toBe(session.id)
    })
  })

  describe('Auto-Generation Hook (Scenario 1.1 & 1.2)', () => {
    it('should auto-create mastery record when node is created', async () => {
      // Create a new node
      const node = await payload.create({
        collection: 'mindmap-nodes',
        data: {
          mindmap: testMindmap.id,
          content: {
            text: 'Test Node for Auto-Generation',
          },
          position: {
            x: 100,
            y: 100,
          },
          metadata: {
            author: testUser.id,
          },
        },
        user: testUser,
      })

      expect(node).toBeDefined()
      expect(node.nodeId).toBeDefined()

      // Wait a bit for the afterChange hook to complete
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Check if mastery record was auto-created
      const masteryResult = await payload.find({
        collection: 'node-mastery',
        where: { nodeId: { equals: node.nodeId } },
        user: testUser,
        overrideAccess: false,
      })

      expect(masteryResult.docs).toHaveLength(1)
      const mastery = masteryResult.docs[0]
      expect(mastery.level).toBe('new')
      expect(mastery.confidence).toBe(0)
      expect(mastery.totalSessions).toBe(0)
      expect(mastery.successRate).toBe(0)
      expect(mastery.nextReviewDate).toBeDefined()
    })

    it('should auto-create initial learning session when node is created', async () => {
      // Create a new node
      const node = await payload.create({
        collection: 'mindmap-nodes',
        data: {
          mindmap: testMindmap.id,
          content: {
            text: 'Test Node for Session Auto-Generation',
          },
          position: {
            x: 200,
            y: 200,
          },
          metadata: {
            author: testUser.id,
          },
        },
        user: testUser,
      })

      expect(node).toBeDefined()
      expect(node.nodeId).toBeDefined()

      // Wait a bit for the afterChange hook to complete
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Check if learning session was auto-created
      const sessionResult = await payload.find({
        collection: 'learning-sessions',
        where: { nodeId: { equals: node.nodeId } },
        user: testUser,
        overrideAccess: false,
      })

      expect(sessionResult.docs).toHaveLength(1)
      const session = sessionResult.docs[0]
      expect(session.type).toBe('learn')
      expect(session.status).toBe('scheduled')
      expect(session.scheduledDate).toBeDefined()

      // Verify scheduled date is tomorrow
      const scheduledDate = new Date(session.scheduledDate)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      expect(scheduledDate.getDate()).toBe(tomorrow.getDate())
    })

    it('should not auto-create learning data on node update', async () => {
      // Create a node
      const node = await payload.create({
        collection: 'mindmap-nodes',
        data: {
          mindmap: testMindmap.id,
          content: {
            text: 'Test Node for Update',
          },
          position: {
            x: 300,
            y: 300,
          },
          metadata: {
            author: testUser.id,
          },
        },
        user: testUser,
      })

      // Wait for auto-generation
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Get initial count
      const initialMasteryCount = await payload.find({
        collection: 'node-mastery',
        where: { nodeId: { equals: node.nodeId } },
        user: testUser,
        overrideAccess: false,
      })

      const initialSessionCount = await payload.find({
        collection: 'learning-sessions',
        where: { nodeId: { equals: node.nodeId } },
        user: testUser,
        overrideAccess: false,
      })

      // Update the node
      await payload.update({
        collection: 'mindmap-nodes',
        id: node.id,
        data: {
          content: {
            text: 'Updated Text',
          },
        },
        user: testUser,
      })

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Check counts haven't changed
      const finalMasteryCount = await payload.find({
        collection: 'node-mastery',
        where: { nodeId: { equals: node.nodeId } },
        user: testUser,
        overrideAccess: false,
      })

      const finalSessionCount = await payload.find({
        collection: 'learning-sessions',
        where: { nodeId: { equals: node.nodeId } },
        user: testUser,
        overrideAccess: false,
      })

      expect(finalMasteryCount.docs).toHaveLength(initialMasteryCount.docs.length)
      expect(finalSessionCount.docs).toHaveLength(initialSessionCount.docs.length)
    })
  })
})


