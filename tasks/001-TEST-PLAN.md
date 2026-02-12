# Task 001: Test Plan

## Overview

This test plan maps BDD scenarios to concrete unit tests for domain type validation.

## Test Structure

```
packages/domain/src/types/__tests__/
├── mindmap.test.ts      # AC1: Core Mindmap Types
├── node.test.ts         # AC2 & AC3: Node Types and Content
├── tree.test.ts         # AC4: Tree Structure Types
├── learning.test.ts     # AC5: Learning Domain Types
├── community.test.ts    # AC6: Community Domain Types
└── exports.test.ts      # AC7: Type Exports
```

---

## Test File 1: mindmap.test.ts

**Covers**: AC1 - Core Mindmap Types

### Tests:

1. `Mindmap type should have required fields`
   - Validates: id, metadata, status, ownerId fields exist
2. `MindmapMetadata type should have required fields`
   - Validates: title, description, created, updated fields exist
3. `MindmapStatus should be a union of valid statuses`
   - Validates: 'draft' | 'published' | 'archived'
4. `Mindmap type should accept valid status values`
   - Tests type compatibility with each status value

---

## Test File 2: node.test.ts

**Covers**: AC2 - Node Types with Stable ID, AC3 - Node Content Types

### Tests:

1. `MindmapNode should have stable nodeId of type string`
   - Validates: nodeId field exists and is string type
2. `MindmapNode should have required fields`
   - Validates: nodeId, content, position, metadata fields exist
3. `NodeContent should support text and rich text`
   - Validates: text, richText fields exist
4. `NodeContent should be separate from tree structure`
   - Validates: NodeContent has no parent/child references
5. `NodePosition should have x and y coordinates`
   - Validates: x, y fields exist and are numbers
6. `NodeMetadata should have timestamps and author`
   - Validates: created, updated, author fields exist

---

## Test File 3: tree.test.ts

**Covers**: AC4 - Tree Structure Types

### Tests:

1. `MindmapTree should have nodes and edges`
   - Validates: nodes, edges, rootId fields exist
2. `NodeEdge should have from and to references`
   - Validates: from, to, type fields exist
3. `EdgeType should be parent-child or reference`
   - Validates: 'parent-child' | 'reference' union type
4. `NodeEdge should reference nodes by nodeId`
   - Validates: from and to are string types (nodeId references)

---

## Test File 4: learning.test.ts

**Covers**: AC5 - Learning Domain Types

### Tests:

1. `Flashcard should have required fields`
   - Validates: id, nodeId, question, answer fields exist
2. `Flashcard should reference node via nodeId`
   - Validates: nodeId field is string type
3. `SRSMetadata should have spaced repetition fields`
   - Validates: interval, ease, nextReview fields exist
4. `SRSMetadata interval should be number`
   - Validates: interval is numeric type
5. `SRSMetadata nextReview should be Date`
   - Validates: nextReview is Date type

---

## Test File 5: community.test.ts

**Covers**: AC6 - Community Domain Types

### Tests:

1. `Comment should have required fields`
   - Validates: id, nodeId, content, author, status fields exist
2. `Comment should reference node via nodeId`
   - Validates: nodeId field is string type
3. `ModerationStatus should be valid enum values`
   - Validates: 'pending' | 'approved' | 'rejected' union type
4. `Comment status should accept ModerationStatus values`
   - Tests type compatibility with each status value

---

## Test File 6: exports.test.ts

**Covers**: AC7 - Type Exports

### Tests:

1. `All mindmap types should be exported`
   - Validates: Mindmap, MindmapMetadata, MindmapStatus are importable
2. `All node types should be exported`
   - Validates: MindmapNode, NodeContent, NodePosition, NodeMetadata are importable
3. `All tree types should be exported`
   - Validates: MindmapTree, NodeEdge, EdgeType are importable
4. `All learning types should be exported`
   - Validates: Flashcard, SRSMetadata are importable
5. `All community types should be exported`
   - Validates: Comment, ModerationStatus are importable

---

## Test Approach

Since these are TypeScript types (not runtime values), tests will:

1. **Type Assertion Tests**: Use TypeScript's type system to validate structure
2. **Mock Object Tests**: Create mock objects that satisfy the types
3. **Type Guard Tests**: Verify type compatibility and assignability

### Example Test Pattern:

```typescript
import { describe, it, expect } from 'vitest'
import type { MindmapNode } from '../node'

describe('MindmapNode', () => {
  it('should have stable nodeId of type string', () => {
    const mockNode: MindmapNode = {
      nodeId: 'node-123',
      content: { text: 'Test' },
      position: { x: 0, y: 0 },
      metadata: { created: new Date(), updated: new Date() },
    }

    expect(mockNode.nodeId).toBeDefined()
    expect(typeof mockNode.nodeId).toBe('string')
  })
})
```

---

## Coverage Summary

| AC        | Scenarios | Test File         | Test Count       |
| --------- | --------- | ----------------- | ---------------- |
| AC1       | 2         | mindmap.test.ts   | 4                |
| AC2       | 3         | node.test.ts      | 6                |
| AC3       | 2         | node.test.ts      | (included above) |
| AC4       | 3         | tree.test.ts      | 4                |
| AC5       | 3         | learning.test.ts  | 5                |
| AC6       | 3         | community.test.ts | 4                |
| AC7       | 2         | exports.test.ts   | 5                |
| **Total** | **15**    | **6 files**       | **~28 tests**    |

---

## Next Step

Write the actual test files with failing tests (no implementation yet).
