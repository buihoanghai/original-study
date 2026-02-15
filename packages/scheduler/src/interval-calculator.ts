/**
 * Review Interval Calculation Logic
 *
 * Calculates when the next review session should be scheduled
 * based on mastery level.
 */

import type { NodeMastery, MasteryLevel } from '@mindmap/domain'

/**
 * Fixed review intervals (in days) for each mastery level
 * MVP uses fixed intervals; can be made adaptive later
 */
const REVIEW_INTERVALS: Record<MasteryLevel, number> = {
  new: 1, // Review tomorrow
  learning: 3, // Review in 3 days
  familiar: 7, // Review in 1 week
  mastered: 30, // Review in 1 month
}

/**
 * Calculate the next review date based on mastery level
 *
 * @param mastery - Current mastery record
 * @returns Date when next review should be scheduled
 */
export function calculateNextReviewDate(mastery: NodeMastery): Date {
  const interval = getIntervalForLevel(mastery.level)
  const nextDate = new Date()
  nextDate.setDate(nextDate.getDate() + interval)
  return nextDate
}

/**
 * Get review interval (in days) for a mastery level
 *
 * @param level - Mastery level
 * @returns Number of days until next review
 */
export function getIntervalForLevel(level: MasteryLevel): number {
  return REVIEW_INTERVALS[level]
}

