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
export type { MindmapNode, NodeContent, NodePosition, NodeMetadata, ContentSection, ContentData, TextContent, ListContent, CodeContent, TableContent, VideoContent, QuizContent, DiagramContent, CustomContent, } from './types/node';
export type { MindmapTree, NodeEdge, EdgeType } from './types/tree';
export type { Flashcard, SRSMetadata } from './types/learning';
export type { LearningSession, SessionType, SessionStatus, } from './types/learning-session';
export type { NodeMastery, MasteryLevel } from './types/mastery';
export type { WeeklyTarget, DailyPlan } from './types/schedule';
export type { Comment, ModerationStatus } from './types/community';
export type { SkillStatus, SkillMetadata } from './types/skill';
export { calculateMastery, shouldAutoComplete } from './utils/mastery';
//# sourceMappingURL=index.d.ts.map