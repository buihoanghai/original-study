# Input Focus Issue - Investigation and Testing

## Issue Description

**Problem**: Input field is not automatically focused when creating a new node via Tab or Enter keys.

**Expected Behavior**: When user presses Tab or Enter to create a new node, the input field should be automatically focused so the user can start typing immediately without clicking.

**Current Behavior**: Input field appears but may not be focused, requiring user to click before typing.

## Root Cause Analysis

The focus behavior is controlled in `packages/editor/src/components/NodeComponent.tsx`:

```typescript
// Focus input when entering edit mode
useEffect(() => {
  if (isEditing && inputRef.current) {
    inputRef.current.focus()
    inputRef.current.select()
  }
}, [isEditing])
```

### Potential Issues

1. **React Flow Interference**: React Flow may be capturing focus or preventing focus changes
2. **Timing Issue**: The `useEffect` may run before the input is fully rendered
3. **State Update Delay**: The `isEditing` state may not update immediately
4. **Browser Focus Policy**: Some browsers restrict programmatic focus changes

## How to Verify the Issue

### Manual Testing

1. **Start the application**:
   ```bash
   npm run dev
   ```

2. **Create a new mindmap** at `http://localhost:3333/new`

3. **Test Tab key**:
   - Click on the root node
   - Press `Tab`
   - **Expected**: Input appears and is focused (you can type immediately)
   - **Actual**: Check if you need to click the input before typing

4. **Test Enter key**:
   - Create a child node with Tab
   - Type some text
   - Press `Enter` while editing
   - **Expected**: New sibling node input is focused
   - **Actual**: Check if focus is working

### E2E Testing

Run the comprehensive E2E tests:

```bash
# Make sure MongoDB is running first
npm run dev:db

# Run the input focus tests
npm run test:e2e -- input-focus.spec.ts

# Or run all editor tests
npm run test:e2e -- editor-complete.spec.ts
```

## E2E Test Coverage

### Existing Tests (`e2e/editor-complete.spec.ts`)

✅ **Lines 85-121**: Tests Enter while editing - verifies autofocus
```typescript
test('Enter while editing - should create sibling and autofocus on it', async ({ page }) => {
  // ...
  await expect(newInput).toBeFocused() // CRITICAL CHECK
  await page.keyboard.type('Second child') // Verify can type immediately
})
```

✅ **Lines 124-159**: Tests Tab while editing - verifies autofocus
```typescript
test('Tab while editing - should create child and autofocus on it', async ({ page }) => {
  // ...
  await expect(newInput).toBeFocused() // CRITICAL CHECK
  await page.keyboard.type('Child node') // Verify can type immediately
})
```

### New Tests (`e2e/input-focus.spec.ts`)

Created comprehensive focus tests covering:
- Tab creates child with auto-focused input
- Enter creates sibling with auto-focused input
- Tab while editing creates child with auto-focused input
- Double-click focuses input for editing
- Focus persists across multiple node creations
- Focus works after Escape and re-entering edit mode

## Debugging Steps

### 1. Check Console for Errors

Open browser DevTools and check for:
- React errors
- Focus-related warnings
- React Flow errors

### 2. Add Debug Logging

Add to `NodeComponent.tsx`:

```typescript
useEffect(() => {
  console.log('NodeComponent: isEditing changed to', isEditing)
  if (isEditing && inputRef.current) {
    console.log('NodeComponent: Attempting to focus input')
    inputRef.current.focus()
    inputRef.current.select()
    console.log('NodeComponent: Input focused?', document.activeElement === inputRef.current)
  }
}, [isEditing])
```

### 3. Check React Flow Configuration

Verify React Flow is not preventing focus:

```typescript
<ReactFlow
  // ...
  nodesFocusable={false} // Prevent React Flow from managing focus
  edgesFocusable={false}
/>
```

### 4. Add Delay if Needed

If timing is the issue, add a small delay:

```typescript
useEffect(() => {
  if (isEditing && inputRef.current) {
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 0)
  }
}, [isEditing])
```

## Potential Fixes

### Fix 1: Ensure Input is Rendered Before Focus

```typescript
useEffect(() => {
  if (isEditing && inputRef.current) {
    // Use requestAnimationFrame to wait for render
    requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    })
  }
}, [isEditing])
```

### Fix 2: Disable React Flow Focus Management

In `MindmapEditor.tsx`:

```typescript
<ReactFlow
  nodes={reactFlowNodes}
  edges={reactFlowEdges}
  nodeTypes={nodeTypes}
  nodesFocusable={false} // Add this
  edgesFocusable={false} // Add this
  // ...
/>
```

### Fix 3: Force Focus After State Update

In `editorStore.ts`, after setting `editingNodeId`:

```typescript
addChild: (parentId: string) => {
  // ... existing code ...
  set((state) => {
    state.nodes = result.nodes
    state.edges = result.edges
    state.ui.selectedNodeId = result.newNodeId
    state.ui.editingNodeId = result.newNodeId
    state.ui.focusMode = 'editing'
  })
  
  // Force focus after state update
  setTimeout(() => {
    const input = document.querySelector('input[data-testid="node-input"]') as HTMLInputElement
    if (input) {
      input.focus()
      input.select()
    }
  }, 0)
}
```

## Verification Checklist

After applying a fix, verify:

- [ ] Tab creates child with focused input
- [ ] Enter creates sibling with focused input
- [ ] Tab while editing creates child with focused input
- [ ] Enter while editing creates sibling with focused input
- [ ] Double-click focuses input
- [ ] Focus works on first node creation
- [ ] Focus works on subsequent node creations
- [ ] Focus works after Escape and re-edit
- [ ] No console errors
- [ ] E2E tests pass

## Related Files

- `packages/editor/src/components/NodeComponent.tsx` - Input focus logic
- `packages/editor/src/components/MindmapEditor.tsx` - React Flow configuration
- `packages/editor/src/store/editorStore.ts` - State management
- `e2e/input-focus.spec.ts` - Focus E2E tests
- `e2e/editor-complete.spec.ts` - Comprehensive editor tests

## References

- [React useEffect Hook](https://react.dev/reference/react/useEffect)
- [HTMLInputElement.focus()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus)
- [React Flow Documentation](https://reactflow.dev/api-reference)

