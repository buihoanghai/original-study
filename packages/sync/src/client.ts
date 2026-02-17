import type { Mindmap, MindmapNode, NodeEdge } from '@mindmap/domain'
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
        credentials: 'include', // Include cookies for authentication
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
   * Transform domain Mindmap to Payload API format
   */
  private transformToPayloadFormat(mindmap: Mindmap): any {
    return {
      title: mindmap.metadata.title,
      description: mindmap.metadata.description,
      status: mindmap.status,
      // owner is auto-set by Payload CMS from authenticated user
    }
  }

  /**
   * Transform Payload API response to domain Mindmap format
   */
  private transformFromPayloadFormat(payloadDoc: any): Mindmap {
    return {
      id: payloadDoc.id,
      metadata: {
        title: payloadDoc.title,
        description: payloadDoc.description || '',
        created: new Date(payloadDoc.createdAt),
        updated: new Date(payloadDoc.updatedAt),
      },
      status: payloadDoc.status,
      ownerId: typeof payloadDoc.owner === 'string' ? payloadDoc.owner : payloadDoc.owner?.id,
    }
  }

  /**
   * Transform domain MindmapNode to Payload API format
   */
  private transformNodeToPayloadFormat(node: MindmapNode, mindmapId: string): any {
    // Omit the author field - Payload will auto-set it to the current user
    // The domain uses 'current-user' placeholder which is not a valid ObjectId
    return {
      nodeId: node.nodeId,
      mindmap: mindmapId,
      content: node.content,
      position: node.position,
      // metadata.author is omitted - Payload's defaultValue will set it
    }
  }

  /**
   * Transform Payload API node to domain MindmapNode format
   */
  private transformNodeFromPayloadFormat(payloadNode: any): MindmapNode {
    return {
      nodeId: payloadNode.nodeId,
      content: payloadNode.content,
      position: payloadNode.position,
      metadata: {
        created: new Date(payloadNode.createdAt),
        updated: new Date(payloadNode.updatedAt),
        author: typeof payloadNode.metadata?.author === 'string'
          ? payloadNode.metadata.author
          : payloadNode.metadata?.author?.id || 'unknown',
      },
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

      // Transform domain format to Payload API format
      const payloadData = this.transformToPayloadFormat(mindmap)

      const result = await withRetry(async () => {
        if (syncedMindmap.id) {
          // Update existing mindmap
          const data = await this.request<{ doc: any }>(
            `/api/mindmaps/${syncedMindmap.id}`,
            {
              method: 'PATCH',
              body: JSON.stringify(payloadData),
            }
          )
          return data.doc
        } else {
          // Create new mindmap
          const data = await this.request<{ doc: any }>(
            '/api/mindmaps',
            {
              method: 'POST',
              body: JSON.stringify(payloadData),
            }
          )
          return data.doc
        }
      }, this.retryOptions)

      console.log('[SyncClient] saveMindmap result from API:', result)

      // Validate result before transforming
      if (!result || !result.id) {
        console.error('[SyncClient] Invalid result from API:', result)
        throw new Error('Invalid response from server: missing mindmap data')
      }

      // Transform Payload response back to domain format
      const domainMindmap = this.transformFromPayloadFormat(result)

      return {
        success: true,
        data: domainMindmap as SyncedMindmap,
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
      // GET request returns the document directly, not wrapped in { doc: {...} }
      const payloadDoc = await withRetry(
        async () => this.request<any>(`/api/mindmaps/${id}`),
        this.retryOptions
      )

      // Validate payloadDoc before transforming
      if (!payloadDoc || !payloadDoc.id) {
        throw new Error('Invalid response from server: missing mindmap data')
      }

      // Transform Payload response to domain format
      const domainMindmap = this.transformFromPayloadFormat(payloadDoc)

      return {
        success: true,
        data: domainMindmap as SyncedMindmap,
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

        // Transform domain node to Payload API format
        const nodeData = this.transformNodeToPayloadFormat(node, mindmapId)

        const savedNode = await withRetry(async () => {
          if (syncedNode.id) {
            // Update existing node
            const data = await this.request<{ doc: any }>(
              `/api/mindmap-nodes/${syncedNode.id}`,
              {
                method: 'PATCH',
                body: JSON.stringify(nodeData),
              }
            )
            return data.doc
          } else {
            // Create new node
            const data = await this.request<{ doc: any }>(
              '/api/mindmap-nodes',
              {
                method: 'POST',
                body: JSON.stringify(nodeData),
              }
            )
            return data.doc
          }
        }, this.retryOptions)

        // Transform back to domain format and add to saved nodes
        const domainNode = this.transformNodeFromPayloadFormat(savedNode)
        savedNodes.push({ ...domainNode, id: savedNode.id } as SyncedNode)
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
          this.request<{ docs: any[] }>(
            `/api/mindmap-nodes?where[mindmap][equals]=${mindmapId}`
          ),
        this.retryOptions
      )

      // Transform Payload nodes to domain format
      const domainNodes = data.docs.map(payloadNode => {
        const domainNode = this.transformNodeFromPayloadFormat(payloadNode)
        return { ...domainNode, id: payloadNode.id } as SyncedNode
      })

      return {
        success: true,
        data: domainNodes,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Load all edges for a mindmap from CMS
   *
   * Fetches edges by first getting all nodes for the mindmap,
   * then querying edges where 'from' matches those nodeIds.
   */
  async loadEdges(mindmapId: string): Promise<LoadResult<NodeEdge[]>> {
    // Check if online
    if (!isOnline()) {
      return {
        success: false,
        error: 'No network connection. Please check your internet and try again.',
      }
    }

    try {
      // First, get all nodes for this mindmap to get their nodeIds
      const nodesResult = await this.loadNodes(mindmapId)
      if (!nodesResult.success || !nodesResult.data) {
        return {
          success: false,
          error: nodesResult.error || 'Failed to fetch nodes for edge query',
        }
      }

      const nodeIds = nodesResult.data.map(node => node.nodeId)

      if (nodeIds.length === 0) {
        // No nodes means no edges
        return {
          success: true,
          data: [],
        }
      }

      // Query edges where 'from' is in nodeIds
      const data = await withRetry(
        async () =>
          this.request<{ docs: any[] }>(
            `/api/node-edges?where[from][in]=${nodeIds.join(',')}&limit=1000`
          ),
        this.retryOptions
      )

      // Transform to domain NodeEdge type
      const edges: NodeEdge[] = data.docs.map((doc: any) => ({
        from: doc.from,
        to: doc.to,
        type: doc.type,
      }))

      return {
        success: true,
        data: edges,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

