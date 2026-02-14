# Debug Workflow - Mandatory for ALL Bug Fixes

**Type**: `always` - Automatically loaded in every AI session

---

## CRITICAL: Repro → Trace → Fix → Verify Loop

Every bug fix MUST follow this workflow. No exceptions.

### The Mandatory Loop

1. **REPRODUCE** - Prove the bug exists with concrete steps
2. **CLASSIFY BOUNDARY** - Identify where code execution stops
3. **GATHER EVIDENCE** - Capture requestId + logs + network traces
4. **INSTRUMENT** - Add minimal tracing (behind flags) if needed
5. **FIX** - Make the smallest safe change
6. **VERIFY** - Run `npm run doctor` and prove the fix works
7. **DOCUMENT** - Fill `debug/templates/AI_DEBUG_BUNDLE.md`

### Evidence Requirements

- **"Code never reached" is NOT acceptable without proof**
- Every request MUST have a requestId visible in both frontend and backend logs
- Must provide evidence at each boundary (see `debug/plans/code-never-reached.md`)
- Never guess - always prove with logs, network traces, or debugger

### Code Change Constraints

- **Default limits**: ≤ 5 files changed, ≤ 200 LOC total diff
- Larger changes require explicit justification
- No unrelated refactors
- No "while we're here" improvements
- Keep diffs small, focused, and reviewable

### Security Rules

- **NEVER log secrets**: Authorization headers, cookies, tokens, passwords, API keys
- **NEVER log full request/response bodies** by default
- Only log: requestId, method, URL, status, duration, userId (if available)
- Use `DEBUG_TRACE=1` flag - never enable in production

---

## Boundary Classification

When debugging "code never reached", identify which boundary failed:

1. **Frontend event never fires** - Button click, form submit doesn't trigger handler
2. **Next.js route renders but fetch never happens** - Page loads but API call doesn't fire
3. **Request hits browser network but not backend** - Network tab shows request, backend has no log
4. **Request hits backend entry but not Payload handler/hook** - Entry log present, handler never runs
5. **Handler runs but branch not reached** - Hook executes but specific code path doesn't run
6. **Async never fired** - Job, event, or webhook should trigger but doesn't

See `debug/plans/code-never-reached.md` for detailed decision tree and checklists.

---

## Debug Flags

### Enable Tracing

**Frontend (Next.js)**:
```bash
NEXT_PUBLIC_DEBUG_TRACE=1 npm run dev:web
```

**Backend (Payload CMS)**:
```bash
DEBUG_TRACE=1 npm run dev:cms
```

**Both**:
```bash
DEBUG_TRACE=1 NEXT_PUBLIC_DEBUG_TRACE=1 npm run dev
```

### What Gets Logged

**Frontend** (`apps/mindmap-web/lib/fetcher.ts`):
- Request ID generation and propagation
- Fetch wrapper: method, URL, status, duration
- Middleware: request tracking

**Backend** (`apps/mindmap-cms/src/lib/debugTrace.ts`):
- Entry logger: all requests with requestId, userId, collection, operation
- Hook tracer: manual debugTrace() calls in hooks

---

## Verification Commands

### Before Submitting PR

1. **Run doctor**:
   ```bash
   npm run doctor
   # or for faster checks:
   npm run doctor -- --fast
   ```

2. **Run triage** (captures artifacts):
   ```bash
   npm run triage
   ```
   Generates:
   - `debug/latest-output.txt`
   - `debug/latest-summary.json`
   - `debug/latest-failures.json`

3. **Paste doctor output in PR**

4. **Fill AI_DEBUG_BUNDLE.md** from `debug/templates/`

---

## PR Requirements

Every bug fix PR MUST include:

1. ✅ Filled `AI_DEBUG_BUNDLE.md` (copy into PR description)
2. ✅ Boundary classification with evidence
3. ✅ RequestId captured and present in both frontend and backend logs
4. ✅ Root cause explanation (1-3 sentences)
5. ✅ Fix description
6. ✅ Verification: `npm run doctor` output pasted
7. ✅ Tests added/updated OR explanation why not
8. ✅ No secrets logged
9. ✅ Diff is minimal (≤ 5 files, ≤ 200 LOC unless justified)

---

## Available Utilities

### Frontend (Next.js)

**Request ID** (`apps/mindmap-web/lib/requestId.ts`):
```typescript
import { generateRequestId, getOrCreateRequestId, isDebugTraceEnabled } from '@/lib/requestId'

const requestId = generateRequestId()
const requestId = getOrCreateRequestId('action-key')
```

**Traced Fetch** (`apps/mindmap-web/lib/fetcher.ts`):
```typescript
import { tracedFetch, debugLog } from '@/lib/fetcher'

const response = await tracedFetch('/api/mindmaps', {
  method: 'POST',
  requestId: 'req_abc123', // optional
})

debugLog('User action', { requestId, action: 'create-mindmap' })
```

**Middleware** (`apps/mindmap-web/middleware.ts`):
- Automatically adds X-Request-Id to all requests when `NEXT_PUBLIC_DEBUG_TRACE=1`

### Backend (Payload CMS)

**Debug Trace** (`apps/mindmap-cms/src/lib/debugTrace.ts`):
```typescript
import { debugTrace, getRequestId } from '@/lib/debugTrace'

// In hooks
hooks: {
  beforeChange: [
    async ({ data, req }) => {
      const requestId = getRequestId(req)
      debugTrace('beforeChange:mindmaps', { requestId, operation: req.context?.operation })
      // ... hook logic
    }
  ]
}
```

**Entry Logger** (`apps/mindmap-cms/src/lib/entryLogger.ts`):
- Automatically logs all Payload operations when `DEBUG_TRACE=1`
- Already configured in `payload.config.ts`

---

## Quick Reference

**Full workflow**: `debug/WORKFLOW.md`
**Decision tree**: `debug/plans/code-never-reached.md`
**Template**: `debug/templates/AI_DEBUG_BUNDLE.md`

---

## Example: Minimal Bug Fix

```diff
File: apps/mindmap-web/lib/api.ts (1 file, 1 line changed)

  const response = await fetch(`${CMS_URL}/api/mindmaps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
+   credentials: 'include',
    body: JSON.stringify({ title, description }),
  })
```

**Evidence**:
- RequestId: `req_abc123`
- Boundary: Request hits backend but returns 401
- Root cause: Frontend not sending credentials → backend sees unauthenticated request
- Verification: `npm run doctor` passes ✅

---

## Anti-Patterns (DO NOT DO)

❌ Guessing without evidence
❌ Large refactors while fixing bugs
❌ Logging secrets
❌ Skipping verification
❌ Missing requestId in logs
❌ No boundary classification

✅ Prove with logs and requestId
✅ Minimal focused fixes
✅ Safe logging (no secrets)
✅ Run doctor before PR
✅ RequestId in frontend + backend
✅ Clear boundary classification

