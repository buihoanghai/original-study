# Task Contract: Create Payload CMS Collections

## Type
Feature

---

## Goal
Define Payload CMS collections using domain types from `@mindmap/domain` to enable content storage and management for mindmaps, nodes, flashcards, and comments.

---

## Background
Task 001 established the domain types. Now we need to create Payload CMS collections that use these types to store and manage content. The CMS is the "content brain" (per `docs/CONTEXT.md`) and must respect the stable `nodeId` requirement.

Per project rules:
- Payload CMS is a content system, NOT editor logic
- `nodeId` must be stable (never change)
- No auto-sync per keystroke
- Respect versioning and permissions

---

## Non-Goals
- ❌ No editor implementation or UI components
- ❌ No sync logic (that's Task 003)
- ❌ No frontend integration yet
- ❌ No custom endpoints (basic CRUD only)
- ❌ No realtime features
- ❌ No auto-sync hooks

---

## Scope (Allowed Areas)
Files allowed to change:
- `apps/mindmap-cms/src/collections/Mindmaps.ts` (new)
- `apps/mindmap-cms/src/collections/MindmapNodes.ts` (new)
- `apps/mindmap-cms/src/collections/Flashcards.ts` (new)
- `apps/mindmap-cms/src/collections/Comments.ts` (new)
- `apps/mindmap-cms/src/collections/index.ts` (new)
- `apps/mindmap-cms/src/payload.config.ts` (update to add collections)
- `apps/mindmap-cms/src/hooks/` (new directory for hooks)
  - `apps/mindmap-cms/src/hooks/ensureStableNodeId.ts` (new)
- `apps/mindmap-cms/package.json` (if dependencies needed)

Any change outside this scope is a violation.

---

## Acceptance Criteria (MANDATORY)

### AC1: Mindmaps Collection
- [ ] **Given** a Payload CMS instance
      **When** the Mindmaps collection is accessed
      **Then** it must have fields matching the `Mindmap` domain type
      **And** it must support draft/published/archived status
      **And** it must have versioning enabled
      **And** it must have access control by owner

### AC2: MindmapNodes Collection with Stable nodeId
- [ ] **Given** a MindmapNode is created in CMS
      **When** the node is saved
      **Then** it must have a `nodeId` field that is auto-generated on creation
      **And** the `nodeId` must never change after creation (enforced by hook)
      **And** it must have content, position, and metadata fields
      **And** it must reference a parent Mindmap

### AC3: Flashcards Collection
- [ ] **Given** a Flashcard is created
      **When** it references a node
      **Then** it must use the stable `nodeId` for the reference
      **And** it must have question, answer fields
      **And** it must have optional SRS metadata fields
      **And** it must have relationship to MindmapNodes collection

### AC4: Comments Collection
- [ ] **Given** a Comment is created
      **When** it references a node
      **Then** it must use the stable `nodeId` for the reference
      **And** it must have content, author, status fields
      **And** it must support moderation status (pending/approved/rejected)
      **And** it must have relationship to MindmapNodes collection

### AC5: NodeId Stability Hook
- [ ] **Given** a MindmapNode exists with a nodeId
      **When** an update is attempted
      **Then** a beforeChange hook must prevent nodeId modification
      **And** it must throw an error if nodeId is changed
      **And** it must allow all other fields to be updated

### AC6: Collections Registered
- [ ] **Given** the Payload config
      **When** the CMS starts
      **Then** all 4 new collections must be registered
      **And** they must be accessible via REST API
      **And** they must be accessible via GraphQL
      **And** they must appear in the admin panel

### AC7: Type Safety
- [ ] **Given** the CMS collections
      **When** TypeScript types are generated
      **Then** payload-types.ts must include all collection types
      **And** types must align with domain types from `@mindmap/domain`
      **And** no TypeScript errors in collection definitions

---

## UX Rules
- N/A (backend only, no UI changes)
- Hotkeys involved: None
- Focus behavior: None
- Visual constraints: None

---

## Data / Schema Impact

### New Collections:

**1. Mindmaps**
- Fields: id, title, description, status, ownerId, created, updated
- Versioning: Enabled
- Access: Owner-based

**2. MindmapNodes**
- Fields: nodeId (stable!), mindmapId, content (text, richText), position (x, y), metadata
- Hooks: beforeChange (prevent nodeId modification)
- Relationships: belongsTo Mindmap

**3. Flashcards**
- Fields: id, nodeId (reference), question, answer, srs (interval, ease, nextReview)
- Relationships: references MindmapNodes via nodeId

**4. Comments**
- Fields: id, nodeId (reference), content, author, status, created, updated
- Relationships: references MindmapNodes via nodeId

---

## Payload Impact

### Collections Affected:
- **New**: Mindmaps, MindmapNodes, Flashcards, Comments

### Read / Write Behavior:
- REST API: `/api/mindmaps`, `/api/mindmap-nodes`, `/api/flashcards`, `/api/comments`
- GraphQL: All collections queryable

### Versioning Impact:
- Mindmaps: Versioning enabled (draft/publish workflow)
- MindmapNodes: No versioning (content versioning handled at Mindmap level)
- Flashcards: No versioning
- Comments: No versioning

### Permissions:
- Mindmaps: Owner can CRUD their own
- MindmapNodes: Inherit from parent Mindmap
- Flashcards: User can CRUD their own
- Comments: User can create, moderators can approve/reject

---

## Test Requirements

### Unit tests:
- `apps/mindmap-cms/src/collections/__tests__/Mindmaps.test.ts`
  - Validate collection config structure
  - Test field definitions
  
- `apps/mindmap-cms/src/collections/__tests__/MindmapNodes.test.ts`
  - Validate nodeId field is required
  - Test collection structure
  
- `apps/mindmap-cms/src/hooks/__tests__/ensureStableNodeId.test.ts`
  - Test nodeId cannot be changed
  - Test error is thrown on modification attempt
  - Test other fields can be updated

### Integration tests:
- `apps/mindmap-cms/tests/int/collections.int.spec.ts`
  - Create mindmap via API
  - Create node with auto-generated nodeId
  - Attempt to change nodeId (should fail)
  - Create flashcard referencing node
  - Create comment referencing node
  - Verify relationships work

### E2E (Playwright):
- None (admin panel testing not required for MVP)

---

## Constraints
- Must follow `docs/CONTEXT.md` architecture
- No refactor outside scope
- Keep PR small and focused
- Collections must use domain types from `@mindmap/domain`
- Must enforce nodeId stability via hooks
- No editor logic in CMS
- No auto-sync hooks

---

## Definition of Done
- [ ] Acceptance Criteria satisfied
- [ ] Unit tests added and passing
- [ ] Integration tests added and passing
- [ ] Type checking passes (`npm run typecheck`)
- [ ] No scope violation
- [ ] All collections registered in payload.config.ts
- [ ] payload-types.ts generated successfully
- [ ] No linting errors
- [ ] Code formatted
- [ ] CMS starts without errors
- [ ] Collections accessible via REST API

