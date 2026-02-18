import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useEditorStore } from '../store/editorStore'
import { SyncClient } from '@mindmap/sync'
import type { Mindmap, MindmapNode, NodeEdge } from '@mindmap/domain'

/**
 * Edge Loading Integration Test
 * 
 * This test reproduces the bug where edges are not being loaded
 * from the CMS when opening a mindmap.
 */

// Mock fetch globally
global.fetch = vi.fn()

describe('Edge Loading Bug Reproduction', () => {
  beforeEach(() => {
    useEditorStore.getState().reset()
    vi.clearAllMocks()
  })

  it('should load edges from CMS and pass them to store', async () => {
    const client = new SyncClient({
      cmsUrl: 'http://localhost:3001',
      authToken: 'test-token',
    })

    // Mock nodes response
    const mockNodes: MindmapNode[] = [
      {
        nodeId: 'node-1',
        content: { text: 'Root' },
        position: { x: 0, y: 0 },
        metadata: { created: new Date(), updated: new Date(), author: 'user-1' },
      },
      {
        nodeId: 'node-2',
        content: { text: 'Child' },
        position: { x: 100, y: 100 },
        metadata: { created: new Date(), updated: new Date(), author: 'user-1' },
      },
    ]

    // Mock edges response - THIS IS THE KEY PART
    const mockEdges: NodeEdge[] = [
      {
        from: 'node-1',
        to: 'node-2',
        type: 'parent-child',
      },
    ]

    // Mock fetch responses for loadEdges
    ;(global.fetch as any)
      // loadNodes (called by loadEdges)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          docs: mockNodes.map((node, i) => ({ ...node, id: `cms-id-${i}`, mindmap: 'mindmap-123' })),
          totalDocs: 2,
        }),
      })
      // loadEdges - actual edge query
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          docs: mockEdges.map((edge, i) => ({ ...edge, id: `edge-id-${i}` })),
          totalDocs: 1,
        }),
      })

    // Load edges - THIS IS THE BUG: useSyncMindmap should call this
    const edgesResult = await client.loadEdges('mindmap-123')
    console.log('[TEST] edgesResult:', edgesResult)

    expect(edgesResult.success).toBe(true)
    expect(edgesResult.data).toHaveLength(1)
    expect(edgesResult.data![0].from).toBe('node-1')
    expect(edgesResult.data![0].to).toBe('node-2')

    // Load into store
    const mockMindmap: Mindmap = {
      id: 'mindmap-1',
      metadata: {
        title: 'Test Mindmap',
        description: 'Test',
        created: new Date(),
        updated: new Date(),
      },
      status: 'draft',
      ownerId: 'user-1',
    }

    useEditorStore.getState().loadMindmap(
      { ...mockMindmap, id: 'mindmap-123' } as any,
      mockNodes,
      edgesResult.data!
    )

    // Verify edges are in store
    const state = useEditorStore.getState()
    expect(state.edges).toHaveLength(1)
    expect(state.edges[0].from).toBe('node-1')
    expect(state.edges[0].to).toBe('node-2')
  })

  it('should handle edge loading failure gracefully', async () => {
    const client = new SyncClient({
      cmsUrl: 'http://localhost:3001',
      authToken: 'test-token',
    })

    // Mock successful nodes response
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        docs: [{ nodeId: 'node-1', id: 'cms-1', mindmap: 'mindmap-123' }],
        totalDocs: 1,
      }),
    })

    // Mock failed edges response
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    })

    const nodesResult = await client.loadNodes('mindmap-123')
    expect(nodesResult.success).toBe(true)

    const edgesResult = await client.loadEdges('mindmap-123')
    expect(edgesResult.success).toBe(false)
    expect(edgesResult.error).toContain('Resource not found')
  })
})

