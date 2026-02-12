import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SyncClient } from '../client'

/**
 * SyncClient Error Handling Tests
 *
 * Tests error handling for network failures, auth errors, and validation errors.
 * Note: SyncClient methods return SaveResult/LoadResult objects with success/error fields
 * instead of throwing errors.
 */

describe('SyncClient Error Handling', () => {
  let client: SyncClient

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
    client = new SyncClient({
      cmsUrl: 'http://localhost:3001',
      authToken: 'test-token',
    })
  })

  describe('Network Errors', () => {
    it('should return error result when fetch fails', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockRejectedValue(new Error('Network failure'))

      const result = await client.loadMindmap('test-id')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network request failed')
    })

    it('should return error result on connection timeout', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockRejectedValue(new Error('Request timeout'))

      const result = await client.saveMindmap({ metadata: { title: 'Test' } })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network request failed')
    })

    it('should return error result on connection refused', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockRejectedValue(new Error('ECONNREFUSED'))

      const result = await client.loadNodes('mindmap-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network request failed')
    })
  })

  describe('Authentication Errors', () => {
    it('should return error result on 401 Unauthorized', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
      } as Response)

      const result = await client.loadMindmap('test-id')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Authentication failed')
    })

    it('should return error result on 403 Forbidden', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
      } as Response)

      const result = await client.saveMindmap({ metadata: { title: 'Test' } })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Authentication failed')
    })
  })

  describe('Not Found Errors', () => {
    it('should return error result on 404', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      } as Response)

      const result = await client.loadMindmap('non-existent-id')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Resource not found')
    })
  })

  describe('Validation Errors', () => {
    it('should return error result on 400 Bad Request', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: 'Invalid data' }),
      } as Response)

      const result = await client.saveMindmap({ metadata: { title: '' } })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid data')
    })

    it('should return error result on 422 Unprocessable Entity', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValue({
        ok: false,
        status: 422,
        json: () => Promise.resolve({ message: 'Validation failed' }),
      } as Response)

      // saveNodes with at least one node to trigger the request
      const nodes = [{ nodeId: 'node-1', content: { text: 'Test' }, position: { x: 0, y: 0 } }]
      const result = await client.saveNodes(nodes, 'mindmap-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Validation failed')
    })

    it('should handle validation error with no message', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({}),
      } as Response)

      const result = await client.saveMindmap({ metadata: { title: 'Test' } })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Request failed')
    })

    it('should handle validation error with malformed JSON', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as Response)

      const result = await client.saveMindmap({ metadata: { title: 'Test' } })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Request failed')
    })
  })

  describe('Server Errors', () => {
    it('should return error result on 500 Internal Server Error', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: 'Internal server error' }),
      } as Response)

      const result = await client.loadMindmap('test-id')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Internal server error')
    })

    it('should return error result on 503 Service Unavailable', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValue({
        ok: false,
        status: 503,
        json: () => Promise.resolve({ message: 'Service unavailable' }),
      } as Response)

      const result = await client.loadNodes('mindmap-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Service unavailable')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty response body', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(null),
      } as Response)

      const result = await client.loadMindmap('test-id')

      expect(result.success).toBe(true)
      expect(result.data).toBeNull()
    })

    it('should handle undefined error details', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockRejectedValue(undefined)

      const result = await client.loadMindmap('test-id')

      expect(result.success).toBe(false)
      // The request() method wraps all non-SyncError errors in a SyncError with message "Network request failed"
      expect(result.error).toBe('Network request failed')
    })

    it('should handle string errors', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockRejectedValue('String error')

      const result = await client.loadMindmap('test-id')

      expect(result.success).toBe(false)
      // The request() method wraps all non-SyncError errors in a SyncError with message "Network request failed"
      expect(result.error).toBe('Network request failed')
    })

    it('should handle null errors', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockRejectedValue(null)

      const result = await client.loadMindmap('test-id')

      expect(result.success).toBe(false)
      // The request() method wraps all non-SyncError errors in a SyncError with message "Network request failed"
      expect(result.error).toBe('Network request failed')
    })
  })

  describe('Multiple Operations', () => {
    it('should return error result in saveNodes batch operation', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockRejectedValue(new Error('Network error'))

      const nodes = [
        { nodeId: 'node-1', content: { text: 'Node 1' }, position: { x: 0, y: 0 } },
        { nodeId: 'node-2', content: { text: 'Node 2' }, position: { x: 100, y: 0 } },
      ]

      const result = await client.saveNodes(nodes, 'mindmap-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network request failed')
    })

    it('should return error on first failure in batch operations', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      let callCount = 0
      mockFetch.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ doc: { id: 'node-1' } }),
          } as Response)
        } else {
          return Promise.reject(new Error('Network error'))
        }
      })

      const nodes = [
        { nodeId: 'node-1', content: { text: 'Node 1' }, position: { x: 0, y: 0 } },
        { nodeId: 'node-2', content: { text: 'Node 2' }, position: { x: 100, y: 0 } },
      ]

      const result = await client.saveNodes(nodes, 'mindmap-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network request failed')
    })
  })
})

