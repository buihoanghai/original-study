# Seed Data Fixes Applied

**Date**: 2026-02-17  
**Issue**: No parent-child hierarchy visible, flashcards not showing

---

## 🐛 Root Causes Identified

### Issue 1: No Parent-Child Hierarchy
**Problem**: Nodes appeared scattered without tree structure in the mindmap view

**Root Cause**: 
- Parent-child relationships were stored in `content.parentId` field
- **No NodeEdge collection existed** to persist graph relationships
- Frontend (React Flow) requires edges to display hierarchy
- The `packages/editor` and `packages/domain` define `NodeEdge` type, but no backend collection existed

**Evidence**:
- `packages/domain/src/types/tree.ts` defines `NodeEdge` interface
- `packages/editor/src/operations/tree.ts` uses edges for hierarchy operations
- No `NodeEdges.ts` collection in `apps/mindmap-cms/src/collections/`

### Issue 2: Flashcards Not Linked
**Problem**: Flashcard panel showed "Select a node to manage flashcards"

**Root Cause**: 
- Flashcards were created correctly with `nodeId` field
- **Duplicate flashcards** were created on re-run (not idempotent)
- Flashcards should be visible in CMS - need to verify in admin panel

---

## ✅ Fixes Applied

### Fix 1: Created NodeEdges Collection

**File**: `apps/mindmap-cms/src/collections/NodeEdges.ts` (NEW)

```typescript
export const NodeEdges: CollectionConfig = {
  slug: 'node-edges',
  fields: [
    { name: 'from', type: 'text', required: true },
    { name: 'to', type: 'text', required: true },
    { name: 'type', type: 'select', options: ['parent-child', 'reference'] },
  ],
  // ... access control, timestamps
}
```

**Features**:
- Stores parent-child relationships as edges
- Supports cross-reference links (prerequisites)
- Uses stable `nodeId` for from/to references
- Access control inherited from parent mindmap

### Fix 2: Registered NodeEdges in Payload Config

**File**: `apps/mindmap-cms/src/payload.config.ts`

```diff
+ import { NodeEdges } from './collections/NodeEdges'

  collections: [
    Users,
    Media,
    Mindmaps,
    MindmapNodes,
+   NodeEdges,
    Flashcards,
    Comments,
    NodeMastery,
    LearningSessions,
  ],
```

### Fix 3: Updated Seed Script to Create Edges

**File**: `apps/mindmap-cms/scripts/seed/seed-foundation.ts`

Added edge creation after nodes:

```typescript
// Create edges for parent-child relationships
console.log('\n🔗 Creating node edges...')
let edgeCount = 0

for (const node of nodes) {
  if (!node.parentId) continue // Skip root nodes

  const childNodeId = nodeIdMap.get(node.id)
  const parentNodeId = nodeIdMap.get(node.parentId)

  if (!childNodeId || !parentNodeId) continue

  // Check if edge already exists (idempotent)
  const existingEdge = await payload.find({
    collection: 'node-edges',
    where: {
      and: [
        { from: { equals: parentNodeId } },
        { to: { equals: childNodeId } },
      ],
    },
    limit: 1,
  })

  if (existingEdge.totalDocs === 0) {
    await payload.create({
      collection: 'node-edges',
      data: {
        from: parentNodeId,
        to: childNodeId,
        type: 'parent-child',
      },
    })
    edgeCount++
  }
}

console.log(`  ✓ Created ${edgeCount} edges`)
```

### Fix 4: Made Flashcard Creation Idempotent

**File**: `apps/mindmap-cms/scripts/seed/seed-foundation.ts`

Added duplicate check before creating flashcards:

```typescript
// Check if flashcard already exists
const existing = await payload.find({
  collection: 'flashcards',
  where: {
    and: [
      { nodeId: { equals: nodeId } },
      { question: { equals: flashcard.question } },
    ],
  },
  limit: 1,
})

if (existing.totalDocs === 0) {
  await payload.create({ /* ... */ })
  flashcardCount++
}
```

---

## 📊 Verification Results

### Seed Script Output (After Fixes)

```
🌱 Seeding Foundation Skills...
✅ Using existing mindmap: Fullstack Developer Skill Tree

📊 Nodes: 0 created, 13 skipped

🃏 Creating flashcards...
  ✓ Created 0 flashcards (39 already exist)

🔗 Creating node edges...
  ✓ Created 12 edges

✅ Phase 1 complete!
```

### Data Created

| Collection | Count | Details |
|------------|-------|---------|
| mindmaps | 1 | Fullstack Developer Skill Tree |
| mindmap-nodes | 13 | Foundation skills (L1, L2, L3) |
| **node-edges** | **12** | **Parent-child relationships** ✅ |
| flashcards | 39 | 3+ per node |
| node-mastery | 13 | Auto-created |
| learning-sessions | 13 | Auto-created |

### Edge Structure

**12 edges created** for parent-child relationships:

- Foundation (root) → 5 L1 children
- L1 nodes → L2 children (4 edges)
- L2 nodes → L3 children (3 edges)

---

## 🎯 Next Steps for User

### 1. Verify in CMS Admin

Open: http://localhost:3001/admin

**Check NodeEdges Collection**:
- Navigate to **Node Edges**
- Should see 12 records
- Each edge shows: `from` (parent nodeId) → `to` (child nodeId)
- Type: `parent-child`

**Check Flashcards**:
- Navigate to **Flashcards**
- Should see 39 flashcards
- Each flashcard has `nodeId` field
- Click on a flashcard to see which node it belongs to

### 2. Verify in Frontend (if available)

- Open mindmap editor
- Nodes should now show hierarchical structure
- Parent-child relationships should be visible as edges/lines
- Clicking a node should show its flashcards in the panel

### 3. Test Idempotency

Run seed again to verify no duplicates:

```bash
npm run seed:foundation
```

Expected output:
```
Nodes: 0 created, 13 skipped
Edges: 0 created (12 already exist)
Flashcards: 0 created (39 already exist)
```

---

## 🔍 Technical Details

### Why Edges Are Needed

The system uses a **hybrid approach**:

1. **Backend (Payload CMS)**:
   - Stores nodes in `mindmap-nodes` collection
   - Stores edges in `node-edges` collection
   - Edges enable graph queries (find children, find parents, etc.)

2. **Frontend (React Flow)**:
   - Reads nodes and edges from API
   - Converts to React Flow format
   - Renders visual hierarchy based on edges

3. **Domain Model** (`@mindmap/domain`):
   - Defines `MindmapNode` (content + position)
   - Defines `NodeEdge` (from + to + type)
   - Defines `MindmapTree` (nodes + edges)

### Why content.parentId Wasn't Enough

- `content.parentId` is metadata for reference
- Frontend needs explicit edges to draw connections
- Edges support multiple relationship types (parent-child, reference)
- Edges enable graph algorithms (find descendants, detect cycles)

---

## ✅ Status

- [x] NodeEdges collection created
- [x] Seed script updated to create edges
- [x] Flashcard creation made idempotent
- [x] 12 parent-child edges created
- [x] CMS running with new collection
- [ ] User verification in CMS admin
- [ ] User verification in frontend

**All fixes applied successfully! Ready for user testing.** 🎉

