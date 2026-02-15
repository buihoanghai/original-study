# Task Contracts

This directory contains Task Contracts that define all work to be done in this repository.

## Purpose

Per `docs/How-AI-work.md`, **no work can start without an approved Task Contract**. This ensures:

- Clear scope and acceptance criteria
- Test-driven development
- No scope creep
- Human approval before implementation

## Workflow

```
1. Create Task Contract (this directory)
   ↓
2. Human reviews and approves
   ↓
3. AI writes BDD scenarios
   ↓
4. AI writes tests (failing)
   ↓
5. AI implements code
   ↓
6. Tests pass
   ↓
7. Self-check via PR_CHECKLIST.md
   ↓
8. Human verification
```

## Task Naming Convention

```
NNN-short-description.md
```

Examples:

- `001-define-domain-models.md`
- `002-create-cms-schema.md`
- `003-implement-sync-logic.md`

## Task Status

| Task | Status              | Description                                      |
| ---- | ------------------- | ------------------------------------------------ |
| 001  | ✅ Completed        | Define core domain models                        |
| 002  | ✅ Completed        | Create CMS collections                           |
| 003  | ✅ Completed        | Implement sync package                           |
| 004  | ✅ Completed        | Build editor core                                |
| 005  | ✅ Completed        | Build web frontend                               |
| 006  | ✅ Completed        | Implement flashcard system                       |
| 007  | 📝 Pending Approval | Adaptive Learning Calendar + Mastery System      |

## Template

All tasks must follow the template in `docs/TASK_TEMPLATE.md`.

Required sections:

- Type (Feature/Bug/Refactor/Tech-debt)
- Goal (clear user-facing outcome)
- Non-Goals (explicit exclusions)
- Scope (allowed files only)
- Acceptance Criteria (Given/When/Then)
- Test Requirements
- Constraints
- Definition of Done

## Rules

1. **No implementation without approval** - Task must be reviewed by human first
2. **No scope violations** - Only modify files listed in Scope section
3. **Tests are mandatory** - Every AC must have tests
4. **Follow the workflow** - No skipping steps

## Current Task

**Task 007: Adaptive Learning Calendar + Mastery System**

- Status: 📝 Awaiting human approval
- File: `tasks/007-adaptive-learning-calendar.md`
- Type: Feature (Major system evolution)
- Estimated Effort: ~40 hours (1 week full-time)
- Dependencies: Tasks 001, 002, 006 (all completed)
- Next: Human reviews and approves before AI proceeds

**Summary**: Transform Mindmap from passive knowledge visualization into an adaptive learning execution system with:
- Auto-scheduled learning sessions
- Per-node mastery tracking
- Weekly calendar interface
- Streak tracking and adaptive rescheduling

---

**Note**: This directory is part of the strict AI workflow defined in `docs/How-AI-work.md`. All tasks must be approved before execution.
