/**
 * Learning Domain Types
 *
 * These types support the learning features of the mindmap app,
 * including flashcards and spaced repetition system (SRS).
 */
/**
 * Spaced Repetition System (SRS) metadata
 *
 * Used to track learning progress and schedule reviews.
 * Based on algorithms like SM-2 (SuperMemo 2).
 */
export interface SRSMetadata {
    /**
     * Current interval in days until next review
     * Starts at 1, increases with successful reviews
     */
    interval: number;
    /**
     * Ease factor (difficulty multiplier)
     * Typically starts at 2.5, adjusted based on performance
     */
    ease: number;
    /**
     * Date/time of next scheduled review
     */
    nextReview: Date;
}
/**
 * A flashcard for learning
 *
 * Flashcards are linked to mindmap nodes via stable nodeId.
 * This allows the flashcard to reference the source material.
 */
export interface Flashcard {
    /** Unique identifier for the flashcard */
    id: string;
    /**
     * Reference to the mindmap node this flashcard is based on
     * Uses stable nodeId that never changes
     */
    nodeId: string;
    /** Question or prompt */
    question: string;
    /** Answer or response */
    answer: string;
    /** Optional SRS metadata for spaced repetition */
    srs?: SRSMetadata;
}
//# sourceMappingURL=learning.d.ts.map