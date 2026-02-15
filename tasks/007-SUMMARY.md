# Task 007: Adaptive Learning Calendar - Summary

**Status**: 📝 PENDING APPROVAL  
**Created**: 2026-02-15

---

## Quick Overview

This task transforms the Mindmap project from a **passive knowledge visualization tool** into an **adaptive learning execution system**.

### The Three-Layer System

```
┌─────────────────────────────────────────────────┐
│  MINDMAP (Knowledge Structure)                  │
│  What to learn                                  │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  CALENDAR (Execution Engine)                    │
│  When to learn                                  │
│  - Auto-scheduled sessions                      │
│  - Mastery tracking                             │
│  - Adaptive rescheduling                        │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  FLASHCARDS (Reinforcement)                     │
│  How to retain                                  │
│  - Spaced repetition                            │
│  - Daily reviews                                │
└─────────────────────────────────────────────────┘
```

---

## What Gets Built

### 1. **Auto-Scheduling System**
When you create a mindmap node:
- ✅ Mastery record auto-created (level: new, confidence: 0)
- ✅ First learning session auto-scheduled for tomorrow
- ✅ Future sessions scheduled based on performance

### 2. **Weekly Calendar View**
Navigate to `/calendar` to see:
- 📅 Weekly grid (Mon-Sun) with all scheduled sessions
- 🎨 Color-coded by type (learn, review, practice, application)
- ✅ Completed sessions show checkmarks
- ⚠️ Missed sessions show warnings
- 🔥 Streak counter (consecutive days with completed sessions)

### 3. **Mastery Dashboard**
Navigate to `/mastery` to see:
- 📊 All nodes grouped by mastery level (new → learning → familiar → mastered)
- 💪 Confidence scores per node
- 📈 Success rates and total sessions
- 🎯 Weak nodes highlighted for focus

### 4. **Session Executor**
Click any session to:
- ⏱️ Start timer
- 📝 Complete with performance score (0-100)
- 🔄 Auto-update mastery level
- 📅 Auto-schedule next session

---

## Key Features

### Behavioral Model

**Node Creation** → Auto-generates:
1. NodeMastery record (level=new, confidence=0)
2. First LearningSession (type=learn, tomorrow)

**Session Completion** → Triggers:
1. Update session status to 'completed'
2. Recalculate mastery (confidence, success rate)
3. Check for level upgrade (new → learning → familiar → mastered)
4. Schedule next session (interval based on mastery level)

**Missed Sessions** → Auto-reschedules:
1. Mark as 'missed' if not completed by end of day
2. Prioritize weak nodes (low confidence)
3. Create new sessions for today/tomorrow

### Mastery Progression

```
NEW (0-3 sessions)
  ↓ (3+ sessions)
LEARNING (confidence < 70%)
  ↓ (confidence ≥ 70%, 5+ sessions)
FAMILIAR (confidence ≥ 70%)
  ↓ (confidence ≥ 90%, 10+ sessions)
MASTERED (confidence ≥ 90%)
```

### Review Intervals (MVP - Fixed)

- **New**: 1 day
- **Learning**: 3 days
- **Familiar**: 7 days
- **Mastered**: 30 days

*(Future: Adaptive intervals based on performance patterns)*

---

## Technical Architecture

### New Packages
- `packages/scheduler` - Scheduling logic and mastery calculations

### New Collections (Payload CMS)
- `learning-sessions` - Scheduled learning activities
- `node-mastery` - Per-node learning progress

### New Domain Types
- `LearningSession` - Session metadata
- `NodeMastery` - Mastery tracking
- `WeeklyTarget`, `DailyPlan` - Scheduling types

### New Frontend
- `/calendar` - Weekly calendar view
- `/mastery` - Mastery dashboard
- Components: CalendarView, SessionExecutor, MasteryDashboard, StreakTracker

---

## User Journey Example

### Day 1: Create Knowledge Structure
```
User creates mindmap: "Learn TypeScript"
  ├─ Node: "Basic Types"
  ├─ Node: "Interfaces"
  └─ Node: "Generics"

System auto-creates:
  ├─ 3 mastery records (all level=new)
  └─ 3 learning sessions (scheduled for tomorrow)
```

### Day 2: First Learning Session
```
User opens /calendar
  → Sees 3 sessions scheduled for today
  → Clicks "Basic Types" session
  → Completes with score 85/100
  
System updates:
  ├─ Session status: completed
  ├─ Mastery: totalSessions=1, confidence=85
  └─ Next session: scheduled in 1 day (still 'new')
```

### Day 5: Progression
```
User completes "Basic Types" 3rd time (score: 90)

System upgrades:
  ├─ Mastery level: new → learning
  ├─ Confidence: 88%
  └─ Next session: scheduled in 3 days (learning interval)
```

### Day 20: Mastery Achieved
```
User completes "Basic Types" 10th time (score: 95)

System upgrades:
  ├─ Mastery level: learning → mastered
  ├─ Confidence: 92%
  └─ Next session: scheduled in 30 days (mastered interval)
```

---

## What's NOT Included (MVP Scope)

❌ AI-powered flashcard generation (manual only)  
❌ Adaptive ML-based scheduling (fixed intervals)  
❌ Mobile app or push notifications  
❌ Collaborative learning features  
❌ Gamification (badges, leaderboards)  
❌ External calendar integration (Google Calendar, etc.)  
❌ Advanced analytics dashboard  

*(These are documented as future enhancements)*

---

## Acceptance Criteria Checklist

- [ ] **AC1**: Node creation auto-generates mastery + session
- [ ] **AC2**: Calendar displays weekly grid with color-coded sessions
- [ ] **AC3**: Session completion updates mastery and schedules next session
- [ ] **AC4**: Mastery dashboard shows nodes grouped by level
- [ ] **AC5**: Streak tracking works (consecutive days)
- [ ] **AC6**: Missed sessions are rescheduled with priority

---

## Estimated Timeline

**Total**: ~40 hours (1 week full-time)

**Breakdown**:
- Domain types + CMS collections: 4h
- Scheduler package: 6h
- Hooks + auto-scheduling: 4h
- API clients: 3h
- Frontend components: 8h
- Pages + routing: 3h
- Tests (unit + integration + E2E): 8h
- Manual testing + fixes: 4h

---

## Next Steps

1. ✅ Task contract created (`007-adaptive-learning-calendar.md`)
2. ⏳ **AWAITING HUMAN APPROVAL**
3. ⏳ Write BDD scenarios (if approved)
4. ⏳ Write tests (failing)
5. ⏳ Implement code
6. ⏳ Tests pass
7. ⏳ PR submitted

---

**Full Details**: See `tasks/007-adaptive-learning-calendar.md`

