# Task 008: Test Plan

**Test Plan for Skill Progress Tracking System**

---

## Test Strategy

### Test Pyramid
- **Unit Tests**: 60% - Domain logic, utilities, calculations
- **Integration Tests**: 30% - API, CMS collections, state management
- **E2E Tests**: 10% - User workflows, keyboard shortcuts, visual verification

### Coverage Goal
- **Minimum**: 80% code coverage
- **Target**: 90% code coverage for domain logic

---

## 1. Unit Tests

### 1.1 Domain Types (`packages/domain/src/types/__tests__/skill.test.ts`)

**Test Suite**: SkillMetadata Type
```typescript
describe('SkillMetadata', () => {
  it('should have valid status values')
  it('should have mastery percentage between 0-100')
  it('should have optional lastPracticed date')
  it('should be assignable to NodeContent')
})
```

**Estimated**: 4 tests, ~30 minutes

---

### 1.2 Mastery Calculation (`packages/domain/src/utils/__tests__/mastery.test.ts`)

**Test Suite**: calculateMastery()
```typescript
describe('calculateMastery', () => {
  it('should return 0% for nodes with no flashcards')
  it('should return 100% for default SRS (ease=2.5)')
  it('should calculate correct percentage for ease=1.3 (0%)')
  it('should calculate correct percentage for ease=1.9 (50%)')
  it('should calculate correct percentage for ease=3.0 (100%)')
  it('should clamp values below 0% to 0%')
  it('should clamp values above 100% to 100%')
  it('should handle empty flashcard array')
  it('should handle flashcards without SRS metadata')
  it('should average ease across multiple flashcards correctly')
})
```

**Test Suite**: shouldAutoComplete()
```typescript
describe('shouldAutoComplete', () => {
  it('should return true when mastery >= 80% and status is in-progress')
  it('should return false when mastery < 80%')
  it('should return false when status is already completed')
  it('should return false when status is not-started')
})
```

**Estimated**: 14 tests, ~1.5 hours

---

### 1.3 Status Badge Component (`apps/mindmap-web/components/__tests__/SkillStatusBadge.test.tsx`)

**Test Suite**: SkillStatusBadge
```typescript
describe('SkillStatusBadge', () => {
  it('should render gray badge for not-started status')
  it('should render blue badge for in-progress status')
  it('should render green badge for completed status')
  it('should render null when status is undefined')
  it('should have correct size (16x16px)')
  it('should have correct aria-label')
  it('should apply correct CSS classes')
})
```

**Estimated**: 7 tests, ~45 minutes

---

### 1.4 Mastery Progress Bar (`apps/mindmap-web/components/__tests__/MasteryProgressBar.test.tsx`)

**Test Suite**: MasteryProgressBar
```typescript
describe('MasteryProgressBar', () => {
  it('should render with correct width (100px)')
  it('should render with correct height (4px)')
  it('should fill bar to correct percentage')
  it('should show red color for 0-30% mastery')
  it('should show yellow color for 31-70% mastery')
  it('should show green color for 71-100% mastery')
  it('should display percentage text')
  it('should handle 0% mastery')
  it('should handle 100% mastery')
  it('should have correct aria attributes')
})
```

**Estimated**: 10 tests, ~1 hour

---

### 1.5 Filter Panel Component (`apps/mindmap-web/components/__tests__/SkillFilterPanel.test.tsx`)

**Test Suite**: SkillFilterPanel
```typescript
describe('SkillFilterPanel', () => {
  it('should render all status options')
  it('should call onFilterChange when option selected')
  it('should highlight selected filter')
  it('should show node counts per status')
  it('should close on Esc key')
  it('should slide in from right')
  it('should have correct width (400px)')
})
```

**Estimated**: 7 tests, ~45 minutes

---

## 2. Integration Tests

### 2.1 API Integration (`apps/mindmap-web/lib/__tests__/skill-api.test.ts`)

**Test Suite**: Skill API
```typescript
describe('updateSkillStatus', () => {
  it('should update node skill status via API')
  it('should return updated node data')
  it('should handle API errors gracefully')
  it('should validate status values')
})

describe('getNodeMastery', () => {
  it('should fetch node with flashcards')
  it('should calculate mastery from flashcards')
  it('should handle nodes without flashcards')
})
```

**Estimated**: 6 tests, ~1 hour

---

### 2.2 CMS Collection Integration (`apps/mindmap-cms/src/collections/__tests__/MindmapNodes.skill.test.ts`)

**Test Suite**: MindmapNodes with Skill Fields
```typescript
describe('MindmapNodes skill fields', () => {
  it('should save node with skill metadata')
  it('should read node with skill metadata')
  it('should update skill status')
  it('should handle nodes without skill metadata (backward compat)')
  it('should validate status enum values')
  it('should store mastery percentage as number')
  it('should store lastPracticed as date')
})
```

**Estimated**: 7 tests, ~1.5 hours

---

### 2.3 Editor Store Integration (`packages/editor/src/store/__tests__/editorStore.skill.test.ts`)

**Test Suite**: Editor Store with Skill Features
```typescript
describe('editorStore skill operations', () => {
  it('should update node skill status')
  it('should recalculate mastery when flashcards change')
  it('should filter nodes by status')
  it('should auto-complete status at 80% mastery')
  it('should cycle status with keyboard shortcut')
  it('should maintain skill metadata in undo/redo')
})
```

**Estimated**: 6 tests, ~1 hour

---

## 3. E2E Tests (Playwright)

### 3.1 Skill Status Workflow (`tests/e2e/skill-status.spec.ts`)

**Test Suite**: Skill Status
```typescript
test('user can set skill status on node creation', async ({ page }) => {
  // Create node → open editor → set status → verify badge
})

test('user can change skill status on existing node', async ({ page }) => {
  // Select node → change status → verify badge updates
})

test('user can cycle status with S key', async ({ page }) => {
  // Select node → press S → verify status cycles
})

test('status badge displays correct color', async ({ page }) => {
  // Create nodes with different statuses → verify badge colors
})
```

**Estimated**: 4 tests, ~2 hours

---

### 3.2 Mastery Display Workflow (`tests/e2e/mastery-display.spec.ts`)

**Test Suite**: Mastery Display
```typescript
test('progress bar shows on node hover', async ({ page }) => {
  // Create node with flashcards → hover → verify progress bar
})

test('mastery updates when flashcard reviewed', async ({ page }) => {
  // Review flashcard → verify mastery recalculates
})

test('progress bar color changes with mastery level', async ({ page }) => {
  // Create nodes with different mastery → verify colors
})
```

**Estimated**: 3 tests, ~1.5 hours

---

### 3.3 Filter Workflow (`tests/e2e/skill-filter.spec.ts`)

**Test Suite**: Skill Filter
```typescript
test('user can open filter panel with Ctrl+Shift+S', async ({ page }) => {
  // Press Ctrl+Shift+S → verify panel opens
})

test('user can filter by status', async ({ page }) => {
  // Create nodes with various statuses → filter → verify visibility
})

test('user can clear filter', async ({ page }) => {
  // Apply filter → select "All" → verify all nodes visible
})

test('filter panel closes with Esc', async ({ page }) => {
  // Open panel → press Esc → verify panel closes
})
```

**Estimated**: 4 tests, ~2 hours

---

### 3.4 Auto-Complete Workflow (`tests/e2e/auto-complete.spec.ts`)

**Test Suite**: Auto-Complete Status
```typescript
test('status auto-updates to completed at 80% mastery', async ({ page }) => {
  // Create node → add flashcards → review until 80% → verify auto-complete
})

test('auto-complete shows notification', async ({ page }) => {
  // Trigger auto-complete → verify notification appears
})
```

**Estimated**: 2 tests, ~1.5 hours

---

## 4. Manual Testing Checklist

### Visual Verification
- [ ] Status badges render correctly (size, position, color)
- [ ] Progress bars display with correct gradient
- [ ] Filter panel slides in smoothly
- [ ] Hover states work correctly
- [ ] Focus indicators are visible

### Keyboard Navigation
- [ ] S key cycles status
- [ ] Ctrl+Shift+S opens filter panel
- [ ] Esc closes filter panel
- [ ] Tab navigation works
- [ ] All shortcuts documented in UX rules work

### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Responsive Design
- [ ] Works on desktop (1920x1080)
- [ ] Works on laptop (1366x768)
- [ ] Filter panel adapts to screen size

---

## 5. Test Execution Plan

### Phase 1: Unit Tests (Day 1-2)
1. Write domain type tests
2. Write mastery calculation tests
3. Write component tests
4. Achieve 90% coverage for domain logic

### Phase 2: Integration Tests (Day 3)
1. Write API integration tests
2. Write CMS collection tests
3. Write editor store tests
4. Achieve 80% coverage for integration layer

### Phase 3: E2E Tests (Day 4)
1. Write skill status workflow tests
2. Write mastery display tests
3. Write filter workflow tests
4. Write auto-complete tests

### Phase 4: Manual Testing (Day 5)
1. Visual verification
2. Keyboard navigation
3. Cross-browser testing
4. Performance testing

---

## 6. Test Data

### Sample Nodes
```typescript
const sampleNodes = [
  { nodeId: 'node-1', content: { text: 'HTTP Lifecycle', skill: { status: 'not-started' } } },
  { nodeId: 'node-2', content: { text: 'REST Principles', skill: { status: 'in-progress' } } },
  { nodeId: 'node-3', content: { text: 'Middleware', skill: { status: 'completed' } } },
]
```

### Sample Flashcards
```typescript
const sampleFlashcards = [
  { nodeId: 'node-2', srs: { ease: 2.8, interval: 6 } },
  { nodeId: 'node-2', srs: { ease: 2.5, interval: 1 } },
  { nodeId: 'node-3', srs: { ease: 3.0, interval: 15 } },
]
```

---

## 7. Success Criteria

- [ ] All unit tests pass (90%+ coverage)
- [ ] All integration tests pass (80%+ coverage)
- [ ] All E2E tests pass
- [ ] Manual testing checklist complete
- [ ] No regressions in existing features
- [ ] Performance benchmarks met (<2s for 500 nodes)

**Estimated Total Effort**: 5 days
