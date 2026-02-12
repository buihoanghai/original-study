# Development Workflow

This document explains the step-by-step workflow for all development in this repository.

## Overview

This project follows a **strict, contract-based workflow** where AI executes and humans approve. No work happens without explicit approval.

## The Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. TASK CONTRACT                                            │
│    - Create in tasks/ directory                            │
│    - Follow docs/TASK_TEMPLATE.md                          │
│    - Define scope, AC, tests                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. HUMAN APPROVAL                                           │
│    - Review task contract                                   │
│    - Verify scope and acceptance criteria                  │
│    - Approve or request changes                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. BDD SCENARIOS                                            │
│    - AI writes Given/When/Then scenarios                   │
│    - Covers all acceptance criteria                        │
│    - Human reviews scenarios                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. TEST PLAN                                                │
│    - AI creates test plan                                   │
│    - Unit, integration, E2E tests defined                  │
│    - Maps to acceptance criteria                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. WRITE TESTS (FAILING)                                    │
│    - AI writes tests first                                  │
│    - Tests fail (no implementation yet)                    │
│    - Verify tests are correct                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. IMPLEMENTATION                                           │
│    - AI implements code                                     │
│    - Only touches files in scope                           │
│    - Makes tests pass                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. TESTS PASS                                               │
│    - npm test (all tests green)                            │
│    - npm run typecheck (no errors)                         │
│    - npm run lint (no violations)                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. SELF-CHECK                                               │
│    - AI checks against docs/PR_CHECKLIST.md               │
│    - Verifies no scope violations                          │
│    - Confirms all AC satisfied                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 9. HUMAN VERIFICATION                                       │
│    - Manual review of changes                              │
│    - UX check if applicable                                │
│    - Final approval to merge                               │
└─────────────────────────────────────────────────────────────┘
```

## Step-by-Step Guide

### Step 1: Create Task Contract

**Location**: `tasks/NNN-description.md`

**Template**: `docs/TASK_TEMPLATE.md`

**Required Sections**:
- Type (Feature/Bug/Refactor/Tech-debt)
- Goal (clear user-facing outcome)
- Non-Goals (explicit exclusions)
- Scope (allowed files only)
- Acceptance Criteria (Given/When/Then)
- Test Requirements
- Constraints

**Example**: `tasks/001-define-domain-models.md`

### Step 2: Human Approval

**Human reviews**:
- Is the scope appropriate?
- Are acceptance criteria clear and testable?
- Are non-goals explicit?
- Does it align with docs/CONTEXT.md?

**Approval format**:
```
APPROVED: Task NNN
```

**Request changes**:
```
CHANGES REQUESTED: Task NNN
- [specific feedback]
```

### Step 3: BDD Scenarios

AI writes scenarios in Given/When/Then format:

```gherkin
Scenario: Create mindmap node with stable ID
  Given a new mindmap node is created
  When the node is assigned an ID
  Then the ID must be a string
  And the ID must never change
```

### Step 4: Test Plan

AI creates detailed test plan:
- Unit tests for each AC
- Integration tests for cross-module behavior
- E2E tests for user-facing features

### Step 5: Write Tests (Failing)

AI writes tests that fail initially:

```typescript
describe('MindmapNode', () => {
  it('should have a stable nodeId', () => {
    const node = createNode()
    expect(node.nodeId).toBeDefined()
    expect(typeof node.nodeId).toBe('string')
  })
})
```

### Step 6: Implementation

AI implements code to make tests pass:
- Only modifies files in scope
- Follows project conventions
- Makes all tests green

### Step 7: Tests Pass

Run all checks:
```bash
npm test              # All tests pass
npm run typecheck     # No TypeScript errors
npm run lint          # No linting errors
npm run format:check  # Code is formatted
```

### Step 8: Self-Check

AI verifies against `docs/PR_CHECKLIST.md`:
- [ ] Changes align with task
- [ ] No scope creep
- [ ] Tests added and passing
- [ ] TypeScript types defined
- [ ] No console.log left in code
- [ ] Documentation updated

### Step 9: Human Verification

Human performs final review:
- Code quality check
- UX verification (if applicable)
- Manual testing
- Approve to merge

## Rules

### ✅ DO
- Follow the workflow strictly
- Get approval before implementation
- Write tests first
- Stay within scope
- Document changes

### ❌ DON'T
- Skip steps in the workflow
- Implement without approval
- Change files outside scope
- Skip tests
- Refactor unrelated code

## Current Task

**Task 001: Define Domain Models**
- Status: 📝 Awaiting approval
- File: `tasks/001-define-domain-models.md`
- Summary: `tasks/001-SUMMARY.md`

## References

- `docs/CONTEXT.md` - Project constitution
- `docs/How-AI-work.md` - AI working guidelines
- `docs/TASK_TEMPLATE.md` - Task contract template
- `docs/PR_CHECKLIST.md` - Definition of done

---

**Remember**: AI executes, human decides. No work without approval.

