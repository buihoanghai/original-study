/**
 * Mastery Tracking Types
 *
 * These types track learning progress and mastery level for each mindmap node.
 * Mastery records are auto-created when nodes are created and updated as sessions complete.
 */
/**
 * Mastery level for a node
 *
 * Progression path:
 * - new: Just created, no sessions completed (0-2 sessions)
 * - learning: Actively learning (3-4 sessions, <70% confidence)
 * - familiar: Comfortable with material (5-9 sessions, 70-89% confidence)
 * - mastered: Fully mastered (10+ sessions, 90%+ confidence)
 */
export type MasteryLevel = 'new' | 'learning' | 'familiar' | 'mastered';
/**
 * Mastery tracking record for a mindmap node
 *
 * Tracks learning progress, confidence, and scheduling for a specific node.
 * One mastery record per node, auto-created on node creation.
 */
export interface NodeMastery {
    /**
     * Reference to the mindmap node being tracked
     * Uses stable nodeId that never changes
     */
    nodeId: string;
    /** Current mastery level */
    level: MasteryLevel;
    /**
     * Confidence score (0-100)
     * Calculated from recent session performance
     * Higher = better retention and understanding
     */
    confidence: number;
    /**
     * Total number of learning sessions completed
     * Used to determine mastery level progression
     */
    totalSessions: number;
    /**
     * Success rate across all sessions (0-100)
     * Average of all performance scores
     */
    successRate: number;
    /**
     * When the next review session should be scheduled
     * Calculated based on mastery level and performance
     */
    nextReviewDate: Date;
    /**
     * When the node was last reviewed
     * Optional - only present after first session completion
     */
    lastReviewed?: Date;
    /** ID of the user who owns this mastery record */
    owner: string;
}
//# sourceMappingURL=mastery.d.ts.map