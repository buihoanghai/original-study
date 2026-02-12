/**
 * Node Types
 *
 * These types define the structure of individual nodes in a mindmap.
 *
 * CRITICAL: nodeId is a stable, immutable identifier that must never change
 * once a node is created. This is used for references across all domains.
 */
/**
 * Position of a node on the canvas
 */
export interface NodePosition {
    /** X coordinate */
    x: number;
    /** Y coordinate */
    y: number;
}
/**
 * Metadata for a node
 */
export interface NodeMetadata {
    /** Creation timestamp */
    created: Date;
    /** Last update timestamp */
    updated: Date;
    /** ID of the user who created this node */
    author: string;
}
/**
 * Content of a node
 *
 * Separated from tree structure to maintain clean separation of concerns.
 * Content is what the user sees and edits, while tree structure defines relationships.
 */
export interface NodeContent {
    /** Plain text content */
    text?: string;
    /** Rich text content (HTML or other format) */
    richText?: string;
    /** Additional metadata or attachments */
    [key: string]: unknown;
}
/**
 * A node in the mindmap
 *
 * CRITICAL: nodeId is STABLE and IMMUTABLE
 * - Once created, it must never change
 * - Used for references in flashcards, comments, edges, etc.
 * - Must be a string type for consistency
 */
export interface MindmapNode {
    /**
     * Stable, immutable identifier for this node
     *
     * ⚠️ WARNING: This ID must NEVER change after creation
     */
    nodeId: string;
    /** Content of the node (text, rich text, etc.) */
    content: NodeContent;
    /** Position on the canvas */
    position: NodePosition;
    /** Node metadata (timestamps, author) */
    metadata: NodeMetadata;
}
//# sourceMappingURL=node.d.ts.map