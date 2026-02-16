# Task 008: Skill Progress Tracking System

**Status**: 📝 PENDING APPROVAL  
**Owner**: AI Agent  
**Created**: 2026-02-15  
**Dependencies**: Task 001 (Domain Models), Task 002 (CMS Collections), Task 006 (Flashcard System)

---

## Type
**Feature** - Learning enhancement

---

## Goal

Enable users to track their learning progress for each skill node with status indicators (not-started, in-progress, completed) and mastery percentage calculated from flashcard performance.

**User-facing outcome**: Users can see visual progress indicators on skill nodes, filter by status, and track overall mastery percentage per skill.

---

## Background

The current mindmap system allows users to create skill trees and flashcards, but lacks:
1. **Status tracking** - No way to mark skills as started, in-progress, or completed
2. **Mastery visibility** - No visual indicator of how well a skill is learned
3. **Progress filtering** - Can't filter/sort skills by completion status
4. **Motivation** - No visual feedback on learning progress

This task adds skill-specific metadata to track learning progress and calculate mastery from flashcard performance.

---

## Non-Goals

**Explicitly OUT of scope**:
- ❌ Time tracking per skill (separate task)
- ❌ Learning path recommendations (separate task)
- ❌ Project-skill mapping (separate task)
- ❌ Skill decay warnings (separate task)
- ❌ Gamification (badges, points, leaderboards)
- ❌ AI-powered mastery calculation (use simple flashcard-based formula)
- ❌ Mobile app or notifications
- ❌ Collaborative features
- ❌ Refactoring existing mindmap or flashcard code

---

## Scope (Allowed Areas)

### New Files (to be created):
**Domain Types**:
- `packages/domain/src/types/skill.ts`

**Utilities**:
- `packages/domain/src/utils/mastery.ts`

**Frontend Components**:
- `apps/mindmap-web/components/SkillStatusBadge.tsx`
- `apps/mindmap-web/components/MasteryProgressBar.tsx`
- `apps/mindmap-web/components/SkillFilterPanel.tsx`

**API Client**:
- `apps/mindmap-web/lib/skill-api.ts`

### Modified Files (existing):
- `packages/domain/src/types/node.ts` (extend NodeContent interface)
- `packages/domain/src/index.ts` (export new types)
- `apps/mindmap-cms/src/collections/MindmapNodes.ts` (add skill fields)
- `packages/editor/src/components/MindmapNode.tsx` (add status badge)
- `apps/mindmap-web/app/mindmaps/[id]/page.tsx` (add filter panel)

**Any change outside this scope is a violation.**

---

## Acceptance Criteria (MANDATORY)

### AC1: Add skill status field to nodes
- [ ] **Given** a user creates or edits a mindmap node
  **When** they open the node editor
  **Then** they see a status dropdown with options: "Not Started", "In Progress", "Completed"

### AC2: Calculate mastery percentage from flashcard performance
- [ ] **Given** a skill node has flashcards with SRS metadata
  **When** the system calculates mastery
  **Then** mastery = (average ease factor - 1.3) / (2.5 - 1.3) * 100, clamped to 0-100%

### AC3: Display status badge on nodes
- [ ] **Given** a skill node has a status set
  **When** the user views the mindmap
  **Then** the node displays a colored badge: ⬜ (not-started), 🔄 (in-progress), ✅ (completed)

### AC4: Display mastery progress bar
- [ ] **Given** a skill node has flashcards
  **When** the user hovers over or selects the node
  **Then** a progress bar shows mastery percentage (0-100%)

### AC5: Filter skills by status
- [ ] **Given** a user is viewing a mindmap
  **When** they open the filter panel and select a status
  **Then** only nodes with that status are highlighted/shown

### AC6: Auto-update status based on mastery
- [ ] **Given** a skill node reaches 80% mastery
  **When** the system recalculates mastery
  **Then** status auto-updates to "Completed" (if not already set)

---

## UX Rules

**Keyboard shortcuts**:
- `Ctrl+Shift+S` - Toggle skill filter panel
- `S` - Cycle status (not-started → in-progress → completed) for selected node

**Visual constraints**:
- Status badges: 16x16px, positioned top-right of node
- Progress bar: 100px wide, 4px tall, positioned below node text
- Color scheme:
  - Not Started: Gray (#9CA3AF)
  - In Progress: Blue (#3B82F6)
  - Completed: Green (#10B981)
- Mastery bar: Gradient from red (0%) → yellow (50%) → green (100%)

**Focus behavior**:
- Filter panel opens as slide-in from right
- Selecting a filter highlights matching nodes
- Esc closes filter panel

---

## Data / Schema Impact

**New domain type** (`packages/domain/src/types/skill.ts`):
```typescript
export type SkillStatus = 'not-started' | 'in-progress' | 'completed'

export interface SkillMetadata {
  status: SkillStatus
  masteryPercentage: number  // 0-100, calculated from flashcards
  lastPracticed?: Date       // Auto-updated when flashcards reviewed
}
```

**Extended NodeContent** (`packages/domain/src/types/node.ts`):
```typescript
export interface NodeContent {
  text?: string
  richText?: string
  skill?: SkillMetadata  // Optional: only for skill nodes
  [key: string]: unknown
}
```

**CMS Collection changes** (`apps/mindmap-cms/src/collections/MindmapNodes.ts`):
- Add `skill` group field with `status`, `masteryPercentage`, `lastPracticed`

---

## Payload Impact

**Collections affected**:
- `mindmap-nodes` - Add skill metadata fields

**Read/Write behavior**:
- Read: Fetch skill metadata with node data
- Write: Update status manually, mastery auto-calculated

**Versioning impact**: None (skill metadata is not versioned)

**Permissions**: Inherit from parent mindmap (no change)

---

## Test Requirements

**Unit tests**:
- `packages/domain/src/utils/mastery.test.ts` - Test mastery calculation algorithm
- `packages/domain/src/types/__tests__/skill.test.ts` - Test skill types

**Integration tests**:
- Test status update via API
- Test mastery calculation when flashcards change
- Test filter functionality

**E2E (Playwright)**:
- `tests/e2e/skill-progress.spec.ts`:
  - Create node → set status → verify badge appears
  - Create flashcards → verify mastery updates
  - Use filter panel → verify nodes filtered correctly
  - Keyboard shortcuts work (Ctrl+Shift+S, S key)

---

## Constraints

- Must follow `docs/CONTEXT.md`
- No refactor outside scope
- Keep PR small and focused (≤ 5 files changed, ≤ 200 LOC)
- No breaking changes to existing node structure
- Skill metadata is optional (backward compatible)

---

## Definition of Done

- [ ] Acceptance Criteria satisfied
- [ ] Tests added and passing (`npm run test`)
- [ ] E2E tests passing (`npm run test:e2e`)
- [ ] No scope violation
- [ ] Manual UX check completed
- [ ] Documentation updated (if needed)
- [ ] PR checklist completed

