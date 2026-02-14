# Debug Workflow - Quick Start Guide

**5-Minute Setup** → Start debugging with request tracing

---

## 1. Enable Debug Tracing (30 seconds)

### Option A: Environment Variables (Recommended)

Create `.env.local` files:

**`apps/mindmap-web/.env.local`**:
```bash
NEXT_PUBLIC_DEBUG_TRACE=1
NEXT_PUBLIC_CMS_URL=http://localhost:3001
```

**`apps/mindmap-cms/.env.local`**:
```bash
DEBUG_TRACE=1
DATABASE_URL=mongodb://localhost:27017/mindmap
PAYLOAD_SECRET=your-secret-here
```

Then start both apps:
```bash
npm run dev
```

### Option B: Inline (Quick Test)

```bash
# Terminal 1: Frontend
NEXT_PUBLIC_DEBUG_TRACE=1 npm run dev:web

# Terminal 2: Backend
DEBUG_TRACE=1 npm run dev:cms
```

---

## 2. Verify Tracing Works (1 minute)

### Test Request

1. Open browser: `http://localhost:3000`
2. Open DevTools Console (F12)
3. Trigger any API call (e.g., login, create mindmap)

### Expected Logs

**Browser Console**:
```
[middleware] POST /api/mindmaps | requestId: req_abc123xyz
[fetcher] POST http://localhost:3001/api/mindmaps | requestId: req_abc123xyz
[fetcher] POST http://localhost:3001/api/mindmaps | 200 | 45ms | requestId: req_abc123xyz
```

**Backend Terminal**:
```
[entry] POST /api/mindmaps | 200 | 45ms | requestId: req_abc123xyz | userId: user_xyz
```

**✅ Success**: Same `requestId` appears in both frontend and backend logs!

---

## 3. Debug a Bug (5 minutes)

### Example: "Create Mindmap" Button Not Working

**Step 1: Reproduce**
1. Login
2. Click "New Mindmap"
3. Enter title
4. Click "Create"
5. Button spins forever ❌

**Step 2: Check Browser Console**
```
[fetcher] POST http://localhost:3001/api/mindmaps | requestId: req_abc123
[fetcher] POST http://localhost:3001/api/mindmaps | 401 | 45ms | requestId: req_abc123
```
→ Status 401 = Unauthorized

**Step 3: Check Backend Logs**
```
[entry] POST /api/mindmaps | 401 | 12ms | requestId: req_abc123 | userId: null
```
→ userId is null = not authenticated

**Step 4: Check Network Tab**
- Open DevTools → Network
- Find the POST request
- Check Request Headers
- Missing: `Cookie` header ❌

**Step 5: Root Cause**
Frontend not sending credentials with fetch request

**Step 6: Fix** (`apps/mindmap-web/lib/api.ts`)
```diff
  const response = await fetch(`${CMS_URL}/api/mindmaps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
+   credentials: 'include', // Send cookies
    body: JSON.stringify({ title, description }),
  })
```

**Step 7: Verify**
```bash
npm run doctor
# ✅ All checks pass

# Manual test:
# 1. Login
# 2. Create mindmap
# Result: Success! ✅
```

---

## 4. Using Tracing Utilities (Optional)

### Frontend: Traced Fetch

Replace plain `fetch` with `tracedFetch`:

```typescript
// Before
const response = await fetch('/api/mindmaps', { method: 'POST' })

// After
import { tracedFetch } from '@/lib/fetcher'
const response = await tracedFetch('/api/mindmaps', { method: 'POST' })
// Automatically logs: method, URL, status, duration, requestId
```

### Backend: Debug Trace in Hooks

Add tracing to Payload hooks:

```typescript
import { debugTrace, getRequestId } from '@/lib/debugTrace'

hooks: {
  beforeChange: [
    async ({ data, req }) => {
      const requestId = getRequestId(req)
      debugTrace('beforeChange:mindmaps', { requestId, title: data.title })
      
      // Your hook logic
      
      return data
    }
  ]
}
```

---

## 5. Run Verification (1 minute)

Before submitting PR:

```bash
# Quick check
npm run doctor

# Fast check (skip builds)
npm run doctor -- --fast

# Full check with artifacts
npm run triage
```

---

## Common Issues

### Debug logs not appearing

**Check env vars**:
```bash
# Frontend
echo $NEXT_PUBLIC_DEBUG_TRACE  # Should be: 1

# Backend
echo $DEBUG_TRACE  # Should be: 1
```

**Restart dev servers** after setting env vars.

### RequestId not matching

**Use `tracedFetch`** instead of plain `fetch`:
```typescript
import { tracedFetch } from '@/lib/fetcher'
```

Or manually add header:
```typescript
headers: {
  'X-Request-Id': generateRequestId(),
}
```

### Doctor script fails

**Check Node version**:
```bash
node --version  # Should be >= 18.20.2 or >= 20.9.0
```

**Install dependencies**:
```bash
npm install
```

---

## Next Steps

- **Full workflow**: Read `debug/WORKFLOW.md`
- **Decision tree**: Use `debug/plans/code-never-reached.md`
- **PR template**: Fill `debug/templates/AI_DEBUG_BUNDLE.md`
- **Detailed guide**: See `debug/HOW_TO_USE.md`

---

## Quick Reference

### Enable Tracing
```bash
NEXT_PUBLIC_DEBUG_TRACE=1 npm run dev:web
DEBUG_TRACE=1 npm run dev:cms
```

### Verify
```bash
npm run doctor
npm run triage
```

### Debug
1. Reproduce bug
2. Check requestId in logs (frontend + backend)
3. Classify boundary (see decision tree)
4. Fix with minimal changes
5. Verify with doctor
6. Document in PR

---

**Need help?** See `debug/HOW_TO_USE.md` for detailed examples.

