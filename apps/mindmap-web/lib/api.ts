import type { Mindmap, MindmapNode } from '@mindmap/domain'

/**
 * Mindmap API Client
 *
 * Client library for interacting with the Payload CMS API endpoints.
 * All functions return a result object with success/error pattern.
 *
 * Transforms between Payload CMS format (flat fields) and domain types (nested metadata).
 */

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3001'

export interface ApiResult<T> {
  success: boolean
  data?: T
  error?: string
}

// Alias for backward compatibility
export type ApiResponse<T> = ApiResult<T>

/**
 * Transform Payload CMS document to domain Mindmap type
 */
function transformToMindmap(doc: any): Mindmap {
  return {
    id: doc.id,
    metadata: {
      title: doc.title,
      description: doc.description || '',
      created: new Date(doc.createdAt),
      updated: new Date(doc.updatedAt),
    },
    status: doc.status,
    ownerId: typeof doc.owner === 'string' ? doc.owner : doc.owner?.id,
  }
}

/**
 * Get all mindmaps for the current user
 *
 * IMPORTANT: When called from Server Components, cookies must be forwarded manually.
 * Pass the cookies from the request headers to authenticate with the backend.
 */
export async function getMindmaps(cookies?: string): Promise<ApiResult<Mindmap[]>> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Forward cookies from Server Component if provided
    if (cookies) {
      headers['Cookie'] = cookies
    }

    const response = await fetch(`${CMS_URL}/api/mindmaps`, {
      method: 'GET',
      headers,
      credentials: 'include', // Include cookies for authentication (client-side)
      cache: 'no-store', // Don't cache authenticated requests
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.errors?.[0]?.message || `Failed to fetch mindmaps: ${response.statusText}`,
      }
    }

    const data = await response.json()

    // Payload returns { docs: [...], totalDocs, ... }
    // Transform each document to domain Mindmap type
    const mindmaps: Mindmap[] = (data.docs || []).map(transformToMindmap)

    return {
      success: true,
      data: mindmaps,
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to fetch mindmaps: ${error instanceof Error ? error.message : 'Network error'}`,
    }
  }
}

/**
 * Get a single mindmap by ID
 *
 * IMPORTANT: When called from Server Components, cookies must be forwarded manually.
 */
export async function getMindmap(id: string, cookies?: string): Promise<ApiResult<Mindmap>> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Forward cookies from Server Component if provided
    if (cookies) {
      headers['Cookie'] = cookies
    }

    const response = await fetch(`${CMS_URL}/api/mindmaps/${id}`, {
      method: 'GET',
      headers,
      credentials: 'include',
      cache: 'no-store', // Don't cache authenticated requests
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.errors?.[0]?.message || `Failed to fetch mindmap: ${response.statusText}`,
      }
    }

    const data = await response.json()

    // Payload returns { doc: {...} } for single document
    const mindmap = transformToMindmap(data.doc)

    return {
      success: true,
      data: mindmap,
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to fetch mindmap: ${error instanceof Error ? error.message : 'Network error'}`,
    }
  }
}

/**
 * Get nodes for a mindmap
 *
 * IMPORTANT: When called from Server Components, cookies must be forwarded manually.
 */
export async function getMindmapNodes(
  mindmapId: string,
  cookies?: string
): Promise<ApiResult<MindmapNode[]>> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Forward cookies from Server Component if provided
    if (cookies) {
      headers['Cookie'] = cookies
    }

    const response = await fetch(
      `${CMS_URL}/api/mindmap-nodes?where[mindmap][equals]=${mindmapId}`,
      {
        method: 'GET',
        headers,
        credentials: 'include',
        cache: 'no-store', // Don't cache authenticated requests
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.errors?.[0]?.message || `Failed to fetch nodes: ${response.statusText}`,
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
      error: `Failed to fetch nodes: ${error instanceof Error ? error.message : 'Network error'}`,
    }
  }
}

/**
 * Create a new mindmap
 */
export async function createMindmap(
  title: string,
  description?: string
): Promise<ApiResult<Mindmap>> {
  try {
    const response = await fetch(`${CMS_URL}/api/mindmaps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        title,
        description: description || '',
        status: 'draft',
        // owner is auto-set by Payload CMS from authenticated user
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.errors?.[0]?.message || `Failed to create mindmap: ${response.statusText}`,
      }
    }

    const data = await response.json()

    // Payload returns { doc: {...} } for created document
    const mindmap = transformToMindmap(data.doc)

    return {
      success: true,
      data: mindmap,
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to create mindmap: ${error instanceof Error ? error.message : 'Network error'}`,
    }
  }
}

/**
 * Update an existing mindmap
 */
export async function updateMindmap(
  id: string,
  updates: Partial<Pick<Mindmap, 'metadata' | 'status'>>
): Promise<ApiResult<Mindmap>> {
  try {
    // Transform domain format to Payload format
    const payload: any = {}
    if (updates.metadata) {
      if (updates.metadata.title !== undefined) payload.title = updates.metadata.title
      if (updates.metadata.description !== undefined) payload.description = updates.metadata.description
    }
    if (updates.status !== undefined) payload.status = updates.status

    const response = await fetch(`${CMS_URL}/api/mindmaps/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.errors?.[0]?.message || `Failed to update mindmap: ${response.statusText}`,
      }
    }

    const data = await response.json()
    const mindmap = transformToMindmap(data.doc)

    return {
      success: true,
      data: mindmap,
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to update mindmap: ${error instanceof Error ? error.message : 'Network error'}`,
    }
  }
}

/**
 * Delete a mindmap
 */
export async function deleteMindmap(id: string): Promise<ApiResult<void>> {
  try {
    const response = await fetch(`${CMS_URL}/api/mindmaps/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.errors?.[0]?.message || `Failed to delete mindmap: ${response.statusText}`,
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to delete mindmap: ${error instanceof Error ? error.message : 'Network error'}`,
    }
  }
}

