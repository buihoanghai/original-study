# Debug Workflow - How to Use

This guide shows you how to use the debug workflow infrastructure for tracing and fixing bugs.

---

## Quick Start

### 1. Enable Debug Tracing

**Frontend only**:
```bash
NEXT_PUBLIC_DEBUG_TRACE=1 npm run dev:web
```

**Backend only**:
```bash
DEBUG_TRACE=1 npm run dev:cms
```

**Both (recommended for full tracing)**:
```bash
# Terminal 1: Frontend
NEXT_PUBLIC_DEBUG_TRACE=1 npm run dev:web

# Terminal 2: Backend
DEBUG_TRACE=1 npm run dev:cms
```

Or set in `.env.local` files:

**`apps/mindmap-web/.env.local`**:
```
NEXT_PUBLIC_DEBUG_TRACE=1
```

**`apps/mindmap-cms/.env.local`**:
```
DEBUG_TRACE=1
```

Then just run:
```bash
npm run dev
```

---

### 2. Reproduce the Bug

Follow the steps that trigger the bug. With debug tracing enabled, you'll see:

**Frontend logs** (browser console):
```
[middleware] POST /api/mindmaps | requestId: req_abc123
[fetcher] POST http://localhost:3001/api/mindmaps | requestId: req_abc123
[fetcher] POST http://localhost:3001/api/mindmaps | 401 | 45ms | requestId: req_abc123
```

**Backend logs** (terminal):
```
[entry] POST /api/mindmaps | 401 | 12ms | requestId: req_abc123 | userId: null
```

**Key**: The `requestId` should match in both frontend and backend logs!

---

### 3. Classify the Boundary

Use the decision tree in `debug/plans/code-never-reached.md` to identify where execution stopped.

**Example**: If you see the request in browser Network tab but backend has no log:
→ Boundary: "Request hits browser network but not backend"

---

### 4. Gather Evidence

Capture:
- **RequestId** from logs
- **Browser Network tab**: URL, method, status, response
- **Browser Console**: errors, debug logs
- **Backend logs**: entry log, handler logs

---

### 5. Fix the Bug

Make the **smallest safe change** to fix the issue.

**Rules**:
- ≤ 5 files changed
- ≤ 200 LOC total diff
- No unrelated refactors
- No secrets logged

---

### 6. Verify the Fix

**Run doctor**:
```bash
npm run doctor
```

Or for faster checks (skips builds):
```bash
npm run doctor -- --fast
```

**Run triage** (captures artifacts):
```bash
npm run triage
```

This generates:
- `debug/latest-output.txt` - Full output
- `debug/latest-summary.json` - Pass/fail matrix
- `debug/latest-failures.json` - Failure details

---

### 7. Document the Fix

Copy `debug/templates/AI_DEBUG_BUNDLE.md` and fill it out.

Paste the completed bundle into your PR description.

---

## Using Tracing Utilities

### Frontend (Next.js)

**Generate request ID**:
```typescript
import { generateRequestId } from '@/lib/requestId'

const requestId = generateRequestId()
console.log('Action started', { requestId })
```

**Use traced fetch**:
```typescript
import { tracedFetch } from '@/lib/fetcher'

const response = await tracedFetch('/api/mindmaps', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ title: 'Test' }),
})
// Automatically logs: method, URL, status, duration, requestId
```

**Debug log**:
```typescript
import { debugLog } from '@/lib/fetcher'

debugLog('User clicked create', { requestId, action: 'create-mindmap' })
// Only logs if NEXT_PUBLIC_DEBUG_TRACE=1
```

---

### Backend (Payload CMS)

**Get request ID**:
```typescript
import { getRequestId } from '@/lib/debugTrace'

const requestId = getRequestId(req)
```

**Debug trace in hooks**:
```typescript
import { debugTrace } from '@/lib/debugTrace'

hooks: {
  beforeChange: [
    async ({ data, req }) => {
      const requestId = getRequestId(req)
      debugTrace('beforeChange:mindmaps', {
        requestId,
        operation: req.context?.operation,
        userId: req.user?.id,
      })
      
      // Your hook logic here
      
      return data
    }
  ]
}
```

**Entry logger** (automatic):
- Already configured in `payload.config.ts`
- Logs all Payload operations when `DEBUG_TRACE=1`
- No code changes needed

---

## Example Debugging Session

### Scenario: "Create Mindmap" button doesn't work

**1. Enable tracing**:
```bash
NEXT_PUBLIC_DEBUG_TRACE=1 npm run dev:web
DEBUG_TRACE=1 npm run dev:cms
```

**2. Reproduce**:
- Login
- Click "New Mindmap"
- Enter title
- Click "Create"
- Button spins forever

**3. Check browser console**:
```
[fetcher] POST http://localhost:3001/api/mindmaps | requestId: req_abc123
[fetcher] POST http://localhost:3001/api/mindmaps | 401 | 45ms | requestId: req_abc123
```

**4. Check backend logs**:
```
[entry] POST /api/mindmaps | 401 | 12ms | requestId: req_abc123 | userId: null
```

**5. Classify boundary**:
- Request hits backend (entry log present)
- Returns 401 Unauthorized
- userId is null → user not authenticated

**6. Root cause**:
Frontend not sending credentials with fetch request

**7. Fix** (`apps/mindmap-web/lib/api.ts`):
```diff
  const response = await fetch(`${CMS_URL}/api/mindmaps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
+   credentials: 'include',
    body: JSON.stringify({ title, description }),
  })
```

**8. Verify**:
```bash
npm run doctor
# ✅ All checks pass

# Manual test:
# 1. Login
# 2. Create mindmap
# Result: Success!
```

**9. Document**:
Fill `debug/templates/AI_DEBUG_BUNDLE.md` and paste into PR.

---

## Troubleshooting

### Debug logs not appearing

**Check environment variables**:
```bash
# Frontend
echo $NEXT_PUBLIC_DEBUG_TRACE
# Should output: 1

# Backend
echo $DEBUG_TRACE
# Should output: 1
```

**Restart dev servers** after setting env vars.

### RequestId not matching between frontend and backend

**Check middleware**:
- `apps/mindmap-web/middleware.ts` should be present
- Middleware adds `X-Request-Id` header

**Check fetch calls**:
- Use `tracedFetch` instead of plain `fetch`
- Or manually add `X-Request-Id` header

### Doctor script fails

**Check Node version**:
```bash
node --version
# Should be >= 18.20.2 or >= 20.9.0
```

**Check package manager**:
```bash
# If using npm
npm run doctor

# If using pnpm
pnpm run doctor

# If using yarn
yarn doctor
```

---

## Reference

- **Full workflow**: `debug/WORKFLOW.md`
- **Decision tree**: `debug/plans/code-never-reached.md`
- **Template**: `debug/templates/AI_DEBUG_BUNDLE.md`
- **AI rules**: `.augment/rules/05-debug-workflow.md`

