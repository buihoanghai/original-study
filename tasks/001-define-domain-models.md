# Task Contract: Define Core Domain Models

## Type

Feature

---

## Goal

Establish TypeScript domain models for mindmap data structures in `@mindmap/domain` package to serve as the single source of truth for data contracts across the editor, CMS, and sync layers.

---

## Background

The application currently has empty placeholder packages. Before implementing the CMS schema or editor logic, we need to define the core domain models that will be shared across all bounded contexts. This ensures type safety and prevents domain leakage between Editor Core, Content, Learning, Community, and Sync domains.

Per `docs/CONTEXT.md`:

- Architecture: Modular Monolith
- Payload CMS is a content brain, NOT editor logic
- Domains must not leak responsibilities

---

## Non-Goals

- ❌ No CMS collection schemas (that's a separate task)
- ❌ No editor implementation or UI components
- ❌ No React Flow integration
- ❌ No API endpoints or hooks
- ❌ No database migrations
- ❌ No sync logic implementation
- ❌ No validation logic (only type definitions)

---

## Scope (Allowed Areas)

Files allowed to change:

- `packages/domain/src/index.ts` (export types)
- `packages/domain/src/types/` (new directory)
  - `packages/domain/src/types/mindmap.ts` (new)
  - `packages/domain/src/types/node.ts` (new)
  - `packages/domain/src/types/learning.ts` (new)
  - `packages/domain/src/types/community.ts` (new)
  - `packages/domain/src/types/common.ts` (new)

Any change outside this scope is a violation.

---

## Acceptance Criteria (MANDATORY)

### AC1: Core Mindmap Types

- [ ] **Given** a developer imports `@mindmap/domain`
      **When** they access mindmap types
      **Then** `Mindmap`, `MindmapMetadata`, `MindmapStatus` types are available

### AC2: Node Types with Stable ID

- [ ] **Given** a mindmap node is created
      **When** the node structure is defined
      **Then** it must have a `nodeId` field of type `string` (stable, immutable identifier)
      **And** it must have `content`, `position`, `metadata` fields

### AC3: Node Content Types

- [ ] **Given** a node needs to store content
      **When** content types are defined
      **Then** `NodeContent` type supports text, rich text, and metadata
      **And** content is separate from tree structure

### AC4: Tree Structure Types

- [ ] **Given** nodes form a tree hierarchy
      **When** tree structure is defined
      **Then** `MindmapTree` type includes nodes and edges
      **And** parent-child relationships are explicit

### AC5: Learning Domain Types

- [ ] **Given** flashcard functionality is needed
      **When** learning types are defined
      **Then** `Flashcard`, `SRSMetadata` types are available
      **And** they reference nodes via `nodeId`

### AC6: Community Domain Types

- [ ] **Given** comments and moderation are needed
      **When** community types are defined
      **Then** `Comment`, `ModerationStatus` types are available
      **And** they reference nodes via `nodeId`

### AC7: Type Exports

- [ ] **Given** other packages need domain types
      **When** they import from `@mindmap/domain`
      **Then** all types are properly exported from `index.ts`

---

## UX Rules

- N/A (no UI in this task)
- Hotkeys involved: None
- Focus behavior: None
- Visual constraints: None

---

## Data / Schema Impact

**New type definitions** (no database changes yet):

### Mindmap Types

- `Mindmap` - Main mindmap document
- `MindmapMetadata` - Title, description, owner, timestamps
- `MindmapStatus` - 'draft' | 'published' | 'archived'

### Node Types

- `MindmapNode` - Individual node with stable `nodeId`
- `NodeContent` - Rich content (text, formatting, attachments)
- `NodePosition` - Canvas position (x, y)
- `NodeMetadata` - Created, updated, author

### Tree Types

- `MindmapTree` - Complete tree structure
- `NodeEdge` - Parent-child or reference relationships
- `EdgeType` - 'parent-child' | 'reference'

### Learning Types

- `Flashcard` - Question/answer pairs
- `SRSMetadata` - Spaced repetition data (interval, ease, next review)

### Community Types

- `Comment` - User comments on nodes
- `ModerationStatus` - 'pending' | 'approved' | 'rejected'

---

## Payload Impact

- None (types only, no CMS collections yet)
- These types will inform future CMS schema design

---

## Test Requirements

### Unit tests:

- `packages/domain/src/types/__tests__/mindmap.test.ts`
  - Type validation tests
  - Ensure nodeId is required and string type
  - Ensure all required fields are present
- `packages/domain/src/types/__tests__/node.test.ts`
  - Node structure validation
  - Content type validation
- `packages/domain/src/types/__tests__/learning.test.ts`
  - Flashcard type validation
  - SRS metadata structure
- `packages/domain/src/types/__tests__/community.test.ts`
  - Comment type validation
  - Moderation status enum

### Integration tests:

- None (pure types)

### E2E (Playwright):

- None (no UI)

---

## Constraints

- Must follow `docs/CONTEXT.md` architecture
- No refactor outside scope
- Keep PR small and focused
- Types must be framework-agnostic (no React, no Payload-specific types)
- Use TypeScript strict mode
- No `any` types unless absolutely justified
- All types must be exported

---

## Definition of Done

- [ ] Acceptance Criteria satisfied
- [ ] Unit tests added and passing (`npm test`)
- [ ] Type checking passes (`npm run typecheck`)
- [ ] No scope violation
- [ ] All types exported from `packages/domain/src/index.ts`
- [ ] Documentation comments (JSDoc) on all public types
- [ ] No linting errors (`npm run lint`)
- [ ] Code formatted (`npm run format`)
