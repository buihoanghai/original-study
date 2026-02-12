/**
 * Community Domain Types
 *
 * These types support community features like comments and moderation.
 */
/**
 * Moderation status for user-generated content
 */
export type ModerationStatus = 'pending' | 'approved' | 'rejected';
/**
 * A comment on a mindmap node
 *
 * Comments are linked to mindmap nodes via stable nodeId.
 * This allows users to discuss specific parts of a mindmap.
 */
export interface Comment {
    /** Unique identifier for the comment */
    id: string;
    /**
     * Reference to the mindmap node this comment is about
     * Uses stable nodeId that never changes
     */
    nodeId: string;
    /** Comment content/text */
    content: string;
    /** ID of the user who wrote the comment */
    author: string;
    /** Moderation status of the comment */
    status: ModerationStatus;
    /** Optional timestamp when comment was created */
    created?: Date;
    /** Optional timestamp when comment was last updated */
    updated?: Date;
}
//# sourceMappingURL=community.d.ts.map