# Quick Start - Foundation Seed

Get the Foundation skill tree seeded in 3 steps.

## 🚀 Quick Setup

### Step 1: Start MongoDB

**Option A: Using Docker (Recommended)**

```bash
cd apps/mindmap-cms
docker compose up -d mongo
docker compose ps  # Verify mongo is running
```

**Option B: If MongoDB is already running locally**

Make sure it's accessible at `mongodb://127.0.0.1:27017/mindmap` without authentication.

### Step 2: Run Seed Script

```bash
cd apps/mindmap-cms
npm run seed:foundation
```

### Step 3: Verify in CMS

1. Open: http://localhost:3001/admin
2. Login: `dev@payloadcms.com` / `password123`
3. Check:
   - **Mindmaps** → "Fullstack Developer Skill Tree"
   - **Mindmap Nodes** → 15 nodes
   - **Node Mastery** → 15 records (auto-created)
   - **Learning Sessions** → 15 sessions (auto-created)
   - **Flashcards** → 45+ cards

## ✅ Expected Output

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
  ✓ Created node: Git Version Control Basics (L1)
  ✓ Created node: Debugging Fundamentals (L1)
  ✓ Created node: Testing Basics (L1)
  ✓ Created node: Advanced OOP & Design Patterns (L2)
  ✓ Created node: Advanced Debugging & Profiling (L2)
  ✓ Created node: TDD & Integration Testing (L2)
  ✓ Created node: Advanced Git Workflows (L2)
  ✓ Created node: Software Architecture Patterns (L3)
  ✓ Created node: Refactoring Strategies & Code Quality (L3)
  ✓ Created node: Production Debugging & Incident Response (L3)

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

## 🐛 Troubleshooting

### "MongoDB connection failed" or "requires authentication"

**Solution 1: Use Docker MongoDB (no auth)**
```bash
# Stop any existing MongoDB
sudo systemctl stop mongod  # If using system MongoDB

# Start Docker MongoDB
cd apps/mindmap-cms
docker compose down
docker compose up -d mongo
```

**Solution 2: Update DATABASE_URL for authenticated MongoDB**

Edit `apps/mindmap-cms/.env`:
```env
DATABASE_URL=mongodb://username:password@127.0.0.1:27017/mindmap?authSource=admin
```

### "Cannot find module 'tsx'"

```bash
# Install tsx (should already be in devDependencies)
npm install
```

### "User not found"

The script will create `dev@payloadcms.com` automatically. If you want to use a different user:

```bash
npm run seed -- --user=your-email@example.com
```

## 📊 What Gets Created

| Collection | Count | Details |
|------------|-------|---------|
| mindmaps | 1 | "Fullstack Developer Skill Tree" |
| mindmap-nodes | 15 | Foundation skills (L1, L2, L3) |
| node-mastery | 15 | Auto-created by hook, level='new' |
| learning-sessions | 15 | Auto-created by hook, scheduled for tomorrow |
| flashcards | 45+ | 3+ per node (definition, pitfall, scenario) |

## 🎯 Node Breakdown

### L1 (Beginner) - 5 nodes
- Foundation (root)
- Programming Fundamentals
- Object-Oriented Programming Basics
- Git Version Control Basics
- Debugging Fundamentals
- Testing Basics

### L2 (Intermediate) - 4 nodes
- Advanced OOP & Design Patterns
- Advanced Debugging & Profiling
- TDD & Integration Testing
- Advanced Git Workflows

### L3 (Advanced) - 3 nodes
- Software Architecture Patterns
- Refactoring Strategies & Code Quality
- Production Debugging & Incident Response

## 🔄 Re-running Seed

The seed script is **idempotent** - safe to run multiple times:

```bash
npm run seed:foundation
```

Output will show:
```
📊 Nodes: 0 created, 15 skipped
```

No duplicates will be created.

## 📚 Next Steps

1. ✅ Verify all data in CMS Admin
2. ✅ Test flashcard review in frontend
3. ✅ Check NodeMastery auto-creation
4. ✅ Verify LearningSessions scheduling
5. 🚀 Proceed to Phase 2: Backend seed data

## 📖 Full Documentation

- **README**: `scripts/seed/README.md` - Complete documentation
- **Test Guide**: `scripts/seed/TEST_GUIDE.md` - Detailed testing steps
- **Seed Data**: `scripts/seed/data/fullstack-foundation.json` - Raw JSON

