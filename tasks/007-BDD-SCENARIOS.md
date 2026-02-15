# Task 007: BDD Scenarios

**Behavior-Driven Development scenarios for Adaptive Learning Calendar**

---

## AC1: Auto-generate mastery record and initial session on node creation

### Scenario 1.1: Node creation triggers mastery record creation

```gherkin
Given a user is authenticated
And the user has a mindmap
When the user creates a new node "TypeScript Basics"
Then a NodeMastery record should be auto-created
And the mastery record should reference the node's stable nodeId
And the mastery level should be "new"
And the confidence should be 0
And the totalSessions should be 0
And the successRate should be 0
And the owner should be the current user
```

### Scenario 1.2: Node creation triggers initial learning session

```gherkin
Given a user is authenticated
And the user has a mindmap
When the user creates a new node "React Hooks"
Then a LearningSession should be auto-created
And the session should reference the node's stable nodeId
And the session type should be "learn"
And the session status should be "scheduled"
And the scheduledDate should be tomorrow (24 hours from now)
And the owner should be the current user
```

### Scenario 1.3: Hook respects user ownership

```gherkin
Given user Alice is authenticated
And user Bob is authenticated
When Alice creates a node "Python Basics"
Then the NodeMastery owner should be Alice
And the LearningSession owner should be Alice
And Bob should not be able to read Alice's mastery record
And Bob should not be able to read Alice's learning session
```

### Scenario 1.4: Hook only runs on node creation (not updates)

```gherkin
Given a user has created a node "GraphQL"
And a NodeMastery record exists for the node
And a LearningSession exists for the node
When the user updates the node content
Then no new NodeMastery record should be created
And no new LearningSession should be created
And existing records should remain unchanged
```

---

## AC2: Display weekly calendar view with scheduled sessions

### Scenario 2.1: Calendar displays current week by default

```gherkin
Given a user is authenticated
And today is Thursday, Feb 15, 2026
When the user navigates to /calendar
Then the calendar should display the week of Feb 12-18, 2026
And the calendar should show 7 days (Mon-Sun)
And Thursday (today) should be highlighted
```

### Scenario 2.2: Sessions are displayed on correct days

```gherkin
Given a user has 3 learning sessions
And session 1 is scheduled for Monday, Feb 12
And session 2 is scheduled for Wednesday, Feb 14
And session 3 is scheduled for Friday, Feb 16
When the user views the calendar for week of Feb 12-18
Then Monday should show session 1
And Wednesday should show session 2
And Friday should show session 3
And Tuesday, Thursday, Saturday, Sunday should show no sessions
```

### Scenario 2.3: Sessions are color-coded by type

```gherkin
Given a user has 4 sessions scheduled for today
And session 1 has type "learn"
And session 2 has type "review"
And session 3 has type "practice"
And session 4 has type "application"
When the user views the calendar
Then session 1 should display with blue color (learn)
And session 2 should display with green color (review)
And session 3 should display with yellow color (practice)
And session 4 should display with purple color (application)
```

### Scenario 2.4: Completed sessions show checkmark

```gherkin
Given a user has 2 sessions scheduled for today
And session 1 has status "completed"
And session 2 has status "scheduled"
When the user views the calendar
Then session 1 should display a checkmark icon
And session 2 should display a clock icon
```

### Scenario 2.5: Missed sessions show warning icon

```gherkin
Given a user has a session scheduled for yesterday
And the session status is "missed"
When the user views the calendar
Then the session should display a warning triangle icon
And the session should have a red accent color
```

### Scenario 2.6: User can navigate to previous/next week

```gherkin
Given a user is viewing the calendar for week of Feb 12-18
When the user clicks "Next Week"
Then the calendar should display week of Feb 19-25
When the user clicks "Prev Week"
Then the calendar should display week of Feb 12-18
```

---

## AC3: Complete a learning session and update mastery

### Scenario 3.1: User completes session with performance score

```gherkin
Given a user has a scheduled session for today
And the session references node "TypeScript Basics"
And the node has mastery level "new" with confidence 0
When the user clicks the session
And the user enters performance score 85
And the user clicks "Complete Session"
Then the session status should change to "completed"
And the session completedDate should be set to now
And the session performance should be 85
```

### Scenario 3.2: Session completion updates mastery statistics

```gherkin
Given a user completes a session with performance 85
And the node mastery has totalSessions = 0
And the node mastery has successRate = 0
When the mastery is updated
Then totalSessions should be 1
And successRate should be 85
And confidence should be calculated based on performance
And lastReviewed should be set to now
```

### Scenario 3.3: Mastery level upgrades from new to learning

```gherkin
Given a node has mastery level "new"
And the node has totalSessions = 2
When the user completes the 3rd session
Then the mastery level should upgrade to "learning"
```

### Scenario 3.4: Mastery level upgrades from learning to familiar

```gherkin
Given a node has mastery level "learning"
And the node has totalSessions = 4
And the node has confidence = 72
When the user completes the 5th session with performance 75
Then the mastery level should upgrade to "familiar"
```

### Scenario 3.5: Mastery level upgrades from familiar to mastered

```gherkin
Given a node has mastery level "familiar"
And the node has totalSessions = 9
And the node has confidence = 91
When the user completes the 10th session with performance 95
Then the mastery level should upgrade to "mastered"
```

### Scenario 3.6: Next review session is auto-scheduled

```gherkin
Given a user completes a session for a node
And the node mastery level is "new"
When the mastery is updated
Then a new LearningSession should be created
And the session type should be "review"
And the scheduledDate should be 1 day from now (new interval)
```

### Scenario 3.7: Review interval increases with mastery level

```gherkin
Given a node has mastery level "learning"
When a session is completed
Then the next session should be scheduled 3 days from now

Given a node has mastery level "familiar"
When a session is completed
Then the next session should be scheduled 7 days from now

Given a node has mastery level "mastered"
When a session is completed
Then the next session should be scheduled 30 days from now
```

---

## AC4: View mastery dashboard per mindmap

### Scenario 4.1: Dashboard displays all nodes grouped by mastery level

```gherkin
Given a user has 10 nodes with mastery records
And 2 nodes have level "new"
And 3 nodes have level "learning"
And 3 nodes have level "familiar"
And 2 nodes have level "mastered"
When the user navigates to /mastery
Then the dashboard should show 4 groups
And the "New" group should contain 2 nodes
And the "Learning" group should contain 3 nodes
And the "Familiar" group should contain 3 nodes
And the "Mastered" group should contain 2 nodes
```

### Scenario 4.2: Weak nodes are highlighted

```gherkin
Given a user has 5 nodes with mastery records
And node 1 has confidence 45 (low)
And node 2 has confidence 52 (low)
And node 3 has confidence 75 (normal)
And node 4 has confidence 88 (high)
And node 5 has confidence 92 (high)
When the user views the mastery dashboard
Then nodes 1 and 2 should be highlighted as "Needs Attention"
And nodes 3, 4, 5 should not be highlighted
```

### Scenario 4.3: Clicking a node shows detailed stats

```gherkin
Given a user is viewing the mastery dashboard
And a node "TypeScript Basics" has mastery data
When the user clicks the node
Then a detail modal should open
And the modal should show mastery level
And the modal should show confidence score
And the modal should show total sessions completed
And the modal should show success rate
And the modal should show last reviewed date
And the modal should show next review date
```

---

## AC5: Track daily streak

### Scenario 5.1: Streak increments when session completed

```gherkin
Given a user has a current streak of 5 days
And the user has not completed any sessions today
When the user completes a session today
Then the streak should increment to 6 days
```

### Scenario 5.2: Streak is maintained if already completed today

```gherkin
Given a user has a current streak of 5 days
And the user has already completed 1 session today
When the user completes another session today
Then the streak should remain 5 days (not increment again)
```

### Scenario 5.3: Streak resets to 0 if day is missed

```gherkin
Given a user has a current streak of 7 days
And the user's last completed session was 2 days ago
When the user views the calendar or mastery dashboard
Then the streak should be reset to 0 days
```

### Scenario 5.4: Streak starts at 1 on first completion

```gherkin
Given a new user has never completed a session
And the user has a streak of 0 days
When the user completes their first session
Then the streak should be set to 1 day
```

### Scenario 5.5: Streak is displayed on calendar and dashboard

```gherkin
Given a user has a current streak of 10 days
When the user views the calendar page
Then the streak should be displayed as "🔥 10 day streak"
When the user views the mastery dashboard
Then the streak should also be displayed as "🔥 10 day streak"
```

---

## AC6: Reschedule missed sessions

### Scenario 6.1: Sessions are marked as missed after deadline

```gherkin
Given a user has a session scheduled for yesterday
And the session status is "scheduled"
And the session was not completed
When the system runs the daily check (or user refreshes calendar)
Then the session status should change to "missed"
```

### Scenario 6.2: Missed sessions are auto-rescheduled

```gherkin
Given a user has 2 sessions marked as "missed"
And session 1 is for node "TypeScript" (confidence: 45)
And session 2 is for node "React" (confidence: 75)
When the system reschedules missed sessions
Then a new session should be created for "TypeScript" (weak node)
And a new session should be created for "React"
And the new sessions should be scheduled for today or tomorrow
```

### Scenario 6.3: Weak nodes are prioritized in rescheduling

```gherkin
Given a user has 3 missed sessions
And session 1 is for node with confidence 40 (weakest)
And session 2 is for node with confidence 60
And session 3 is for node with confidence 80 (strongest)
When the system reschedules with daily limit of 2 sessions
Then session 1 (confidence 40) should be rescheduled first
And session 2 (confidence 60) should be rescheduled second
And session 3 (confidence 80) should be rescheduled later
```

### Scenario 6.4: Rescheduling respects daily limits

```gherkin
Given a user has 5 missed sessions
And the daily session limit is 3
When the system reschedules missed sessions
Then only 3 sessions should be scheduled for today
And the remaining 2 sessions should be scheduled for tomorrow
```

### Scenario 6.5: Original missed sessions remain in history

```gherkin
Given a user has a missed session from yesterday
When the system reschedules the session
Then the original session should remain with status "missed"
And a new session should be created with status "scheduled"
And both sessions should reference the same nodeId
```

---

## Integration Scenarios

### Scenario I.1: End-to-end learning flow

```gherkin
Given a user creates a new node "Docker Basics"
Then a mastery record is created (level: new, confidence: 0)
And a session is scheduled for tomorrow

When tomorrow arrives
And the user views the calendar
Then the session is displayed on today's date

When the user completes the session with score 80
Then the session status becomes "completed"
And the mastery updates (totalSessions: 1, confidence: 80)
And a new session is scheduled for 1 day later (new interval)

When the user completes 2 more sessions (scores: 85, 90)
Then the mastery level upgrades to "learning"
And the next session is scheduled for 3 days later (learning interval)

When the user views the mastery dashboard
Then "Docker Basics" appears in the "Learning" group
And the confidence is displayed as 85%
```

### Scenario I.2: Multi-node mastery progression

```gherkin
Given a user creates 3 nodes: "TypeScript", "React", "Node.js"
Then 3 mastery records are created
And 3 sessions are scheduled for tomorrow

When the user completes all 3 sessions over time
And "TypeScript" reaches mastered level (10 sessions, 92% confidence)
And "React" reaches familiar level (6 sessions, 78% confidence)
And "Node.js" remains at learning level (4 sessions, 65% confidence)

When the user views the mastery dashboard
Then "TypeScript" appears in "Mastered" group with gold badge
And "React" appears in "Familiar" group with green badge
And "Node.js" appears in "Learning" group with blue badge
And "Node.js" is highlighted as "Needs Attention" (low confidence)
```

### Scenario I.3: Streak maintenance and recovery

```gherkin
Given a user has a 5-day streak
When the user completes sessions for 3 more consecutive days
Then the streak increases to 8 days

When the user misses a day (no sessions completed)
Then the streak resets to 0 days

When the user completes a session the next day
Then the streak starts again at 1 day
```

---

## Edge Cases

### Scenario E.1: Multiple sessions on same day

```gherkin
Given a user has 3 sessions scheduled for today
When the user completes all 3 sessions
Then all 3 sessions should have status "completed"
And the streak should only increment by 1 (not 3)
And each node's mastery should be updated independently
```

### Scenario E.2: Session completed before scheduled date

```gherkin
Given a user has a session scheduled for tomorrow
When the user completes the session today (early)
Then the session should be marked as "completed"
And the mastery should be updated normally
And the next session should be scheduled from today (not tomorrow)
```

### Scenario E.3: Node deleted with existing mastery and sessions

```gherkin
Given a user has a node with mastery record and sessions
When the user deletes the node
Then the mastery record should be deleted (or orphaned)
And the sessions should be deleted (or marked as invalid)
And the calendar should not display the deleted node's sessions
```

### Scenario E.4: User has no sessions scheduled

```gherkin
Given a new user with no nodes created
When the user views the calendar
Then the calendar should display an empty state
And the message should say "No sessions scheduled. Create a mindmap node to get started."
```

### Scenario E.5: Confidence calculation with varying performance

```gherkin
Given a node has 3 completed sessions
And session 1 had performance 60
And session 2 had performance 70
And session 3 had performance 90
When the mastery is calculated
Then the confidence should be weighted average
And recent performance (90) should have more weight
And the confidence should be approximately 75-80
```

---

**Total Scenarios**: 35 scenarios covering all 6 Acceptance Criteria + Integration + Edge Cases

**Next Step**: Create detailed test plan mapping these scenarios to unit/integration/E2E tests


