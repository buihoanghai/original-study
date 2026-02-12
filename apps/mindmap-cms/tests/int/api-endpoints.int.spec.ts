import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'

/**
 * API Endpoint Integration Tests
 *
 * Tests the REST API endpoints for all collections:
 * - POST /api/{collection} - Create
 * - GET /api/{collection} - List
 * - GET /api/{collection}/{id} - Read
 * - PATCH /api/{collection}/{id} - Update
 * - DELETE /api/{collection}/{id} - Delete
 *
 * Also tests:
 * - Authentication (401 errors)
 * - Authorization (403 errors)
 * - Not found (404 errors)
 * - Validation errors (400 errors)
 *
 * NOTE: These tests require the CMS server to be running on http://localhost:3000
 *
 * To run these tests:
 * 1. Start the CMS server: `cd apps/mindmap-cms && pnpm dev`
 * 2. In another terminal, run: `cd apps/mindmap-cms && npm run test:int`
 *
 * These tests are currently SKIPPED by default (describe.skip).
 * To enable them, change `describe.skip` to `describe` on line 48.
 */

let payload: Payload
let user1: any
let user2: any
let authToken1: string
let authToken2: string

const API_URL = 'http://localhost:3000/api'

describe.skip('API Endpoints Integration Tests (requires server running)', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    // Clean up any existing test users
    await payload.delete({
      collection: 'users',
      where: {
        email: {
          in: ['api-test-user-1@example.com', 'api-test-user-2@example.com'],
        },
      },
    })

    // Create two test users
    user1 = await payload.create({
      collection: 'users',
      data: {
        email: 'api-test-user-1@example.com',
        password: 'password123',
      },
    })

    user2 = await payload.create({
      collection: 'users',
      data: {
        email: 'api-test-user-2@example.com',
        password: 'password123',
      },
    })

    // Login via REST API to get auth tokens
    const login1Response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'api-test-user-1@example.com',
        password: 'password123',
      }),
    })
    const login1Data = await login1Response.json()
    authToken1 = login1Data.token

    const login2Response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'api-test-user-2@example.com',
        password: 'password123',
      }),
    })
    const login2Data = await login2Response.json()
    authToken2 = login2Data.token
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
          in: ['api-test-user-1@example.com', 'api-test-user-2@example.com'],
        },
      },
    })
  })

  describe('Mindmaps API Endpoints', () => {
    it('POST /api/mindmaps - should create mindmap when authenticated', async () => {
      const response = await fetch(`${API_URL}/mindmaps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${authToken1}`,
        },
        body: JSON.stringify({
          title: 'API Test Mindmap',
          description: 'Created via API',
          status: 'draft',
        }),
      })

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.doc).toBeDefined()
      expect(data.doc.title).toBe('API Test Mindmap')
      expect(data.doc.status).toBe('draft')
    })

    it('POST /api/mindmaps - should return 401 when not authenticated', async () => {
      const response = await fetch(`${API_URL}/mindmaps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Unauthorized Mindmap',
          status: 'draft',
        }),
      })

      expect(response.status).toBe(401)
    })

    it('POST /api/mindmaps - should return 400 for missing required fields', async () => {
      const response = await fetch(`${API_URL}/mindmaps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${authToken1}`,
        },
        body: JSON.stringify({
          // Missing required 'title' field
          description: 'No title',
        }),
      })

      expect(response.status).toBe(400)
    })

    it('GET /api/mindmaps - should list user mindmaps only', async () => {
      // Create a mindmap as user1
      const createResponse = await fetch(`${API_URL}/mindmaps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${authToken1}`,
        },
        body: JSON.stringify({
          title: 'User 1 Mindmap for List Test',
          status: 'draft',
        }),
      })
      expect(createResponse.status).toBe(201)

      // List as user1 - should see own mindmap
      const listResponse = await fetch(`${API_URL}/mindmaps`, {
        headers: {
          Authorization: `JWT ${authToken1}`,
        },
      })

      expect(listResponse.status).toBe(200)
      const data = await listResponse.json()
      expect(data.docs).toBeDefined()
      expect(data.docs.length).toBeGreaterThan(0)
      expect(data.totalDocs).toBeGreaterThan(0)
    })

    it('GET /api/mindmaps/:id - should return mindmap when authorized', async () => {
      // Create a mindmap
      const createResponse = await fetch(`${API_URL}/mindmaps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${authToken1}`,
        },
        body: JSON.stringify({
          title: 'Mindmap for Read Test',
          status: 'draft',
        }),
      })
      const createData = await createResponse.json()
      const mindmapId = createData.doc.id

      // Read the mindmap
      const readResponse = await fetch(`${API_URL}/mindmaps/${mindmapId}`, {
        headers: {
          Authorization: `JWT ${authToken1}`,
        },
      })

      expect(readResponse.status).toBe(200)
      const data = await readResponse.json()
      expect(data.id).toBe(mindmapId)
      expect(data.title).toBe('Mindmap for Read Test')
    })

    it('GET /api/mindmaps/:id - should return 404 for non-existent mindmap', async () => {
      const response = await fetch(`${API_URL}/mindmaps/000000000000000000000000`, {
        headers: {
          Authorization: `JWT ${authToken1}`,
        },
      })

      expect(response.status).toBe(404)
    })

    it('GET /api/mindmaps/:id - should return 403 when accessing other user mindmap', async () => {
      // Create mindmap as user1
      const createResponse = await fetch(`${API_URL}/mindmaps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${authToken1}`,
        },
        body: JSON.stringify({
          title: 'User 1 Private Mindmap',
          status: 'draft',
        }),
      })
      const createData = await createResponse.json()
      const mindmapId = createData.doc.id

      // Try to read as user2
      const readResponse = await fetch(`${API_URL}/mindmaps/${mindmapId}`, {
        headers: {
          Authorization: `JWT ${authToken2}`,
        },
      })

      expect(readResponse.status).toBe(404) // Payload returns 404 for forbidden resources
    })

    it('PATCH /api/mindmaps/:id - should update mindmap when authorized', async () => {
      // Create mindmap
      const createResponse = await fetch(`${API_URL}/mindmaps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${authToken1}`,
        },
        body: JSON.stringify({
          title: 'Mindmap for Update Test',
          status: 'draft',
        }),
      })
      const createData = await createResponse.json()
      const mindmapId = createData.doc.id

      // Update the mindmap
      const updateResponse = await fetch(`${API_URL}/mindmaps/${mindmapId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${authToken1}`,
        },
        body: JSON.stringify({
          title: 'Updated Title',
          status: 'published',
        }),
      })

      expect(updateResponse.status).toBe(200)
      const data = await updateResponse.json()
      expect(data.doc.title).toBe('Updated Title')
      expect(data.doc.status).toBe('published')
    })

    it('PATCH /api/mindmaps/:id - should return 403 when updating other user mindmap', async () => {
      // Create mindmap as user1
      const createResponse = await fetch(`${API_URL}/mindmaps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${authToken1}`,
        },
        body: JSON.stringify({
          title: 'User 1 Mindmap',
          status: 'draft',
        }),
      })
      const createData = await createResponse.json()
      const mindmapId = createData.doc.id

      // Try to update as user2
      const updateResponse = await fetch(`${API_URL}/mindmaps/${mindmapId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${authToken2}`,
        },
        body: JSON.stringify({
          title: 'Hacked Title',
        }),
      })

      expect(updateResponse.status).toBe(404) // Payload returns 404 for forbidden resources
    })

    it('DELETE /api/mindmaps/:id - should delete mindmap when authorized', async () => {
      // Create mindmap
      const createResponse = await fetch(`${API_URL}/mindmaps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${authToken1}`,
        },
        body: JSON.stringify({
          title: 'Mindmap for Delete Test',
          status: 'draft',
        }),
      })
      const createData = await createResponse.json()
      const mindmapId = createData.doc.id

      // Delete the mindmap
      const deleteResponse = await fetch(`${API_URL}/mindmaps/${mindmapId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `JWT ${authToken1}`,
        },
      })

      expect(deleteResponse.status).toBe(200)

      // Verify it's deleted
      const readResponse = await fetch(`${API_URL}/mindmaps/${mindmapId}`, {
        headers: {
          Authorization: `JWT ${authToken1}`,
        },
      })
      expect(readResponse.status).toBe(404)
    })

    it('DELETE /api/mindmaps/:id - should return 403 when deleting other user mindmap', async () => {
      // Create mindmap as user1
      const createResponse = await fetch(`${API_URL}/mindmaps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${authToken1}`,
        },
        body: JSON.stringify({
          title: 'User 1 Mindmap for Delete',
          status: 'draft',
        }),
      })
      const createData = await createResponse.json()
      const mindmapId = createData.doc.id

      // Try to delete as user2
      const deleteResponse = await fetch(`${API_URL}/mindmaps/${mindmapId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `JWT ${authToken2}`,
        },
      })

      expect(deleteResponse.status).toBe(404) // Payload returns 404 for forbidden resources
    })
  })

  describe('MindmapNodes API Endpoints', () => {
    let testMindmap: any

    beforeAll(async () => {
      // Create a test mindmap for nodes
      testMindmap = await payload.create({
        collection: 'mindmaps',
        data: {
          title: 'Test Mindmap for Nodes API',
          status: 'draft',
          owner: user1.id,
        },
      })
    })

    it('POST /api/mindmap-nodes - should create node with auto-generated nodeId', async () => {
      const response = await fetch(`${API_URL}/mindmap-nodes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${authToken1}`,
        },
        body: JSON.stringify({
          mindmap: testMindmap.id,
          content: {
            text: 'API Test Node',
          },
          position: {
            x: 100,
            y: 100,
          },
        }),
      })

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.doc).toBeDefined()
      expect(data.doc.nodeId).toBeDefined()
      expect(data.doc.content.text).toBe('API Test Node')
    })

    it('PATCH /api/mindmap-nodes/:id - should enforce nodeId immutability', async () => {
      // Create a node
      const createResponse = await fetch(`${API_URL}/mindmap-nodes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${authToken1}`,
        },
        body: JSON.stringify({
          mindmap: testMindmap.id,
          content: { text: 'Node for Immutability Test' },
          position: { x: 200, y: 200 },
        }),
      })
      const createData = await createResponse.json()
      const nodeId = createData.doc.id
      const originalNodeId = createData.doc.nodeId

      // Try to update nodeId
      const updateResponse = await fetch(`${API_URL}/mindmap-nodes/${nodeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${authToken1}`,
        },
        body: JSON.stringify({
          nodeId: 'new-node-id-attempt',
          content: { text: 'Updated content' },
        }),
      })

      expect(updateResponse.status).toBe(400) // Should fail due to hook validation
    })

    it('GET /api/mindmap-nodes - should list nodes from user mindmaps only', async () => {
      const response = await fetch(`${API_URL}/mindmap-nodes`, {
        headers: {
          Authorization: `JWT ${authToken1}`,
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.docs).toBeDefined()
    })
  })

  describe('Flashcards API Endpoints', () => {
    it('POST /api/flashcards - should create flashcard with SRS metadata', async () => {
      const response = await fetch(`${API_URL}/flashcards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${authToken1}`,
        },
        body: JSON.stringify({
          nodeId: 'test-node-id',
          question: 'What is the capital of France?',
          answer: 'Paris',
          owner: user1.id,
        }),
      })

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.doc).toBeDefined()
      expect(data.doc.question).toBe('What is the capital of France?')
      expect(data.doc.srsMetadata).toBeDefined()
      expect(data.doc.srsMetadata.interval).toBe(0)
      expect(data.doc.srsMetadata.ease).toBe(2.5)
    })

    it('GET /api/flashcards - should list user flashcards only', async () => {
      const response = await fetch(`${API_URL}/flashcards`, {
        headers: {
          Authorization: `JWT ${authToken1}`,
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.docs).toBeDefined()
    })

    it('PATCH /api/flashcards/:id - should update SRS metadata', async () => {
      // Create flashcard
      const createResponse = await fetch(`${API_URL}/flashcards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${authToken1}`,
        },
        body: JSON.stringify({
          nodeId: 'test-node-srs',
          question: 'Test Question',
          answer: 'Test Answer',
          owner: user1.id,
        }),
      })
      const createData = await createResponse.json()
      const flashcardId = createData.doc.id

      // Update SRS metadata
      const updateResponse = await fetch(`${API_URL}/flashcards/${flashcardId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${authToken1}`,
        },
        body: JSON.stringify({
          srsMetadata: {
            interval: 1,
            ease: 2.6,
            nextReview: new Date(Date.now() + 86400000).toISOString(),
          },
        }),
      })

      expect(updateResponse.status).toBe(200)
      const data = await updateResponse.json()
      expect(data.doc.srsMetadata.interval).toBe(1)
      expect(data.doc.srsMetadata.ease).toBe(2.6)
    })
  })

  describe('Comments API Endpoints', () => {
    it('POST /api/comments - should create comment with pending status', async () => {
      const response = await fetch(`${API_URL}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${authToken1}`,
        },
        body: JSON.stringify({
          nodeId: 'test-node-comment',
          content: 'This is a test comment via API',
          author: user1.id,
        }),
      })

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.doc).toBeDefined()
      expect(data.doc.content).toBe('This is a test comment via API')
      expect(data.doc.status).toBe('pending')
    })

    it('GET /api/comments - should list comments', async () => {
      const response = await fetch(`${API_URL}/comments`, {
        headers: {
          Authorization: `JWT ${authToken1}`,
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.docs).toBeDefined()
    })

    it('PATCH /api/comments/:id - should update comment status (moderation)', async () => {
      // Create comment
      const createResponse = await fetch(`${API_URL}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${authToken1}`,
        },
        body: JSON.stringify({
          nodeId: 'test-node-moderation',
          content: 'Comment for moderation test',
          author: user1.id,
        }),
      })
      const createData = await createResponse.json()
      const commentId = createData.doc.id

      // Update status to approved
      const updateResponse = await fetch(`${API_URL}/comments/${commentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${authToken1}`,
        },
        body: JSON.stringify({
          status: 'approved',
        }),
      })

      expect(updateResponse.status).toBe(200)
      const data = await updateResponse.json()
      expect(data.doc.status).toBe('approved')
    })

    it('PATCH /api/comments/:id - should prevent updating other user comments', async () => {
      // Create comment as user1
      const createResponse = await fetch(`${API_URL}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${authToken1}`,
        },
        body: JSON.stringify({
          nodeId: 'test-node-access',
          content: 'User 1 comment',
          author: user1.id,
        }),
      })
      const createData = await createResponse.json()
      const commentId = createData.doc.id

      // Try to update as user2
      const updateResponse = await fetch(`${API_URL}/comments/${commentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${authToken2}`,
        },
        body: JSON.stringify({
          content: 'Hacked by user 2',
        }),
      })

      expect(updateResponse.status).toBe(404) // Payload returns 404 for forbidden resources
    })
  })
})

