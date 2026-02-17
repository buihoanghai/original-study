# How to Use Flashcards - Step by Step

## ✅ Current Status

**Backend**: Working perfectly ✅
- 13 nodes created
- 12 edges connecting them
- 39 flashcards (3 per node)

**Frontend**: Edges are being fetched ✅
- Code updated to load edges
- Edges should be visible as lines connecting nodes

**Issue**: You need to **SELECT A NODE** first!

---

## 📋 Step-by-Step Instructions

### Step 1: Make Sure Flashcard Panel is Open

Look at the top-right corner of the screen. You should see a **"Flashcards"** button.

**If the panel is NOT visible**:
- Click the "Flashcards" button
- OR press `Ctrl+Shift+F` (Windows/Linux) or `Cmd+Shift+F` (Mac)

The panel should slide in from the right side.

---

### Step 2: Click on a Node

**This is the key step!**

1. Look at the mindmap canvas (the black area with white boxes)
2. Click on ANY node (white box with text)
3. For example, click on "Programming Fundamentals"

**What should happen**:
- The node gets selected (might change color or show a border)
- The flashcard panel updates to show flashcards for that node

---

### Step 3: View Flashcards

Once you've selected a node, the flashcard panel should show:
- **Number of flashcards** in the header (e.g., "Flashcards (3)")
- **List of flashcards** with questions
- **+ New Flashcard** button to add more

---

## 🐛 Troubleshooting

### Issue: "Select a node to manage flashcards"

**Cause**: No node is currently selected

**Solution**:
1. Click on any node in the mindmap
2. Make sure you click directly on the white box (not the background)
3. The panel should update immediately

---

### Issue: Nodes are hard to click

**Possible causes**:
1. Nodes are too small
2. Nodes are overlapping
3. Zoom level is too far out

**Solutions**:
1. Use the zoom controls (bottom-right) to zoom in
2. Use mouse wheel to zoom
3. Click and drag to pan the canvas
4. Use the minimap (bottom-right corner) to navigate

---

### Issue: Still no flashcards after clicking

**Debug steps**:
1. Open browser console (Press F12)
2. Click on a node
3. Look for any error messages
4. Check the Network tab for a request to `/api/flashcards`

**If you see an error**, please share it so I can help fix it.

---

## 🎯 Expected Behavior

### When you click "Programming Fundamentals":

**Flashcard Panel should show**:
```
Flashcards (3)

📝 What are variables, functions, and control flow?
   [Answer hidden - click to reveal]

📝 Why is skipping fundamentals dangerous?
   [Answer hidden - click to reveal]

📝 Real-world scenario: Debug a null pointer...
   [Answer hidden - click to reveal]

[+ New Flashcard]
```

---

## 🔍 How to Verify Everything is Working

### 1. Check Browser Console

Press F12 and look for these logs:
```
[useSyncMindmap] Loaded edges: Array(12)
[useSyncMindmap] Edges count: 12
```

This confirms edges are being loaded.

### 2. Check Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Click on a node
4. You should see a request to `/api/flashcards?where[nodeId][equals]=...`
5. The response should contain flashcard data

### 3. Check React DevTools (Optional)

If you have React DevTools installed:
1. Find the `FlashcardPanel` component
2. Check the `nodeId` prop
3. It should have a UUID value (not null)

---

## 📊 Understanding the Hierarchy

The mindmap shows a tree structure:

```
Foundation (root)
├─ Programming Fundamentals
├─ OOP Basics
│  └─ Advanced OOP
│     ├─ Architecture Patterns
│     └─ Refactoring Strategies
├─ Git Basics
│  └─ Advanced Git Workflows
├─ Debugging Fundamentals
│  └─ Advanced Debugging
│     └─ Production Debugging
└─ Testing Basics
   └─ TDD & Integration Testing
```

**Each node has 3 flashcards** covering:
1. Definition/concept
2. Common pitfalls
3. Real-world scenario

---

## ✅ Success Checklist

- [ ] Flashcard panel is visible (click "Flashcards" button if not)
- [ ] Clicked on a node in the mindmap
- [ ] Flashcard panel shows "Flashcards (3)" or similar
- [ ] Can see flashcard questions
- [ ] Can click on a flashcard to reveal the answer

---

## 🚀 Next Steps

1. **Try clicking different nodes** - each should show its own flashcards
2. **Test the review feature** - click on a flashcard to see the answer
3. **Create a new flashcard** - click "+ New Flashcard" button
4. **Navigate the hierarchy** - zoom and pan to see all nodes

---

**If you're still seeing "Select a node to manage flashcards" after clicking a node, please:**
1. Open browser console (F12)
2. Share any error messages
3. Check if the node actually gets selected (visual feedback)

I'm here to help debug further if needed!

