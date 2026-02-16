# Skill Tree Enhancement Tasks

**Created**: 2026-02-15  
**Purpose**: Transform the mindmap tool into a comprehensive fullstack skill tree learning system

---

## Overview

This document indexes the 5 task contracts created to address current limitations in using the mindmap tool for learning the fullstack skill tree. These enhancements will add progress tracking, learning path guidance, time management, retention monitoring, and project-based learning.

---

## Task Summary

| Task | Title | Status | Priority | Estimated Effort |
|------|-------|--------|----------|------------------|
| 008 | Skill Progress Tracking System | 📝 Pending | High | 3-5 days |
| 009 | Learning Path Recommendation Engine | 📝 Pending | Medium | 5-7 days |
| 010 | Time Tracking Per Skill | 📝 Pending | Medium | 3-4 days |
| 011 | Skill Decay Tracking System | 📝 Pending | Low | 2-3 days |
| 012 | Project-Skill Mapping System | 📝 Pending | Medium | 4-6 days |

**Total Estimated Effort**: 17-25 days

---

## Task Details

### Task 008: Skill Progress Tracking System
**File**: `tasks/008-skill-progress-tracking.md`

**Goal**: Enable users to track learning progress with status indicators and mastery percentages.

**Key Features**:
- ✅ Status field: not-started, in-progress, completed
- ✅ Mastery percentage calculated from flashcard performance
- ✅ Visual status badges on nodes
- ✅ Progress bars showing mastery
- ✅ Filter skills by status
- ✅ Auto-update status based on mastery

**Dependencies**: Task 001, Task 002, Task 006

**Impact**: 
- Extends `NodeContent` with `SkillMetadata`
- Adds status badges to mindmap nodes
- Provides progress visibility

---

### Task 009: Learning Path Recommendation Engine
**File**: `tasks/009-learning-path-recommendations.md`

**Goal**: Implement "What should I learn next?" recommendations based on prerequisites.

**Key Features**:
- ✅ Prerequisite edge type (hard vs soft)
- ✅ Topological sort for learning order
- ✅ Next skill recommendations
- ✅ Prerequisite chain highlighting
- ✅ Lock skills until prerequisites completed
- ✅ Learning path visualization

**Dependencies**: Task 001, Task 008

**Impact**:
- Extends `NodeEdge` with prerequisite type
- Adds path-finding algorithms
- Provides guided learning progression

---

### Task 010: Time Tracking Per Skill
**File**: `tasks/010-time-tracking-per-skill.md`

**Goal**: Track time spent on each skill with timer and session history.

**Key Features**:
- ✅ Estimated hours field per skill
- ✅ Start/stop timer for active learning
- ✅ Time entry log with history
- ✅ Total actual hours display
- ✅ Estimated vs actual comparison
- ✅ Learning velocity metrics

**Dependencies**: Task 001, Task 008

**Impact**:
- New `TimeEntries` collection
- Extends `SkillMetadata` with time fields
- Adds timer component to UI

---

### Task 011: Skill Decay Tracking System
**File**: `tasks/011-skill-decay-tracking.md`

**Goal**: Warn users when skills haven't been practiced and recommend review intervals.

**Key Features**:
- ✅ Last practice date tracking
- ✅ Decay status: fresh, aging, stale, forgotten
- ✅ Decay warning badges
- ✅ Recommended review intervals
- ✅ Review schedule panel
- ✅ Integration with flashcard SRS

**Dependencies**: Task 006, Task 008

**Impact**:
- Extends `SkillMetadata` with decay fields
- Adds decay calculation utilities
- Provides retention monitoring

---

### Task 012: Project-Skill Mapping System
**File**: `tasks/012-project-skill-mapping.md`

**Goal**: Create learning projects that map to required skills with gap analysis.

**Key Features**:
- ✅ Create learning projects
- ✅ Link required/optional skills
- ✅ Skill gap analysis
- ✅ Project badges on skill nodes
- ✅ Project completion tracking
- ✅ Project-based learning paths

**Dependencies**: Task 001, Task 008

**Impact**:
- New `LearningProjects` collection
- New `ProjectSkills` join table
- Adds projects page and UI

---

## Implementation Order

### Phase 1: Foundation (Week 1-2)
1. **Task 008** - Skill Progress Tracking
   - Provides base `SkillMetadata` structure
   - Required by all other tasks
   - Immediate user value (progress visibility)

### Phase 2: Learning Guidance (Week 3-4)
2. **Task 009** - Learning Path Recommendations
   - Builds on progress tracking
   - Provides learning direction
   - High user value

### Phase 3: Time & Retention (Week 5-6)
3. **Task 010** - Time Tracking
   - Independent feature
   - Can be developed in parallel with Task 011

4. **Task 011** - Skill Decay Tracking
   - Uses progress tracking from Task 008
   - Complements flashcard SRS

### Phase 4: Project Integration (Week 7-8)
5. **Task 012** - Project-Skill Mapping
   - Ties everything together
   - Provides concrete learning goals
   - Highest complexity

---

## Architecture Impact

### Domain Layer
**New Types**:
- `packages/domain/src/types/skill.ts`
- `packages/domain/src/types/prerequisite.ts`
- `packages/domain/src/types/time-tracking.ts`
- `packages/domain/src/types/decay.ts`
- `packages/domain/src/types/project.ts`

**New Utilities**:
- `packages/domain/src/utils/mastery.ts`
- `packages/domain/src/utils/topological-sort.ts`
- `packages/domain/src/utils/path-finder.ts`
- `packages/domain/src/utils/time-formatter.ts`
- `packages/domain/src/utils/decay-calculator.ts`

### CMS Layer
**New Collections**:
- `TimeEntries` - Time tracking logs
- `LearningProjects` - Project definitions
- `ProjectSkills` - Project-skill links

**Modified Collections**:
- `MindmapNodes` - Add skill metadata fields

### Frontend Layer
**New Components**:
- Skill status badges and progress bars
- Learning path panel
- Timer and time log
- Decay warnings and review schedule
- Project cards and gap analysis

**New Pages**:
- `/projects` - Project list
- `/projects/[id]` - Project detail

---

## Testing Strategy

Each task includes:
- ✅ Unit tests for domain logic
- ✅ Integration tests for API
- ✅ E2E tests for user workflows
- ✅ Manual UX verification

**Total Test Coverage Goal**: >80%

---

## Success Metrics

After implementing all 5 tasks, users should be able to:

1. ✅ Create a fullstack skill tree with 100+ skills
2. ✅ Track progress with visual indicators
3. ✅ Get "What to learn next?" recommendations
4. ✅ Track time spent on each skill
5. ✅ Receive decay warnings for stale skills
6. ✅ Create projects and see skill gaps
7. ✅ Complete projects by learning required skills

**User Value**: Transform from passive knowledge visualization to active learning execution system.

---

## Notes

- All tasks follow the strict workflow: Task Contract → BDD → Tests → Implementation
- All tasks maintain backward compatibility (skill features are optional)
- All tasks respect the constraint: ≤ 5 files changed, ≤ 200 LOC per PR
- All tasks include comprehensive test coverage
- All tasks follow keyboard-first UX principles

---

## Next Steps

1. **Review** - Get approval for all 5 task contracts
2. **Prioritize** - Confirm implementation order
3. **Start** - Begin with Task 008 (Skill Progress Tracking)
4. **Iterate** - Complete each task following the workflow
5. **Integrate** - Ensure all features work together seamlessly

