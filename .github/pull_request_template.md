# Pull Request

## Description
<!-- Provide a clear and concise description of your changes -->

## Related Issue
<!-- Link to the issue this PR addresses -->
Closes #

## Type of Change
<!-- Mark the relevant option with an 'x' -->
- [ ] Bug fix (non-breaking change which fixes an issue) → **MUST fill AI Debug Bundle below**
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Refactoring (no functional changes)
- [ ] Documentation update
- [ ] Tooling/Infrastructure change

## Bounded Context
<!-- Which bounded context does this change affect? -->
- [ ] Editor Core
- [ ] Content
- [ ] Learning
- [ ] Community
- [ ] Sync
- [ ] Infrastructure/Tooling
- [ ] Other (please specify)

---

## AI Debug Bundle (REQUIRED for Bug Fixes)

<!-- If this is a bug fix, copy and fill debug/templates/AI_DEBUG_BUNDLE.md -->
<!-- Paste the completed bundle here or link to it -->

<details>
<summary>Click to expand AI Debug Bundle (required for bug fixes)</summary>

### Environment
- **Environment**: [dev / staging / prod]
- **Commit**: [commit hash]
- **Branch**: [branch name]

### Bug Description
**Repro Steps**:
1.
2.
3.

**Expected**:
**Actual**:

### Boundary Classification
- [ ] Frontend event never fires
- [ ] Next.js route renders but fetch never happens
- [ ] Request hits browser network but not backend
- [ ] Request hits backend entry but not Payload handler/hook
- [ ] Handler runs but branch not reached
- [ ] Async never fired

### Evidence Pack
**RequestId**: `req_xxxxx`

**Frontend**:
- Route:
- Network: [URL, method, status]
- Console:

**Backend**:
- Entry log present: [YES/NO]
- Handler log present: [YES/NO]

### Root Cause
<!-- 1-3 sentences -->

### Fix
**Files changed**:
**Lines changed**:

</details>

---

## PR Checklist
<!-- All items must be checked before merging -->

### Scope & Intent
- [ ] Changes align with the original task/issue
- [ ] No scope creep or unrelated changes
- [ ] Follows project architecture (docs/CONTEXT.md)

### Code Quality
- [ ] Code follows project conventions and style guide
- [ ] No console.log or debug code left in (except behind DEBUG_TRACE flag)
- [ ] TypeScript types are properly defined (no `any` unless justified)
- [ ] Error handling is implemented where needed
- [ ] **Bug fixes only**: RequestId captured in evidence
- [ ] **Bug fixes only**: Boundary classification completed
- [ ] **Bug fixes only**: No secrets logged (Authorization, cookies, tokens)
- [ ] Diff is minimal (≤ 5 files, ≤ 200 LOC) OR justified in "Additional Notes"
- [ ] No unrelated refactors or scope creep

### Testing
- [ ] Unit tests added/updated and passing (`npm run test`)
- [ ] E2E tests added/updated if needed (`npm run test:e2e`)
- [ ] Manual testing completed
- [ ] All tests pass locally
- [ ] `npm run doctor` passes (paste output below)

<details>
<summary>Doctor Output (required)</summary>

```
<!-- Paste output of `npm run doctor` or `npm run doctor --fast` here -->
```

</details>

### Pre-commit Checks
- [ ] Linting passes (`npm run lint`)
- [ ] Type checking passes (`npm run typecheck`)
- [ ] Code formatting applied (`npm run format`)
- [ ] Format check passes (`npm run format:check`)

### Documentation
- [ ] Code is self-documenting or has necessary comments
- [ ] README/docs updated if needed
- [ ] ADR created if architectural decision was made

### Architecture & Dependencies
- [ ] No cross-context dependencies introduced
- [ ] Bounded context boundaries respected
- [ ] New dependencies justified and documented
- [ ] Package manager used for dependency changes (not manual edits)

### Final Verification
- [ ] Changes reviewed against docs/PR_CHECKLIST.md
- [ ] No breaking changes (or properly documented/versioned)
- [ ] Ready for human review and approval

## Screenshots/Demo
<!-- If applicable, add screenshots or a demo video -->

## Additional Notes
<!-- Any additional information reviewers should know -->

