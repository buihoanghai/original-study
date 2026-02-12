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

// Core Mindmap Types
export type { Mindmap, MindmapMetadata, MindmapStatus } from './types/mindmap'

// Node Types
export type {
  MindmapNode,
  NodeContent,
  NodePosition,
  NodeMetadata,
} from './types/node'

// Tree Structure Types
export type { MindmapTree, NodeEdge, EdgeType } from './types/tree'

// Learning Domain Types
export type { Flashcard, SRSMetadata } from './types/learning'

// Community Domain Types
export type { Comment, ModerationStatus } from './types/community'
