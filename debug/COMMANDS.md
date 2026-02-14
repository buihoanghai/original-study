# Debug Workflow - Command Reference

Quick reference for all debug workflow commands.

---

## Enable Debug Tracing

### Frontend (Next.js)

**Inline**:
```bash
NEXT_PUBLIC_DEBUG_TRACE=1 npm run dev:web
```

**Environment file** (`apps/mindmap-web/.env.local`):
```bash
NEXT_PUBLIC_DEBUG_TRACE=1
```

### Backend (Payload CMS)

**Inline**:
```bash
DEBUG_TRACE=1 npm run dev:cms
```

**Environment file** (`apps/mindmap-cms/.env.local`):
```bash
DEBUG_TRACE=1
```

### Both

**Inline** (two terminals):
```bash
# Terminal 1
NEXT_PUBLIC_DEBUG_TRACE=1 npm run dev:web

# Terminal 2
DEBUG_TRACE=1 npm run dev:cms
```

**Environment files** (recommended):
```bash
# Set in .env.local files (see above)
npm run dev
```

---

## Verification Commands

### Doctor (Health Check)

**Full check**:
```bash
npm run doctor
```

**Fast check** (skip builds):
```bash
npm run doctor -- --fast
```

**Frontend only**:
```bash
npm run doctor -- --frontend
```

**Backend only**:
```bash
npm run doctor -- --backend
```

**Fast + Frontend**:
```bash
npm run doctor -- --fast --frontend
```

### Triage (Capture Artifacts)

**Full triage**:
```bash
npm run triage
```

**Fast triage**:
```bash
npm run triage -- --fast
```

**Output**:
- `debug/latest-output.txt` - Full output
- `debug/latest-summary.json` - Pass/fail matrix
- `debug/latest-failures.json` - Failure details

---

## Development Commands

### Start Development Servers

**Both**:
```bash
npm run dev
```

**Frontend only**:
```bash
npm run dev:web
```

**Backend only**:
```bash
npm run dev:cms
```

### Build

**Both**:
```bash
npm run build
```

**Frontend only**:
```bash
npm run build:web
```

**Backend only**:
```bash
npm run build:cms
```

### Test

**All tests**:
```bash
npm run test
```

**Watch mode**:
```bash
npm run test:watch
```

**E2E tests**:
```bash
npm run test:e2e
```

### Lint & Typecheck

**Lint**:
```bash
npm run lint
```

**Typecheck**:
```bash
npm run typecheck
```

**Typecheck (watch)**:
```bash
npm run typecheck:watch
```

---

## Payload CMS Commands

### Generate Types

**After schema changes**:
```bash
cd apps/mindmap-cms
npm run generate:types
```

### Generate Import Map

**After adding/modifying components**:
```bash
cd apps/mindmap-cms
npm run generate:importmap
```

---

## Debugging Commands

### Check Environment Variables

**Frontend**:
```bash
echo $NEXT_PUBLIC_DEBUG_TRACE
echo $NEXT_PUBLIC_CMS_URL
```

**Backend**:
```bash
echo $DEBUG_TRACE
echo $DATABASE_URL
echo $PAYLOAD_SECRET
```

### View Logs

**Frontend** (browser console):
- Open DevTools (F12)
- Console tab
- Filter: `[fetcher]` or `[middleware]` or `[debug]`

**Backend** (terminal):
- Look for `[entry]` or `[debug:*]` prefixes

### Clear Debug Artifacts

```bash
rm -f debug/latest-*.txt debug/latest-*.json
```

---

## Git Commands (for PRs)

### Create Branch

```bash
git checkout -b fix/bug-description
```

### Commit Changes

```bash
git add .
git commit -m "fix: description of fix"
```

### Push and Create PR

```bash
git push origin fix/bug-description
# Then create PR on GitHub
```

---

## Package Manager Commands

### Install Dependencies

**Root**:
```bash
npm install
```

**Frontend**:
```bash
cd apps/mindmap-web
npm install
```

**Backend**:
```bash
cd apps/mindmap-cms
npm install
```

### Clean Install

```bash
npm run clean
npm install
```

---

## Quick Workflows

### Debug a Bug (Full Workflow)

```bash
# 1. Enable tracing
NEXT_PUBLIC_DEBUG_TRACE=1 npm run dev:web  # Terminal 1
DEBUG_TRACE=1 npm run dev:cms              # Terminal 2

# 2. Reproduce bug and capture requestId

# 3. Fix the bug

# 4. Verify
npm run doctor

# 5. Capture artifacts
npm run triage

# 6. Create PR with debug bundle
```

### Quick Health Check

```bash
npm run doctor -- --fast
```

### Full Verification Before PR

```bash
npm run triage
# Review debug/latest-summary.json
# Paste debug/latest-output.txt in PR
```

---

## Environment Setup

### Create .env.local Files

**Frontend** (`apps/mindmap-web/.env.local`):
```bash
NEXT_PUBLIC_DEBUG_TRACE=1
NEXT_PUBLIC_CMS_URL=http://localhost:3001
```

**Backend** (`apps/mindmap-cms/.env.local`):
```bash
DEBUG_TRACE=1
DATABASE_URL=mongodb://localhost:27017/mindmap
PAYLOAD_SECRET=your-secret-here-min-32-chars
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3001
```

### Check Node Version

```bash
node --version
# Should be >= 18.20.2 or >= 20.9.0
```

### Check Package Manager

```bash
npm --version
# or
pnpm --version
# or
yarn --version
```

---

## Troubleshooting Commands

### Restart Dev Servers

```bash
# Kill all node processes
pkill -f node

# Restart
npm run dev
```

### Clear Next.js Cache

```bash
rm -rf apps/mindmap-web/.next
rm -rf apps/mindmap-cms/.next
```

### Clear All Build Artifacts

```bash
npm run clean
```

### Reinstall Dependencies

```bash
npm run clean
npm install
```

---

## Reference

- **Quick start**: `debug/QUICK_START.md`
- **Full guide**: `debug/HOW_TO_USE.md`
- **Workflow**: `debug/WORKFLOW.md`
- **Decision tree**: `debug/plans/code-never-reached.md`

