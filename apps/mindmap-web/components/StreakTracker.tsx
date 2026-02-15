'use client'

import { useState, useEffect } from 'react'
import { getWeeklyTarget } from '@/lib/learning-api'
import type { WeeklyTarget } from '@mindmap/domain'

/**
 * StreakTracker Component
 *
 * Displays current learning streak and weekly progress.
 * Provides motivational feedback and visual progress indicators.
 *
 * Features:
 * - Current streak count
 * - Weekly target progress
 * - Motivational messages
 * - Visual progress bar
 */
export function StreakTracker() {
  const [weeklyTarget, setWeeklyTarget] = useState<WeeklyTarget | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadWeeklyTarget()
  }, [])

  async function loadWeeklyTarget() {
    setIsLoading(true)
    setError(null)

    const result = await getWeeklyTarget()

    if (result.success) {
      setWeeklyTarget(result.data || null)
    } else {
      setError(result.error || 'Failed to load streak data')
    }

    setIsLoading(false)
  }

  const getMotivationalMessage = (streak: number): string => {
    if (streak === 0) return "Start your learning journey today!"
    if (streak === 1) return "Great start! Keep it going!"
    if (streak < 7) return `${streak} days strong! 🔥`
    if (streak < 30) return `Amazing ${streak}-day streak! 🌟`
    return `Incredible ${streak}-day streak! You're unstoppable! 🚀`
  }

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return 'bg-green-500'
    if (percentage >= 70) return 'bg-blue-500'
    if (percentage >= 40) return 'bg-yellow-500'
    return 'bg-gray-400'
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="text-gray-500 text-center">Loading streak...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="text-red-600 text-sm">{error}</div>
        <button
          onClick={loadWeeklyTarget}
          className="mt-2 text-sm text-red-700 underline"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!weeklyTarget) {
    return null
  }

  const progressPercentage = Math.min(
    100,
    (weeklyTarget.completedSessions / weeklyTarget.targetSessions) * 100
  )

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Your Progress</h2>

      {/* Streak Display */}
      <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg p-6 mb-4">
        <div className="text-center">
          <div className="text-5xl font-bold mb-2">
            {weeklyTarget.streak}
            <span className="text-2xl ml-2">🔥</span>
          </div>
          <div className="text-lg opacity-90">Day Streak</div>
          <div className="text-sm opacity-75 mt-2">
            {getMotivationalMessage(weeklyTarget.streak)}
          </div>
        </div>
      </div>

      {/* Weekly Target */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Weekly Target</span>
          <span className="text-sm text-gray-600">
            {weeklyTarget.completedSessions} / {weeklyTarget.targetSessions} sessions
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className={`h-full ${getProgressColor(progressPercentage)} transition-all duration-300 flex items-center justify-center`}
            style={{ width: `${progressPercentage}%` }}
          >
            {progressPercentage >= 20 && (
              <span className="text-xs font-semibold text-white">
                {progressPercentage.toFixed(0)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Week Info */}
      <div className="text-xs text-gray-500 text-center">
        Week of {new Date(weeklyTarget.weekStartDate).toLocaleDateString()}
      </div>

      {/* Refresh Button */}
      <button
        onClick={loadWeeklyTarget}
        className="mt-4 w-full text-sm text-blue-600 hover:text-blue-700 underline"
      >
        Refresh
      </button>
    </div>
  )
}

