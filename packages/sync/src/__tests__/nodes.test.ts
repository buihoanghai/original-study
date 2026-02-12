import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SyncClient } from '../client'
import type { MindmapNode } from '@mindmap/domain'

// Mock fetch globally
global.fetch = vi.fn()

describe('SyncClient - Node Operations', () => {
  let client: SyncClient
  const mockCmsUrl = 'http://localhost:3001'
  const mockMindmapId = 'mindmap-123'

  beforeEach(() => {
    client = new SyncClient({ cmsUrl: mockCmsUrl })
    vi.clearAllMocks()
  })

  describe('saveNodes', () => {
    it('should save multiple nodes and preserve nodeIds', async () => {
      const nodes: MindmapNode[] = [
        {
          nodeId: 'node-1',
          content: { text: 'Node 1' },
          position: { x: 0, y: 0 },
          metadata: {
            created: new Date(),
            updated: new Date(),
            author: 'user-1',
          },
        },
        {
          nodeId: 'node-2',
          content: { text: 'Node 2' },
          position: { x: 100, y: 100 },
          metadata: {
            created: new Date(),
            updated: new Date(),
            author: 'user-1',
          },
        },
      ]

      // Mock responses for each node
      ;(global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            doc: {
              ...nodes[0],
              id: 'cms-node-1',
              mindmap: mockMindmapId,
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            doc: {
              ...nodes[1],
              id: 'cms-node-2',
              mindmap: mockMindmapId,
            },
          }),
        })

      const result = await client.saveNodes(nodes, mockMindmapId)

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data?.[0].nodeId).toBe('node-1') // Preserved
      expect(result.data?.[1].nodeId).toBe('node-2') // Preserved
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('should update existing nodes', async () => {
      const nodes: any[] = [
        {
          id: 'cms-node-1',
          nodeId: 'node-1',
          content: { text: 'Updated Node 1' },
          position: { x: 50, y: 50 },
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
            mindmap: mockMindmapId,
          },
        }),
      })

      const result = await client.saveNodes(nodes, mockMindmapId)

      expect(result.success).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockCmsUrl}/api/mindmap-nodes/cms-node-1`,
        expect.objectContaining({
          method: 'PATCH',
        })
      )
    })

    it('should handle errors during node save', async () => {
      const nodes: MindmapNode[] = [
        {
          nodeId: 'node-1',
          content: { text: 'Node 1' },
          position: { x: 0, y: 0 },
          metadata: {
            created: new Date(),
            updated: new Date(),
            author: 'user-1',
          },
        },
      ]

      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      const result = await client.saveNodes(nodes, mockMindmapId)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('loadNodes', () => {
    it('should load all nodes for a mindmap', async () => {
      const mockNodes = [
        {
          id: 'cms-node-1',
          nodeId: 'node-1',
          mindmap: mockMindmapId,
          content: { text: 'Node 1' },
          position: { x: 0, y: 0 },
        },
        {
          id: 'cms-node-2',
          nodeId: 'node-2',
          mindmap: mockMindmapId,
          content: { text: 'Node 2' },
          position: { x: 100, y: 100 },
        },
      ]

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ docs: mockNodes }),
      })

      const result = await client.loadNodes(mockMindmapId)

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data?.[0].nodeId).toBe('node-1')
      expect(result.data?.[1].nodeId).toBe('node-2')
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockCmsUrl}/api/mindmap-nodes?where[mindmap][equals]=${mockMindmapId}`,
        expect.any(Object)
      )
    })

    it('should handle errors during node load', async () => {
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      const result = await client.loadNodes(mockMindmapId)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })
})

