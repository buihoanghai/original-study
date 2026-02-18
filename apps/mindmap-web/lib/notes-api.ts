/**
 * Notes API
 * 
 * Functions for managing user notes on mindmap nodes.
 */

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3001'

export interface Note {
  id: string
  nodeId: string
  author: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Get note for a specific node (current user)
 */
export async function getNoteByNodeId(nodeId: string): Promise<ApiResponse<Note | null>> {
  try {
    const response = await fetch(
      `${CMS_URL}/api/notes?where[nodeId][equals]=${nodeId}&limit=1`,
      {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch note: ${response.statusText}`,
      }
    }

    const result = await response.json()
    const note = result.docs && result.docs.length > 0 ? result.docs[0] : null

    return {
      success: true,
      data: note,
    }
  } catch (error) {
    console.error('Error fetching note:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Create a new note
 */
export async function createNote(
  nodeId: string,
  content: string
): Promise<ApiResponse<Note>> {
  try {
    const response = await fetch(`${CMS_URL}/api/notes`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nodeId,
        content,
      }),
    })

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to create note: ${response.statusText}`,
      }
    }

    const note = await response.json()

    return {
      success: true,
      data: note,
    }
  } catch (error) {
    console.error('Error creating note:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Update an existing note
 */
export async function updateNote(
  noteId: string,
  content: string
): Promise<ApiResponse<Note>> {
  try {
    const response = await fetch(`${CMS_URL}/api/notes/${noteId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
      }),
    })

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to update note: ${response.statusText}`,
      }
    }

    const note = await response.json()

    return {
      success: true,
      data: note,
    }
  } catch (error) {
    console.error('Error updating note:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Delete a note
 */
export async function deleteNote(noteId: string): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(`${CMS_URL}/api/notes/${noteId}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to delete note: ${response.statusText}`,
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error deleting note:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

