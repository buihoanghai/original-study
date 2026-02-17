# Testing Instructions - With Logging

**Date**: 2026-02-17  
**Purpose**: Diagnose flashcard and hierarchy issues with comprehensive logging

---

## 🚀 Quick Start

### Step 1: Start Both Servers

**Terminal 1 - Backend (CMS)**:
```bash
cd apps/mindmap-cms
npm run dev
```

Wait for: `✓ Ready in X ms`

**Terminal 2 - Frontend (Web)**:
```bash
cd apps/mindmap-web
npm run dev
```

Wait for: `✓ Ready on http://localhost:3000`

---

### Step 2: Open Browser with DevTools

1. Open **Chrome** or **Firefox**
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Clear console (click 🚫 icon or Ctrl+L)
5. Navigate to http://localhost:3000

---

### Step 3: Login and Open Mindmap

1. Login with:
   - Email: `dev@payloadcms.com`
   - Password: `password123`

2. Click on **"Fullstack Developer Skill Tree"**

3. **IMPORTANT**: Watch the console output!

---

### Step 4: Check Console Output

You should see logs like this:

```
[useSyncMindmap] Loading edges for mindmap: <id>
[useSyncMindmap] Loaded edges: Array(12)
[useSyncMindmap] Edges count: 12
[editorStore] loadMindmap called
[editorStore] - Mindmap: Fullstack Developer Skill Tree
[editorStore] - Nodes count: 13
[editorStore] - Edges count: 12
[MindmapEditor] Rendering with:
[MindmapEditor] - Nodes: 13
[MindmapEditor] - Edges: 12
```

**✅ If you see this**: Edges are loading correctly!  
**❌ If you DON'T see this**: Edges are NOT loading - report the actual output

---

### Step 5: Open Flashcard Panel

1. Click the **"Flashcards"** button in the top-right corner
2. The panel should slide in from the right
3. You should see: "Select a node to manage flashcards"

---

### Step 6: Click on a Node

1. Click on any node (white box) in the mindmap
   - Try clicking on **"Programming Fundamentals"**
   - Or **"OOP Basics"**
   - Or **"Foundation"**

2. **Watch the console!** You should see:

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

3. **Check the Flashcard Panel**: Should show 3 flashcards

---

## 🐛 Troubleshooting

### Issue: No console logs at all

**Possible Causes**:
- DevTools not open
- Console tab not selected
- Logs filtered out

**Fix**:
1. Make sure Console tab is active
2. Check filter settings (should show "All levels")
3. Clear any search filters

---

### Issue: "Edges count: 0"

**This means edges are NOT being loaded!**

**Debug Steps**:
1. Go to **Network** tab in DevTools
2. Filter by "node-edges"
3. Reload the page
4. Look for a request to `/api/node-edges`
5. Click on it and check:
   - Status code (should be 200)
   - Response (should have 12 items)

**If no request**: Edge loading code isn't running  
**If 404**: NodeEdges collection not registered  
**If 200 but empty**: No edges in database (re-run seed)

---

### Issue: Node click doesn't log anything

**This means onClick handler isn't firing!**

**Possible Causes**:
1. Clicking on background instead of node
2. Node is too small to click
3. React Flow not rendering nodes

**Debug Steps**:
1. Zoom in using mouse wheel
2. Make sure you click directly on the white box (node)
3. Try clicking different nodes
4. Check if nodes are visible at all

---

### Issue: "FlashcardPanel - nodeId: null"

**This means node selection isn't working!**

**Debug Steps**:
1. Check if you see `[editorStore] selectNode called with: <nodeId>`
2. If YES but nodeId is still null → store update issue
3. If NO → onClick handler not firing

---

### Issue: Flashcard API request fails

**Check Network tab**:
1. Go to Network tab
2. Filter by "flashcards"
3. Look for request to `/api/flashcards?where[nodeId][equals]=...`
4. Check status code and response

**If 404**: Flashcards collection issue  
**If 401**: Authentication issue  
**If 200 but empty**: No flashcards for that node

---

## 📋 Checklist

Please complete this checklist and report results:

### Backend
- [ ] CMS running on http://localhost:3001
- [ ] Can access http://localhost:3001/admin
- [ ] 13 nodes visible in "Mindmap Nodes" collection
- [ ] 12 edges visible in "Node Edges" collection
- [ ] 39 flashcards visible in "Flashcards" collection

### Frontend - Initial Load
- [ ] Web app running on http://localhost:3000
- [ ] Can login successfully
- [ ] Can see "Fullstack Developer Skill Tree" mindmap
- [ ] Console shows: `[useSyncMindmap] Edges count: 12`
- [ ] Console shows: `[MindmapEditor] - Nodes: 13`
- [ ] Console shows: `[MindmapEditor] - Edges: 12`

### Frontend - Node Selection
- [ ] Clicked "Flashcards" button to open panel
- [ ] Clicked on a node
- [ ] Console shows: `[MindmapEditor] Node clicked: <nodeId>`
- [ ] Console shows: `[editorStore] selectNode called with: <nodeId>`
- [ ] Console shows: `[FlashcardPanel] - nodeId: <nodeId>` (not null)

### Frontend - Flashcards
- [ ] Console shows: `[FlashcardPanel] Loading flashcards for node: <nodeId>`
- [ ] Console shows: `[FlashcardPanel] Loaded flashcards count: 3`
- [ ] Flashcard panel shows flashcards (not "Select a node")
- [ ] Can see 3 flashcards in the panel

---

## 📤 What to Report

Please copy and paste:

1. **Full console output** from when you open the mindmap
2. **Console output** from when you click a node
3. **Any error messages** (red text in console)
4. **Network tab** - screenshot or list of requests
5. **Checklist results** - which items passed/failed

---

## 🎯 Expected Success

If everything works, you should see:

1. ✅ Mindmap loads with 13 nodes
2. ✅ 12 edges connecting nodes (lines between boxes)
3. ✅ Console shows all expected logs
4. ✅ Clicking a node updates selectedNodeId
5. ✅ Flashcard panel shows 3 flashcards for selected node

---

**Ready to test! Please follow the steps above and report what you see in the console.**

