# Task 010: Time Tracking Per Skill

**Status**: 📝 PENDING APPROVAL  
**Owner**: AI Agent  
**Created**: 2026-02-15  
**Dependencies**: Task 001 (Domain Models), Task 008 (Skill Progress Tracking)

---

## Type
**Feature** - Learning enhancement

---

## Goal

Enable users to track time spent learning each skill with a built-in timer, time log history, and estimated vs actual time comparison.

**User-facing outcome**: Users can start/stop a timer for active learning sessions, see total time spent per skill, and compare estimated vs actual hours.

---

## Background

The current mindmap system tracks skill progress and flashcard reviews, but lacks:
1. **Time tracking** - No way to measure time spent on each skill
2. **Session history** - No log of learning sessions
3. **Estimation accuracy** - Can't compare estimated vs actual time
4. **Learning velocity** - No metrics on learning speed

This task adds time tracking functionality to help users understand their learning pace and improve time estimation.

---

## Non-Goals

**Explicitly OUT of scope**:
- ❌ Automatic time tracking (Pomodoro, idle detection)
- ❌ Calendar integration (Google Calendar, etc.)
- ❌ Team/collaborative time tracking
- ❌ Billing/invoicing features
- ❌ Advanced analytics dashboard
- ❌ Time tracking for non-skill nodes
- ❌ Mobile app or notifications
- ❌ Background timers (must be active session)
- ❌ Refactoring existing session logic

---

## Scope (Allowed Areas)

### New Files (to be created):
**Domain Types**:
- `packages/domain/src/types/time-tracking.ts`

**Utilities**:
- `packages/domain/src/utils/time-formatter.ts`

**CMS Collections**:
- `apps/mindmap-cms/src/collections/TimeEntries.ts`

**Frontend Components**:
- `apps/mindmap-web/components/SkillTimer.tsx`
- `apps/mindmap-web/components/TimeLogPanel.tsx`
- `apps/mindmap-web/components/TimeComparisonChart.tsx`

**API Client**:
- `apps/mindmap-web/lib/time-api.ts`

### Modified Files (existing):
- `packages/domain/src/types/skill.ts` (add time fields)
- `packages/domain/src/index.ts` (export new types)
- `apps/mindmap-cms/src/payload.config.ts` (register TimeEntries collection)
- `apps/mindmap-web/app/mindmaps/[id]/page.tsx` (add timer component)

**Any change outside this scope is a violation.**

---

## Acceptance Criteria (MANDATORY)

### AC1: Add estimated hours field to skill nodes
- [ ] **Given** a user creates or edits a skill node
  **When** they open the node editor
  **Then** they see an "Estimated Hours" input field (number, optional)

### AC2: Start/stop timer for active skill
- [ ] **Given** a user selects a skill node
  **When** they click "Start Timer" or press `T` key
  **Then** a timer starts counting up from 00:00:00

### AC3: Save time entry on timer stop
- [ ] **Given** a timer is running for a skill
  **When** the user clicks "Stop Timer" or presses `T` again
  **Then** a time entry is saved with nodeId, duration, startTime, endTime

### AC4: Display total actual hours per skill
- [ ] **Given** a skill has time entries
  **When** the user views the skill node
  **Then** the node shows "Actual: X.X hours" below the skill name

### AC5: Show estimated vs actual comparison
- [ ] **Given** a skill has both estimated and actual hours
  **When** the user hovers over the time display
  **Then** a tooltip shows "Estimated: X hrs | Actual: Y hrs | Diff: ±Z hrs"

### AC6: View time log history
- [ ] **Given** a user selects a skill node
  **When** they open the time log panel (Ctrl+Shift+T)
  **Then** they see a list of all time entries with date, duration, notes

---

## UX Rules

**Keyboard shortcuts**:
- `T` - Start/stop timer for selected node
- `Ctrl+Shift+T` - Toggle time log panel

**Visual constraints**:
- Timer display: MM:SS format while running, positioned top-right of canvas
- Active timer indicator: Pulsing red dot on node
- Time display on node: "X.X hrs" in small gray text below node name
- Time log panel: Slide-in from right, 400px wide

**Focus behavior**:
- Starting timer auto-focuses the node
- Stopping timer prompts for optional notes
- Only one timer can run at a time
- Timer persists across page refreshes (localStorage)

---

## Data / Schema Impact

**New domain type** (`packages/domain/src/types/time-tracking.ts`):
```typescript
export interface TimeEntry {
  id: string
  nodeId: string
  startTime: Date
  endTime: Date
  duration: number  // seconds
  notes?: string
  owner: string
}

export interface SkillTimeMetadata {
  estimatedHours: number
  actualHours: number  // Sum of all time entries
  lastSession?: Date
}
```

**Extended SkillMetadata** (`packages/domain/src/types/skill.ts`):
```typescript
export interface SkillMetadata {
  status: SkillStatus
  masteryPercentage: number
  lastPracticed?: Date
  time?: SkillTimeMetadata  // New field
}
```

**New CMS Collection** (`apps/mindmap-cms/src/collections/TimeEntries.ts`):
- Fields: nodeId, startTime, endTime, duration, notes, owner
- Access: User can only read/write their own entries

---

## Payload Impact

**Collections affected**:
- `mindmap-nodes` - Add time metadata fields
- `time-entries` - New collection

**Read/Write behavior**:
- Read: Fetch time entries by nodeId
- Write: Create time entry on timer stop
- Aggregate: Calculate total actual hours from entries

**Versioning impact**: None (time entries are not versioned)

**Permissions**: 
- TimeEntries: User can only access their own entries
- Inherit mindmap ownership for node access

---

## Test Requirements

**Unit tests**:
- `packages/domain/src/utils/time-formatter.test.ts` - Test time formatting
- Test time entry creation and aggregation
- Test estimated vs actual calculation

**Integration tests**:
- Test timer start/stop via API
- Test time entry creation
- Test actual hours calculation

**E2E (Playwright)**:
- `tests/e2e/time-tracking.spec.ts`:
  - Start timer → verify timer runs
  - Stop timer → verify time entry saved
  - Add estimated hours → verify comparison shown
  - Open time log → verify entries listed
  - Keyboard shortcuts work (T, Ctrl+Shift+T)
  - Timer persists across page refresh

---

## Constraints

- Must follow `docs/CONTEXT.md`
- No refactor outside scope
- Keep PR small and focused (≤ 5 files changed, ≤ 200 LOC)
- No breaking changes to existing skill structure
- Time tracking is optional (backward compatible)
- Timer must be client-side (no server polling)
- Handle browser close gracefully (save partial session)

---

## Definition of Done

- [ ] Acceptance Criteria satisfied
- [ ] Tests added and passing (`npm run test`)
- [ ] E2E tests passing (`npm run test:e2e`)
- [ ] No scope violation
- [ ] Manual UX check completed
- [ ] Documentation updated (if needed)
- [ ] PR checklist completed

