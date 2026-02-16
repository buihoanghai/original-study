# Task 011: Skill Decay Tracking System

**Status**: 📝 PENDING APPROVAL  
**Owner**: AI Agent  
**Created**: 2026-02-15  
**Dependencies**: Task 006 (Flashcard System), Task 008 (Skill Progress Tracking)

---

## Type
**Feature** - Learning enhancement

---

## Goal

Implement a skill decay tracking system that warns users when skills haven't been practiced recently and recommends review intervals based on skill complexity and last practice date.

**User-facing outcome**: Users see decay warnings ("Haven't practiced React in 3 months"), recommended review dates, and integration with flashcard SRS for skill-level retention.

---

## Background

The current flashcard system tracks individual card reviews with SRS, but lacks:
1. **Skill-level decay** - No tracking of when a skill as a whole was last practiced
2. **Decay warnings** - No alerts when skills become stale
3. **Review recommendations** - No suggested intervals for skill review
4. **Retention visualization** - Can't see which skills are at risk of being forgotten

This task adds skill-level decay tracking to complement the existing flashcard SRS system.

---

## Non-Goals

**Explicitly OUT of scope**:
- ❌ AI/ML-based decay prediction
- ❌ Personalized forgetting curves
- ❌ Automatic skill downgrading (status changes)
- ❌ Email/push notifications
- ❌ Complex decay algorithms (use simple time-based rules)
- ❌ Integration with external learning platforms
- ❌ Skill difficulty estimation
- ❌ Refactoring existing SRS logic

---

## Scope (Allowed Areas)

### New Files (to be created):
**Domain Types**:
- `packages/domain/src/types/decay.ts`

**Utilities**:
- `packages/domain/src/utils/decay-calculator.ts`

**Frontend Components**:
- `apps/mindmap-web/components/DecayWarningBadge.tsx`
- `apps/mindmap-web/components/ReviewSchedulePanel.tsx`
- `apps/mindmap-web/components/SkillRetentionChart.tsx`

**API Client**:
- `apps/mindmap-web/lib/decay-api.ts`

### Modified Files (existing):
- `packages/domain/src/types/skill.ts` (add decay fields)
- `packages/domain/src/index.ts` (export new types)
- `packages/editor/src/components/MindmapNode.tsx` (add decay warning badge)
- `apps/mindmap-web/app/mindmaps/[id]/page.tsx` (add review schedule panel)

**Any change outside this scope is a violation.**

---

## Acceptance Criteria (MANDATORY)

### AC1: Track last practice date per skill
- [ ] **Given** a user reviews flashcards or completes a learning session for a skill
  **When** the activity is recorded
  **Then** the skill's `lastPracticed` date is updated to now

### AC2: Calculate decay status based on time elapsed
- [ ] **Given** a skill has a `lastPracticed` date
  **When** the system calculates decay status
  **Then** status is: Fresh (<7 days), Aging (7-30 days), Stale (30-90 days), Forgotten (>90 days)

### AC3: Display decay warning badge
- [ ] **Given** a skill has decay status "Stale" or "Forgotten"
  **When** the user views the mindmap
  **Then** the node shows a warning badge (⚠️ for Stale, 🔴 for Forgotten)

### AC4: Show recommended review interval
- [ ] **Given** a skill has a complexity level (Junior/Mid/Senior)
  **When** the user views the skill details
  **Then** recommended review interval is shown: Junior (2 weeks), Mid (1 month), Senior (3 months)

### AC5: List skills needing review
- [ ] **Given** a user opens the review schedule panel
  **When** the panel loads
  **Then** skills are grouped by decay status with counts: Fresh (X), Aging (Y), Stale (Z), Forgotten (W)

### AC6: Integrate with flashcard SRS
- [ ] **Given** a skill has flashcards with SRS metadata
  **When** calculating skill decay
  **Then** average flashcard interval is factored into decay calculation

---

## UX Rules

**Keyboard shortcuts**:
- `Ctrl+Shift+R` - Toggle review schedule panel
- `R` - Mark selected skill as "reviewed today" (updates lastPracticed)

**Visual constraints**:
- Decay badges: 16x16px, positioned top-left of node
- Badge colors:
  - Fresh: Green 🟢
  - Aging: Yellow 🟡
  - Stale: Orange ⚠️
  - Forgotten: Red 🔴
- Review schedule panel: Slide-in from right, 400px wide

**Focus behavior**:
- Clicking a skill in review schedule selects it in graph
- Esc closes review schedule panel
- Decay warnings are non-intrusive (no popups)

---

## Data / Schema Impact

**New domain type** (`packages/domain/src/types/decay.ts`):
```typescript
export type DecayStatus = 'fresh' | 'aging' | 'stale' | 'forgotten'

export interface SkillDecayMetadata {
  lastPracticed: Date
  decayStatus: DecayStatus
  recommendedReviewDate: Date
  daysSinceLastPractice: number
}

export interface DecayConfig {
  freshThreshold: number    // days (default: 7)
  agingThreshold: number    // days (default: 30)
  staleThreshold: number    // days (default: 90)
  reviewIntervals: {
    junior: number   // days (default: 14)
    mid: number      // days (default: 30)
    senior: number   // days (default: 90)
  }
}
```

**Extended SkillMetadata** (`packages/domain/src/types/skill.ts`):
```typescript
export interface SkillMetadata {
  status: SkillStatus
  masteryPercentage: number
  lastPracticed?: Date
  time?: SkillTimeMetadata
  decay?: SkillDecayMetadata  // New field
  skillLevel?: 'Junior' | 'Mid' | 'Senior'  // For review interval
}
```

---

## Payload Impact

**Collections affected**:
- `mindmap-nodes` - Add decay metadata fields

**Read/Write behavior**:
- Read: Fetch decay metadata with node data
- Write: Update lastPracticed when flashcards reviewed or sessions completed
- Calculate: Decay status computed on read (not stored)

**Versioning impact**: None (decay metadata is not versioned)

**Permissions**: Inherit from parent mindmap (no change)

---

## Test Requirements

**Unit tests**:
- `packages/domain/src/utils/decay-calculator.test.ts` - Test decay calculation
- Test decay status transitions (fresh → aging → stale → forgotten)
- Test recommended review date calculation
- Test integration with flashcard SRS intervals

**Integration tests**:
- Test lastPracticed update when flashcards reviewed
- Test decay status calculation
- Test review schedule generation

**E2E (Playwright)**:
- `tests/e2e/skill-decay.spec.ts`:
  - Create skill → wait (mock time) → verify decay badge appears
  - Review flashcard → verify lastPracticed updates
  - Open review schedule → verify skills grouped by decay status
  - Press R key → verify skill marked as reviewed
  - Keyboard shortcuts work (Ctrl+Shift+R, R)

---

## Constraints

- Must follow `docs/CONTEXT.md`
- No refactor outside scope
- Keep PR small and focused (≤ 5 files changed, ≤ 200 LOC)
- No breaking changes to existing skill structure
- Decay tracking is optional (backward compatible)
- Decay calculation must be efficient (no N+1 queries)
- Use simple time-based rules (no complex ML)

---

## Definition of Done

- [ ] Acceptance Criteria satisfied
- [ ] Tests added and passing (`npm run test`)
- [ ] E2E tests passing (`npm run test:e2e`)
- [ ] No scope violation
- [ ] Manual UX check completed
- [ ] Documentation updated (if needed)
- [ ] PR checklist completed

