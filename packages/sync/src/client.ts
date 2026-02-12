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

  constructor(config: SyncConfig) {
    this.config = config
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
   */
  async saveMindmap(mindmap: Mindmap): Promise<SaveResult<SyncedMindmap>> {
    try {
      const syncedMindmap = mindmap as SyncedMindmap

      if (syncedMindmap.id) {
        // Update existing mindmap
        const data = await this.request<{ doc: SyncedMindmap }>(
          `/api/mindmaps/${syncedMindmap.id}`,
          {
            method: 'PATCH',
            body: JSON.stringify(mindmap),
          }
        )

        return {
          success: true,
          data: data.doc,
        }
      } else {
        // Create new mindmap
        const data = await this.request<{ doc: SyncedMindmap }>(
          '/api/mindmaps',
          {
            method: 'POST',
            body: JSON.stringify(mindmap),
          }
        )

        return {
          success: true,
          data: data.doc,
        }
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
    try {
      const data = await this.request<SyncedMindmap>(`/api/mindmaps/${id}`)

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
    try {
      const savedNodes: SyncedNode[] = []

      // Save each node individually
      // TODO: Implement batch API endpoint for better performance
      for (const node of nodes) {
        const syncedNode = node as SyncedNode

        const nodeData = {
          ...node,
          mindmap: mindmapId,
        }

        if (syncedNode.id) {
          // Update existing node
          const data = await this.request<{ doc: SyncedNode }>(
            `/api/mindmap-nodes/${syncedNode.id}`,
            {
              method: 'PATCH',
              body: JSON.stringify(nodeData),
            }
          )
          savedNodes.push(data.doc)
        } else {
          // Create new node
          const data = await this.request<{ doc: SyncedNode }>(
            '/api/mindmap-nodes',
            {
              method: 'POST',
              body: JSON.stringify(nodeData),
            }
          )
          savedNodes.push(data.doc)
        }
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
    try {
      const data = await this.request<{ docs: SyncedNode[] }>(
        `/api/mindmap-nodes?where[mindmap][equals]=${mindmapId}`
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

