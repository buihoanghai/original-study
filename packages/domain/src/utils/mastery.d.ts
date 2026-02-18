import type { Flashcard } from '../types/learning';
import type { SkillStatus } from '../types/skill';
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
export declare function calculateMastery(flashcards: Flashcard[]): number;
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
export declare function shouldAutoComplete(status: SkillStatus, mastery: number): boolean;
//# sourceMappingURL=mastery.d.ts.map