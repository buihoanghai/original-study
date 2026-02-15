'use client'

import { useState } from 'react'
import type { LearningSession } from '@mindmap/domain'
import { completeSession, skipSession } from '@/lib/learning-api'

interface SessionExecutorProps {
  session: LearningSession | null
  onComplete: () => void
  onClose: () => void
}

/**
 * SessionExecutor Component
 *
 * Interface for completing a learning session.
 * Allows user to rate their performance and track duration.
 *
 * Features:
 * - Performance rating (0-100)
 * - Duration tracking
 * - Complete/Skip actions
 * - Visual feedback
 */
export function SessionExecutor({
  session,
  onComplete,
  onClose,
}: SessionExecutorProps) {
  const [performance, setPerformance] = useState(70)
  const [duration, setDuration] = useState(15)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!session) {
    return null
  }

  const handleComplete = async () => {
    setIsSubmitting(true)
    setError(null)

    const result = await completeSession(session.sessionId, performance, duration)

    if (result.success) {
      onComplete()
      onClose()
    } else {
      setError(result.error || 'Failed to complete session')
    }

    setIsSubmitting(false)
  }

  const handleSkip = async () => {
    setIsSubmitting(true)
    setError(null)

    const result = await skipSession(session.sessionId)

    if (result.success) {
      onComplete()
      onClose()
    } else {
      setError(result.error || 'Failed to skip session')
    }

    setIsSubmitting(false)
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

  const getPerformanceLabel = (score: number): string => {
    if (score >= 90) return 'Excellent'
    if (score >= 70) return 'Good'
    if (score >= 50) return 'Fair'
    return 'Needs Work'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Learning Session</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        <div
          className={`${getSessionTypeColor(session.type)} text-white rounded-lg p-4 mb-4`}
        >
          <div className="text-sm opacity-90">Session Type</div>
          <div className="text-xl font-bold capitalize">{session.type}</div>
        </div>

        <div className="mb-6">
          <div className="text-sm text-gray-600 mb-1">Node ID</div>
          <div className="font-mono text-xs bg-gray-100 p-2 rounded">
            {session.nodeId}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            How well did you understand? ({performance}% - {getPerformanceLabel(performance)})
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={performance}
            onChange={(e) => setPerformance(Number(e.target.value))}
            className="w-full"
            disabled={isSubmitting}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Duration (minutes)
          </label>
          <input
            type="number"
            min="1"
            max="120"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2"
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleComplete}
            disabled={isSubmitting}
            className="flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Complete'}
          </button>
          <button
            onClick={handleSkip}
            disabled={isSubmitting}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  )
}

