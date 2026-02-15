import type { NodeMastery, LearningSession, WeeklyTarget } from '@mindmap/domain'
import type { ApiResult } from './api'

/**
 * Learning System API Client
 *
 * Provides functions to interact with Payload CMS learning collections:
 * - NodeMastery collection
 * - LearningSessions collection
 *
 * All functions use cookie-based authentication and return ApiResult<T>.
 */

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3001'

/**
 * Get mastery record for a specific node
 */
export async function getNodeMastery(
  nodeId: string
): Promise<ApiResult<NodeMastery | null>> {
  try {
    const response = await fetch(
      `${CMS_URL}/api/node-mastery?where[nodeId][equals]=${nodeId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error:
          errorData.errors?.[0]?.message ||
          `Failed to fetch mastery: ${response.statusText}`,
      }
    }

    const data = await response.json()
    const mastery = data.docs?.[0] || null

    return {
      success: true,
      data: mastery,
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to fetch mastery: ${error instanceof Error ? error.message : 'Network error'}`,
    }
  }
}

/**
 * Get all mastery records for the current user
 */
export async function getAllMastery(): Promise<ApiResult<NodeMastery[]>> {
  try {
    const response = await fetch(`${CMS_URL}/api/node-mastery`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error:
          errorData.errors?.[0]?.message ||
          `Failed to fetch mastery records: ${response.statusText}`,
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
      error: `Failed to fetch mastery records: ${error instanceof Error ? error.message : 'Network error'}`,
    }
  }
}

/**
 * Update mastery record after session completion
 */
export async function updateMastery(
  masteryId: string,
  updates: Partial<NodeMastery>
): Promise<ApiResult<NodeMastery>> {
  try {
    const response = await fetch(`${CMS_URL}/api/node-mastery/${masteryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error:
          errorData.errors?.[0]?.message ||
          `Failed to update mastery: ${response.statusText}`,
      }
    }

    const data = await response.json()
    return {
      success: true,
      data: data.doc || data,
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to update mastery: ${error instanceof Error ? error.message : 'Network error'}`,
    }
  }
}

/**
 * Get learning sessions for a specific date range
 */
export async function getSessionsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<ApiResult<LearningSession[]>> {
  try {
    const start = startDate.toISOString()
    const end = endDate.toISOString()

    const response = await fetch(
      `${CMS_URL}/api/learning-sessions?where[and][0][scheduledDate][greater_than_equal]=${start}&where[and][1][scheduledDate][less_than_equal]=${end}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error:
          errorData.errors?.[0]?.message ||
          `Failed to fetch sessions: ${response.statusText}`,
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
      error: `Failed to fetch sessions: ${error instanceof Error ? error.message : 'Network error'}`,
    }
  }
}

/**
 * Get sessions due today
 */
export async function getTodaySessions(): Promise<
  ApiResult<LearningSession[]>
> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return getSessionsByDateRange(today, tomorrow)
}

/**
 * Get sessions for current week
 */
export async function getWeekSessions(): Promise<ApiResult<LearningSession[]>> {
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay()) // Sunday
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 7)

  return getSessionsByDateRange(startOfWeek, endOfWeek)
}

/**
 * Complete a learning session
 */
export async function completeSession(
  sessionId: string,
  performance: number,
  duration?: number
): Promise<ApiResult<LearningSession>> {
  try {
    const response = await fetch(
      `${CMS_URL}/api/learning-sessions/${sessionId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: 'completed',
          performance,
          duration,
          completedDate: new Date().toISOString(),
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error:
          errorData.errors?.[0]?.message ||
          `Failed to complete session: ${response.statusText}`,
      }
    }

    const data = await response.json()
    return {
      success: true,
      data: data.doc || data,
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to complete session: ${error instanceof Error ? error.message : 'Network error'}`,
    }
  }
}

/**
 * Skip a learning session
 */
export async function skipSession(
  sessionId: string
): Promise<ApiResult<LearningSession>> {
  try {
    const response = await fetch(
      `${CMS_URL}/api/learning-sessions/${sessionId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: 'skipped',
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error:
          errorData.errors?.[0]?.message ||
          `Failed to skip session: ${response.statusText}`,
      }
    }

    const data = await response.json()
    return {
      success: true,
      data: data.doc || data,
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to skip session: ${error instanceof Error ? error.message : 'Network error'}`,
    }
  }
}

/**
 * Calculate weekly target progress
 */
export async function getWeeklyTarget(): Promise<ApiResult<WeeklyTarget>> {
  try {
    const sessionsResult = await getWeekSessions()
    if (!sessionsResult.success) {
      return {
        success: false,
        error: sessionsResult.error,
      }
    }

    const sessions = sessionsResult.data || []
    const completedSessions = sessions.filter((s) => s.status === 'completed')

    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    // Calculate streak (simplified - would need more data in real implementation)
    const streak = completedSessions.length > 0 ? 1 : 0

    const weeklyTarget: WeeklyTarget = {
      weekStartDate: startOfWeek,
      targetSessions: 7, // Default target: 1 per day
      completedSessions: completedSessions.length,
      streak,
    }

    return {
      success: true,
      data: weeklyTarget,
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to calculate weekly target: ${error instanceof Error ? error.message : 'Network error'}`,
    }
  }
}


