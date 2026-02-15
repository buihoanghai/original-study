# Task 007: Test Plan

**Test-Driven Development plan for Adaptive Learning Calendar**

---

## Overview

This test plan maps BDD scenarios to concrete tests following TDD methodology:
1. Write failing tests first
2. Implement minimal code to pass tests
3. Refactor while keeping tests green

---

## Test Structure

```
packages/domain/src/types/__tests__/
├── learning-session.test.ts    # Domain types for sessions
├── mastery.test.ts             # Domain types for mastery
└── schedule.test.ts            # Domain types for scheduling

packages/scheduler/src/__tests__/
├── scheduler.test.ts           # Scheduling logic
├── mastery-calculator.test.ts  # Mastery calculation
└── interval-calculator.test.ts # Review interval logic

apps/mindmap-cms/src/__tests__/
├── collections/
│   ├── learning-sessions.test.ts  # Collection schema
│   └── node-mastery.test.ts       # Collection schema
├── hooks/
│   └── node-creation-hook.test.ts # Auto-generation hook
└── api/
    ├── sessions-api.test.ts       # CRUD operations
    └── mastery-api.test.ts        # CRUD operations

apps/mindmap-web/lib/__tests__/
├── session-api.test.ts         # Frontend API client
└── mastery-api.test.ts         # Frontend API client

apps/mindmap-web/components/__tests__/
├── CalendarView.test.tsx       # Calendar component
├── SessionExecutor.test.tsx    # Session completion
├── MasteryDashboard.test.tsx   # Mastery display
└── StreakTracker.test.tsx      # Streak tracking

apps/mindmap-web/e2e/
├── learning-flow.spec.ts       # End-to-end integration
├── calendar.spec.ts            # Calendar interactions
├── mastery.spec.ts             # Mastery dashboard
└── streak.spec.ts              # Streak tracking
```

---

## Phase 1: Domain Types Tests (TDD)

### File: `packages/domain/src/types/__tests__/learning-session.test.ts`

**Covers**: AC1, AC2, AC3 - Session type validation

#### Tests:

```typescript
describe('LearningSession type', () => {
  it('should have required fields', () => {
    // Scenario 1.2: Session structure
    const session: LearningSession = {
      sessionId: 'session_123',
      nodeId: 'node_abc',
      type: 'learn',
      scheduledDate: new Date(),
      status: 'scheduled',
    }
    expect(session.sessionId).toBeDefined()
    expect(session.nodeId).toBeDefined()
    expect(session.type).toBeDefined()
  })

  it('should accept valid session types', () => {
    // Scenario 2.3: Color-coded by type
    const types: SessionType[] = ['learn', 'review', 'practice', 'application']
    types.forEach(type => {
      const session: LearningSession = {
        sessionId: 'session_123',
        nodeId: 'node_abc',
        type,
        scheduledDate: new Date(),
        status: 'scheduled',
      }
      expect(session.type).toBe(type)
    })
  })

  it('should accept valid session statuses', () => {
    // Scenario 2.4, 2.5: Status icons
    const statuses: SessionStatus[] = ['scheduled', 'completed', 'skipped', 'missed']
    statuses.forEach(status => {
      const session: LearningSession = {
        sessionId: 'session_123',
        nodeId: 'node_abc',
        type: 'learn',
        scheduledDate: new Date(),
        status,
      }
      expect(session.status).toBe(status)
    })
  })

  it('should support optional performance and duration', () => {
    // Scenario 3.1: Performance score
    const session: LearningSession = {
      sessionId: 'session_123',
      nodeId: 'node_abc',
      type: 'learn',
      scheduledDate: new Date(),
      status: 'completed',
      performance: 85,
      duration: 15,
    }
    expect(session.performance).toBe(85)
    expect(session.duration).toBe(15)
  })
})
```

### File: `packages/domain/src/types/__tests__/mastery.test.ts`

**Covers**: AC3, AC4 - Mastery type validation

#### Tests:

```typescript
describe('NodeMastery type', () => {
  it('should have required fields', () => {
    // Scenario 1.1: Mastery structure
    const mastery: NodeMastery = {
      nodeId: 'node_abc',
      level: 'new',
      confidence: 0,
      totalSessions: 0,
      successRate: 0,
      nextReviewDate: new Date(),
    }
    expect(mastery.nodeId).toBeDefined()
    expect(mastery.level).toBeDefined()
    expect(mastery.confidence).toBeDefined()
  })

  it('should accept valid mastery levels', () => {
    // Scenario 3.3-3.5: Level upgrades
    const levels: MasteryLevel[] = ['new', 'learning', 'familiar', 'mastered']
    levels.forEach(level => {
      const mastery: NodeMastery = {
        nodeId: 'node_abc',
        level,
        confidence: 0,
        totalSessions: 0,
        successRate: 0,
        nextReviewDate: new Date(),
      }
      expect(mastery.level).toBe(level)
    })
  })

  it('should support confidence as number 0-100', () => {
    // Scenario 4.2: Confidence scores
    const mastery: NodeMastery = {
      nodeId: 'node_abc',
      level: 'learning',
      confidence: 75,
      totalSessions: 5,
      successRate: 80,
      nextReviewDate: new Date(),
    }
    expect(mastery.confidence).toBeGreaterThanOrEqual(0)
    expect(mastery.confidence).toBeLessThanOrEqual(100)
  })
})
```

### File: `packages/domain/src/types/__tests__/schedule.test.ts`

**Covers**: AC5, AC6 - Schedule type validation

#### Tests:

```typescript
describe('WeeklyTarget type', () => {
  it('should have required fields', () => {
    const target: WeeklyTarget = {
      weekStartDate: new Date(),
      targetSessions: 7,
      completedSessions: 5,
      streak: 10,
    }
    expect(target.streak).toBeDefined()
    expect(target.targetSessions).toBeDefined()
  })
})

describe('DailyPlan type', () => {
  it('should contain sessions array', () => {
    const plan: DailyPlan = {
      date: new Date(),
      sessions: [],
      completed: false,
    }
    expect(Array.isArray(plan.sessions)).toBe(true)
  })
})
```

---

## Phase 2: Scheduler Package Tests (TDD)

### File: `packages/scheduler/src/__tests__/mastery-calculator.test.ts`

**Covers**: AC3 - Mastery calculation logic

#### Tests:

```typescript
describe('updateMastery', () => {
  it('should increment totalSessions on completion', () => {
    // Scenario 3.2: Update statistics
    const current: NodeMastery = {
      nodeId: 'node_abc',
      level: 'new',
      confidence: 0,
      totalSessions: 0,
      successRate: 0,
      nextReviewDate: new Date(),
    }
    const updated = updateMastery(current, 85)
    expect(updated.totalSessions).toBe(1)
  })

  it('should calculate success rate correctly', () => {
    // Scenario 3.2: Success rate calculation
    const current: NodeMastery = {
      nodeId: 'node_abc',
      level: 'new',
      confidence: 0,
      totalSessions: 2,
      successRate: 70, // avg of previous sessions
      nextReviewDate: new Date(),
    }
    const updated = updateMastery(current, 90)
    // (70*2 + 90) / 3 = 76.67
    expect(updated.successRate).toBeCloseTo(76.67, 1)
  })

  it('should upgrade level from new to learning after 3 sessions', () => {
    // Scenario 3.3: Level upgrade
    const current: NodeMastery = {
      nodeId: 'node_abc',
      level: 'new',
      confidence: 75,
      totalSessions: 2,
      successRate: 75,
      nextReviewDate: new Date(),
    }
    const updated = updateMastery(current, 80)
    expect(updated.level).toBe('learning')
    expect(updated.totalSessions).toBe(3)
  })

  it('should upgrade level from learning to familiar', () => {
    // Scenario 3.4: Level upgrade
    const current: NodeMastery = {
      nodeId: 'node_abc',
      level: 'learning',
      confidence: 72,
      totalSessions: 4,
      successRate: 72,
      nextReviewDate: new Date(),
    }
    const updated = updateMastery(current, 75)
    expect(updated.level).toBe('familiar')
    expect(updated.confidence).toBeGreaterThanOrEqual(70)
  })

  it('should upgrade level from familiar to mastered', () => {
    // Scenario 3.5: Level upgrade
    const current: NodeMastery = {
      nodeId: 'node_abc',
      level: 'familiar',
      confidence: 91,
      totalSessions: 9,
      successRate: 91,
      nextReviewDate: new Date(),
    }
    const updated = updateMastery(current, 95)
    expect(updated.level).toBe('mastered')
    expect(updated.confidence).toBeGreaterThanOrEqual(90)
    expect(updated.totalSessions).toBeGreaterThanOrEqual(10)
  })
})
```

### File: `packages/scheduler/src/__tests__/interval-calculator.test.ts`

**Covers**: AC3, AC6 - Review interval calculation

#### Tests:

```typescript
describe('calculateNextReviewDate', () => {
  it('should schedule 1 day for new level', () => {
    // Scenario 3.7: Review intervals
    const mastery: NodeMastery = {
      nodeId: 'node_abc',
      level: 'new',
      confidence: 50,
      totalSessions: 1,
      successRate: 50,
      nextReviewDate: new Date(),
    }
    const nextDate = calculateNextReviewDate(mastery)
    const expectedDate = addDays(new Date(), 1)
    expect(isSameDay(nextDate, expectedDate)).toBe(true)
  })

  it('should schedule 3 days for learning level', () => {
    // Scenario 3.7: Review intervals
    const mastery: NodeMastery = {
      nodeId: 'node_abc',
      level: 'learning',
      confidence: 70,
      totalSessions: 4,
      successRate: 70,
      nextReviewDate: new Date(),
    }
    const nextDate = calculateNextReviewDate(mastery)
    const expectedDate = addDays(new Date(), 3)
    expect(isSameDay(nextDate, expectedDate)).toBe(true)
  })

  it('should schedule 7 days for familiar level', () => {
    const mastery: NodeMastery = {
      nodeId: 'node_abc',
      level: 'familiar',
      confidence: 80,
      totalSessions: 7,
      successRate: 80,
      nextReviewDate: new Date(),
    }
    const nextDate = calculateNextReviewDate(mastery)
    const expectedDate = addDays(new Date(), 7)
    expect(isSameDay(nextDate, expectedDate)).toBe(true)
  })

  it('should schedule 30 days for mastered level', () => {
    const mastery: NodeMastery = {
      nodeId: 'node_abc',
      level: 'mastered',
      confidence: 95,
      totalSessions: 12,
      successRate: 95,
      nextReviewDate: new Date(),
    }
    const nextDate = calculateNextReviewDate(mastery)
    const expectedDate = addDays(new Date(), 30)
    expect(isSameDay(nextDate, expectedDate)).toBe(true)
  })
})

describe('rescheduleSession', () => {
  it('should prioritize weak nodes', () => {
    // Scenario 6.3: Weak node priority
    const sessions: LearningSession[] = [
      { nodeId: 'node_1', confidence: 40, scheduledDate: yesterday() },
      { nodeId: 'node_2', confidence: 60, scheduledDate: yesterday() },
      { nodeId: 'node_3', confidence: 80, scheduledDate: yesterday() },
    ]
    const rescheduled = prioritizeSessions(sessions)
    expect(rescheduled[0].nodeId).toBe('node_1') // weakest first
    expect(rescheduled[1].nodeId).toBe('node_2')
    expect(rescheduled[2].nodeId).toBe('node_3')
  })

  it('should respect daily limits', () => {
    // Scenario 6.4: Daily limits
    const missedSessions = createMissedSessions(5)
    const rescheduled = rescheduleWithLimit(missedSessions, 3)
    const today = rescheduled.filter(s => isToday(s.scheduledDate))
    const tomorrow = rescheduled.filter(s => isTomorrow(s.scheduledDate))
    expect(today.length).toBe(3)
    expect(tomorrow.length).toBe(2)
  })
})
```

### File: `packages/scheduler/src/__tests__/streak-calculator.test.ts`

**Covers**: AC5 - Streak tracking logic

#### Tests:

```typescript
describe('updateStreak', () => {
  it('should increment streak on first completion of the day', () => {
    // Scenario 5.1: Streak increment
    const currentStreak = 5
    const lastCompletedDate = yesterday()
    const newStreak = updateStreak(currentStreak, lastCompletedDate, new Date())
    expect(newStreak).toBe(6)
  })

  it('should maintain streak if already completed today', () => {
    // Scenario 5.2: No double increment
    const currentStreak = 5
    const lastCompletedDate = new Date() // today
    const newStreak = updateStreak(currentStreak, lastCompletedDate, new Date())
    expect(newStreak).toBe(5) // no change
  })

  it('should reset streak to 0 if day was missed', () => {
    // Scenario 5.3: Streak reset
    const currentStreak = 7
    const lastCompletedDate = twoDaysAgo()
    const newStreak = updateStreak(currentStreak, lastCompletedDate, new Date())
    expect(newStreak).toBe(0)
  })

  it('should start streak at 1 on first completion', () => {
    // Scenario 5.4: First completion
    const currentStreak = 0
    const lastCompletedDate = null
    const newStreak = updateStreak(currentStreak, lastCompletedDate, new Date())
    expect(newStreak).toBe(1)
  })
})
```

---

## Phase 3: CMS Collection Tests (Integration)

### File: `apps/mindmap-cms/src/__tests__/collections/node-mastery.test.ts`

**Covers**: AC1, AC4 - NodeMastery collection schema and access control

#### Tests:

```typescript
describe('NodeMastery Collection', () => {
  it('should have correct schema fields', async () => {
    const collection = payload.collections['node-mastery']
    expect(collection.fields).toContainEqual(
      expect.objectContaining({ name: 'nodeId', type: 'text' })
    )
    expect(collection.fields).toContainEqual(
      expect.objectContaining({ name: 'level', type: 'select' })
    )
    expect(collection.fields).toContainEqual(
      expect.objectContaining({ name: 'confidence', type: 'number' })
    )
  })

  it('should enforce user ownership on read', async () => {
    // Scenario 1.3: Access control
    const alice = await createUser('alice')
    const bob = await createUser('bob')

    const mastery = await payload.create({
      collection: 'node-mastery',
      data: {
        nodeId: 'node_abc',
        level: 'new',
        confidence: 0,
        owner: alice.id,
      },
    })

    // Alice can read
    const aliceRead = await payload.findByID({
      collection: 'node-mastery',
      id: mastery.id,
      user: alice,
    })
    expect(aliceRead).toBeDefined()

    // Bob cannot read
    await expect(
      payload.findByID({
        collection: 'node-mastery',
        id: mastery.id,
        user: bob,
      })
    ).rejects.toThrow()
  })

  it('should have default values', async () => {
    // Scenario 1.1: Default values
    const mastery = await payload.create({
      collection: 'node-mastery',
      data: {
        nodeId: 'node_abc',
        owner: 'user_123',
      },
    })
    expect(mastery.level).toBe('new')
    expect(mastery.confidence).toBe(0)
    expect(mastery.totalSessions).toBe(0)
    expect(mastery.successRate).toBe(0)
  })
})
```

### File: `apps/mindmap-cms/src/__tests__/collections/learning-sessions.test.ts`

**Covers**: AC2, AC3, AC6 - LearningSession collection schema

#### Tests:

```typescript
describe('LearningSession Collection', () => {
  it('should have correct schema fields', async () => {
    const collection = payload.collections['learning-sessions']
    expect(collection.fields).toContainEqual(
      expect.objectContaining({ name: 'nodeId', type: 'text' })
    )
    expect(collection.fields).toContainEqual(
      expect.objectContaining({ name: 'type', type: 'select' })
    )
    expect(collection.fields).toContainEqual(
      expect.objectContaining({ name: 'status', type: 'select' })
    )
  })

  it('should enforce user ownership', async () => {
    // Scenario 1.3: Access control
    const alice = await createUser('alice')
    const bob = await createUser('bob')

    const session = await payload.create({
      collection: 'learning-sessions',
      data: {
        nodeId: 'node_abc',
        type: 'learn',
        scheduledDate: new Date(),
        status: 'scheduled',
        owner: alice.id,
      },
    })

    // Alice can read
    const aliceRead = await payload.findByID({
      collection: 'learning-sessions',
      id: session.id,
      user: alice,
    })
    expect(aliceRead).toBeDefined()

    // Bob cannot read
    await expect(
      payload.findByID({
        collection: 'learning-sessions',
        id: session.id,
        user: bob,
      })
    ).rejects.toThrow()
  })
})
```

### File: `apps/mindmap-cms/src/__tests__/hooks/node-creation-hook.test.ts`

**Covers**: AC1 - Auto-generation on node creation

#### Tests:

```typescript
describe('Node Creation Hook', () => {
  it('should auto-create mastery record on node creation', async () => {
    // Scenario 1.1: Auto-create mastery
    const user = await createUser('testuser')
    const mindmap = await createMindmap(user)

    const node = await payload.create({
      collection: 'mindmap-nodes',
      data: {
        mindmapId: mindmap.id,
        nodeId: 'node_abc',
        content: { text: 'TypeScript Basics' },
        position: { x: 0, y: 0 },
        owner: user.id,
      },
      user,
    })

    // Check mastery was created
    const mastery = await payload.find({
      collection: 'node-mastery',
      where: { nodeId: { equals: 'node_abc' } },
      user,
    })
    expect(mastery.docs).toHaveLength(1)
    expect(mastery.docs[0].level).toBe('new')
    expect(mastery.docs[0].confidence).toBe(0)
  })

  it('should auto-create initial learning session', async () => {
    // Scenario 1.2: Auto-create session
    const user = await createUser('testuser')
    const mindmap = await createMindmap(user)

    const node = await payload.create({
      collection: 'mindmap-nodes',
      data: {
        mindmapId: mindmap.id,
        nodeId: 'node_abc',
        content: { text: 'React Hooks' },
        position: { x: 0, y: 0 },
        owner: user.id,
      },
      user,
    })

    // Check session was created
    const sessions = await payload.find({
      collection: 'learning-sessions',
      where: { nodeId: { equals: 'node_abc' } },
      user,
    })
    expect(sessions.docs).toHaveLength(1)
    expect(sessions.docs[0].type).toBe('learn')
    expect(sessions.docs[0].status).toBe('scheduled')

    // Check scheduled for tomorrow
    const tomorrow = addDays(new Date(), 1)
    expect(isSameDay(sessions.docs[0].scheduledDate, tomorrow)).toBe(true)
  })

  it('should not create duplicates on node update', async () => {
    // Scenario 1.4: No duplicates on update
    const user = await createUser('testuser')
    const mindmap = await createMindmap(user)

    const node = await payload.create({
      collection: 'mindmap-nodes',
      data: {
        mindmapId: mindmap.id,
        nodeId: 'node_abc',
        content: { text: 'GraphQL' },
        position: { x: 0, y: 0 },
        owner: user.id,
      },
      user,
    })

    // Update the node
    await payload.update({
      collection: 'mindmap-nodes',
      id: node.id,
      data: {
        content: { text: 'GraphQL Updated' },
      },
      user,
    })

    // Check only 1 mastery record exists
    const mastery = await payload.find({
      collection: 'node-mastery',
      where: { nodeId: { equals: 'node_abc' } },
      user,
    })
    expect(mastery.docs).toHaveLength(1)

    // Check only 1 session exists
    const sessions = await payload.find({
      collection: 'learning-sessions',
      where: { nodeId: { equals: 'node_abc' } },
      user,
    })
    expect(sessions.docs).toHaveLength(1)
  })
})
```

---

## Phase 4: Frontend Component Tests (React Testing Library)

### File: `apps/mindmap-web/components/__tests__/CalendarView.test.tsx`

**Covers**: AC2 - Calendar display and navigation

#### Tests:

```typescript
describe('CalendarView', () => {
  it('should display current week by default', () => {
    // Scenario 2.1: Current week display
    render(<CalendarView />)
    const today = new Date()
    const weekStart = startOfWeek(today)
    const weekEnd = endOfWeek(today)

    expect(screen.getByText(format(weekStart, 'MMM d'))).toBeInTheDocument()
    expect(screen.getByText(format(weekEnd, 'MMM d'))).toBeInTheDocument()
  })

  it('should highlight today', () => {
    // Scenario 2.1: Today highlighted
    render(<CalendarView />)
    const todayElement = screen.getByTestId('calendar-day-today')
    expect(todayElement).toHaveClass('bg-blue-50')
  })

  it('should display sessions on correct days', async () => {
    // Scenario 2.2: Sessions on correct days
    const sessions = [
      { id: '1', nodeId: 'node_1', scheduledDate: addDays(new Date(), 0), type: 'learn' },
      { id: '2', nodeId: 'node_2', scheduledDate: addDays(new Date(), 2), type: 'review' },
    ]
    mockFetchSessions.mockResolvedValue(sessions)

    render(<CalendarView />)
    await waitFor(() => {
      expect(screen.getByTestId('session-1')).toBeInTheDocument()
      expect(screen.getByTestId('session-2')).toBeInTheDocument()
    })
  })

  it('should color-code sessions by type', async () => {
    // Scenario 2.3: Color-coded sessions
    const sessions = [
      { id: '1', type: 'learn', scheduledDate: new Date() },
      { id: '2', type: 'review', scheduledDate: new Date() },
      { id: '3', type: 'practice', scheduledDate: new Date() },
      { id: '4', type: 'application', scheduledDate: new Date() },
    ]
    mockFetchSessions.mockResolvedValue(sessions)

    render(<CalendarView />)
    await waitFor(() => {
      expect(screen.getByTestId('session-1')).toHaveClass('bg-blue-100') // learn
      expect(screen.getByTestId('session-2')).toHaveClass('bg-green-100') // review
      expect(screen.getByTestId('session-3')).toHaveClass('bg-yellow-100') // practice
      expect(screen.getByTestId('session-4')).toHaveClass('bg-purple-100') // application
    })
  })

  it('should navigate to next/prev week', async () => {
    // Scenario 2.6: Week navigation
    render(<CalendarView />)

    const nextButton = screen.getByText('Next Week')
    fireEvent.click(nextButton)

    await waitFor(() => {
      const nextWeekStart = addWeeks(startOfWeek(new Date()), 1)
      expect(screen.getByText(format(nextWeekStart, 'MMM d'))).toBeInTheDocument()
    })

    const prevButton = screen.getByText('Prev Week')
    fireEvent.click(prevButton)

    await waitFor(() => {
      const currentWeekStart = startOfWeek(new Date())
      expect(screen.getByText(format(currentWeekStart, 'MMM d'))).toBeInTheDocument()
    })
  })
})
```

### File: `apps/mindmap-web/components/__tests__/SessionExecutor.test.tsx`

**Covers**: AC3 - Session completion

#### Tests:

```typescript
describe('SessionExecutor', () => {
  it('should display session details', () => {
    // Scenario 3.1: Session modal
    const session = {
      id: 'session_123',
      nodeId: 'node_abc',
      type: 'learn',
      scheduledDate: new Date(),
      status: 'scheduled',
    }
    render(<SessionExecutor session={session} onClose={() => {}} />)

    expect(screen.getByText('Learn Session')).toBeInTheDocument()
    expect(screen.getByLabelText('Performance Score')).toBeInTheDocument()
  })

  it('should complete session with performance score', async () => {
    // Scenario 3.1: Complete with score
    const session = {
      id: 'session_123',
      nodeId: 'node_abc',
      type: 'learn',
      scheduledDate: new Date(),
      status: 'scheduled',
    }
    const onComplete = jest.fn()
    render(<SessionExecutor session={session} onComplete={onComplete} />)

    const scoreInput = screen.getByLabelText('Performance Score')
    fireEvent.change(scoreInput, { target: { value: '85' } })

    const completeButton = screen.getByText('Complete Session')
    fireEvent.click(completeButton)

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith({
        sessionId: 'session_123',
        performance: 85,
        status: 'completed',
      })
    })
  })

  it('should validate performance score range', () => {
    // Edge case: Score validation
    const session = {
      id: 'session_123',
      nodeId: 'node_abc',
      type: 'learn',
      scheduledDate: new Date(),
      status: 'scheduled',
    }
    render(<SessionExecutor session={session} onClose={() => {}} />)

    const scoreInput = screen.getByLabelText('Performance Score')
    fireEvent.change(scoreInput, { target: { value: '150' } }) // invalid

    const completeButton = screen.getByText('Complete Session')
    fireEvent.click(completeButton)

    expect(screen.getByText('Score must be between 0 and 100')).toBeInTheDocument()
  })
})
```

### File: `apps/mindmap-web/components/__tests__/MasteryDashboard.test.tsx`

**Covers**: AC4 - Mastery display

#### Tests:

```typescript
describe('MasteryDashboard', () => {
  it('should group nodes by mastery level', async () => {
    // Scenario 4.1: Grouped display
    const masteryRecords = [
      { nodeId: 'node_1', level: 'new', confidence: 0 },
      { nodeId: 'node_2', level: 'new', confidence: 0 },
      { nodeId: 'node_3', level: 'learning', confidence: 65 },
      { nodeId: 'node_4', level: 'familiar', confidence: 80 },
      { nodeId: 'node_5', level: 'mastered', confidence: 95 },
    ]
    mockFetchMastery.mockResolvedValue(masteryRecords)

    render(<MasteryDashboard />)

    await waitFor(() => {
      expect(screen.getByText('New (2)')).toBeInTheDocument()
      expect(screen.getByText('Learning (1)')).toBeInTheDocument()
      expect(screen.getByText('Familiar (1)')).toBeInTheDocument()
      expect(screen.getByText('Mastered (1)')).toBeInTheDocument()
    })
  })

  it('should highlight weak nodes', async () => {
    // Scenario 4.2: Weak nodes highlighted
    const masteryRecords = [
      { nodeId: 'node_1', level: 'learning', confidence: 45 }, // weak
      { nodeId: 'node_2', level: 'learning', confidence: 75 }, // normal
    ]
    mockFetchMastery.mockResolvedValue(masteryRecords)

    render(<MasteryDashboard />)

    await waitFor(() => {
      const weakNode = screen.getByTestId('mastery-node_1')
      expect(weakNode).toHaveClass('border-red-500')
      expect(screen.getByText('Needs Attention')).toBeInTheDocument()
    })
  })

  it('should show detailed stats on click', async () => {
    // Scenario 4.3: Detail modal
    const masteryRecords = [
      {
        nodeId: 'node_abc',
        level: 'learning',
        confidence: 75,
        totalSessions: 5,
        successRate: 80,
        lastReviewed: new Date(),
        nextReviewDate: addDays(new Date(), 3),
      },
    ]
    mockFetchMastery.mockResolvedValue(masteryRecords)

    render(<MasteryDashboard />)

    await waitFor(() => {
      const node = screen.getByTestId('mastery-node_abc')
      fireEvent.click(node)
    })

    expect(screen.getByText('Mastery Level: learning')).toBeInTheDocument()
    expect(screen.getByText('Confidence: 75%')).toBeInTheDocument()
    expect(screen.getByText('Total Sessions: 5')).toBeInTheDocument()
    expect(screen.getByText('Success Rate: 80%')).toBeInTheDocument()
  })
})
```

### File: `apps/mindmap-web/components/__tests__/StreakTracker.test.tsx`

**Covers**: AC5 - Streak display

#### Tests:

```typescript
describe('StreakTracker', () => {
  it('should display current streak', () => {
    // Scenario 5.5: Streak display
    render(<StreakTracker streak={10} />)
    expect(screen.getByText('🔥 10 day streak')).toBeInTheDocument()
  })

  it('should display zero streak', () => {
    render(<StreakTracker streak={0} />)
    expect(screen.getByText('Start your streak today!')).toBeInTheDocument()
  })

  it('should display singular for 1 day', () => {
    render(<StreakTracker streak={1} />)
    expect(screen.getByText('🔥 1 day streak')).toBeInTheDocument()
  })
})
```

---

## Phase 5: E2E Tests (Playwright)

### File: `apps/mindmap-web/e2e/learning-flow.spec.ts`

**Covers**: Integration Scenario I.1 - End-to-end learning flow

#### Tests:

```typescript
test.describe('Learning Flow', () => {
  test('should complete full learning cycle from node creation to mastery', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')

    // Create mindmap node
    await page.goto('/mindmaps/test-mindmap')
    await page.click('[data-testid="add-node-button"]')
    await page.fill('[data-testid="node-content"]', 'Docker Basics')
    await page.click('[data-testid="save-node"]')

    // Verify mastery record created
    await page.goto('/mastery')
    await expect(page.locator('text=Docker Basics')).toBeVisible()
    await expect(page.locator('text=New')).toBeVisible()
    await expect(page.locator('text=0%')).toBeVisible()

    // Verify session scheduled
    await page.goto('/calendar')
    const tomorrow = addDays(new Date(), 1)
    const tomorrowCell = page.locator(`[data-date="${format(tomorrow, 'yyyy-MM-dd')}"]`)
    await expect(tomorrowCell.locator('text=Docker Basics')).toBeVisible()

    // Complete first session
    await tomorrowCell.locator('text=Docker Basics').click()
    await page.fill('[data-testid="performance-score"]', '80')
    await page.click('[data-testid="complete-session"]')

    // Verify mastery updated
    await page.goto('/mastery')
    await expect(page.locator('text=80%')).toBeVisible()
    await expect(page.locator('text=1 session')).toBeVisible()

    // Verify next session scheduled
    await page.goto('/calendar')
    const nextReview = addDays(tomorrow, 1) // 1 day interval for 'new'
    const nextCell = page.locator(`[data-date="${format(nextReview, 'yyyy-MM-dd')}"]`)
    await expect(nextCell.locator('text=Docker Basics')).toBeVisible()
  })
})
```

### File: `apps/mindmap-web/e2e/streak.spec.ts`

**Covers**: Integration Scenario I.3 - Streak tracking

#### Tests:

```typescript
test.describe('Streak Tracking', () => {
  test('should increment streak on daily completion', async ({ page }) => {
    await loginAs(page, 'test@example.com')

    // Day 1: Complete session
    await page.goto('/calendar')
    await page.locator('[data-testid="session-1"]').click()
    await page.fill('[data-testid="performance-score"]', '85')
    await page.click('[data-testid="complete-session"]')

    // Verify streak = 1
    await expect(page.locator('text=🔥 1 day streak')).toBeVisible()

    // Day 2: Complete another session (simulate next day)
    await setSystemDate(addDays(new Date(), 1))
    await page.reload()
    await page.locator('[data-testid="session-2"]').click()
    await page.fill('[data-testid="performance-score"]', '90')
    await page.click('[data-testid="complete-session"]')

    // Verify streak = 2
    await expect(page.locator('text=🔥 2 day streak')).toBeVisible()
  })

  test('should reset streak on missed day', async ({ page }) => {
    await loginAs(page, 'test@example.com')
    await setStreak(page, 5) // Set initial streak

    // Simulate 2 days passing with no completion
    await setSystemDate(addDays(new Date(), 2))
    await page.goto('/calendar')

    // Verify streak reset
    await expect(page.locator('text=Start your streak today!')).toBeVisible()
  })
})
```

---

## Test Execution Order (TDD Workflow)

### Step 1: Domain Types (Write tests first)
```bash
npm run test packages/domain/src/types/__tests__/learning-session.test.ts
npm run test packages/domain/src/types/__tests__/mastery.test.ts
npm run test packages/domain/src/types/__tests__/schedule.test.ts
```
**Expected**: All tests fail (types don't exist yet)

**Then**: Implement types in `packages/domain/src/types/`

**Expected**: All tests pass ✅

---

### Step 2: Scheduler Package (Write tests first)
```bash
npm run test packages/scheduler/src/__tests__/mastery-calculator.test.ts
npm run test packages/scheduler/src/__tests__/interval-calculator.test.ts
npm run test packages/scheduler/src/__tests__/streak-calculator.test.ts
```
**Expected**: All tests fail (functions don't exist yet)

**Then**: Implement scheduler logic

**Expected**: All tests pass ✅

---

### Step 3: CMS Collections (Write tests first)
```bash
npm run test apps/mindmap-cms/src/__tests__/collections/
npm run test apps/mindmap-cms/src/__tests__/hooks/
```
**Expected**: All tests fail (collections don't exist yet)

**Then**: Implement collections and hooks

**Expected**: All tests pass ✅

---

### Step 4: Frontend Components (Write tests first)
```bash
npm run test apps/mindmap-web/components/__tests__/
```
**Expected**: All tests fail (components don't exist yet)

**Then**: Implement React components

**Expected**: All tests pass ✅

---

### Step 5: E2E Tests (Write tests first)
```bash
npm run test:e2e apps/mindmap-web/e2e/
```
**Expected**: All tests fail (integration not complete)

**Then**: Wire everything together

**Expected**: All tests pass ✅

---

## Coverage Requirements

### Minimum Coverage Targets
- **Domain types**: 100% (pure types, easy to test)
- **Scheduler package**: 95% (core business logic)
- **CMS collections**: 85% (schema + hooks)
- **Frontend components**: 80% (UI logic)
- **E2E**: 70% (critical user flows)

### Coverage Commands
```bash
npm run test:coverage -- packages/domain
npm run test:coverage -- packages/scheduler
npm run test:coverage -- apps/mindmap-cms
npm run test:coverage -- apps/mindmap-web
```

---

## Summary

**Total Test Files**: 15 files
**Total Test Cases**: ~100+ tests
**Estimated Test Writing Time**: 8 hours
**Estimated Implementation Time**: 32 hours

**BDD Scenarios Covered**: 35/35 ✅

**Acceptance Criteria Coverage**:
- AC1: ✅ Covered by Phase 3 (hooks tests)
- AC2: ✅ Covered by Phase 4 (CalendarView tests)
- AC3: ✅ Covered by Phase 2 & 4 (mastery calculator + SessionExecutor)
- AC4: ✅ Covered by Phase 4 (MasteryDashboard tests)
- AC5: ✅ Covered by Phase 2 & 4 (streak calculator + StreakTracker)
- AC6: ✅ Covered by Phase 2 (interval calculator + reschedule tests)

---

**Next Step**: Start implementing Phase 1 (Domain Types) following TDD workflow! 🚀
