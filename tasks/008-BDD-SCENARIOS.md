# Task 008: BDD Scenarios

**Behavior-Driven Development scenarios for Skill Progress Tracking System**

---

## AC1: Add skill status field to nodes

### Scenario 1.1: User sets skill status on node creation

```gherkin
Given a user is authenticated
And the user has a mindmap
When the user creates a new node "HTTP Lifecycle"
And the user opens the node editor
Then the editor should display a status dropdown
And the dropdown should have options: "Not Started", "In Progress", "Completed"
And the default value should be "Not Started"
```

### Scenario 1.2: User changes skill status on existing node

```gherkin
Given a user has a node "REST Principles" with status "Not Started"
When the user opens the node editor
And the user selects "In Progress" from the status dropdown
And the user saves the node
Then the node's skill.status should be "in-progress"
And the node should display an in-progress badge
```

### Scenario 1.3: Status field is optional (backward compatibility)

```gherkin
Given a user has an existing node "Old Node" created before Task 008
When the user views the node
Then the node should display without errors
And the node should not have a status badge
And the node's skill metadata should be undefined
```

### Scenario 1.4: User cycles through statuses with keyboard

```gherkin
Given a user has selected a node "Middleware" with status "not-started"
When the user presses the "S" key
Then the status should change to "in-progress"
When the user presses the "S" key again
Then the status should change to "completed"
When the user presses the "S" key again
Then the status should cycle back to "not-started"
```

---

## AC2: Calculate mastery percentage from flashcard performance

### Scenario 2.1: Node with no flashcards has 0% mastery

```gherkin
Given a user has a node "TypeScript Basics"
And the node has no flashcards
When the system calculates mastery
Then the mastery percentage should be 0
```

### Scenario 2.2: Node with new flashcards has low mastery

```gherkin
Given a user has a node "React Hooks"
And the node has 3 flashcards
And all flashcards have default SRS (ease=2.5, interval=1)
When the system calculates mastery
Then the average ease should be 2.5
And the mastery percentage should be 100 (normalized from ease 2.5)
```

### Scenario 2.3: Node with reviewed flashcards shows accurate mastery

```gherkin
Given a user has a node "GraphQL"
And the node has 4 flashcards
And flashcard 1 has ease=3.0 (reviewed well)
And flashcard 2 has ease=2.8
And flashcard 3 has ease=2.2 (struggled)
And flashcard 4 has ease=1.5 (very difficult)
When the system calculates mastery
Then the average ease should be 2.375
And the mastery percentage should be approximately 90%
```

### Scenario 2.4: Mastery calculation formula is correct

```gherkin
Given the mastery formula is: (avgEase - 1.3) / (2.5 - 1.3) * 100
When a node has average ease of 1.3 (minimum)
Then mastery should be 0%
When a node has average ease of 2.5 (default)
Then mastery should be 100%
When a node has average ease of 1.9 (midpoint)
Then mastery should be 50%
When a node has average ease of 3.0 (excellent)
Then mastery should be clamped to 100%
```

### Scenario 2.5: Mastery updates when flashcard is reviewed

```gherkin
Given a user has a node "REST API" with 2 flashcards
And current mastery is 80%
When the user reviews a flashcard and rates it "Hard" (rating=1)
And the flashcard's ease decreases from 2.5 to 2.3
Then the system should recalculate mastery
And the new mastery should be lower than 80%
And the node should display the updated mastery percentage
```

---

## AC3: Display status badge on nodes

### Scenario 3.1: Not-started status shows gray badge

```gherkin
Given a user has a node "Python Basics" with status "not-started"
When the user views the mindmap
Then the node should display a badge "⬜"
And the badge color should be gray (#9CA3AF)
And the badge should be positioned at top-right of the node
```

### Scenario 3.2: In-progress status shows blue badge

```gherkin
Given a user has a node "Docker" with status "in-progress"
When the user views the mindmap
Then the node should display a badge "🔄"
And the badge color should be blue (#3B82F6)
```

### Scenario 3.3: Completed status shows green badge

```gherkin
Given a user has a node "Git Basics" with status "completed"
When the user views the mindmap
Then the node should display a badge "✅"
And the badge color should be green (#10B981)
```

### Scenario 3.4: Badge size and position are correct

```gherkin
Given a user has a node with any status
When the badge is rendered
Then the badge should be 16x16 pixels
And the badge should be positioned at top-right corner
And the badge should not overlap with node text
```

---

## AC4: Display mastery progress bar

### Scenario 4.1: Progress bar shows on node hover

```gherkin
Given a user has a node "JavaScript" with 3 flashcards
And the node has 60% mastery
When the user hovers over the node
Then a progress bar should appear below the node text
And the progress bar should be 100px wide and 4px tall
And the progress bar should be filled 60% with color
```

### Scenario 4.2: Progress bar color gradient is correct

```gherkin
Given a user has nodes with different mastery levels
When a node has 0-30% mastery
Then the progress bar should be red
When a node has 31-70% mastery
Then the progress bar should be yellow/orange
When a node has 71-100% mastery
Then the progress bar should be green
```

### Scenario 4.3: Progress bar shows on node selection

```gherkin
Given a user has a node "CSS Grid" with 45% mastery
When the user clicks to select the node
Then the progress bar should be visible
And the progress bar should show "45%" text
And the bar should remain visible while node is selected
```

### Scenario 4.4: Nodes without flashcards show empty progress bar

```gherkin
Given a user has a node "New Skill" with no flashcards
When the user hovers over the node
Then the progress bar should appear
And the progress bar should be empty (0% filled)
And the bar should show "0%" text
```

---

## AC5: Filter skills by status

### Scenario 5.1: User opens filter panel

```gherkin
Given a user is viewing a mindmap
When the user presses "Ctrl+Shift+S"
Then the skill filter panel should slide in from the right
And the panel should show status options: "All", "Not Started", "In Progress", "Completed"
And "All" should be selected by default
```

### Scenario 5.2: Filter by "In Progress" status

```gherkin
Given a user has a mindmap with 10 nodes
And 3 nodes have status "in-progress"
And 4 nodes have status "not-started"
And 3 nodes have status "completed"
When the user opens the filter panel
And the user selects "In Progress"
Then only the 3 in-progress nodes should be highlighted
And other nodes should be dimmed (opacity 0.3)
```

### Scenario 5.3: Filter by "Completed" status

```gherkin
Given a user has a mindmap with skills at various statuses
When the user filters by "Completed"
Then only completed nodes should be fully visible
And the filter panel should show count: "Completed (5)"
```

### Scenario 5.4: Clear filter shows all nodes

```gherkin
Given a user has applied a filter "In Progress"
And some nodes are dimmed
When the user selects "All" in the filter panel
Then all nodes should return to full opacity
And no nodes should be dimmed
```

### Scenario 5.5: Close filter panel with Esc

```gherkin
Given the filter panel is open
When the user presses "Esc"
Then the filter panel should close
And any applied filters should remain active
```

---

## AC6: Auto-update status based on mastery

### Scenario 6.1: Status auto-updates to completed at 80% mastery

```gherkin
Given a user has a node "Express.js" with status "in-progress"
And the node has 5 flashcards
And current mastery is 75%
When the user reviews flashcards and mastery reaches 80%
Then the system should auto-update status to "completed"
And the node should display the completed badge "✅"
```

### Scenario 6.2: Auto-update only happens if status is not already completed

```gherkin
Given a user has a node "MongoDB" with status "completed"
And mastery drops to 70% (user forgot some concepts)
When the system recalculates mastery
Then the status should remain "completed"
And the system should NOT downgrade the status
```

### Scenario 6.3: Auto-update respects manual status changes

```gherkin
Given a user has a node "Redis" with status "in-progress"
And mastery reaches 85%
And the system auto-updates status to "completed"
When the user manually changes status back to "in-progress"
Then the status should be "in-progress"
And the system should NOT auto-update again until user changes it
```

### Scenario 6.4: Auto-update triggers on flashcard review

```gherkin
Given a user has a node "PostgreSQL" with status "in-progress"
And current mastery is 78%
When the user reviews 2 flashcards and rates them "Easy"
And mastery increases to 82%
Then the status should auto-update to "completed"
And the user should see a notification: "Skill completed! 🎉"
```

---

## Edge Cases and Error Handling

### Scenario E1: Handle nodes with skill metadata but no flashcards

```gherkin
Given a user has a node with status "in-progress"
But the node has no flashcards
When the system calculates mastery
Then mastery should be 0%
And the progress bar should be empty
And no errors should occur
```

### Scenario E2: Handle invalid status values

```gherkin
Given a node has an invalid status value "invalid-status" (data corruption)
When the system renders the node
Then the node should display without errors
And the status should default to "not-started"
And a warning should be logged to console
```

### Scenario E3: Handle concurrent status updates

```gherkin
Given a user has a node open in two browser tabs
When the user changes status to "in-progress" in tab 1
And simultaneously changes status to "completed" in tab 2
Then the last write should win (optimistic locking)
And both tabs should sync to the same status
```

---

## Integration Scenarios

### Scenario I1: Status and mastery work together

```gherkin
Given a user creates a new node "Kubernetes"
When the user sets status to "in-progress"
And the user creates 5 flashcards
And the user reviews flashcards over 2 weeks
And mastery reaches 85%
Then the status should auto-update to "completed"
And the node should show both completed badge and 85% progress bar
```

### Scenario I2: Filter and mastery display work together

```gherkin
Given a user has 20 nodes with various statuses
When the user filters by "In Progress"
And hovers over a filtered node
Then the progress bar should display correctly
And the mastery percentage should be visible
```

### Scenario I3: Keyboard shortcuts work in all contexts

```gherkin
Given a user is viewing a mindmap
When the user presses "S" to cycle status
Then the status should change
When the user presses "Ctrl+Shift+S" to open filter
Then the filter panel should open
And the "S" key should no longer cycle status (panel has focus)
When the user presses "Esc" to close filter
Then the "S" key should cycle status again
```

---

## Performance Scenarios

### Scenario P1: Mastery calculation is efficient for large mindmaps

```gherkin
Given a user has a mindmap with 500 nodes
And 300 nodes have flashcards (average 5 flashcards each)
When the user views the mindmap
Then all mastery percentages should be calculated within 2 seconds
And the UI should remain responsive
```

### Scenario P2: Filter performance with many nodes

```gherkin
Given a user has a mindmap with 1000 nodes
When the user applies a status filter
Then the filter should apply within 500ms
And the UI should not freeze
```

---

## Accessibility Scenarios

### Scenario A1: Status badges have accessible labels

```gherkin
Given a user is using a screen reader
When the user navigates to a node with status "in-progress"
Then the screen reader should announce "In Progress"
And the badge should have aria-label="In Progress"
```

### Scenario A2: Progress bar has accessible text

```gherkin
Given a user is using a screen reader
When the user focuses on a node with 75% mastery
Then the screen reader should announce "Mastery: 75 percent"
And the progress bar should have role="progressbar" and aria-valuenow="75"
```

### Scenario A3: Keyboard navigation works for all features

```gherkin
Given a user is navigating with keyboard only (no mouse)
When the user tabs through the interface
Then the user can reach: status dropdown, filter panel, all nodes
And all interactive elements should have visible focus indicators
And all keyboard shortcuts should work as documented
```

---

## Summary

**Total Scenarios**: 35
- AC1 (Status field): 4 scenarios
- AC2 (Mastery calculation): 5 scenarios
- AC3 (Status badges): 4 scenarios
- AC4 (Progress bar): 4 scenarios
- AC5 (Filtering): 5 scenarios
- AC6 (Auto-update): 4 scenarios
- Edge cases: 3 scenarios
- Integration: 3 scenarios
- Performance: 2 scenarios
- Accessibility: 3 scenarios

**Coverage**: All 6 acceptance criteria + edge cases + non-functional requirements

