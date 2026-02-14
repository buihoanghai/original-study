# E2E Test Selector Fix Summary

## Problem

E2E tests were failing because the selector `[data-testid^="node-"]` was matching both:
1. Actual node elements: `<div data-testid="node-{nodeId}">`
2. The input element for editing: `<input data-testid="node-input">`

This caused node counts to be incorrect (e.g., expecting 2 nodes but getting 3 because the input was counted).

## Root Cause

The selector `[data-testid^="node-"]` uses the "starts with" operator (`^=`), which matches any element whose `data-testid` attribute starts with "node-". This includes:
- `node-JzpIjiv0J-nt1f0NW_ULM` (actual node)
- `node-input` (input element)

## Solution

Changed all selectors from:
```typescript
page.locator('[data-testid^="node-"]')
```

To:
```typescript
page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])')
```

This selector:
1. Only matches `<div>` elements (nodes are divs, input is an input)
2. Explicitly excludes the input element with `:not([data-testid="node-input"])`

## Files Modified

- `e2e/editor-complete.spec.ts` - Updated all node selectors in all tests

## Results

**Before Fix**:
- 7 failed tests (all with node counting issues)
- 3 passed tests

**After Fix**:
- 5 failed tests (now with focus issues, not counting issues)
- 5 passed tests

**Improvement**: Fixed the node counting issue! The remaining failures are related to input focus, which is a separate issue.

## Remaining Issues

All 5 remaining failures are related to the input element not being focused when expected:
1. Tab test - input not focused after creating child
2. Enter test - input not focused after creating sibling
3. Esc test - input not focused after pressing Tab
4. Creation journey test - input not focused during node creation
5. Ctrl+S test - input not focused during node creation

**Next Step**: Investigate why the input element is not being focused when a new node is created in editing mode.

