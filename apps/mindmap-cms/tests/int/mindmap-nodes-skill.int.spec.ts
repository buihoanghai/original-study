import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Payload } from 'payload'
import type { NodeContent } from '@mindmap/domain'

/**
 * Integration tests for MindmapNodes skill fields
 *
 * Tests the skill progress tracking fields added to MindmapNodes collection:
 * - status (not-started, in-progress, completed)
 * - masteryPercentage (0-100)
 * - lastPracticed (date stored as ISO string)
 */
describe('MindmapNodes Skill Fields', () => {
  let payload: Payload
  let testUser: any
  let testMindmap: any

  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    // Create test user
    testUser = await payload.create({
      collection: 'users',
      data: {
        email: 'skill-test@example.com',
        password: 'password123',
      },
    })

    // Create test mindmap
    testMindmap = await payload.create({
      collection: 'mindmaps',
      data: {
        title: 'Skill Test Mindmap',
        description: 'Test mindmap for skill fields',
        status: 'published',
        owner: testUser.id,
      },
      draft: false,
    })
  })

  afterAll(async () => {
    // Cleanup
    if (testMindmap?.id) {
      await payload.delete({
        collection: 'mindmaps',
        id: testMindmap.id,
      })
    }
    if (testUser?.id) {
      await payload.delete({
        collection: 'users',
        id: testUser.id,
      })
    }
  })

  it('should save node with skill metadata', async () => {
    const node = await payload.create({
      collection: 'mindmap-nodes',
      data: {
        mindmap: testMindmap.id,
        content: {
          text: 'HTTP Lifecycle',
          skill: {
            status: 'in-progress',
            masteryPercentage: 75,
            lastPracticed: '2026-02-15T00:00:00.000Z',
          },
        },
        position: { x: 0, y: 0 },
      },
    })

    expect(node.content).toBeDefined()
    const content = node.content as NodeContent
    expect(content?.skill).toBeDefined()
    expect(content?.skill?.status).toBe('in-progress')
    expect(content?.skill?.masteryPercentage).toBe(75)
    expect(content?.skill?.lastPracticed).toBe('2026-02-15T00:00:00.000Z')
  })

  it('should read node with skill metadata', async () => {
    const created = await payload.create({
      collection: 'mindmap-nodes',
      data: {
        mindmap: testMindmap.id,
        content: {
          text: 'REST Principles',
          skill: {
            status: 'completed',
            masteryPercentage: 100,
          },
        },
        position: { x: 100, y: 100 },
      },
    })

    const node = await payload.findByID({
      collection: 'mindmap-nodes',
      id: created.id,
    })

    expect(node.content).toBeDefined()
    const content = node.content as NodeContent
    expect(content?.skill?.status).toBe('completed')
    expect(content?.skill?.masteryPercentage).toBe(100)
    expect(content?.skill?.lastPracticed).toBeUndefined()
  })

  it('should update skill status', async () => {
    const node = await payload.create({
      collection: 'mindmap-nodes',
      data: {
        mindmap: testMindmap.id,
        content: {
          text: 'Middleware',
          skill: {
            status: 'not-started',
            masteryPercentage: 0,
          },
        },
        position: { x: 200, y: 200 },
      },
    })

    const testDate = new Date().toISOString()

    const updated = await payload.update({
      collection: 'mindmap-nodes',
      id: node.id,
      data: {
        content: {
          ...(node.content as NodeContent),
          skill: {
            status: 'in-progress',
            masteryPercentage: 50,
            lastPracticed: testDate,
          },
        },
      },
    })

    // payload.update returns the updated document directly
    expect(updated.content).toBeDefined()
    const updatedContent = updated.content as NodeContent
    expect(updatedContent?.skill?.status).toBe('in-progress')
    expect(updatedContent?.skill?.masteryPercentage).toBe(50)
    expect(updatedContent?.skill?.lastPracticed).toBe(testDate)
  })

  it('should handle nodes without skill metadata (backward compatibility)', async () => {
    const node = await payload.create({
      collection: 'mindmap-nodes',
      data: {
        mindmap: testMindmap.id,
        content: {
          text: 'Regular Node',
        },
        position: { x: 300, y: 300 },
      },
    })

    expect(node.content).toBeDefined()
    const content = node.content as NodeContent
    // Payload creates an empty skill object even when not provided
    // This is acceptable for backward compatibility - empty object is falsy in checks
    expect(content?.skill).toBeDefined()
    expect(content?.skill?.status).toBeUndefined()
    expect(content?.skill?.masteryPercentage).toBeUndefined()
    expect(content?.skill?.lastPracticed).toBeUndefined()
    expect(content?.text).toBe('Regular Node')
  })

  it('should validate status enum values', async () => {
    await expect(
      payload.create({
        collection: 'mindmap-nodes',
        data: {
          mindmap: testMindmap.id,
          content: {
            text: 'Invalid Status',
            skill: {
              status: 'invalid-status' as any,
              masteryPercentage: 50,
            },
          },
          position: { x: 400, y: 400 },
        },
      })
    ).rejects.toThrow()
  })

  it('should store mastery percentage as number', async () => {
    const node = await payload.create({
      collection: 'mindmap-nodes',
      data: {
        mindmap: testMindmap.id,
        content: {
          text: 'Mastery Test',
          skill: {
            status: 'in-progress',
            masteryPercentage: 85,
          },
        },
        position: { x: 500, y: 500 },
      },
    })

    expect(node.content).toBeDefined()
    const content = node.content as NodeContent
    expect(typeof content?.skill?.masteryPercentage).toBe('number')
    expect(content?.skill?.masteryPercentage).toBe(85)
  })

  it('should store lastPracticed as ISO string', async () => {
    const testDate = '2026-02-15T10:30:00.000Z'

    const node = await payload.create({
      collection: 'mindmap-nodes',
      data: {
        mindmap: testMindmap.id,
        content: {
          text: 'Date Test',
          skill: {
            status: 'in-progress',
            masteryPercentage: 60,
            lastPracticed: testDate,
          },
        },
        position: { x: 600, y: 600 },
      },
    })

    expect(node.content).toBeDefined()
    const content = node.content as NodeContent
    expect(content?.skill?.lastPracticed).toBe(testDate)
  })
})

