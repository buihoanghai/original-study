'use client'

import { useState, useEffect } from 'react'
import type { LearningSession } from '@mindmap/domain'
import { getWeekSessions } from '@/lib/learning-api'

interface CalendarViewProps {
  onSessionClick?: (session: LearningSession) => void
}

/**
 * CalendarView Component
 *
 * Displays a weekly calendar view of scheduled learning sessions.
 * Shows sessions grouped by day with visual indicators for status.
 *
 * Features:
 * - Weekly view (Sunday - Saturday)
 * - Color-coded session types
 * - Status indicators (scheduled, completed, skipped, missed)
 * - Click to execute session
 */
export function CalendarView({ onSessionClick }: CalendarViewProps) {
  const [sessions, setSessions] = useState<LearningSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date()
    const start = new Date(today)
    start.setDate(today.getDate() - today.getDay()) // Sunday
    start.setHours(0, 0, 0, 0)
    return start
  })

  useEffect(() => {
    loadSessions()
  }, [currentWeekStart])

  async function loadSessions() {
    setIsLoading(true)
    setError(null)

    const result = await getWeekSessions()

    if (result.success) {
      setSessions(result.data || [])
    } else {
      setError(result.error || 'Failed to load sessions')
    }

    setIsLoading(false)
  }

  const getSessionsForDay = (dayIndex: number): LearningSession[] => {
    const dayStart = new Date(currentWeekStart)
    dayStart.setDate(currentWeekStart.getDate() + dayIndex)
    dayStart.setHours(0, 0, 0, 0)

    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayStart.getDate() + 1)

    return sessions.filter((session) => {
      const sessionDate = new Date(session.scheduledDate)
      return sessionDate >= dayStart && sessionDate < dayEnd
    })
  }

  const getSessionTypeColor = (type: string): string => {
    switch (type) {
      case 'learn':
        return 'bg-blue-500'
      case 'review':
        return 'bg-green-500'
      case 'practice':
        return 'bg-yellow-500'
      case 'application':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'completed':
        return '✓'
      case 'skipped':
        return '⊘'
      case 'missed':
        return '✗'
      default:
        return ''
    }
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading calendar...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadSessions}
          className="mt-2 text-sm text-red-700 underline"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Learning Calendar</h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const newStart = new Date(currentWeekStart)
              newStart.setDate(newStart.getDate() - 7)
              setCurrentWeekStart(newStart)
            }}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            ← Prev
          </button>
          <button
            onClick={() => {
              const today = new Date()
              const start = new Date(today)
              start.setDate(today.getDate() - today.getDay())
              start.setHours(0, 0, 0, 0)
              setCurrentWeekStart(start)
            }}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Today
          </button>
          <button
            onClick={() => {
              const newStart = new Date(currentWeekStart)
              newStart.setDate(newStart.getDate() + 7)
              setCurrentWeekStart(newStart)
            }}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Next →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {dayNames.map((dayName, dayIndex) => {
          const daySessions = getSessionsForDay(dayIndex)
          const dayDate = new Date(currentWeekStart)
          dayDate.setDate(currentWeekStart.getDate() + dayIndex)
          const isToday =
            dayDate.toDateString() === new Date().toDateString()

          return (
            <div
              key={dayIndex}
              className={`border rounded p-2 min-h-[150px] ${
                isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="font-semibold text-sm mb-2">
                {dayName}
                <div className="text-xs text-gray-500">
                  {dayDate.getDate()}
                </div>
              </div>

              <div className="space-y-1">
                {daySessions.map((session) => (
                  <button
                    key={session.sessionId}
                    onClick={() => onSessionClick?.(session)}
                    className={`w-full text-left p-2 rounded text-xs ${getSessionTypeColor(
                      session.type
                    )} text-white hover:opacity-80 transition-opacity`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">
                        {session.type}
                      </span>
                      {session.status !== 'scheduled' && (
                        <span className="text-sm">
                          {getStatusIcon(session.status)}
                        </span>
                      )}
                    </div>
                  </button>
                ))}

                {daySessions.length === 0 && (
                  <div className="text-xs text-gray-400 text-center py-4">
                    No sessions
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Learn</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Review</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span>Practice</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-purple-500 rounded"></div>
          <span>Application</span>
        </div>
      </div>
    </div>
  )
}


