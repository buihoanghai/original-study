import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SyncClient } from '../client'
import { SyncError, SyncErrorType } from '../types'
import type { Mindmap, MindmapNode } from '@mindmap/domain'

// Mock fetch globally
global.fetch = vi.fn()

describe('SyncClient', () => {
  let client: SyncClient
  const mockCmsUrl = 'http://localhost:3001'

  beforeEach(() => {
    client = new SyncClient({ cmsUrl: mockCmsUrl })
    vi.clearAllMocks()
  })

  describe('saveMindmap', () => {
    it('should create a new mindmap when no ID exists', async () => {
      const mindmap: any = {
        metadata: {
          title: 'Test Mindmap',
          description: 'A test mindmap',
          created: new Date(),
          updated: new Date(),
        },
        status: 'draft',
        ownerId: 'user-1',
      }

      const mockResponse = {
        doc: {
          ...mindmap,
          id: 'mindmap-123',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await client.saveMindmap(mindmap)

      expect(result.success).toBe(true)
      expect(result.data?.id).toBe('mindmap-123')
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockCmsUrl}/api/mindmaps`,
        expect.objectContaining({
          method: 'POST',
        })
      )
    })

    it('should update an existing mindmap when ID exists', async () => {
      const mindmap: any = {
        id: 'mindmap-123',
        metadata: {
          title: 'Updated Mindmap',
          description: 'Updated description',
          created: new Date(),
          updated: new Date(),
          owner: 'user-1',
        },
        status: 'published',
      }

      const mockResponse = {
        doc: {
          ...mindmap,
          updatedAt: new Date().toISOString(),
        },
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await client.saveMindmap(mindmap)

      expect(result.success).toBe(true)
      expect(result.data?.id).toBe('mindmap-123')
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockCmsUrl}/api/mindmaps/mindmap-123`,
        expect.objectContaining({
          method: 'PATCH',
        })
      )
    })

    it('should handle network errors', async () => {
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

      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      const result = await client.saveMindmap(mindmap)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('loadMindmap', () => {
    it('should load a mindmap by ID', async () => {
      const mockMindmap = {
        id: 'mindmap-123',
        metadata: {
          title: 'Test Mindmap',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          owner: 'user-1',
        },
        status: 'draft',
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMindmap,
      })

      const result = await client.loadMindmap('mindmap-123')

      expect(result.success).toBe(true)
      expect(result.data?.id).toBe('mindmap-123')
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockCmsUrl}/api/mindmaps/mindmap-123`,
        expect.any(Object)
      )
    })

    it('should handle not found errors', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not found' }),
      })

      const result = await client.loadMindmap('nonexistent')

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })
})

