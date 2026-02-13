import type { Flashcard, SRSMetadata } from '@mindmap/domain'
import type { ReviewRating } from '@mindmap/flashcard'
import { calculateNextReview, createInitialSRS } from '@mindmap/flashcard'
import type { ApiResult } from './api'

/**
 * Flashcard API Client
 *
 * Provides functions to interact with Payload CMS Flashcards collection.
 * All functions use cookie-based authentication and return ApiResult<T>.
 */

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3001'

/**
 * Get all flashcards for a specific node
 */
export async function getFlashcardsByNode(
  nodeId: string
): Promise<ApiResult<Flashcard[]>> {
  try {
    const response = await fetch(
      `${CMS_URL}/api/flashcards?where[nodeId][equals]=${nodeId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.errors?.[0]?.message || `Failed to fetch flashcards: ${response.statusText}`,
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
      error: `Failed to fetch flashcards: ${error instanceof Error ? error.message : 'Network error'}`,
    }
  }
}

/**
 * Get all flashcards for a mindmap
 */
export async function getAllFlashcards(): Promise<ApiResult<Flashcard[]>> {
  try {
    const response = await fetch(`${CMS_URL}/api/flashcards`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for authentication
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.errors?.[0]?.message || `Failed to fetch flashcards: ${response.statusText}`,
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
      error: `Failed to fetch flashcards: ${error instanceof Error ? error.message : 'Network error'}`,
    }
  }
}

/**
 * Get flashcards that are due for review
 */
export async function getDueFlashcards(): Promise<ApiResult<Flashcard[]>> {
  try {
    const now = new Date().toISOString()
    const response = await fetch(
      `${CMS_URL}/api/flashcards?where[srs.nextReview][less_than_equal]=${now}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.errors?.[0]?.message || `Failed to fetch due flashcards: ${response.statusText}`,
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
      error: `Failed to fetch due flashcards: ${error instanceof Error ? error.message : 'Network error'}`,
    }
  }
}

/**
 * Create a new flashcard
 */
export async function createFlashcard(
  nodeId: string,
  question: string,
  answer: string
): Promise<ApiResult<Flashcard>> {
  try {
    const srs = createInitialSRS()

    const response = await fetch(`${CMS_URL}/api/flashcards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for authentication
      body: JSON.stringify({
        nodeId,
        question,
        answer,
        srs: {
          interval: srs.interval,
          ease: srs.ease,
          nextReview: srs.nextReview.toISOString(),
        },
        // Owner is auto-set by Payload CMS from authenticated user
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.errors?.[0]?.message || `Failed to create flashcard: ${response.statusText}`,
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
      error: `Failed to create flashcard: ${error instanceof Error ? error.message : 'Network error'}`,
    }
  }
}

/**
 * Update a flashcard
 */
export async function updateFlashcard(
  id: string,
  updates: Partial<Pick<Flashcard, 'question' | 'answer'>>
): Promise<ApiResult<Flashcard>> {
  try {
    const response = await fetch(`${CMS_URL}/api/flashcards/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for authentication
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.errors?.[0]?.message || `Failed to update flashcard: ${response.statusText}`,
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
      error: `Failed to update flashcard: ${error instanceof Error ? error.message : 'Network error'}`,
    }
  }
}

/**
 * Delete a flashcard
 */
export async function deleteFlashcard(
  id: string
): Promise<ApiResult<void>> {
  try {
    const response = await fetch(`${CMS_URL}/api/flashcards/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for authentication
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.errors?.[0]?.message || `Failed to delete flashcard: ${response.statusText}`,
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to delete flashcard: ${error instanceof Error ? error.message : 'Network error'}`,
    }
  }
}

/**
 * Review a flashcard and update SRS metadata
 */
export async function reviewFlashcard(
  id: string,
  currentSRS: SRSMetadata,
  rating: ReviewRating
): Promise<ApiResult<Flashcard>> {
  try {
    const newSRS = calculateNextReview(currentSRS, rating)

    const response = await fetch(`${CMS_URL}/api/flashcards/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for authentication
      body: JSON.stringify({
        srs: {
          interval: newSRS.interval,
          ease: newSRS.ease,
          nextReview: newSRS.nextReview.toISOString(),
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.errors?.[0]?.message || `Failed to review flashcard: ${response.statusText}`,
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
      error: `Failed to review flashcard: ${error instanceof Error ? error.message : 'Network error'}`,
    }
  }
}
