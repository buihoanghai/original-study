# Task Contract: Implement Sync Package

## Type
Feature

---

## Goal
Implement explicit synchronization between the local editor and Payload CMS, enabling users to save their mindmap changes to the server and load mindmaps from the server.

---

## Background
Tasks 001 and 002 established domain types and CMS collections. Now we need to implement the sync layer that allows the editor to communicate with the CMS.

Per project rules (`docs/CONTEXT.md`):
- **Local-first editor** - Editor works offline, syncs explicitly
- **No auto-sync** - No per-keystroke syncing
- **Explicit sync** - User triggers save/load operations
- **Sync domain** - Bounded context for editor ↔ CMS sync

---

## Non-Goals
- ❌ No auto-sync or realtime collaboration
- ❌ No per-keystroke syncing
- ❌ No conflict resolution UI (manual merge for MVP)
- ❌ No offline queue (simple fail/retry for MVP)
- ❌ No optimistic updates
- ❌ No editor implementation (that's Task 004)

---

## Scope (Allowed Areas)
Files allowed to change:
- `packages/sync/src/types.ts` (new)
- `packages/sync/src/client.ts` (new)
- `packages/sync/src/operations.ts` (new)
- `packages/sync/src/index.ts` (update exports)
- `packages/sync/src/__tests__/` (new directory for tests)
- `packages/sync/package.json` (add dependencies)
- `packages/sync/tsconfig.json` (if needed)

Any change outside this scope is a violation.

---

## Acceptance Criteria (MANDATORY)

### AC1: Sync Client
- [ ] **Given** a sync client is initialized with CMS URL
      **When** the client is created
      **Then** it must provide methods: saveMindmap, loadMindmap, saveNodes, loadNodes
      **And** it must use fetch API to communicate with CMS REST API

### AC2: Save Mindmap
- [ ] **Given** a mindmap with metadata
      **When** saveMindmap is called
      **Then** it must POST to `/api/mindmaps` if new
      **Or** PATCH to `/api/mindmaps/:id` if existing
      **And** it must return the saved mindmap with CMS ID

### AC3: Load Mindmap
- [ ] **Given** a mindmap ID
      **When** loadMindmap is called
      **Then** it must GET from `/api/mindmaps/:id`
      **And** it must return the mindmap metadata

### AC4: Save Nodes
- [ ] **Given** an array of nodes with stable nodeIds
      **When** saveNodes is called
      **Then** it must POST/PATCH to `/api/mindmap-nodes` for each node
      **And** it must preserve stable nodeIds
      **And** it must handle batch operations

### AC5: Load Nodes
- [ ] **Given** a mindmap ID
      **When** loadNodes is called
      **Then** it must GET from `/api/mindmap-nodes?where[mindmap][equals]=:id`
      **And** it must return all nodes for that mindmap

### AC6: Error Handling
- [ ] **Given** a network error occurs
      **When** any sync operation is called
      **Then** it must throw a descriptive error
      **And** it must not corrupt local state

### AC7: Type Safety
- [ ] **Given** the sync package
      **When** imported by other packages
      **Then** all operations must use domain types from `@mindmap/domain`
      **And** TypeScript compilation must pass

---

## UX Rules
- N/A (backend package, no UI)
- Hotkeys involved: None
- Focus behavior: None

---

## Data / Schema Impact

### Sync Operations:

**1. Save Mindmap**
- Input: `Mindmap` (from domain)
- Output: `Mindmap` with CMS ID
- API: `POST /api/mindmaps` or `PATCH /api/mindmaps/:id`

**2. Load Mindmap**
- Input: mindmap ID (string)
- Output: `Mindmap`
- API: `GET /api/mindmaps/:id`

**3. Save Nodes**
- Input: `MindmapNode[]` (from domain)
- Output: `MindmapNode[]` with CMS IDs
- API: `POST /api/mindmap-nodes` (batch)

**4. Load Nodes**
- Input: mindmap ID (string)
- Output: `MindmapNode[]`
- API: `GET /api/mindmap-nodes?where[mindmap][equals]=:id`

---

## Payload Impact

### Collections Affected:
- **Read/Write**: Mindmaps, MindmapNodes

### API Endpoints Used:
- `POST /api/mindmaps`
- `GET /api/mindmaps/:id`
- `PATCH /api/mindmaps/:id`
- `POST /api/mindmap-nodes`
- `GET /api/mindmap-nodes`
- `PATCH /api/mindmap-nodes/:id`

---

## Test Requirements

### Unit tests:
- `packages/sync/src/__tests__/client.test.ts`
  - Test sync client initialization
  - Test API URL construction
  
- `packages/sync/src/__tests__/operations.test.ts`
  - Test saveMindmap (create and update)
  - Test loadMindmap
  - Test saveNodes (batch)
  - Test loadNodes
  - Test error handling

### Integration tests:
- Mock fetch API
- Test full sync flow (save → load)
- Test nodeId preservation

### E2E:
- None (editor integration in Task 004)

---

## Constraints
- Must use domain types from `@mindmap/domain`
- Must use fetch API (no axios or other HTTP clients)
- Must preserve stable nodeIds
- No auto-sync logic
- No realtime features
- Keep PR small and focused

---

## Definition of Done
- [ ] Acceptance Criteria satisfied
- [ ] Unit tests added and passing
- [ ] Type checking passes
- [ ] No scope violation
- [ ] All exports from `packages/sync/src/index.ts`
- [ ] No linting errors
- [ ] Code formatted
- [ ] Documentation comments added

