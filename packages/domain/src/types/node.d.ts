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
 * Generic Content Section Types
 *
 * Flexible schema for dynamic content sections instead of hardcoded fields.
 * Allows content creators to define custom sections with different types, colors, and ordering.
 */
/** Text content section */
export interface TextContent {
    type: 'text';
    text: string;
}
/** List content section */
export interface ListContent {
    type: 'list';
    items: string[];
    listStyle?: 'bullet' | 'numbered' | 'checklist';
}
/** Code examples section */
export interface CodeContent {
    type: 'code';
    examples: Array<{
        language: string;
        title?: string;
        code: string;
    }>;
}
/** Table content section */
export interface TableContent {
    type: 'table';
    headers: string[];
    rows: string[][];
}
/** Video content section */
export interface VideoContent {
    type: 'video';
    videos: Array<{
        url: string;
        title?: string;
        description?: string;
        duration?: string;
        platform?: 'youtube' | 'vimeo' | 'custom';
    }>;
}
/** Quiz content section */
export interface QuizContent {
    type: 'quiz';
    questions: Array<{
        id: string;
        question: string;
        options: string[];
        correctAnswer: number;
        explanation?: string;
    }>;
}
/** Diagram content section */
export interface DiagramContent {
    type: 'diagram';
    diagrams: Array<{
        title?: string;
        description?: string;
        mermaidCode?: string;
        imageUrl?: string;
        alt?: string;
    }>;
}
/** Custom/extensible content section */
export interface CustomContent {
    type: 'custom';
    data: unknown;
}
/** Union type for all content data types */
export type ContentData = TextContent | ListContent | CodeContent | TableContent | VideoContent | QuizContent | DiagramContent | CustomContent;
/** Generic content section */
export interface ContentSection {
    /** Unique identifier for this section */
    id: string;
    /** Content type determines how it's rendered */
    type: 'text' | 'list' | 'code' | 'table' | 'video' | 'quiz' | 'diagram' | 'custom';
    /** Display name (e.g., "Pitfalls", "Best Practices") */
    name: string;
    /** Emoji or icon (e.g., "⚠️", "✅") */
    icon?: string;
    /** Color theme (e.g., "red", "green", "blue", "purple", "gray") */
    color?: 'red' | 'green' | 'blue' | 'purple' | 'yellow' | 'orange' | 'gray';
    /** Display order (sections sorted by this value) */
    order: number;
    /** Whether section is expanded by default */
    defaultExpanded?: boolean;
    /** Actual content (type varies based on section type) */
    content: ContentData;
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
    /** Skill-specific metadata (optional, for skill nodes only) */
    skill?: {
        status: 'not-started' | 'in-progress' | 'completed';
        masteryPercentage: number;
        lastPracticed?: Date;
    };
    /** Display mode for detail panel */
    displayMode?: 'normal' | 'aggregate-children';
    /** Optional intro text when aggregating children */
    aggregateIntro?: string;
    /** Generic content sections (new flexible schema) */
    sections?: ContentSection[];
    /** Legacy fields (for backward compatibility) - will be deprecated */
    definition?: string;
    pitfalls?: string[];
    commonMistakes?: string[];
    bestPractices?: string[];
    realWorldUseCases?: string[];
    practiceTasks?: string[];
    assessment?: string;
    signalsOfMastery?: string[];
    codeExamples?: Array<{
        language: string;
        title?: string;
        code: string;
    }>;
    interviewQuestions?: string[];
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