# Fullstack Developer Skill Tree - Seed Scripts

Production-ready seed data for a comprehensive Fullstack Developer learning path.

## 📦 What Gets Seeded

### Phase 1: Foundation ✅ (READY)
- **15 nodes** covering L1 → L2 → L3 progression
- **45+ flashcards** (3+ per node: definition, pitfall, scenario)
- **Skills**: Programming Fundamentals, OOP, Git, Debugging, Testing, Design Patterns, Architecture, Refactoring

### Phase 2-9: Coming Soon
- Backend (Web Core, API Design, Auth)
- Frontend (HTML/CSS, JavaScript, React)
- Database (SQL, Performance, NoSQL)
- System & DevOps (Networking, Deployment, Scaling)
- Observability (Logging, Monitoring, Tracing)
- Distributed Systems (Messaging, Event Sourcing)
- Engineering Analysis (Requirements, Trade-offs, RCA)
- AI-Era Skills (Prompt Engineering, AI Integration)

## 🚀 Quick Start

### Prerequisites
1. MongoDB running: `cd apps/mindmap-cms && docker compose up -d mongo`
2. CMS environment configured: `apps/mindmap-cms/.env`

### Run Seed

```bash
# From project root
cd apps/mindmap-cms

# Seed Phase 1: Foundation
npm run seed:foundation

# Or seed all phases (when available)
npm run seed
```

### Custom User

```bash
npm run seed -- --user=your-email@example.com
```

## 📊 What Happens During Seeding

1. **Creates/finds user** (default: `dev@payloadcms.com`)
2. **Creates mindmap** "Fullstack Developer Skill Tree"
3. **Creates nodes** with system-compatible schema:
   - Stable `nodeId` (UUID)
   - Content with skill metadata
   - Position for visualization
4. **Auto-triggers hooks**:
   - ✅ `NodeMastery` record created (level: 'new', confidence: 0)
   - ✅ `LearningSession` scheduled for tomorrow (type: 'learn')
5. **Creates flashcards** linked to nodes via `nodeId`

## 🗂️ File Structure

```
scripts/seed/
├── index.ts                          # Main orchestrator
├── seed-foundation.ts                # Phase 1: Foundation
├── data/
│   └── fullstack-foundation.json     # Foundation seed data
└── README.md                         # This file
```

## 📋 Seed Data Schema

Each node follows this structure:

```typescript
{
  id: string                    // Seed ID (mapped to nodeId)
  title: string                 // Node title
  level: "L1" | "L2" | "L3"     // Difficulty tier
  parentId: string | null       // Hierarchy
  prerequisites: string[]       // Dependency tracking
  estimatedHours: number        // Learning time estimate
  difficultyScore: 1-5          // Complexity rating
  tags: string[]                // Categorization
  reviewTTL: number             // Days until review
  content: {
    definition: string          // Core concept (max 3 sentences)
    commonMistakes: string[]    // What learners get wrong
    pitfalls: string[]          // Trade-offs and hidden complexity
    bestPractices: string[]     // Concrete, actionable advice
    realWorldUseCases: string[] // Scenarios with outcomes
    practiceTasks: string[]     // Hands-on exercises
    assessment: string          // Pass criteria
    signalsOfMastery: string[]  // Measurable indicators
  }
  flashcards: [
    {
      type: "definition" | "pitfall" | "scenario"
      question: string
      answer: string
    }
  ]
}
```

## ✅ Verification

After seeding, verify:

1. **CMS Admin**: http://localhost:3001/admin
2. **Login**: `dev@payloadcms.com` / `password123`
3. **Check**:
   - Mindmaps → "Fullstack Developer Skill Tree"
   - Mindmap Nodes → 15 Foundation nodes
   - Node Mastery → 15 records (auto-created)
   - Learning Sessions → 15 sessions (auto-created)
   - Flashcards → 45+ cards

## 🔍 Troubleshooting

### "Cannot find module" error
```bash
# Regenerate types
npm run generate:types
```

### "User not found" error
```bash
# Create user manually or specify existing user
npm run seed -- --user=existing@example.com
```

### Duplicate nodes
The seed script is **idempotent** - it checks for existing nodes before creating. Safe to run multiple times.

## 📝 Adding New Phases

To add Phase 2 (Backend):

1. Create `data/fullstack-backend.json`
2. Create `seed-backend.ts` (follow `seed-foundation.ts` pattern)
3. Add to `index.ts`:
   ```typescript
   if (phasesToRun.includes(2)) {
     const result = await seedBackend(userId)
     results.push({ phase: 2, name: 'Backend', ...result })
   }
   ```
4. Add npm script to `package.json`:
   ```json
   "seed:backend": "tsx scripts/seed/index.ts --phase=2"
   ```

## 🎯 Design Principles

1. **System-compatible**: Uses actual schema (not custom fields)
2. **Idempotent**: Safe to run multiple times
3. **Incremental**: Seed one phase at a time
4. **Production-ready**: Real scenarios, concrete examples
5. **Dependency-correct**: L1 → L2 → L3 progression enforced
6. **Flashcard-rich**: 3+ cards per node (definition, pitfall, scenario)

## 📚 Resources

- **Task Contract**: `/tasks/007-adaptive-learning-calendar.md`
- **Domain Types**: `/packages/domain/src/types/`
- **Collections**: `/apps/mindmap-cms/src/collections/`
- **Hooks**: `/apps/mindmap-cms/src/hooks/`

