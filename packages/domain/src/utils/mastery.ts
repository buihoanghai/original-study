import type { Flashcard } from '../types/learning'
import type { SkillStatus } from '../types/skill'

/**
 * Mastery Calculation Utilities
 *
 * Calculates skill mastery based on flashcard performance (SRS ease factor).
 */

/**
 * Calculate mastery percentage from flashcard performance
 *
 * Formula: mastery = (avgEase - 1.3) / (2.5 - 1.3) * 100
 * - ease 1.3 = 0% mastery (minimum ease factor)
 * - ease 2.5 = 100% mastery (default ease factor)
 * - Values are clamped to 0-100%
 *
 * @param flashcards - Array of flashcards for a skill node
 * @returns Mastery percentage (0-100)
 */
export function calculateMastery(flashcards: Flashcard[]): number {
  // No flashcards = 0% mastery
  if (flashcards.length === 0) {
    return 0
  }

  // Filter flashcards with SRS metadata
  const flashcardsWithSRS = flashcards.filter((f) => f.srs)

  // No SRS data = 0% mastery
  if (flashcardsWithSRS.length === 0) {
    return 0
  }

  // Calculate average ease factor
  const totalEase = flashcardsWithSRS.reduce((sum, f) => sum + f.srs!.ease, 0)
  const avgEase = totalEase / flashcardsWithSRS.length

  // Normalize ease to percentage
  // ease 1.3 = 0%, ease 2.5 = 100%
  const MIN_EASE = 1.3
  const DEFAULT_EASE = 2.5
  const mastery = ((avgEase - MIN_EASE) / (DEFAULT_EASE - MIN_EASE)) * 100

  // Clamp to 0-100%
  return Math.max(0, Math.min(100, Math.round(mastery)))
}

/**
 * Check if a skill should auto-complete based on mastery
 *
 * Auto-complete criteria:
 * - Status must be "in-progress"
 * - Mastery must be >= 80%
 *
 * @param status - Current skill status
 * @param mastery - Current mastery percentage
 * @returns True if skill should auto-complete
 */
export function shouldAutoComplete(
  status: SkillStatus,
  mastery: number
): boolean {
  return status === 'in-progress' && mastery >= 80
}

