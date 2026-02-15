# Task 007: Implementation Guide

**Quick reference for implementing the Adaptive Learning Calendar system**

---

## Phase 1: Domain Types (4 hours)

### Files to Create

#### `packages/domain/src/types/learning-session.ts`
```typescript
export type SessionType = 'learn' | 'review' | 'practice' | 'application'
export type SessionStatus = 'scheduled' | 'completed' | 'skipped' | 'missed'

export interface LearningSession {
  sessionId: string
  nodeId: string
  type: SessionType
  scheduledDate: Date
  completedDate?: Date
  status: SessionStatus
  duration?: number
  performance?: number
}
```

#### `packages/domain/src/types/mastery.ts`
```typescript
export type MasteryLevel = 'new' | 'learning' | 'familiar' | 'mastered'

export interface NodeMastery {
  nodeId: string
  level: MasteryLevel
  confidence: number
  lastReviewed?: Date
  totalSessions: number
  successRate: number
  nextReviewDate: Date
}
```

#### `packages/domain/src/types/schedule.ts`
```typescript
export interface WeeklyTarget {
  weekStartDate: Date
  targetSessions: number
  completedSessions: number
  streak: number
}

export interface DailyPlan {
  date: Date
  sessions: LearningSession[]
  energyLevel?: 'low' | 'medium' | 'high'
  completed: boolean
}
```

#### Update `packages/domain/src/index.ts`
```typescript
export type { LearningSession, SessionType, SessionStatus } from './types/learning-session'
export type { NodeMastery, MasteryLevel } from './types/mastery'
export type { WeeklyTarget, DailyPlan } from './types/schedule'
```

---

## Phase 2: CMS Collections (4 hours)

### Files to Create

#### `apps/mindmap-cms/src/collections/LearningSessions.ts`
```typescript
import type { CollectionConfig } from 'payload'

export const LearningSessions: CollectionConfig = {
  slug: 'learning-sessions',
  admin: {
    useAsTitle: 'sessionId',
    defaultColumns: ['sessionId', 'type', 'scheduledDate', 'status'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      return { owner: { equals: user.id } }
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => {
      if (!user) return false
      return { owner: { equals: user.id } }
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      return { owner: { equals: user.id } }
    },
  },
  fields: [
    { name: 'sessionId', type: 'text', required: true, unique: true },
    { name: 'nodeId', type: 'text', required: true, index: true },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Learn', value: 'learn' },
        { label: 'Review', value: 'review' },
        { label: 'Practice', value: 'practice' },
        { label: 'Application', value: 'application' },
      ],
    },
    { name: 'scheduledDate', type: 'date', required: true, index: true },
    { name: 'completedDate', type: 'date' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'scheduled',
      options: [
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Completed', value: 'completed' },
        { label: 'Skipped', value: 'skipped' },
        { label: 'Missed', value: 'missed' },
      ],
      index: true,
    },
    { name: 'duration', type: 'number', label: 'Duration (minutes)' },
    { name: 'performance', type: 'number', label: 'Performance (0-100)' },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
      defaultValue: ({ user }) => user?.id,
      admin: { readOnly: true },
      index: true,
    },
  ],
  timestamps: true,
}
```

#### `apps/mindmap-cms/src/collections/NodeMastery.ts`
```typescript
import type { CollectionConfig } from 'payload'

export const NodeMastery: CollectionConfig = {
  slug: 'node-mastery',
  admin: {
    useAsTitle: 'nodeId',
    defaultColumns: ['nodeId', 'level', 'confidence', 'totalSessions'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      return { owner: { equals: user.id } }
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => {
      if (!user) return false
      return { owner: { equals: user.id } }
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      return { owner: { equals: user.id } }
    },
  },
  fields: [
    { name: 'nodeId', type: 'text', required: true, index: true },
    {
      name: 'level',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Learning', value: 'learning' },
        { label: 'Familiar', value: 'familiar' },
        { label: 'Mastered', value: 'mastered' },
      ],
      index: true,
    },
    { name: 'confidence', type: 'number', required: true, defaultValue: 0 },
    { name: 'lastReviewed', type: 'date' },
    { name: 'totalSessions', type: 'number', required: true, defaultValue: 0 },
    { name: 'successRate', type: 'number', required: true, defaultValue: 0 },
    { name: 'nextReviewDate', type: 'date', required: true, index: true },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
      defaultValue: ({ user }) => user?.id,
      admin: { readOnly: true },
      index: true,
    },
  ],
  timestamps: true,
}
```

#### Update `apps/mindmap-cms/src/payload.config.ts`
```typescript
import { LearningSessions } from './collections/LearningSessions'
import { NodeMastery } from './collections/NodeMastery'

// In collections array:
collections: [
  Users,
  Media,
  Mindmaps,
  MindmapNodes,
  Flashcards,
  Comments,
  LearningSessions,  // ADD
  NodeMastery,       // ADD
],
```

---

## Phase 3: Scheduler Package (6 hours)

### Create Package Structure

```bash
mkdir -p packages/scheduler/src
```

#### `packages/scheduler/package.json`
```json
{
  "name": "@mindmap/scheduler",
  "version": "0.1.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "@mindmap/domain": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

#### `packages/scheduler/tsconfig.json`
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "references": [
    { "path": "../domain" }
  ]
}
```

---

## Phase 4: Hooks (4 hours)

### Modify `apps/mindmap-cms/src/collections/MindmapNodes.ts`

Add afterChange hook:

```typescript
import { generateId } from '@mindmap/domain'

hooks: {
  beforeChange: [ensureStableNodeId],
  afterChange: [
    async ({ doc, req, operation }) => {
      // Only run on create
      if (operation !== 'create') return

      const { payload, user } = req
      if (!user) return

      // Create NodeMastery record
      await payload.create({
        collection: 'node-mastery',
        data: {
          nodeId: doc.nodeId,
          level: 'new',
          confidence: 0,
          totalSessions: 0,
          successRate: 0,
          nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          owner: user.id,
        },
      })

      // Create initial LearningSession
      await payload.create({
        collection: 'learning-sessions',
        data: {
          sessionId: generateId(),
          nodeId: doc.nodeId,
          type: 'learn',
          scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          status: 'scheduled',
          owner: user.id,
        },
      })
    },
  ],
},
```

---

## Phase 5: API Clients (3 hours)

Create `apps/mindmap-web/lib/session-api.ts` and `mastery-api.ts` following the pattern from `flashcard-api.ts`.

---

## Phase 6: Frontend (11 hours)

### Components to Create
1. `CalendarView.tsx` - Weekly grid
2. `SessionExecutor.tsx` - Complete sessions
3. `MasteryDashboard.tsx` - View progress
4. `StreakTracker.tsx` - Display streak

### Pages to Create
1. `app/calendar/page.tsx`
2. `app/mastery/page.tsx`

---

## Testing Checklist

- [ ] Unit tests for scheduler logic
- [ ] Unit tests for mastery calculations
- [ ] Integration tests for hooks
- [ ] Integration tests for API endpoints
- [ ] E2E test: Create node → verify auto-creation
- [ ] E2E test: Complete session → verify mastery update
- [ ] E2E test: Calendar navigation
- [ ] E2E test: Streak tracking

---

**See full task contract**: `tasks/007-adaptive-learning-calendar.md`

