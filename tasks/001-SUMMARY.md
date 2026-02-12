# Task 001: Define Domain Models - Summary

## Status

📝 **Awaiting Human Approval**

## What This Task Does

Creates the foundational TypeScript types for the entire mindmap application in the `@mindmap/domain` package. These types will be shared across:

- Editor (web app)
- CMS (Payload)
- Sync layer
- Learning features
- Community features

## Why This Matters

1. **Single Source of Truth** - All parts of the app use the same type definitions
2. **Type Safety** - Prevents bugs from mismatched data structures
3. **Clear Contracts** - Defines what data looks like before implementing features
4. **Domain Separation** - Keeps bounded contexts clean (Editor, Content, Learning, Community, Sync)

## Key Design Decisions

### 1. Stable Node IDs

- `nodeId` is a **stable, immutable identifier**
- Per project rules: "Keep `nodeId` stable" (docs/How-AI-work.md)
- Once created, it never changes
- Used for references across domains (flashcards, comments, etc.)

### 2. Separation of Concerns

- **Tree structure** (parent-child) separate from **content** (rich text)
- **Position** (canvas x,y) separate from **metadata** (timestamps, author)
- **Learning** and **Community** domains reference nodes, don't own them

### 3. Framework Agnostic

- No React types
- No Payload-specific types
- Pure TypeScript interfaces/types
- Can be used in any context (web, CMS, CLI, etc.)

## Files to be Created

```
packages/domain/src/
├── index.ts                          # Export all types
└── types/
    ├── mindmap.ts                    # Mindmap, MindmapMetadata, MindmapStatus
    ├── node.ts                       # MindmapNode, NodeContent, NodePosition
    ├── tree.ts                       # MindmapTree, NodeEdge, EdgeType
    ├── learning.ts                   # Flashcard, SRSMetadata
    ├── community.ts                  # Comment, ModerationStatus
    ├── common.ts                     # Shared utility types
    └── __tests__/
        ├── mindmap.test.ts
        ├── node.test.ts
        ├── tree.test.ts
        ├── learning.test.ts
        └── community.test.ts
```

## What Happens After Approval

1. **BDD Scenarios** - Write Given/When/Then scenarios
2. **Test Plan** - Define unit tests for type validation
3. **Write Tests** - Create failing tests first
4. **Implementation** - Write the actual type definitions
5. **Tests Pass** - Ensure all tests green
6. **PR Checklist** - Self-check against docs/PR_CHECKLIST.md
7. **Human Verification** - Final review

## Next Tasks (After This One)

Once domain models are defined, we can:

1. **Task 002**: Create Payload CMS Collections
   - Use domain types to define CMS schema
   - Add access control and versioning
2. **Task 003**: Implement Sync Package
   - Use domain types for sync contracts
   - Handle editor ↔ CMS synchronization

3. **Task 004**: Build Editor Core
   - Use domain types for state management
   - Implement tree operations

## Questions to Consider

Before approving, consider:

1. **Are these the right core entities?**
   - Mindmap, Node, Tree, Flashcard, Comment
2. **Is the node structure correct?**
   - Stable nodeId
   - Separate content from structure
   - Position for canvas layout
3. **Do we need additional types?**
   - Tags/categories?
   - Attachments/media?
   - Collaboration metadata?
4. **Is the domain separation clear?**
   - Learning domain (flashcards, SRS)
   - Community domain (comments, moderation)
   - Content domain (nodes, trees)

## Approval Checklist

Before approving this task, verify:

- [ ] Domain model structure makes sense
- [ ] Bounded contexts are respected
- [ ] nodeId stability requirement is clear
- [ ] No framework-specific types
- [ ] Scope is appropriate (not too big, not too small)
- [ ] Acceptance criteria are testable
- [ ] Non-goals are explicit

---

## To Approve This Task

Reply with:

```
APPROVED: Task 001
```

Then AI will proceed with the workflow:

1. Write BDD scenarios
2. Write tests
3. Implement types
4. Verify all checks pass

## To Request Changes

Reply with specific feedback:

```
CHANGES REQUESTED: Task 001
- [specific change needed]
- [another change]
```

---

**Current Status**: 📝 Awaiting your approval to proceed
