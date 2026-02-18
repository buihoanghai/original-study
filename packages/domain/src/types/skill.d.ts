/**
 * Skill Domain Types
 *
 * These types support skill progress tracking in the mindmap app.
 * Skills are a specialized type of node with status and mastery tracking.
 */
/**
 * Status of a skill in the learning journey
 */
export type SkillStatus = 'not-started' | 'in-progress' | 'completed';
/**
 * Metadata for skill progress tracking
 *
 * This extends NodeContent to add skill-specific fields.
 */
export interface SkillMetadata {
    /**
     * Current status of the skill
     */
    status: SkillStatus;
    /**
     * Mastery percentage (0-100)
     * Calculated from flashcard performance (average ease factor)
     */
    masteryPercentage: number;
    /**
     * Last time this skill was practiced
     * Updated when flashcards are reviewed or learning sessions completed
     */
    lastPracticed?: Date;
}
//# sourceMappingURL=skill.d.ts.map