import type { MindmapNode } from '@mindmap/domain'

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3001'

export interface NodeApiResult {
  success: boolean
  data?: MindmapNode
  error?: string
}

/**
 * Fetch node by nodeId from CMS
 * 
 * @param nodeId - The stable nodeId to fetch
 * @returns Promise with success/error result and node data
 * 
 * @example
 * const result = await getNodeByNodeId('node-123')
 * if (result.success) {
 *   console.log(result.data.content)
 * }
 */
export async function getNodeByNodeId(
  nodeId: string
): Promise<NodeApiResult> {
  try {
    const response = await fetch(
      `${CMS_URL}/api/mindmap-nodes?where[nodeId][equals]=${nodeId}&limit=1`,
      {
        credentials: 'include',
      }
    )

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      }
    }

    const result = await response.json()

    if (result.docs && result.docs.length > 0) {
      return {
        success: true,
        data: result.docs[0],
      }
    }

    return {
      success: false,
      error: 'Node not found',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

