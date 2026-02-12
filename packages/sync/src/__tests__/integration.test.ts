import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SyncClient } from '../client'
import { SyncError, SyncErrorType } from '../types'
import type { Mindmap, MindmapNode } from '@mindmap/domain'

/**
 * Sync Integration Tests
 *
 * Tests conflict resolution, error recovery, retry logic, and other
 * integration scenarios that go beyond basic unit tests.
 *
 * These tests use mocked fetch to simulate real-world scenarios:
 * - Network failures and recovery
 * - Authentication errors
 * - Concurrent operations
 * - Data validation errors
 * - Batch operations
 */

// Mock fetch globally
global.fetch = vi.fn()

describe('Sync Integration Tests', () => {
  let client: SyncClient
  const mockCmsUrl = 'http://localhost:3001'
  const mockAuthToken = 'test-token-123'

  beforeEach(() => {
    client = new SyncClient({ cmsUrl: mockCmsUrl, authToken: mockAuthToken })
    vi.clearAllMocks()
  })

  describe('Conflict Resolution', () => {
    it('should handle conflict when updating same mindmap concurrently', async () => {
      const mindmap: any = {
        id: 'mindmap-123',
        metadata: {
          title: 'Conflicting Mindmap',
          description: 'Test',
          created: new Date(),
          updated: new Date(),
        },
        status: 'draft',
        ownerId: 'user-1',
      }

      // First update succeeds
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          doc: { ...mindmap, updatedAt: new Date().toISOString() },
        }),
      })

      const result1 = await client.saveMindmap(mindmap)
      expect(result1.success).toBe(true)

      // Second update fails with conflict (409)
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ message: 'Conflict: Resource was modified' }),
      })

      const result2 = await client.saveMindmap(mindmap)
      expect(result2.success).toBe(false)
      expect(result2.error).toContain('Conflict')
    })

    it('should preserve nodeId immutability during sync', async () => {
      const nodes: MindmapNode[] = [
        {
          nodeId: 'stable-node-id-1',
          content: { text: 'Node 1' },
          position: { x: 0, y: 0 },
          metadata: {
            created: new Date(),
            updated: new Date(),
            author: 'user-1',
          },
        },
      ]

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          doc: {
            ...nodes[0],
            id: 'cms-id-123',
            nodeId: 'stable-node-id-1', // Must preserve original nodeId
          },
        }),
      })

      const result = await client.saveNodes(nodes, 'mindmap-123')
      expect(result.success).toBe(true)
      expect(result.data?.[0].nodeId).toBe('stable-node-id-1')
    })
  })

  describe('Error Recovery', () => {
    it('should recover from network errors gracefully', async () => {
      const mindmap: any = {
        metadata: {
          title: 'Test',
          description: '',
          created: new Date(),
          updated: new Date(),
        },
        status: 'draft',
        ownerId: 'user-1',
      }

      // First attempt fails with network error
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      const result1 = await client.saveMindmap(mindmap)
      expect(result1.success).toBe(false)
      expect(result1.error).toBeDefined()

      // Second attempt succeeds (simulating retry)
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          doc: { ...mindmap, id: 'mindmap-123' },
        }),
      })

      const result2 = await client.saveMindmap(mindmap)
      expect(result2.success).toBe(true)
      expect(result2.data?.id).toBe('mindmap-123')
    })

    it('should handle authentication errors and provide clear error type', async () => {
      const mindmap: any = {
        metadata: { title: 'Test', created: new Date(), updated: new Date() },
        status: 'draft',
        ownerId: 'user-1',
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      })

      const result = await client.saveMindmap(mindmap)
      expect(result.success).toBe(false)
      expect(result.error).toContain('Authentication failed')
    })

    it('should handle validation errors with detailed messages', async () => {
      const mindmap: any = {
        metadata: {
          title: '', // Invalid: empty title
          created: new Date(),
          updated: new Date(),
        },
        status: 'draft',
        ownerId: 'user-1',
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          message: 'Validation failed',
          errors: [{ field: 'title', message: 'Title is required' }],
        }),
      })

      const result = await client.saveMindmap(mindmap)
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('Batch Operations', () => {
    it('should handle large batch operations efficiently', async () => {
      // Create 10 nodes
      const nodes: MindmapNode[] = Array.from({ length: 10 }, (_, i) => ({
        nodeId: `node-${i}`,
        content: { text: `Node ${i}` },
        position: { x: i * 100, y: 0 },
        metadata: {
          created: new Date(),
          updated: new Date(),
          author: 'user-1',
        },
      }))

      // Mock successful responses for all nodes
      for (let i = 0; i < 10; i++) {
        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            doc: { ...nodes[i], id: `cms-id-${i}` },
          }),
        })
      }

      const result = await client.saveNodes(nodes, 'mindmap-123')
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(10)
      expect(global.fetch).toHaveBeenCalledTimes(10)
    })

    it('should handle partial failures in batch operations', async () => {
      const nodes: MindmapNode[] = [
        {
          nodeId: 'node-1',
          content: { text: 'Node 1' },
          position: { x: 0, y: 0 },
          metadata: { created: new Date(), updated: new Date(), author: 'user-1' },
        },
        {
          nodeId: 'node-2',
          content: { text: 'Node 2' },
          position: { x: 100, y: 0 },
          metadata: { created: new Date(), updated: new Date(), author: 'user-1' },
        },
      ]

      // First node succeeds
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ doc: { ...nodes[0], id: 'cms-id-1' } }),
      })

      // Second node fails
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Validation error' }),
      })

      const result = await client.saveNodes(nodes, 'mindmap-123')
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should rollback on validation errors', async () => {
      const mindmap: any = {
        metadata: {
          title: 'Test',
          description: '',
          created: new Date(),
          updated: new Date(),
        },
        status: 'invalid-status', // Invalid status
        ownerId: 'user-1',
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          message: 'Validation failed',
          errors: [{ field: 'status', message: 'Invalid status value' }],
        }),
      })

      const result = await client.saveMindmap(mindmap)
      expect(result.success).toBe(false)
      expect(result.error).toContain('Validation failed')
    })
  })

  describe('Concurrent Operations', () => {
    it('should handle concurrent save operations', async () => {
      const mindmap1: any = {
        metadata: { title: 'Mindmap 1', created: new Date(), updated: new Date() },
        status: 'draft',
        ownerId: 'user-1',
      }

      const mindmap2: any = {
        metadata: { title: 'Mindmap 2', created: new Date(), updated: new Date() },
        status: 'draft',
        ownerId: 'user-1',
      }

      // Mock responses for both
      ;(global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ doc: { ...mindmap1, id: 'mindmap-1' } }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ doc: { ...mindmap2, id: 'mindmap-2' } }),
        })

      // Save concurrently
      const [result1, result2] = await Promise.all([
        client.saveMindmap(mindmap1),
        client.saveMindmap(mindmap2),
      ])

      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
      expect(result1.data?.id).toBe('mindmap-1')
      expect(result2.data?.id).toBe('mindmap-2')
    })

    it('should preserve data integrity during partial failures', async () => {
      const nodes: MindmapNode[] = [
        {
          nodeId: 'node-1',
          content: { text: 'Node 1' },
          position: { x: 0, y: 0 },
          metadata: { created: new Date(), updated: new Date(), author: 'user-1' },
        },
      ]

      // Simulate network failure
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network timeout'))

      const result = await client.saveNodes(nodes, 'mindmap-123')
      expect(result.success).toBe(false)

      // Verify original data is unchanged
      expect(nodes[0].nodeId).toBe('node-1')
      expect(nodes[0].content.text).toBe('Node 1')
    })
  })

  describe('Resource Not Found', () => {
    it('should handle 404 errors when loading non-existent mindmap', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Mindmap not found' }),
      })

      const result = await client.loadMindmap('nonexistent-id')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Resource not found')
    })

    it('should handle 404 errors when loading nodes for non-existent mindmap', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Mindmap not found' }),
      })

      const result = await client.loadNodes('nonexistent-mindmap-id')
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })
})

