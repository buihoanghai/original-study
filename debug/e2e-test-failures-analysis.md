# E2E Test Failures Analysis

**Date**: 2026-02-14
**Test Run**: npm run test:e2e

---

## Summary

**Total Tests**: 10
**Passed**: 3
**Failed**: 7

All 7 failures are in `e2e/editor-complete.spec.ts` and have the same root cause.

---

## Failure Pattern

All failing tests timeout waiting for `[data-testid^="node-"]` element:

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('[data-testid^="node-"]').first()
```

---

## Boundary Classification

Using `debug/plans/code-never-reached.md`:

**Boundary Type**: #1 - Frontend event never fires / Page renders but element never appears

**Evidence**:
1. ✅ Page loads successfully (GET /editor/[id] returns 200)
2. ✅ Editor page renders (canvas element present)
3. ❌ Node elements never appear in DOM
4. ❌ JavaScript error visible in page snapshot

---

## Root Cause

From error-context.md snapshot:

```yaml
- generic [ref=e24]:
  - generic [ref=e25]: Error
  - generic "Cannot read properties of undefined (reading 'metadata')" [ref=e26]: 
      Cannot read properties of unde...
```

**JavaScript Error**: `Cannot read properties of undefined (reading 'metadata')`

This error prevents the mindmap nodes from rendering, causing all tests to timeout.

---

## Affected Tests

1. ❌ Tab - should add child node
2. ❌ Enter - should add sibling node
3. ❌ Esc - should exit edit mode
4. ❌ Ctrl+Z - should undo last action
5. ❌ Complete mindmap creation journey
6. ❌ Edit existing node content
7. ❌ Save new mindmap with Ctrl+S

---

## Passing Tests

1. ✅ should load the home page
2. ✅ should navigate to new mindmap page
3. ✅ authenticate (setup)

---

## Next Steps

1. **Enable debug tracing** to capture the full error stack
2. **Find the code** that accesses `.metadata` property
3. **Identify** why the object is undefined
4. **Fix** the undefined access
5. **Verify** all tests pass

---

## Debug Commands

```bash
# Enable tracing
NEXT_PUBLIC_DEBUG_TRACE=1 npm run dev:web

# Run single test
npx playwright test e2e/editor-complete.spec.ts:36 --headed

# View test report
npx playwright show-report
```

