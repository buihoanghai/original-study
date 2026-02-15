'use client'

import { useState, useEffect } from 'react'
import type { NodeMastery } from '@mindmap/domain'
import { getAllMastery } from '@/lib/learning-api'

/**
 * MasteryDashboard Component
 *
 * Displays an overview of learning progress across all nodes.
 * Shows mastery levels, confidence scores, and statistics.
 *
 * Features:
 * - Mastery level breakdown (new, learning, familiar, mastered)
 * - Average confidence score
 * - Total sessions completed
 * - Progress visualization
 */
export function MasteryDashboard() {
  const [masteryRecords, setMasteryRecords] = useState<NodeMastery[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMastery()
  }, [])

  async function loadMastery() {
    setIsLoading(true)
    setError(null)

    const result = await getAllMastery()

    if (result.success) {
      setMasteryRecords(result.data || [])
    } else {
      setError(result.error || 'Failed to load mastery data')
    }

    setIsLoading(false)
  }

  const getMasteryStats = () => {
    const stats = {
      new: 0,
      learning: 0,
      familiar: 0,
      mastered: 0,
      totalSessions: 0,
      avgConfidence: 0,
    }

    masteryRecords.forEach((record) => {
      stats[record.level]++
      stats.totalSessions += record.totalSessions
      stats.avgConfidence += record.confidence
    })

    if (masteryRecords.length > 0) {
      stats.avgConfidence = Math.round(stats.avgConfidence / masteryRecords.length)
    }

    return stats
  }

  const getMasteryColor = (level: string): string => {
    switch (level) {
      case 'new':
        return 'bg-gray-200 text-gray-700'
      case 'learning':
        return 'bg-blue-200 text-blue-700'
      case 'familiar':
        return 'bg-green-200 text-green-700'
      case 'mastered':
        return 'bg-purple-200 text-purple-700'
      default:
        return 'bg-gray-200 text-gray-700'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading mastery data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadMastery}
          className="mt-2 text-sm text-red-700 underline"
        >
          Retry
        </button>
      </div>
    )
  }

  const stats = getMasteryStats()
  const totalNodes = masteryRecords.length

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Learning Progress</h2>

      {totalNodes === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No learning data yet.</p>
          <p className="text-sm mt-2">
            Create nodes in your mindmap to start learning!
          </p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Total Nodes</div>
              <div className="text-3xl font-bold text-blue-600">
                {totalNodes}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Avg Confidence</div>
              <div className="text-3xl font-bold text-green-600">
                {stats.avgConfidence}%
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Total Sessions</div>
              <div className="text-3xl font-bold text-purple-600">
                {stats.totalSessions}
              </div>
            </div>
          </div>

          {/* Mastery Level Breakdown */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Mastery Levels</h3>
            <div className="space-y-2">
              {(['new', 'learning', 'familiar', 'mastered'] as const).map(
                (level) => {
                  const count = stats[level]
                  const percentage =
                    totalNodes > 0 ? (count / totalNodes) * 100 : 0

                  return (
                    <div key={level} className="flex items-center gap-3">
                      <div className="w-24 text-sm font-medium capitalize">
                        {level}
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                        <div
                          className={`h-full ${getMasteryColor(level)} flex items-center justify-end px-2 transition-all duration-300`}
                          style={{ width: `${percentage}%` }}
                        >
                          {count > 0 && (
                            <span className="text-xs font-semibold">
                              {count}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-16 text-sm text-gray-600 text-right">
                        {percentage.toFixed(0)}%
                      </div>
                    </div>
                  )
                }
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

