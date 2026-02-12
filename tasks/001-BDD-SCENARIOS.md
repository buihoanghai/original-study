# Task 001: BDD Scenarios

## AC1: Core Mindmap Types

### Scenario 1.1: Import mindmap types

```gherkin
Given a developer imports from "@mindmap/domain"
When they access mindmap types
Then "Mindmap" type should be available
And "MindmapMetadata" type should be available
And "MindmapStatus" type should be available
```

### Scenario 1.2: Mindmap status enum

```gherkin
Given a mindmap status is defined
When the status values are checked
Then it should include "draft"
And it should include "published"
And it should include "archived"
```

---

## AC2: Node Types with Stable ID

### Scenario 2.1: Node has stable nodeId

```gherkin
Given a mindmap node type is defined
When the node structure is examined
Then it must have a "nodeId" field
And the "nodeId" must be of type string
And the "nodeId" must be required (not optional)
```

### Scenario 2.2: Node has required fields

```gherkin
Given a mindmap node type is defined
When the node structure is examined
Then it must have a "content" field
And it must have a "position" field
And it must have a "metadata" field
```

### Scenario 2.3: NodeId immutability contract

```gherkin
Given a node with a nodeId is created
When the node is used in the system
Then the nodeId should never be reassigned
And the nodeId should serve as a stable identifier
```

---

## AC3: Node Content Types

### Scenario 3.1: NodeContent structure

```gherkin
Given a NodeContent type is defined
When the content structure is examined
Then it should support text content
And it should support rich text formatting
And it should support metadata
```

### Scenario 3.2: Content separation from structure

```gherkin
Given node content and tree structure
When types are examined
Then NodeContent should be a separate type
And NodeContent should not contain tree relationships
And NodeContent should not contain position data
```

---

## AC4: Tree Structure Types

### Scenario 4.1: MindmapTree structure

```gherkin
Given a MindmapTree type is defined
When the tree structure is examined
Then it should include a collection of nodes
And it should include a collection of edges
And it should have a root node identifier
```

### Scenario 4.2: Parent-child relationships

```gherkin
Given a NodeEdge type is defined
When edge relationships are examined
Then edges should have a "from" node reference
And edges should have a "to" node reference
And edges should have an edge type
```

### Scenario 4.3: Edge types

```gherkin
Given an EdgeType is defined
When edge type values are checked
Then it should include "parent-child" type
And it should include "reference" type
```

---

## AC5: Learning Domain Types

### Scenario 5.1: Flashcard structure

```gherkin
Given a Flashcard type is defined
When the flashcard structure is examined
Then it should have an "id" field
And it should have a "nodeId" reference field
And it should have a "question" field
And it should have an "answer" field
```

### Scenario 5.2: SRS metadata structure

```gherkin
Given an SRSMetadata type is defined
When the SRS structure is examined
Then it should have an "interval" field for spacing
And it should have an "ease" factor field
And it should have a "nextReview" date field
```

### Scenario 5.3: Flashcard references node via nodeId

```gherkin
Given a Flashcard type is defined
When the flashcard-node relationship is examined
Then the flashcard should reference a node via "nodeId"
And the "nodeId" should be of type string
And the reference should be stable (not change)
```

---

## AC6: Community Domain Types

### Scenario 6.1: Comment structure

```gherkin
Given a Comment type is defined
When the comment structure is examined
Then it should have an "id" field
And it should have a "nodeId" reference field
And it should have a "content" field
And it should have an "author" field
And it should have a "status" field for moderation
```

### Scenario 6.2: Moderation status enum

```gherkin
Given a ModerationStatus type is defined
When moderation status values are checked
Then it should include "pending"
And it should include "approved"
And it should include "rejected"
```

### Scenario 6.3: Comment references node via nodeId

```gherkin
Given a Comment type is defined
When the comment-node relationship is examined
Then the comment should reference a node via "nodeId"
And the "nodeId" should be of type string
And the reference should be stable (not change)
```

---

## AC7: Type Exports

### Scenario 7.1: All types exported from index

```gherkin
Given the @mindmap/domain package
When a developer imports from the package
Then all mindmap types should be exported from index.ts
And all node types should be exported from index.ts
And all tree types should be exported from index.ts
And all learning types should be exported from index.ts
And all community types should be exported from index.ts
```

### Scenario 7.2: Named exports available

```gherkin
Given the @mindmap/domain package
When a developer uses named imports
Then they can import { Mindmap } from "@mindmap/domain"
And they can import { MindmapNode } from "@mindmap/domain"
And they can import { Flashcard } from "@mindmap/domain"
And they can import { Comment } from "@mindmap/domain"
```

---

## Summary

**Total Scenarios**: 15 scenarios covering all 7 acceptance criteria

**Coverage**:

- AC1: 2 scenarios (Core Mindmap Types)
- AC2: 3 scenarios (Node Types with Stable ID)
- AC3: 2 scenarios (Node Content Types)
- AC4: 3 scenarios (Tree Structure Types)
- AC5: 3 scenarios (Learning Domain Types)
- AC6: 3 scenarios (Community Domain Types)
- AC7: 2 scenarios (Type Exports)

**Next Step**: Create test plan mapping these scenarios to unit tests
