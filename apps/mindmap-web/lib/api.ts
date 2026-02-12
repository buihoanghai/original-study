import type { Mindmap, MindmapNode } from '@mindmap/domain'

/**
 * API Client for CMS Communication
 *
 * Provides functions to interact with Payload CMS API.
 * Uses fetch API for HTTP requests.
 */

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3001'

export interface MindmapListItem {
  id: string
  metadata: {
    title: string
    description?: string
    created: Date
    updated: Date
  }
  status: 'draft' | 'published' | 'archived'
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Get list of all mindmaps
 */
export async function getMindmaps(): Promise<ApiResponse<MindmapListItem[]>> {
  try {
    const response = await fetch(`${CMS_URL}/api/mindmaps`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch mindmaps: ${response.statusText}`,
      }
    }

    const data = await response.json()
    return {
      success: true,
      data: data.docs || [],
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get a single mindmap by ID
 */
export async function getMindmap(id: string): Promise<ApiResponse<Mindmap>> {
  try {
    const response = await fetch(`${CMS_URL}/api/mindmaps/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch mindmap: ${response.statusText}`,
      }
    }

    const data = await response.json()
    return {
      success: true,
      data: data.doc,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get nodes for a mindmap
 */
export async function getMindmapNodes(
  mindmapId: string
): Promise<ApiResponse<MindmapNode[]>> {
  try {
    const response = await fetch(
      `${CMS_URL}/api/mindmap-nodes?where[mindmap][equals]=${mindmapId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch nodes: ${response.statusText}`,
      }
    }

    const data = await response.json()
    return {
      success: true,
      data: data.docs || [],
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Create a new mindmap
 */
export async function createMindmap(
  title: string,
  description?: string
): Promise<ApiResponse<Mindmap>> {
  try {
    const response = await fetch(`${CMS_URL}/api/mindmaps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metadata: {
          title,
          description,
          created: new Date(),
          updated: new Date(),
        },
        status: 'draft',
        ownerId: 'default-user', // TODO: Replace with actual user ID when auth is implemented
      }),
    })

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to create mindmap: ${response.statusText}`,
      }
    }

    const data = await response.json()
    return {
      success: true,
      data: data.doc,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

