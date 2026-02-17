# Bug Report - Mindmap Hierarchy & Flashcards

**Date**: 2026-02-17  
**Reporter**: AI Assistant  
**Status**: Under Investigation

---

## 🐛 Reported Issues

### Issue #1: Flashcards Not Showing
**Severity**: High  
**Status**: Investigating

**User Report**: "still no flash card"

**Expected Behavior**:
- User clicks on a node
- Flashcard panel shows flashcards for that node (3 flashcards per node)

**Actual Behavior**:
- Flashcard panel shows "Select a node to manage flashcards"
- No flashcards appear even after clicking nodes

**Evidence from Database**:
```
✅ 13 nodes exist
✅ 39 flashcards exist (3 per node)
✅ Flashcards correctly linked via nodeId field
```

**Possible Root Causes**:
1. Node selection not working (onClick handler not firing)
2. selectedNodeId not being set in store
3. FlashcardPanel not receiving nodeId prop
4. API request failing silently
5. Flashcard panel not visible (user needs to click "Flashcards" button)

---

### Issue #2: Hierarchy Hard to Understand
**Severity**: Medium  
**Status**: Confirmed - Layout Issue

**User Report**: "the hierarchical hard to understand"

**Expected Behavior**:
- Clear tree structure showing parent-child relationships
- Foundation at top/left
- L1 nodes as children
- L2 and L3 nodes nested appropriately

**Actual Behavior**:
- Nodes arranged in grid pattern (x: 0, 400, 800)
- Difficult to see parent-child relationships
- All nodes visible at once (no visual hierarchy)

**Evidence from Database**:
```
✅ 12 edges exist with correct parent-child relationships
✅ Foundation → 5 L1 children
✅ L1 → L2 → L3 progression correct
```

**Root Cause**: 
- Seed data uses grid layout positions
- React Flow displays nodes at exact positions from database
- No auto-layout applied

**Positions in Database**:
```
Foundation: (0, 0)
L1 nodes: (0, 150), (0, 300), (0, 450), (0, 600), (0, 750)
L2 nodes: (400, 0), (400, 150), (400, 300), (400, 450)
L3 nodes: (800, 0), (800, 150), (800, 300)
```

---

### Issue #3: No Child Nodes Visible
**Severity**: Medium  
**Status**: False Alarm - They ARE Visible

**User Report**: "there are no child node of these"

**Investigation**:
- All 13 nodes exist in database ✅
- All 12 edges exist ✅
- Nodes ARE visible in the screenshot
- Issue is likely confusion due to poor layout (see Issue #2)

**Conclusion**: This is the same as Issue #2 - the layout makes it hard to understand which nodes are children.

---

## 🔍 Investigation Steps Taken

### 1. Backend Verification ✅
Ran database query to verify data integrity:

```bash
cd apps/mindmap-cms
npx tsx debug-data.js
```

**Results**:
- ✅ Mindmap exists: "Fullstack Developer Skill Tree"
- ✅ 13 nodes created
- ✅ 12 edges with correct relationships
- ✅ 39 flashcards (3 per node)
- ✅ All flashcards linked via nodeId

### 2. Frontend Code Review ✅
Verified edge loading code:

**Files Checked**:
- ✅ `apps/mindmap-web/lib/api.ts` - getMindmapEdges() function exists
- ✅ `packages/sync/src/client.ts` - loadEdges() method exists
- ✅ `packages/editor/src/hooks/useSyncMindmap.ts` - Calls loadEdges()
- ✅ `packages/editor/src/store/editorStore.ts` - loadMindmap() accepts edges
- ✅ `packages/editor/src/components/MindmapEditor.tsx` - Converts edges to React Flow format

### 3. Added Comprehensive Logging ✅
Added console.log statements to track data flow:

**Logging Added To**:
- ✅ `editorStore.ts` - selectNode() and loadMindmap()
- ✅ `MindmapEditor.tsx` - Node click handler and render
- ✅ `FlashcardPanel.tsx` - useEffect and flashcard loading
- ✅ `EditorWrapper.tsx` - selectedNodeId changes

---

## 🧪 Reproduction Steps

### For Issue #1 (Flashcards):
1. Start CMS: `cd apps/mindmap-cms && npm run dev`
2. Start Web: `cd apps/mindmap-web && npm run dev`
3. Open http://localhost:3000
4. Login with dev@payloadcms.com / password123
5. Click on "Fullstack Developer Skill Tree"
6. Click "Flashcards" button (top-right) to open panel
7. Click on any node (e.g., "Programming Fundamentals")
8. **Expected**: Flashcards appear
9. **Actual**: "Select a node to manage flashcards" message

### For Issue #2 (Hierarchy):
1. Follow steps 1-5 above
2. Observe the mindmap layout
3. **Expected**: Clear tree structure
4. **Actual**: Grid layout, hard to understand relationships

---

## 📊 Expected Console Output (After Logging)

When user opens mindmap:
```
[useSyncMindmap] Loading edges for mindmap: <id>
[useSyncMindmap] Loaded edges: Array(12)
[useSyncMindmap] Edges count: 12
[editorStore] loadMindmap called
[editorStore] - Mindmap: Fullstack Developer Skill Tree
[editorStore] - Nodes count: 13
[editorStore] - Edges count: 12
[editorStore] - Initial selectedNodeId: <nodeId>
[MindmapEditor] Rendering with:
[MindmapEditor] - Nodes: 13
[MindmapEditor] - Edges: 12
[MindmapEditor] - Selected node: <nodeId>
```

When user clicks a node:
```
[MindmapEditor] Node clicked: <nodeId>
[editorStore] selectNode called with: <nodeId>
[editorStore] selectedNodeId updated to: <nodeId>
[EditorWrapper] selectedNodeId changed to: <nodeId>
[FlashcardPanel] useEffect triggered
[FlashcardPanel] - nodeId: <nodeId>
[FlashcardPanel] - isVisible: true
[FlashcardPanel] Loading flashcards for node: <nodeId>
[FlashcardPanel] Flashcards result: {success: true, data: Array(3)}
[FlashcardPanel] Loaded flashcards count: 3
```

---

## 🔧 Next Steps

### Immediate Actions:
1. ✅ Add logging (COMPLETE)
2. ⏳ User tests with browser console open
3. ⏳ Collect actual console output
4. ⏳ Compare with expected output
5. ⏳ Identify where the flow breaks

### If Edges Not Loading:
- Check Network tab for `/api/node-edges` request
- Verify request returns 12 edges
- Check if edges are passed to loadMindmap()

### If Node Selection Not Working:
- Check if onClick handler fires
- Verify selectNode() is called
- Check if selectedNodeId updates in store

### If Flashcards Not Loading:
- Check Network tab for `/api/flashcards` request
- Verify nodeId is passed correctly
- Check API response

---

## 📝 Notes

- Backend data is 100% correct ✅
- Frontend code looks correct ✅
- Need actual browser console output to diagnose
- Logging added to track entire data flow

