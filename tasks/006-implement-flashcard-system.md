# Task 006: Implement Flashcard System

**Status**: IN PROGRESS  
**Owner**: AI Agent  
**Created**: 2026-02-12  
**Dependencies**: Task 001 (Domain Models), Task 002 (CMS Collections), Task 005 (Web Frontend)

---

## 1. Goal

Implement flashcard creation, spaced repetition scheduling (SRS), and review interface to support deep learning and effective recall.

---

## 2. Context

- **Domain types** for Flashcard and SRSMetadata already exist in `@mindmap/domain`
- **CMS collection** for Flashcards already exists with SRS fields
- **Web frontend** is ready for new features
- **SRS Algorithm**: SM-2 (SuperMemo 2) for spaced repetition
- **User Flow**: Create flashcards from nodes → Review due cards → Update SRS metadata

---

## 3. Scope

### In Scope
- Flashcard package with SRS logic
- API client functions for flashcard CRUD
- Flashcard creation UI in editor
- Review interface with keyboard shortcuts
- SRS scheduling algorithm (SM-2)
- Due flashcard filtering
- Review statistics

### Out of Scope
- Advanced SRS algorithms (Anki, FSRS)
- Flashcard sharing
- Collaborative flashcard decks
- Mobile app
- Offline review mode
- Audio/image flashcards (text only for MVP)

---

## 4. Acceptance Criteria

**AC1**: Can create flashcard from selected node in editor  
**AC2**: Flashcard references stable nodeId  
**AC3**: Review page shows only due flashcards  
**AC4**: Can rate flashcard difficulty (Again, Hard, Good, Easy)  
**AC5**: SRS algorithm updates interval and nextReview correctly  
**AC6**: Keyboard shortcuts work in review (1-4 for ratings, Space to flip)  
**AC7**: Review statistics show cards due today/this week  
**AC8**: All tests passing for SRS logic  

---

## 5. Technical Design

### File Structure
```
packages/flashcard/
├── src/
│   ├── srs.ts                  # SM-2 algorithm
│   ├── types.ts                # Flashcard types
│   ├── index.ts                # Exports
│   └── __tests__/
│       └── srs.test.ts         # SRS algorithm tests
├── package.json
└── tsconfig.json

apps/mindmap-web/
├── lib/
│   └── flashcard-api.ts        # Flashcard API client
├── components/
│   ├── FlashcardForm.tsx       # Create/edit flashcard
│   ├── FlashcardReview.tsx     # Review interface
│   └── FlashcardStats.tsx      # Statistics display
└── app/
    └── review/
        └── page.tsx            # Review page
```

### SRS Algorithm (SM-2)

**Rating Scale**:
- 0 (Again): Complete blackout, wrong response
- 1 (Hard): Correct response recalled with serious difficulty
- 2 (Good): Correct response after hesitation
- 3 (Easy): Perfect response

**Algorithm**:
```
If rating < 2:
  interval = 1 day
  ease = max(1.3, ease - 0.2)
Else:
  If interval == 1: interval = 6 days
  Else if interval == 6: interval = interval * ease
  Else: interval = interval * ease
  
  ease = ease + (0.1 - (3 - rating) * (0.08 + (3 - rating) * 0.02))
  ease = max(1.3, ease)

nextReview = today + interval
```

---

## 6. Implementation Plan

### Phase 1: Flashcard Package
1. Create `packages/flashcard` workspace
2. Implement SM-2 algorithm in `srs.ts`
3. Write comprehensive tests for SRS logic
4. Export types and functions

### Phase 2: API Client
1. Create `flashcard-api.ts` with CRUD functions
2. Implement `getFlashcards`, `createFlashcard`, `updateFlashcard`, `deleteFlashcard`
3. Implement `getDueFlashcards` with date filtering
4. Implement `reviewFlashcard` to update SRS metadata

### Phase 3: Editor Integration
1. Add "Create Flashcard" button to node affordances
2. Create FlashcardForm component
3. Wire up form to API client
4. Show flashcard count badge on nodes with flashcards

### Phase 4: Review Interface
1. Create review page at `/review`
2. Implement FlashcardReview component with flip animation
3. Add keyboard shortcuts (1-4 for ratings, Space to flip)
4. Show progress (X of Y cards reviewed)
5. Handle empty state (no cards due)

### Phase 5: Statistics
1. Create FlashcardStats component
2. Show cards due today/this week/total
3. Display on home page and review page

---

## 7. Testing Strategy

### Unit Tests
- SRS algorithm with all rating scenarios
- Edge cases (ease factor limits, interval calculations)
- Date calculations

### Integration Tests
- Create flashcard from node
- Review flashcard updates SRS
- Due flashcard filtering

### E2E Tests (Future)
- Full review workflow
- Keyboard shortcuts in review

---

## 8. Quality Checks

- [ ] All TypeScript compiles without errors
- [ ] All unit tests pass (SRS algorithm)
- [ ] Can create flashcard from node
- [ ] Review interface works with keyboard
- [ ] SRS updates correctly after review
- [ ] Due flashcards filter correctly
- [ ] Statistics display accurately
- [ ] No console errors

---

## 9. Deliverables

1. `packages/flashcard/src/srs.ts` - SM-2 algorithm
2. `packages/flashcard/src/__tests__/srs.test.ts` - SRS tests
3. `apps/mindmap-web/lib/flashcard-api.ts` - API client
4. `apps/mindmap-web/components/FlashcardForm.tsx` - Create/edit form
5. `apps/mindmap-web/components/FlashcardReview.tsx` - Review interface
6. `apps/mindmap-web/components/FlashcardStats.tsx` - Statistics
7. `apps/mindmap-web/app/review/page.tsx` - Review page
8. Updated editor to show flashcard creation button
9. All tests passing

---

## 10. Definition of Done

- All acceptance criteria met
- All tests passing
- TypeScript compiles without errors
- Can create, review, and track flashcards
- SRS algorithm working correctly
- Keyboard shortcuts functional
- Code reviewed and approved

