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

// Learning Session Types
export type {
  LearningSession,
  SessionType,
  SessionStatus,
} from './types/learning-session'

// Mastery Tracking Types
export type { NodeMastery, MasteryLevel } from './types/mastery'

// Schedule and Planning Types
export type { WeeklyTarget, DailyPlan } from './types/schedule'

// Community Domain Types
export type { Comment, ModerationStatus } from './types/community'

// Skill Progress Tracking Types
export type { SkillStatus, SkillMetadata } from './types/skill'

// Mastery Calculation Utilities
export { calculateMastery, shouldAutoComplete } from './utils/mastery'
