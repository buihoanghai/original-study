'use client'

import type { Flashcard } from '@mindmap/domain'
import { getReviewStats } from '@mindmap/flashcard'

interface FlashcardStatsProps {
  flashcards: Flashcard[]
}

/**
 * FlashcardStats Component
 *
 * Displays statistics about flashcard reviews.
 */
export function FlashcardStats({ flashcards }: FlashcardStatsProps) {
  const stats = getReviewStats(flashcards)

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="p-4 border border-zinc-200 rounded-lg bg-white">
        <div className="text-2xl font-bold text-zinc-900">{stats.total}</div>
        <div className="text-sm text-zinc-600">Total Cards</div>
      </div>

      <div className="p-4 border border-zinc-200 rounded-lg bg-white">
        <div className="text-2xl font-bold text-blue-600">
          {stats.dueToday}
        </div>
        <div className="text-sm text-zinc-600">Due Today</div>
      </div>

      <div className="p-4 border border-zinc-200 rounded-lg bg-white">
        <div className="text-2xl font-bold text-green-600">
          {stats.dueThisWeek}
        </div>
        <div className="text-sm text-zinc-600">Due This Week</div>
      </div>

      <div className="p-4 border border-zinc-200 rounded-lg bg-white">
        <div className="text-2xl font-bold text-purple-600">
          {stats.newCards}
        </div>
        <div className="text-sm text-zinc-600">New Cards</div>
      </div>
    </div>
  )
}

