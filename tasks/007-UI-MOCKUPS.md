# Task 007: UI Mockups & Design Specs

**Visual design specifications for the Adaptive Learning Calendar**

---

## 1. Calendar View (`/calendar`)

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  [← Prev Week]    Week of Feb 12-18, 2026    [Next Week →]  │
│                                                               │
│  🔥 Streak: 7 days  |  📊 This week: 5/7 completed           │
├─────────────────────────────────────────────────────────────┤
│  Mon 12  │  Tue 13  │  Wed 14  │  Thu 15  │  Fri 16  │ ...  │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────┤
│          │          │          │  TODAY   │          │      │
│  ✅ Learn│  ✅ Review│  ⏰ Learn│  ⏰ Review│  ⏰ Practice│   │
│  TypeScript│ React  │  Node.js │  TypeScript│ React  │      │
│  9:00 AM │  2:00 PM │  10:00 AM│  9:00 AM │  3:00 PM │      │
│          │          │          │          │          │      │
│  ✅ Review│  ⚠️ Learn│          │  ⏰ Learn │          │      │
│  Python  │  Docker  │          │  GraphQL │          │      │
│  3:00 PM │  4:00 PM │          │  2:00 PM │          │      │
│  (MISSED)│          │          │          │          │      │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────┘

Legend:
  ✅ Completed  ⏰ Scheduled  ⚠️ Missed  ⏭️ Skipped
```

### Color Coding
- **Learn** (blue): `bg-blue-100 border-l-4 border-blue-500`
- **Review** (green): `bg-green-100 border-l-4 border-green-500`
- **Practice** (yellow): `bg-yellow-100 border-l-4 border-yellow-500`
- **Application** (purple): `bg-purple-100 border-l-4 border-purple-500`

### Session Card
```
┌────────────────────────────┐
│ 🔵 Learn                   │
│ TypeScript Basics          │
│ 9:00 AM                    │
│ ✅ Completed (Score: 85)   │
└────────────────────────────┘
```

### Interactions
- **Click session** → Open SessionExecutor modal
- **Hover** → Show tooltip with node details
- **Keyboard**: `←/→` navigate weeks, `1-7` jump to day

---

## 2. Session Executor (Modal)

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Complete Learning Session                            [✕]   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  📘 Learn: TypeScript Basics                                 │
│  📅 Scheduled: Today, 9:00 AM                                │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Node Content:                                      │    │
│  │  - Variables and types                              │    │
│  │  - Type inference                                   │    │
│  │  - Union types                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ⏱️ Duration: [15] minutes                                   │
│                                                               │
│  📊 Performance:                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  0 ────────────●─────────────────────────── 100     │    │
│  │                85                                    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  [Cancel]                          [Complete Session ✓]     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Behavior
- Performance slider: 0-100 (default: 50)
- Duration auto-filled (optional edit)
- **Complete** → Updates mastery, schedules next session
- **Cancel** → No changes

---

## 3. Mastery Dashboard (`/mastery`)

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Mastery Dashboard                                           │
│                                                               │
│  📊 Overall Progress                                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  🥇 Mastered: 3 nodes                               │    │
│  │  ✅ Familiar: 5 nodes                               │    │
│  │  📚 Learning: 8 nodes                               │    │
│  │  🆕 New: 12 nodes                                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ⚠️ Needs Attention (Low Confidence)                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  📘 Docker Basics          Confidence: 45%  [View]  │    │
│  │  📘 GraphQL Queries        Confidence: 52%  [View]  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  🥇 Mastered (3)                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  ✓ TypeScript Basics       Confidence: 92%  [View]  │    │
│  │  ✓ React Hooks             Confidence: 95%  [View]  │    │
│  │  ✓ Python Basics           Confidence: 90%  [View]  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  [Show All Nodes]                                            │
└─────────────────────────────────────────────────────────────┘
```

### Node Detail Card (Expanded)
```
┌─────────────────────────────────────────────────────────────┐
│  TypeScript Basics                                     [✕]   │
├─────────────────────────────────────────────────────────────┤
│  Level: 🥇 Mastered                                          │
│  Confidence: 92%                                             │
│                                                               │
│  📊 Statistics:                                              │
│  - Total Sessions: 12                                        │
│  - Success Rate: 88%                                         │
│  - Last Reviewed: 2 days ago                                 │
│  - Next Review: in 28 days                                   │
│                                                               │
│  📈 Progress Chart:                                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  100% ┤                                        ●     │    │
│  │   75% ┤                              ●    ●         │    │
│  │   50% ┤                    ●    ●                   │    │
│  │   25% ┤          ●    ●                             │    │
│  │    0% ┤    ●                                        │    │
│  │       └────────────────────────────────────────     │    │
│  │        Session 1  2  3  4  5  6  7  8  9  10 11 12 │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  [View in Mindmap]  [Create Flashcard]  [Schedule Review]   │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Streak Tracker (Component)

### Compact View (Header)
```
┌──────────────────────────┐
│  🔥 7 day streak         │
│  Keep it going!          │
└──────────────────────────┘
```

### Expanded View (Dashboard)
```
┌─────────────────────────────────────────────────────────────┐
│  🔥 Current Streak: 7 days                                   │
│  🏆 Longest Streak: 14 days                                  │
│                                                               │
│  Last 7 Days:                                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Mon  Tue  Wed  Thu  Fri  Sat  Sun                  │    │
│  │   ✅   ✅   ✅   ✅   ✅   ✅   ✅                    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  💡 Tip: Complete at least 1 session per day to maintain     │
│     your streak!                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Navigation (Updated Layout)

### Main Navigation
```
┌─────────────────────────────────────────────────────────────┐
│  Mindmap Learning                                    [User]  │
├─────────────────────────────────────────────────────────────┤
│  [Mindmaps]  [Calendar]  [Mastery]  [Flashcards]  [Review]  │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Responsive Design

### Mobile Calendar (Stacked Days)
```
┌─────────────────────────┐
│  Week of Feb 12-18      │
│  [← Prev]  [Next →]     │
├─────────────────────────┤
│  🔥 Streak: 7 days      │
├─────────────────────────┤
│  Mon 12                 │
│  ✅ Learn TypeScript    │
│  ✅ Review Python       │
├─────────────────────────┤
│  Tue 13                 │
│  ✅ Review React        │
│  ⚠️ Learn Docker        │
├─────────────────────────┤
│  Wed 14 (TODAY)         │
│  ⏰ Learn Node.js       │
├─────────────────────────┤
│  ...                    │
└─────────────────────────┘
```

---

## 7. Color Palette

### Session Types
- **Learn**: `#3B82F6` (blue-500)
- **Review**: `#10B981` (green-500)
- **Practice**: `#F59E0B` (yellow-500)
- **Application**: `#8B5CF6` (purple-500)

### Mastery Levels
- **New**: `#6B7280` (gray-500)
- **Learning**: `#3B82F6` (blue-500)
- **Familiar**: `#10B981` (green-500)
- **Mastered**: `#F59E0B` (gold-500)

### Status
- **Completed**: `#10B981` (green-500)
- **Scheduled**: `#6B7280` (gray-500)
- **Missed**: `#EF4444` (red-500)
- **Skipped**: `#9CA3AF` (gray-400)

---

## 8. Accessibility

- **Keyboard Navigation**: Full support for arrow keys, Enter, Esc
- **Screen Readers**: Proper ARIA labels on all interactive elements
- **Color Contrast**: All text meets WCAG AA standards
- **Focus Indicators**: Visible focus rings on all focusable elements

---

**Implementation**: Use Tailwind CSS classes as specified above

