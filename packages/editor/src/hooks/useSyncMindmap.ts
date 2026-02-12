import { useCallback } from 'react'
import { SyncClient } from '@mindmap/sync'
import { useEditorStore } from '../store/editorStore'
import type { Mindmap, NodeEdge } from '@mindmap/domain'

/**
 * useSyncMindmap Hook
 *
 * Provides sync functionality for saving and loading mindmaps to/from CMS.
 * Uses SyncClient from @mindmap/sync package.
 *
 * Features:
 * - Explicit sync (no auto-sync)
 * - Preserves stable nodeIds
 * - Error handling
 * - Loading states
 */
export const useSyncMindmap = (cmsUrl: string, authToken?: string) => {
  const {
    mindmap,
    nodes,
    edges,
    loadMindmap,
    setSyncing,
    setSyncError,
    setLastSyncedAt,
  } = useEditorStore()

  const syncClient = new SyncClient({ cmsUrl, authToken })

  /**
   * Save current mindmap and nodes to CMS
   */
  const save = useCallback(async () => {
    if (!mindmap) {
      setSyncError('No mindmap to save')
      return { success: false, error: 'No mindmap to save' }
    }

    setSyncing(true)
    setSyncError(null)

    try {
      // Save mindmap metadata
      const mindmapResult = await syncClient.saveMindmap(mindmap)
      if (!mindmapResult.success) {
        throw new Error(mindmapResult.error || 'Failed to save mindmap')
      }

      const savedMindmap = mindmapResult.data!

      // Save all nodes
      const nodesResult = await syncClient.saveNodes(nodes, savedMindmap.id!)
      if (!nodesResult.success) {
        throw new Error(nodesResult.error || 'Failed to save nodes')
      }

      setLastSyncedAt(new Date())
      setSyncing(false)

      return { success: true, mindmapId: savedMindmap.id }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setSyncError(errorMessage)
      setSyncing(false)
      return { success: false, error: errorMessage }
    }
  }, [mindmap, nodes, syncClient, setSyncing, setSyncError, setLastSyncedAt])

  /**
   * Load mindmap and nodes from CMS
   */
  const load = useCallback(
    async (mindmapId: string) => {
      setSyncing(true)
      setSyncError(null)

      try {
        // Load mindmap metadata
        const mindmapResult = await syncClient.loadMindmap(mindmapId)
        if (!mindmapResult.success) {
          throw new Error(mindmapResult.error || 'Failed to load mindmap')
        }

        const loadedMindmap = mindmapResult.data! as Mindmap

        // Load all nodes
        const nodesResult = await syncClient.loadNodes(mindmapId)
        if (!nodesResult.success) {
          throw new Error(nodesResult.error || 'Failed to load nodes')
        }

        const loadedNodes = nodesResult.data!

        // Build edges from node relationships
        // TODO: This assumes edges are stored separately or derived from node structure
        // For now, we'll use an empty array and let the tree operations rebuild them
        const loadedEdges: NodeEdge[] = []

        // Load into store
        loadMindmap(loadedMindmap, loadedNodes, loadedEdges)

        setLastSyncedAt(new Date())
        setSyncing(false)

        return { success: true }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        setSyncError(errorMessage)
        setSyncing(false)
        return { success: false, error: errorMessage }
      }
    },
    [syncClient, loadMindmap, setSyncing, setSyncError, setLastSyncedAt]
  )

  return {
    save,
    load,
  }
}

