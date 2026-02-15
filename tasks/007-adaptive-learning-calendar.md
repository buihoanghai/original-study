# Task 007: Adaptive Learning Calendar + Mastery System

**Status**: 📝 PENDING APPROVAL  
**Owner**: AI Agent  
**Created**: 2026-02-15  
**Dependencies**: Task 001 (Domain Models), Task 002 (CMS Collections), Task 006 (Flashcard System)

---

## Type
**Feature** - Major system evolution

---

## Goal

Transform the Mindmap project from a passive knowledge visualization tool into an **adaptive learning execution system** that automatically schedules learning sessions, tracks mastery per node, and delivers spaced repetition through an integrated calendar interface.

**User-facing outcome**: Users can see a weekly calendar of auto-generated learning sessions, complete sessions to build mastery, and receive daily flashcard reviews based on performance.

---

## Background

The current Mindmap system allows users to create knowledge structures and flashcards, but lacks:
1. **Execution engine** - No automatic scheduling of learning activities
2. **Mastery tracking** - No visibility into learning progress per node
3. **Adaptive reinforcement** - Flashcards exist but aren't integrated with learning sessions
4. **Behavioral system** - No streak tracking, daily habits, or performance-based scheduling

This task implements the **three-layer learning system**:
- **Mindmap** (Knowledge Structure) - What to learn
- **Calendar** (Execution Engine) - When to learn  
- **Flashcards** (Reinforcement) - How to retain

---

## Non-Goals

**Explicitly OUT of scope**:
- ❌ AI-powered flashcard generation (manual creation only for MVP)
- ❌ Complex ML-based adaptive algorithms (use fixed intervals first)
- ❌ Mobile app or notifications (web-only)
- ❌ Collaborative learning features
- ❌ Gamification (badges, leaderboards, etc.)
- ❌ Integration with external calendar systems (Google Calendar, etc.)
- ❌ Audio/video learning sessions
- ❌ Advanced analytics dashboard
- ❌ Multi-language support
- ❌ Refactoring existing mindmap or flashcard code

---

## Scope (Allowed Areas)

### New Files (to be created):
**Domain Types**:
- `packages/domain/src/types/learning-session.ts`
- `packages/domain/src/types/mastery.ts`
- `packages/domain/src/types/schedule.ts`

**CMS Collections**:
- `apps/mindmap-cms/src/collections/LearningSessions.ts`
- `apps/mindmap-cms/src/collections/NodeMastery.ts`

**Scheduler Package**:
- `packages/scheduler/package.json`
- `packages/scheduler/src/index.ts`
- `packages/scheduler/src/scheduler.ts`
- `packages/scheduler/src/mastery.ts`
- `packages/scheduler/tsconfig.json`

**API Client**:
- `apps/mindmap-web/lib/session-api.ts`
- `apps/mindmap-web/lib/mastery-api.ts`

**Frontend Components**:
- `apps/mindmap-web/components/CalendarView.tsx`
- `apps/mindmap-web/components/MasteryDashboard.tsx`
- `apps/mindmap-web/components/SessionExecutor.tsx`
- `apps/mindmap-web/components/StreakTracker.tsx`

**Pages**:
- `apps/mindmap-web/app/calendar/page.tsx`
- `apps/mindmap-web/app/mastery/page.tsx`

### Modified Files (existing):
- `packages/domain/src/index.ts` (export new types)
- `apps/mindmap-cms/src/payload.config.ts` (register new collections)
- `apps/mindmap-cms/src/collections/MindmapNodes.ts` (add afterChange hook)
- `apps/mindmap-web/app/layout.tsx` (add navigation links)

**Any change outside this scope is a violation.**

---

## Acceptance Criteria (MANDATORY)

### AC1: Auto-generate mastery record and initial session on node creation
- [ ] **Given** a user creates a new mindmap node
- [ ] **When** the node is saved to CMS
- [ ] **Then** a NodeMastery record is auto-created with level='new', confidence=0
- [ ] **And** a LearningSession is auto-scheduled for tomorrow with type='learn'
- [ ] **And** both records reference the stable nodeId

### AC2: Display weekly calendar view with scheduled sessions
- [ ] **Given** a user has scheduled learning sessions
- [ ] **When** they navigate to /calendar
- [ ] **Then** they see a weekly grid (Mon-Sun) with sessions displayed
- [ ] **And** sessions are color-coded by type (learn=blue, review=green, practice=yellow, application=purple)
- [ ] **And** completed sessions show checkmark, missed sessions show warning icon

### AC3: Complete a learning session and update mastery
- [ ] **Given** a user has a scheduled session for today
- [ ] **When** they click the session and mark it complete with performance score (0-100)
- [ ] **Then** the session status changes to 'completed'
- [ ] **And** the NodeMastery record updates: totalSessions++, successRate recalculated, confidence updated
- [ ] **And** mastery level upgrades if thresholds met (new→learning→familiar→mastered)
- [ ] **And** next review session is auto-scheduled based on mastery level

### AC4: View mastery dashboard per mindmap
- [ ] **Given** a user has completed multiple sessions across nodes
- [ ] **When** they navigate to /mastery
- [ ] **Then** they see a list of all nodes with mastery levels
- [ ] **And** nodes are grouped by mastery level (new, learning, familiar, mastered)
- [ ] **And** weak nodes (low confidence) are highlighted
- [ ] **And** clicking a node shows detailed stats (total sessions, success rate, last reviewed)

### AC5: Track daily streak
- [ ] **Given** a user completes at least one session per day
- [ ] **When** they view the calendar or mastery dashboard
- [ ] **Then** they see their current streak count (consecutive days with completed sessions)
- [ ] **And** streak resets to 0 if a day is missed (no completed sessions)

### AC6: Reschedule missed sessions
- [ ] **Given** a user has sessions scheduled for yesterday that were not completed
- [ ] **When** the system runs daily (or user refreshes calendar)
- [ ] **Then** missed sessions are marked as status='missed'
- [ ] **And** new sessions are auto-scheduled for today/tomorrow based on priority
- [ ] **And** weak nodes (low mastery) are prioritized over strong nodes

---

## UX Rules

### Hotkeys
- **Calendar View**:
  - `←/→` - Navigate weeks (previous/next)
  - `1-7` - Jump to day of week (Mon=1, Sun=7)
  - `Space` - Mark selected session as complete
  - `Esc` - Close session detail modal

- **Session Executor**:
  - `Space` - Start/pause timer
  - `Enter` - Submit completion with current performance score
  - `Esc` - Cancel and return to calendar

### Focus Behavior
- Calendar loads with current week in view
- Today's date is highlighted with border
- First incomplete session of the day is auto-selected
- After completing a session, focus moves to next incomplete session

### Visual Constraints
- **Session Colors** (consistent across all views):
  - Learn: `bg-blue-100 border-blue-500`
  - Review: `bg-green-100 border-green-500`
  - Practice: `bg-yellow-100 border-yellow-500`
  - Application: `bg-purple-100 border-purple-500`

- **Mastery Levels**:
  - New: Gray badge
  - Learning: Blue badge
  - Familiar: Green badge
  - Mastered: Gold badge

- **Status Icons**:
  - Scheduled: Clock icon
  - Completed: Checkmark (green)
  - Missed: Warning triangle (red)
  - Skipped: Dash (gray)

---

## Data / Schema Impact

### New Collections

#### 1. `learning-sessions`
```typescript
{
  sessionId: string (unique, indexed)
  nodeId: string (indexed, references MindmapNodes.nodeId)
  type: 'learn' | 'review' | 'practice' | 'application'
  scheduledDate: Date (indexed)
  completedDate?: Date
  status: 'scheduled' | 'completed' | 'skipped' | 'missed' (indexed)
  duration?: number (minutes)
  performance?: number (0-100 score)
  owner: relationship → users (indexed)
  createdAt: Date
  updatedAt: Date
}
```

**Indexes**:
- `owner + scheduledDate` (for calendar queries)
- `owner + status` (for filtering)
- `nodeId + owner` (for node-specific sessions)

#### 2. `node-mastery`
```typescript
{
  nodeId: string (indexed, references MindmapNodes.nodeId)
  level: 'new' | 'learning' | 'familiar' | 'mastered' (indexed)
  confidence: number (0-100)
  lastReviewed?: Date
  totalSessions: number
  successRate: number (0-100)
  nextReviewDate: Date (indexed)
  owner: relationship → users (indexed)
  createdAt: Date
  updatedAt: Date
}
```

**Indexes**:
- `owner + nodeId` (unique composite - one mastery record per user per node)
- `owner + level` (for grouping by mastery level)
- `owner + nextReviewDate` (for scheduling)

### Modified Collections

#### `mindmap-nodes`
- **Hook added**: `afterChange` hook to auto-create mastery + initial session
- **No schema changes**

---

## Payload Impact

### Collections Affected
- **New**: `learning-sessions`, `node-mastery`
- **Modified**: `mindmap-nodes` (hook only, no schema change)

### Read/Write Behavior
- **LearningSessions**:
  - Read: User can only read their own sessions (`owner: { equals: user.id }`)
  - Write: User can create/update/delete their own sessions
  - Bulk read: Calendar view queries by date range + owner

- **NodeMastery**:
  - Read: User can only read their own mastery records
  - Write: Auto-created by hook, updated by session completion
  - Unique constraint: One mastery record per (owner, nodeId) pair

### Versioning Impact
- **None** - New collections don't need versioning (transactional data)

### Permissions
- All new collections follow existing pattern: user-scoped access control
- No admin-only fields
- No public read access (all data is private to owner)

---

## Test Requirements

### Unit Tests

**Scheduler Package** (`packages/scheduler/src/__tests__/`):
- [ ] `scheduler.test.ts` - Test session scheduling logic
  - scheduleReviewSessions() generates correct intervals per mastery level
  - rescheduleMissedSessions() prioritizes weak nodes
  - respects daily limits and weekly targets

- [ ] `mastery.test.ts` - Test mastery calculation
  - updateMastery() correctly calculates confidence and success rate
  - mastery level upgrades at correct thresholds
  - nextReviewDate calculated correctly per level

**API Client** (`apps/mindmap-web/lib/__tests__/`):
- [ ] `session-api.test.ts` - Test CRUD operations
- [ ] `mastery-api.test.ts` - Test mastery queries

### Integration Tests

**CMS Hooks** (`apps/mindmap-cms/src/__tests__/integration/`):
- [ ] `node-creation-hook.test.ts`
  - Creating a node auto-creates mastery record
  - Creating a node auto-schedules first session
  - Hook respects user ownership

**API Endpoints** (`apps/mindmap-cms/src/__tests__/api/`):
- [ ] `learning-sessions.test.ts`
  - CRUD operations work correctly
  - Access control enforced (user can't read others' sessions)
  - Date range queries work

- [ ] `node-mastery.test.ts`
  - Mastery records are user-scoped
  - Unique constraint enforced (one per user+node)

### E2E Tests (Playwright)

**Calendar Flow** (`apps/mindmap-web/e2e/`):
- [ ] `calendar.spec.ts`
  - User can view weekly calendar
  - Sessions display with correct colors
  - User can complete a session
  - Streak counter updates
  - Navigation (prev/next week) works

**Mastery Flow**:
- [ ] `mastery.spec.ts`
  - User can view mastery dashboard
  - Nodes grouped by mastery level
  - Clicking node shows details
  - Weak nodes highlighted

**End-to-End Integration**:
- [ ] `learning-flow.spec.ts`
  - Create node → mastery auto-created → session auto-scheduled
  - Complete session → mastery updated → next session scheduled
  - Miss session → marked as missed → rescheduled

---

## Constraints

- **Must follow** `docs/CONTEXT.md` architecture (monorepo, Payload CMS, Next.js)
- **No refactoring** of existing mindmap or flashcard code
- **Keep PR focused** - This is a large feature, break into sub-PRs if needed:
  1. Domain types + CMS collections
  2. Scheduler package + hooks
  3. Frontend components + pages
- **Use existing patterns**:
  - Access control: Same as Flashcards collection
  - API client: Same pattern as `flashcard-api.ts`
  - Component structure: Follow existing conventions
- **Performance**: Index all query fields (owner, scheduledDate, status, nodeId)
- **Data integrity**: Use stable `nodeId` for all references (never CMS IDs)

---

## Definition of Done

- [ ] All Acceptance Criteria satisfied (AC1-AC6)
- [ ] All tests added and passing (unit + integration + E2E)
- [ ] No scope violations (only files in Scope section modified)
- [ ] Manual UX check completed:
  - [ ] Create node → verify mastery + session auto-created
  - [ ] View calendar → verify sessions display correctly
  - [ ] Complete session → verify mastery updates
  - [ ] Check streak → verify counter works
  - [ ] Miss session → verify rescheduling works
- [ ] Code follows existing patterns (access control, API client, components)
- [ ] TypeScript compiles with no errors
- [ ] `npm run doctor` passes (if available)
- [ ] PR description includes:
  - [ ] Screenshots of calendar view
  - [ ] Screenshots of mastery dashboard
  - [ ] Demo of session completion flow
  - [ ] Verification of auto-scheduling behavior

---

## Implementation Notes

### Mastery Level Thresholds
```typescript
// Upgrade logic
if (confidence >= 90 && totalSessions >= 10) → 'mastered'
else if (confidence >= 70 && totalSessions >= 5) → 'familiar'
else if (totalSessions >= 3) → 'learning'
else → 'new'
```

### Review Interval by Mastery Level
```typescript
// Fixed intervals for MVP (adaptive logic in future)
'new' → 1 day
'learning' → 3 days
'familiar' → 7 days
'mastered' → 30 days
```

### Confidence Calculation
```typescript
// Weighted average: recent performance matters more
confidence = (successRate * 0.7) + (lastPerformance * 0.3)
```

### Streak Calculation
```typescript
// Consecutive days with at least 1 completed session
// Resets to 0 if any day is missed
```

---

## Dependencies

**Upstream** (must be completed first):
- ✅ Task 001: Domain Models (completed)
- ✅ Task 002: CMS Collections (completed)
- ✅ Task 006: Flashcard System (completed)

**Downstream** (blocked by this task):
- None (this is a self-contained feature)

---

## Estimated Effort

- **Domain types + CMS collections**: 4 hours
- **Scheduler package**: 6 hours
- **Hooks + auto-scheduling**: 4 hours
- **API clients**: 3 hours
- **Frontend components**: 8 hours
- **Pages + routing**: 3 hours
- **Tests (unit + integration + E2E)**: 8 hours
- **Manual testing + bug fixes**: 4 hours

**Total**: ~40 hours (1 week full-time)

---

## Future Enhancements (Post-MVP)

These are **explicitly out of scope** for this task but documented for future reference:

1. **AI Flashcard Generation** - Auto-generate flashcards from node content
2. **Adaptive Scheduling** - ML-based interval adjustment based on performance patterns
3. **Energy-Based Suggestions** - Recommend sessions based on time of day / user energy
4. **Mobile App** - Native iOS/Android with push notifications
5. **Collaborative Learning** - Share sessions, compete with friends
6. **Advanced Analytics** - Learning velocity, retention curves, heatmaps
7. **Integration** - Sync with Google Calendar, Notion, etc.

---

**END OF TASK CONTRACT**

**Status**: 📝 PENDING HUMAN APPROVAL

**Next Steps**:
1. Human reviews this contract
2. Human approves or requests changes
3. AI writes BDD scenarios (if approved)
4. AI writes tests (failing)
5. AI implements code
6. Tests pass
7. PR submitted for review


