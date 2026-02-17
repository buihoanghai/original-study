# Foundation Seed - Testing Guide

Step-by-step guide to test Phase 1: Foundation seed data.

## 🎯 Test Objectives

Verify that:
1. ✅ Nodes are created with correct data
2. ✅ NodeMastery records are auto-created
3. ✅ LearningSessions are auto-scheduled
4. ✅ Flashcards are linked correctly
5. ✅ Seed script is idempotent (safe to run multiple times)

## 📋 Pre-Test Checklist

- [ ] MongoDB is running
- [ ] CMS environment is configured (`.env` file exists)
- [ ] Dependencies are installed (`npm install`)

## 🧪 Test Steps

### Step 1: Start MongoDB

```bash
cd apps/mindmap-cms
docker compose up -d mongo
docker compose ps  # Verify mongo is running
```

**Expected**: MongoDB container is running on port 27017

### Step 2: Run Seed Script

```bash
# From apps/mindmap-cms directory
npm run seed:foundation
```

**Expected Output**:
```
🌳 Fullstack Developer Skill Tree - Seed Script

👤 Using existing user: dev@payloadcms.com

📋 Running phases: 1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 PHASE 1: FOUNDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌱 Seeding Foundation Skills...
✅ Created mindmap: Fullstack Developer Skill Tree
  ✓ Created node: Foundation (L1)
  ✓ Created node: Programming Fundamentals (L1)
  ✓ Created node: Object-Oriented Programming Basics (L1)
  ... (15 nodes total)

📊 Nodes: 15 created, 0 skipped

🃏 Creating flashcards...
  ✓ Created 45 flashcards

✅ Phase 1 complete!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 SEED SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase 1: Foundation
  Mindmap: Fullstack Developer Skill Tree
  Nodes: 15 created, 0 skipped
  Flashcards: 45 created

✅ Seed complete!
```

### Step 3: Verify in CMS Admin

1. **Open CMS**: http://localhost:3001/admin
2. **Login**: `dev@payloadcms.com` / `password123`

#### 3.1 Check Mindmap

- Navigate to **Mindmaps**
- Find "Fullstack Developer Skill Tree"
- Status should be "published"

#### 3.2 Check Nodes

- Navigate to **Mindmap Nodes**
- Should see **15 nodes**:
  - 1 root: "Foundation"
  - 5 L1 nodes: Programming Fundamentals, OOP Basics, Git Basics, Debugging Fundamentals, Testing Basics
  - 4 L2 nodes: Advanced OOP, Advanced Debugging, TDD & Integration Testing, Advanced Git Workflows
  - 5 L3 nodes: Architecture Patterns, Refactoring Strategies, Production Debugging

#### 3.3 Check NodeMastery (Auto-Created)

- Navigate to **Node Mastery**
- Should see **15 records** (one per node)
- Each record should have:
  - `level`: "new"
  - `confidence`: 0
  - `totalSessions`: 0
  - `successRate`: 0
  - `nextReviewDate`: Tomorrow's date

#### 3.4 Check LearningSessions (Auto-Created)

- Navigate to **Learning Sessions**
- Should see **15 sessions** (one per node)
- Each session should have:
  - `type`: "learn"
  - `status`: "scheduled"
  - `scheduledDate`: Tomorrow at 9 AM

#### 3.5 Check Flashcards

- Navigate to **Flashcards**
- Should see **45+ flashcards** (3+ per node)
- Each flashcard should have:
  - `question`: Non-empty string
  - `answer`: Non-empty string
  - `nodeId`: Valid reference to a node

### Step 4: Test Idempotency

Run the seed script again:

```bash
npm run seed:foundation
```

**Expected Output**:
```
📊 Nodes: 0 created, 15 skipped
```

**Verify**: No duplicate nodes, mastery records, or sessions created.

### Step 5: Test Node Content

Pick one node (e.g., "Programming Fundamentals") and verify:

- [ ] `content.text`: "Programming Fundamentals"
- [ ] `content.level`: "L1"
- [ ] `content.definition`: Non-empty, max 3 sentences
- [ ] `content.commonMistakes`: Array with 2+ items
- [ ] `content.pitfalls`: Array with 2+ items
- [ ] `content.bestPractices`: Array with 3+ items
- [ ] `content.realWorldUseCases`: Array with 2+ items
- [ ] `content.practiceTasks`: Array with 2+ items
- [ ] `content.assessment`: Non-empty string
- [ ] `content.signalsOfMastery`: Array with 2+ items
- [ ] `content.skill.status`: "not-started"
- [ ] `content.skill.masteryPercentage`: 0

## ✅ Success Criteria

All of the following must be true:

- [x] Seed script runs without errors
- [x] 15 nodes created
- [x] 15 NodeMastery records auto-created
- [x] 15 LearningSessions auto-scheduled
- [x] 45+ flashcards created
- [x] Running seed twice doesn't create duplicates
- [x] All nodes have complete content (definition, mistakes, pitfalls, etc.)
- [x] Flashcards are linked to correct nodes

## 🐛 Common Issues

### Issue: "Cannot find module 'tsx'"

**Solution**:
```bash
npm install tsx --save-dev
```

### Issue: "MongoDB connection failed"

**Solution**:
```bash
# Check if MongoDB is running
docker compose ps

# Restart MongoDB
docker compose restart mongo

# Check logs
docker compose logs mongo
```

### Issue: "User not found"

**Solution**:
Create user manually in CMS Admin or specify existing user:
```bash
npm run seed -- --user=your-email@example.com
```

## 📊 Expected Database State

After successful seed:

| Collection | Count | Notes |
|------------|-------|-------|
| mindmaps | 1 | "Fullstack Developer Skill Tree" |
| mindmap-nodes | 15 | Foundation nodes (L1, L2, L3) |
| node-mastery | 15 | Auto-created, level='new' |
| learning-sessions | 15 | Auto-created, type='learn', status='scheduled' |
| flashcards | 45+ | 3+ per node |

## 🎉 Next Steps

After successful testing:

1. Review node content quality
2. Test flashcard review flow in frontend
3. Verify mastery calculation works
4. Test learning session scheduling
5. Proceed to Phase 2: Backend seed data

