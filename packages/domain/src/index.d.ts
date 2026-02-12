/**
 * @mindmap/domain
 *
 * Shared types and contracts for the Mindmap Learning App.
 * This package contains domain models, interfaces, and type definitions
 * used across the monorepo.
 *
 * All types are framework-agnostic and can be used in any context
 * (web app, CMS, CLI tools, etc.).
 */
export type { Mindmap, MindmapMetadata, MindmapStatus } from './types/mindmap';
export type { MindmapNode, NodeContent, NodePosition, NodeMetadata, } from './types/node';
export type { MindmapTree, NodeEdge, EdgeType } from './types/tree';
export type { Flashcard, SRSMetadata } from './types/learning';
export type { Comment, ModerationStatus } from './types/community';
//# sourceMappingURL=index.d.ts.map