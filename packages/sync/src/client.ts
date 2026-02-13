import type { Mindmap, MindmapNode } from '@mindmap/domain'
import {
  SyncConfig,
  SaveResult,
  LoadResult,
  SyncedMindmap,
  SyncedNode,
  SyncError,
  SyncErrorType,
} from './types'
import { withRetry, isOnline, type RetryOptions } from './retry'

/**
 * SyncClient
 *
 * Handles synchronization between local editor and Payload CMS.
 *
 * Features:
 * - Explicit sync (no auto-sync)
 * - Save/load mindmaps and nodes
 * - Preserves stable nodeIds
 * - Error handling for network failures
 *
 * Usage:
 * ```typescript
 * const client = new SyncClient({ cmsUrl: 'http://localhost:3001' })
 * const result = await client.saveMindmap(mindmap)
 * ```
 */
export class SyncClient {
  private config: SyncConfig
  private retryOptions: RetryOptions

  constructor(config: SyncConfig, retryOptions?: RetryOptions) {
    this.config = config
    this.retryOptions = retryOptions || {
      maxAttempts: 3,
      initialDelay: 1000,
      shouldRetry: (error: Error) => {
        // Retry on network errors, but not on auth or validation errors
        return (
          error.message.includes('Network') ||
          error.message.includes('fetch') ||
          !error.message.includes('Authentication') &&
          !error.message.includes('not found')
        )
      },
    }
  }

  /**
   * Get headers for API requests
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (this.config.authToken) {
      headers['Authorization'] = `Bearer ${this.config.authToken}`
    }

    return headers
  }

  /**
   * Make a fetch request with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.cmsUrl}${endpoint}`

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new SyncError(
            SyncErrorType.AUTH_ERROR,
            'Authentication failed',
            { status: response.status }
          )
        }

        if (response.status === 404) {
          throw new SyncError(
            SyncErrorType.NOT_FOUND,
            'Resource not found',
            { status: response.status }
          )
        }

        const errorData = await response.json().catch(() => ({})) as any
        throw new SyncError(
          SyncErrorType.VALIDATION_ERROR,
          errorData.message || 'Request failed',
          { status: response.status, data: errorData }
        )
      }

      return (await response.json()) as T
    } catch (error) {
      if (error instanceof SyncError) {
        throw error
      }

      throw new SyncError(
        SyncErrorType.NETWORK_ERROR,
        'Network request failed',
        { originalError: error }
      )
    }
  }

  /**
   * Save a mindmap to CMS
   * Creates new mindmap if no ID, updates if ID exists
   * Detects conflicts by comparing updatedAt timestamps
   */
  async saveMindmap(
    mindmap: Mindmap,
    options?: { skipConflictCheck?: boolean }
  ): Promise<SaveResult<SyncedMindmap>> {
    // Check if online
    if (!isOnline()) {
      return {
        success: false,
        error: 'No network connection. Please check your internet and try again.',
      }
    }

    try {
      const syncedMindmap = mindmap as SyncedMindmap

      // Check for conflicts before updating (if ID exists and not skipping)
      if (
        syncedMindmap.id &&
        !options?.skipConflictCheck &&
        syncedMindmap.updatedAt
      ) {
        const remoteResult = await this.loadMindmap(syncedMindmap.id)
        if (remoteResult.success && remoteResult.data) {
          const remote = remoteResult.data
          const localUpdated = new Date(syncedMindmap.updatedAt)
          const remoteUpdated = new Date(remote.updatedAt!)

          // Conflict detected: remote was updated after local
          if (remoteUpdated > localUpdated) {
            return {
              success: false,
              error: 'Conflict: Remote version is newer than local version',
              conflict: {
                local: syncedMindmap,
                remote,
                localUpdated,
                remoteUpdated,
              },
            }
          }
        }
      }

      const result = await withRetry(async () => {
        if (syncedMindmap.id) {
          // Update existing mindmap
          const data = await this.request<{ doc: SyncedMindmap }>(
            `/api/mindmaps/${syncedMindmap.id}`,
            {
              method: 'PATCH',
              body: JSON.stringify(mindmap),
            }
          )
          return data.doc
        } else {
          // Create new mindmap
          const data = await this.request<{ doc: SyncedMindmap }>(
            '/api/mindmaps',
            {
              method: 'POST',
              body: JSON.stringify(mindmap),
            }
          )
          return data.doc
        }
      }, this.retryOptions)

      return {
        success: true,
        data: result,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Load a mindmap from CMS
   */
  async loadMindmap(id: string): Promise<LoadResult<SyncedMindmap>> {
    // Check if online
    if (!isOnline()) {
      return {
        success: false,
        error: 'No network connection. Please check your internet and try again.',
      }
    }

    try {
      const data = await withRetry(
        async () => this.request<SyncedMindmap>(`/api/mindmaps/${id}`),
        this.retryOptions
      )

      return {
        success: true,
        data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Save nodes to CMS
   * Creates or updates nodes, preserving stable nodeIds
   */
  async saveNodes(
    nodes: MindmapNode[],
    mindmapId: string
  ): Promise<SaveResult<SyncedNode[]>> {
    // Check if online
    if (!isOnline()) {
      return {
        success: false,
        error: 'No network connection. Please check your internet and try again.',
      }
    }

    try {
      const savedNodes: SyncedNode[] = []

      // Save each node individually with retry
      // TODO: Implement batch API endpoint for better performance
      for (const node of nodes) {
        const syncedNode = node as SyncedNode

        const nodeData = {
          ...node,
          mindmap: mindmapId,
        }

        const savedNode = await withRetry(async () => {
          if (syncedNode.id) {
            // Update existing node
            const data = await this.request<{ doc: SyncedNode }>(
              `/api/mindmap-nodes/${syncedNode.id}`,
              {
                method: 'PATCH',
                body: JSON.stringify(nodeData),
              }
            )
            return data.doc
          } else {
            // Create new node
            const data = await this.request<{ doc: SyncedNode }>(
              '/api/mindmap-nodes',
              {
                method: 'POST',
                body: JSON.stringify(nodeData),
              }
            )
            return data.doc
          }
        }, this.retryOptions)

        savedNodes.push(savedNode)
      }

      return {
        success: true,
        data: savedNodes,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Load all nodes for a mindmap from CMS
   */
  async loadNodes(mindmapId: string): Promise<LoadResult<SyncedNode[]>> {
    // Check if online
    if (!isOnline()) {
      return {
        success: false,
        error: 'No network connection. Please check your internet and try again.',
      }
    }

    try {
      const data = await withRetry(
        async () =>
          this.request<{ docs: SyncedNode[] }>(
            `/api/mindmap-nodes?where[mindmap][equals]=${mindmapId}`
          ),
        this.retryOptions
      )

      return {
        success: true,
        data: data.docs,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

