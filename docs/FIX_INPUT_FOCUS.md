# Input Focus Fix - Auto-Focus on Node Creation

## Issue Summary

**Problem**: Input field was not automatically focused when creating new nodes via Tab or Enter keys, requiring users to click before typing.

**Impact**: Poor keyboard-first UX - users couldn't type immediately after creating nodes.

**Status**: ✅ **FIXED**

---

## Root Cause

The original implementation used `setTimeout(0)` to delay focus, but this was insufficient for React Flow's event handling cycle. React Flow needs time to:
1. Process the node creation event
2. Update the canvas
3. Render the new node component
4. Mount the input element in the DOM

A `0ms` delay was too fast - the focus attempt happened before React Flow finished its event handling, causing the focus to be lost.

---

## Solution

Changed the focus delay from `0ms` to `50ms` in `packages/editor/src/components/NodeComponent.tsx`:

```typescript
// Focus input when entering edit mode
useEffect(() => {
  if (isEditing && inputRef.current) {
    // Use a small delay to ensure focus happens after React Flow's event handling
    // and DOM is fully rendered. 50ms is enough for React Flow to settle.
    const timeoutId = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    }, 50)
    return () => clearTimeout(timeoutId)
  }
}, [isEditing])
```

### Why 50ms?

- **Too fast (0ms)**: Focus happens before React Flow finishes event handling → focus lost
- **Too slow (>100ms)**: Noticeable delay, poor UX
- **50ms**: Sweet spot - imperceptible to users, gives React Flow enough time to settle

---

## Testing

### E2E Tests Created

**File**: `e2e/input-focus.spec.ts`

Comprehensive tests covering:
1. ✅ Tab creates child with auto-focused input
2. ✅ Enter creates sibling with auto-focused input  
3. ✅ Tab while editing creates child with auto-focused input
4. ✅ Double-click focuses input for editing
5. ✅ Focus persists across multiple node creations
6. ✅ Focus works after Escape and re-entering edit mode

### Test Results

**Before Fix**: 4-5 failures (input not focused)
**After Fix**: ✅ **All 7 tests passed**

```bash
npm run test:e2e -- input-focus.spec.ts
```

Output:
```
✓ 7 passed (20.3s)
```

---

## Files Changed

### Modified
- `packages/editor/src/components/NodeComponent.tsx` - Changed `setTimeout` delay from `0` to `50`

### Created
- `e2e/input-focus.spec.ts` - Comprehensive E2E tests for input focus
- `docs/INPUT_FOCUS_ISSUE.md` - Investigation and debugging guide
- `docs/FIX_INPUT_FOCUS.md` - This fix documentation

---

## Verification Checklist

- [x] Tab creates child with focused input
- [x] Enter creates sibling with focused input
- [x] Tab while editing creates child with focused input
- [x] Enter while editing creates sibling with focused input
- [x] Double-click focuses input
- [x] Focus works on first node creation
- [x] Focus works on subsequent node creations
- [x] Focus works after Escape and re-edit
- [x] No console errors
- [x] E2E tests pass (7/7)

---

## Key Learnings

1. **React Flow Event Handling**: React Flow has its own event handling cycle that can interfere with focus management
2. **Timing Matters**: The delay value is critical - too fast or too slow both cause issues
3. **E2E Testing**: Playwright's `toBeFocused()` assertion is perfect for verifying focus behavior
4. **User Experience**: 50ms is imperceptible to users but crucial for technical correctness

---

## Related Issues

- Authentication Access Control Error (Fixed in `docs/FIX_AUTH_ACCESS_CONTROL.md`)
- nodeId Validation Error (Fixed in `docs/FIX_NODEID_VALIDATION.md`)

---

## References

- React Flow Documentation: https://reactflow.dev/
- HTMLInputElement.focus(): https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus
- Playwright toBeFocused(): https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-be-focused

