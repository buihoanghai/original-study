'use client'

import { useState, useEffect } from 'react'
import type { LearningSession } from '@mindmap/domain'
import { getTodaySessions } from '@/lib/learning-api'

/**
 * LearningNotifications Component
 *
 * Displays notifications for upcoming and overdue learning sessions.
 * Provides quick access to start sessions directly from notifications.
 *
 * Features:
 * - Shows count of sessions due today
 * - Highlights overdue sessions
 * - Click to navigate to learning page
 * - Auto-refresh every 5 minutes
 * - Dismissible notifications
 */
export function LearningNotifications() {
  const [todaySessions, setTodaySessions] = useState<LearningSession[]>([])
  const [isVisible, setIsVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTodaySessions()

    // Refresh every 5 minutes
    const interval = setInterval(loadTodaySessions, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  async function loadTodaySessions() {
    setIsLoading(true)

    const result = await getTodaySessions()

    if (result.success) {
      const sessions = result.data || []
      // Only show scheduled sessions (not completed/skipped)
      const pendingSessions = sessions.filter((s) => s.status === 'scheduled')
      setTodaySessions(pendingSessions)
    }

    setIsLoading(false)
  }

  const getOverdueSessions = (): LearningSession[] => {
    const now = new Date()
    return todaySessions.filter((session) => {
      const scheduledDate = new Date(session.scheduledDate)
      return scheduledDate < now
    })
  }

  const handleDismiss = () => {
    setIsVisible(false)
    // Store dismissal in localStorage to persist across page reloads
    localStorage.setItem('learning-notifications-dismissed', Date.now().toString())
  }

  const handleNavigateToLearning = () => {
    window.location.href = '/learning'
  }

  // Don't show if dismissed or no sessions
  if (!isVisible || isLoading || todaySessions.length === 0) {
    return null
  }

  const overdueSessions = getOverdueSessions()
  const hasOverdue = overdueSessions.length > 0

  return (
    <div
      className={`fixed bottom-4 right-4 max-w-sm rounded-lg shadow-lg p-4 z-50 ${
        hasOverdue
          ? 'bg-red-50 border-2 border-red-500'
          : 'bg-blue-50 border-2 border-blue-500'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{hasOverdue ? '⚠️' : '📚'}</span>
          <h3 className="font-bold text-lg">
            {hasOverdue ? 'Overdue Sessions!' : 'Learning Reminder'}
          </h3>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      </div>

      <div className="mb-3">
        {hasOverdue ? (
          <p className="text-red-700">
            You have <strong>{overdueSessions.length}</strong> overdue learning
            session{overdueSessions.length > 1 ? 's' : ''}!
          </p>
        ) : (
          <p className="text-blue-700">
            You have <strong>{todaySessions.length}</strong> learning session
            {todaySessions.length > 1 ? 's' : ''} scheduled for today.
          </p>
        )}
      </div>

      <div className="space-y-2 mb-3">
        {todaySessions.slice(0, 3).map((session) => {
          const isOverdue = new Date(session.scheduledDate) < new Date()
          return (
            <div
              key={session.sessionId}
              className={`text-sm p-2 rounded ${
                isOverdue ? 'bg-red-100' : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium capitalize">{session.type}</span>
                <span className="text-xs text-gray-600">
                  {new Date(session.scheduledDate).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="text-xs text-gray-500 font-mono truncate">
                {session.nodeId}
              </div>
            </div>
          )
        })}

        {todaySessions.length > 3 && (
          <div className="text-xs text-gray-600 text-center">
            +{todaySessions.length - 3} more session
            {todaySessions.length - 3 > 1 ? 's' : ''}
          </div>
        )}
      </div>

      <button
        onClick={handleNavigateToLearning}
        className={`w-full py-2 px-4 rounded font-medium text-white ${
          hasOverdue
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {hasOverdue ? 'Start Now' : 'View Calendar'}
      </button>
    </div>
  )
}

