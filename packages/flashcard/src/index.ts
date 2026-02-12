/**
 * Flashcard Package
 *
 * Provides spaced repetition system (SRS) functionality for flashcards.
 */

export {
  createInitialSRS,
  calculateNextReview,
  isDue,
  getDueFlashcards,
  getDueCount,
  getReviewStats,
  type ReviewRating,
} from './srs'

// Re-export domain types for convenience
export type { Flashcard, SRSMetadata } from '@mindmap/domain'

