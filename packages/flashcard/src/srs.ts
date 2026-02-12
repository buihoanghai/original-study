import type { SRSMetadata } from '@mindmap/domain'

/**
 * Spaced Repetition System (SRS) Implementation
 *
 * Based on the SM-2 (SuperMemo 2) algorithm.
 * This algorithm schedules flashcard reviews based on user performance.
 */

/**
 * Rating scale for flashcard review
 *
 * 0 (Again): Complete blackout, wrong response
 * 1 (Hard): Correct response recalled with serious difficulty
 * 2 (Good): Correct response after hesitation
 * 3 (Easy): Perfect response
 */
export type ReviewRating = 0 | 1 | 2 | 3

/**
 * Initial SRS metadata for a new flashcard
 */
export function createInitialSRS(): SRSMetadata {
  return {
    interval: 1,
    ease: 2.5,
    nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
  }
}

/**
 * Calculate next review based on SM-2 algorithm
 *
 * @param current - Current SRS metadata
 * @param rating - User's rating (0-3)
 * @returns Updated SRS metadata
 */
export function calculateNextReview(
  current: SRSMetadata,
  rating: ReviewRating
): SRSMetadata {
  let newInterval: number
  let newEase: number

  // If rating is Again (0) or Hard (1), reset interval
  if (rating < 2) {
    newInterval = 1
    newEase = Math.max(1.3, current.ease - 0.2)
  } else {
    // Calculate new ease factor
    // Formula: EF' = EF + (0.1 - (3 - q) * (0.08 + (3 - q) * 0.02))
    // where q is the rating (2 or 3)
    const easeDelta = 0.1 - (3 - rating) * (0.08 + (3 - rating) * 0.02)
    newEase = Math.max(1.3, current.ease + easeDelta)

    // Calculate new interval
    if (current.interval === 1) {
      newInterval = 6 // First successful review: 6 days
    } else {
      newInterval = Math.round(current.interval * newEase)
    }
  }

  // Calculate next review date
  const nextReview = new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000)

  return {
    interval: newInterval,
    ease: newEase,
    nextReview,
  }
}

/**
 * Check if a flashcard is due for review
 *
 * @param srs - SRS metadata
 * @param now - Current date (defaults to now)
 * @returns True if the flashcard is due
 */
export function isDue(srs: SRSMetadata, now: Date = new Date()): boolean {
  return srs.nextReview <= now
}

/**
 * Get flashcards that are due for review
 *
 * @param flashcards - Array of flashcards with SRS metadata
 * @param now - Current date (defaults to now)
 * @returns Flashcards that are due
 */
export function getDueFlashcards<T extends { srs?: SRSMetadata }>(
  flashcards: T[],
  now: Date = new Date()
): T[] {
  return flashcards.filter((card) => card.srs && isDue(card.srs, now))
}

/**
 * Get count of flashcards due within a time period
 *
 * @param flashcards - Array of flashcards with SRS metadata
 * @param days - Number of days to look ahead
 * @param now - Current date (defaults to now)
 * @returns Count of due flashcards
 */
export function getDueCount<T extends { srs?: SRSMetadata }>(
  flashcards: T[],
  days: number = 0,
  now: Date = new Date()
): number {
  const endDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
  return flashcards.filter(
    (card) => card.srs && card.srs.nextReview <= endDate
  ).length
}

/**
 * Get statistics about flashcard reviews
 *
 * @param flashcards - Array of flashcards with SRS metadata
 * @param now - Current date (defaults to now)
 * @returns Review statistics
 */
export function getReviewStats<T extends { srs?: SRSMetadata }>(
  flashcards: T[],
  now: Date = new Date()
) {
  const total = flashcards.length
  const dueToday = getDueCount(flashcards, 0, now)
  const dueThisWeek = getDueCount(flashcards, 7, now)
  const newCards = flashcards.filter((card) => !card.srs).length

  return {
    total,
    dueToday,
    dueThisWeek,
    newCards,
  }
}

