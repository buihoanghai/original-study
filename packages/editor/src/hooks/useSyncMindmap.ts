import { useCallback, useMemo } from 'react'
import { SyncClient } from '@mindmap/sync'
import { useEditorStore } from '../store/editorStore'
import type { Mindmap, NodeEdge } from '@mindmap/domain'
import { createNode } from '../operations/tree'

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
    updateMindmap,
    setSyncing,
    setSyncError,
    setLastSyncedAt,
  } = useEditorStore()

  const syncClient = useMemo(() => new SyncClient({ cmsUrl, authToken }), [cmsUrl, authToken])

  /**
   * Save current mindmap and nodes to CMS
   * @param skipConflictCheck - Skip conflict detection (force save)
   */
  const save = useCallback(
    async (skipConflictCheck = false) => {
      if (!mindmap) {
        setSyncError('No mindmap to save')
        return { success: false, error: 'No mindmap to save' }
      }

      setSyncing(true)
      setSyncError(null)

      try {
        // Save mindmap metadata
        const mindmapResult = await syncClient.saveMindmap(mindmap, {
          skipConflictCheck,
        })
        if (!mindmapResult.success) {
          // Return conflict data if present
          if (mindmapResult.conflict) {
            setSyncing(false)
            return {
              success: false,
              error: mindmapResult.error,
              conflict: mindmapResult.conflict,
            }
          }
          throw new Error(mindmapResult.error || 'Failed to save mindmap')
        }

        const savedMindmap = mindmapResult.data!
        console.log('[useSyncMindmap] savedMindmap:', savedMindmap)

        // Ensure the saved mindmap has an ID
        if (!savedMindmap || !savedMindmap.id) {
          console.error('[useSyncMindmap] savedMindmap is missing or has no ID:', savedMindmap)
          throw new Error('Saved mindmap missing ID')
        }

        // Update the mindmap in the store with the saved version (which has the ID)
        console.log('[useSyncMindmap] Updating mindmap in store with:', savedMindmap)
        updateMindmap(savedMindmap as Mindmap)

        // Save all nodes
        const nodesResult = await syncClient.saveNodes(nodes, savedMindmap.id)
        if (!nodesResult.success) {
          throw new Error(nodesResult.error || 'Failed to save nodes')
        }

        setLastSyncedAt(new Date())
        setSyncing(false)

        return { success: true, mindmapId: savedMindmap.id }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'
        setSyncError(errorMessage)
        setSyncing(false)
        return { success: false, error: errorMessage }
      }
    },
    [mindmap, nodes, syncClient, updateMindmap, setSyncing, setSyncError, setLastSyncedAt]
  )

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

        let loadedNodes = nodesResult.data!

        console.log('[useSyncMindmap] Loaded nodes:', loadedNodes)
        console.log('[useSyncMindmap] Nodes count:', loadedNodes.length)

        // If no nodes exist, create and save a root node with the mindmap title
        if (loadedNodes.length === 0) {
          console.log('[useSyncMindmap] No nodes found, creating root node')
          const rootNode = createNode(
            { text: loadedMindmap.metadata.title },
            { x: 0, y: 0 }
          )
          console.log('[useSyncMindmap] Created root node:', rootNode)

          // Save the root node to CMS
          console.log('[useSyncMindmap] Saving root node to CMS...')
          const saveNodesResult = await syncClient.saveNodes([rootNode], mindmapId)
          console.log('[useSyncMindmap] Save result:', saveNodesResult)

          if (saveNodesResult.success && saveNodesResult.data) {
            loadedNodes = saveNodesResult.data
            console.log('[useSyncMindmap] Using saved nodes from CMS')
          } else {
            // If save fails, still use the local node
            loadedNodes = [rootNode]
            console.log('[useSyncMindmap] Save failed, using local node')
          }
        }

        console.log('[useSyncMindmap] Final nodes to load into store:', loadedNodes)

        // Load edges from CMS
        console.log('[useSyncMindmap] Loading edges...')
        const edgesResult = await syncClient.loadEdges(mindmapId)
        if (!edgesResult.success) {
          console.warn('[useSyncMindmap] Failed to load edges:', edgesResult.error)
          // Don't fail the whole load if edges fail - use empty array
        }

        const loadedEdges = edgesResult.success ? edgesResult.data! : []
        console.log('[useSyncMindmap] Loaded edges:', loadedEdges)
        console.log('[useSyncMindmap] Edges count:', loadedEdges.length)

        // Load into store
        loadMindmap(loadedMindmap, loadedNodes, loadedEdges)

        setLastSyncedAt(new Date())
        setSyncing(false)

        return { success: true }
      } catch (error) {
        console.error('[useSyncMindmap] Error loading mindmap:', error)
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

