# Pull Request

## Description
<!-- Provide a clear and concise description of your changes -->

## Related Issue
<!-- Link to the issue this PR addresses -->
Closes #

## Type of Change
<!-- Mark the relevant option with an 'x' -->
- [ ] Bug fix (non-breaking change which fixes an issue)
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

## PR Checklist
<!-- All items must be checked before merging -->

### Scope & Intent
- [ ] Changes align with the original task/issue
- [ ] No scope creep or unrelated changes
- [ ] Follows project architecture (docs/CONTEXT.md)

### Code Quality
- [ ] Code follows project conventions and style guide
- [ ] No console.log or debug code left in
- [ ] TypeScript types are properly defined (no `any` unless justified)
- [ ] Error handling is implemented where needed

### Testing
- [ ] Unit tests added/updated and passing (`npm run test`)
- [ ] E2E tests added/updated if needed (`npm run test:e2e`)
- [ ] Manual testing completed
- [ ] All tests pass locally

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

