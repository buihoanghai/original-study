'use client'

import { useState, useEffect } from 'react'
import type { LearningSession } from '@mindmap/domain'
import { getSessionsByDateRange } from '@/lib/learning-api'

/**
 * SessionHistory Component
 *
 * Displays a history of completed learning sessions.
 * Shows performance trends and session statistics.
 *
 * Features:
 * - List of past sessions with performance scores
 * - Filter by date range
 * - Performance trend visualization
 * - Session type breakdown
 * - Total time spent learning
 */
export function SessionHistory() {
  const [sessions, setSessions] = useState<LearningSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'all'>('week')

  useEffect(() => {
    loadSessions()
  }, [dateRange])

  async function loadSessions() {
    setIsLoading(true)
    setError(null)

    const endDate = new Date()
    const startDate = new Date()

    switch (dateRange) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7)
        break
      case 'month':
        startDate.setDate(endDate.getDate() - 30)
        break
      case 'all':
        startDate.setFullYear(2020) // Far back enough to get all sessions
        break
    }

    const result = await getSessionsByDateRange(startDate, endDate)

    if (result.success) {
      const allSessions = result.data || []
      // Filter to only completed sessions
      const completedSessions = allSessions.filter(
        (s) => s.status === 'completed' && s.completedDate
      )
      // Sort by completion date (newest first)
      completedSessions.sort((a, b) => {
        const dateA = new Date(a.completedDate!).getTime()
        const dateB = new Date(b.completedDate!).getTime()
        return dateB - dateA
      })
      setSessions(completedSessions)
    } else {
      setError(result.error || 'Failed to load session history')
    }

    setIsLoading(false)
  }

  const getStats = () => {
    const totalSessions = sessions.length
    const totalTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0)
    const avgPerformance =
      totalSessions > 0
        ? sessions.reduce((sum, s) => sum + (s.performance || 0), 0) /
          totalSessions
        : 0

    const typeBreakdown = sessions.reduce(
      (acc, s) => {
        acc[s.type] = (acc[s.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return {
      totalSessions,
      totalTime,
      avgPerformance: Math.round(avgPerformance),
      typeBreakdown,
    }
  }

  const getPerformanceColor = (performance: number): string => {
    if (performance >= 90) return 'text-green-600'
    if (performance >= 70) return 'text-blue-600'
    if (performance >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSessionTypeColor = (type: string): string => {
    switch (type) {
      case 'learn':
        return 'bg-blue-100 text-blue-700'
      case 'review':
        return 'bg-green-100 text-green-700'
      case 'practice':
        return 'bg-yellow-100 text-yellow-700'
      case 'application':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">Loading history...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-red-600">{error}</div>
        <button
          onClick={loadSessions}
          className="mt-2 text-sm text-red-700 underline"
        >
          Retry
        </button>
      </div>
    )
  }

  const stats = getStats()

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Session History</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setDateRange('week')}
            className={`px-3 py-1 rounded text-sm ${
              dateRange === 'week'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setDateRange('month')}
            className={`px-3 py-1 rounded text-sm ${
              dateRange === 'month'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setDateRange('all')}
            className={`px-3 py-1 rounded text-sm ${
              dateRange === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No completed sessions yet.</p>
          <p className="text-sm mt-2">Start learning to build your history!</p>
        </div>
      ) : (
        <>
          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Total Sessions</div>
              <div className="text-3xl font-bold text-blue-600">
                {stats.totalSessions}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Avg Performance</div>
              <div className="text-3xl font-bold text-green-600">
                {stats.avgPerformance}%
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Total Time</div>
              <div className="text-3xl font-bold text-purple-600">
                {stats.totalTime}m
              </div>
            </div>
          </div>

          {/* Session List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {sessions.map((session) => (
              <div
                key={session.sessionId}
                className="border border-gray-200 rounded p-3 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium capitalize ${getSessionTypeColor(
                      session.type
                    )}`}
                  >
                    {session.type}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(session.completedDate!).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-gray-600 truncate">
                    {session.nodeId}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">
                      {session.duration || 0}m
                    </span>
                    <span
                      className={`text-sm font-bold ${getPerformanceColor(
                        session.performance || 0
                      )}`}
                    >
                      {session.performance || 0}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

