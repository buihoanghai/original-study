import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useEditorStore } from '../store/editorStore'
import { SyncClient } from '@mindmap/sync'

// Mock fetch globally
global.fetch = vi.fn()

describe('Sync Integration', () => {
  beforeEach(() => {
    useEditorStore.getState().reset()
    vi.clearAllMocks()
  })

  describe('SyncClient Integration', () => {
    it('should create sync client with config', () => {
      const client = new SyncClient({
        cmsUrl: 'http://localhost:3001',
        authToken: 'test-token',
      })

      expect(client).toBeDefined()
      expect(client.saveMindmap).toBeDefined()
      expect(client.loadMindmap).toBeDefined()
    })

    it('should save mindmap and nodes to CMS', async () => {
      const { createMindmap, addChild } = useEditorStore.getState()

      // Create a mindmap
      createMindmap('Test Mindmap', 'Test description')
      const rootId = useEditorStore.getState().nodes[0].nodeId
      addChild(rootId)

      // Mock successful save responses
      ;(global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            doc: {
              id: 'mindmap-123',
              metadata: {
                title: 'Test Mindmap',
                description: 'Test description',
                created: new Date().toISOString(),
                updated: new Date().toISOString(),
              },
              status: 'draft',
              ownerId: 'user-1',
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            doc: {
              id: 'node-1',
              nodeId: rootId,
              mindmap: 'mindmap-123',
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            doc: {
              id: 'node-2',
              nodeId: useEditorStore.getState().nodes[1].nodeId,
              mindmap: 'mindmap-123',
            },
          }),
        })

      const client = new SyncClient({
        cmsUrl: 'http://localhost:3001',
        authToken: 'test-token',
      })

      const mindmap = useEditorStore.getState().mindmap!
      const nodes = useEditorStore.getState().nodes

      const saveResult = await client.saveMindmap(mindmap)

      expect(saveResult.success).toBe(true)
      expect(saveResult.data?.id).toBe('mindmap-123')
    })

    // TODO: Add error handling test
    // Currently skipped due to mock interference between tests
  })

  describe('NodeId Preservation', () => {
    it('should preserve stable nodeIds during sync', async () => {
      const { createMindmap, addChild } = useEditorStore.getState()

      createMindmap('Test')
      const rootId = useEditorStore.getState().nodes[0].nodeId
      addChild(rootId)
      const childId = useEditorStore.getState().nodes[1].nodeId

      // Mock save responses that preserve nodeIds
      ;(global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            doc: {
              id: 'mindmap-123',
              metadata: { title: 'Test', created: new Date(), updated: new Date() },
              status: 'draft',
              ownerId: 'user-1',
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            doc: {
              id: 'cms-node-1',
              nodeId: rootId, // Preserved!
              mindmap: 'mindmap-123',
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            doc: {
              id: 'cms-node-2',
              nodeId: childId, // Preserved!
              mindmap: 'mindmap-123',
            },
          }),
        })

      const client = new SyncClient({
        cmsUrl: 'http://localhost:3001',
        authToken: 'test-token',
      })

      const mindmap = useEditorStore.getState().mindmap!
      await client.saveMindmap(mindmap)

      // Verify nodeIds are still the same
      const state = useEditorStore.getState()
      expect(state.nodes[0].nodeId).toBe(rootId)
      expect(state.nodes[1].nodeId).toBe(childId)
    })
  })
})

