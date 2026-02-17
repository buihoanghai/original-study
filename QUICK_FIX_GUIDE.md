# Quick Fix Guide - Flashcards & Hierarchy

## Issue 1: Flashcards Not Showing

### Possible Causes:
1. **Flashcard panel not toggled on** - Click the "Flashcards" button in top-right
2. **Node not selected** - Click on a node first
3. **Selection not working** - Check browser console for errors

### How to Test:
1. Open http://localhost:3000
2. Click the **"Flashcards"** button in the top-right corner
3. Click on any node (e.g., "Programming Fundamentals")
4. Flashcards should appear in the right panel

### Debug Steps:
1. Open browser console (F12)
2. Click on a node
3. Look for these logs:
   ```
   [useSyncMindmap] Loaded edges: Array(12)
   [useSyncMindmap] Edges count: 12
   ```
4. Check if there are any errors

---

## Issue 2: Confusing Hierarchy

### Current Problem:
- Nodes are arranged in a grid (x: 0, 400, 800)
- Hard to see parent-child relationships
- All nodes visible at once (no collapsing)

### Solutions:

#### Option A: Use React Flow Auto-Layout (Recommended)
Install dagre for automatic tree layout:

```bash
cd packages/editor
npm install dagre
```

Then update `MindmapEditor.tsx` to use auto-layout.

#### Option B: Improve Seed Data Positions
Update the JSON to have better spacing:
- Foundation at (0, 0)
- L1 nodes spread vertically: (300, 0), (300, 200), (300, 400)...
- L2 nodes at (600, ...)
- L3 nodes at (900, ...)

#### Option C: Add Collapse/Expand Feature
- Show only root node initially
- Click to expand children
- This is already supported by the editor!

---

## Quick Test Checklist

### Backend ✅
- [ ] CMS running on http://localhost:3001
- [ ] 13 nodes in database
- [ ] 12 edges in database
- [ ] 39 flashcards in database

### Frontend
- [ ] Web app running on http://localhost:3000
- [ ] Can see mindmap with nodes
- [ ] Edges/lines connecting nodes
- [ ] **Click "Flashcards" button** in top-right
- [ ] Click on a node
- [ ] Flashcards appear in right panel

---

## Immediate Actions

### 1. Test Flashcard Panel

**Steps**:
1. Make sure you clicked the "Flashcards" button (top-right)
2. Click on a node
3. Check if flashcards appear

**If still not working**:
- Open browser console (F12)
- Look for errors
- Check Network tab for `/api/flashcards` request

### 2. Check Browser Console

Look for:
```
[useSyncMindmap] Loaded edges: Array(12)
[useSyncMindmap] Edges count: 12
```

If edges count is 0, the frontend isn't fetching edges.

### 3. Verify Node Selection

Click on a node and check console for:
```
Selected node: <nodeId>
```

---

## Common Issues

### "Select a node to manage flashcards"
**Cause**: No node is selected  
**Fix**: Click on any node in the mindmap

### Nodes scattered randomly
**Cause**: Grid layout from seed data  
**Fix**: Use React Flow auto-layout (see Option A above)

### No edges visible
**Cause**: Edges not being fetched  
**Fix**: Check browser console for edge loading logs

### Flashcard panel not visible
**Cause**: Panel is hidden by default  
**Fix**: Click "Flashcards" button or press Ctrl+Shift+F

---

## Next Steps

1. **Test flashcards** - Click button, select node, verify flashcards show
2. **Check console** - Look for edge loading logs
3. **Report findings** - Share any console errors or issues

If flashcards still don't work after clicking the button and selecting a node, we need to debug further.

