# Debug Workflow: Repro → Trace → Fix → Verify

## Mandatory Process for ALL Bug Fixes

This workflow is **REQUIRED** for every bug fix in this repository. No exceptions.

### The Loop

Every bug fix MUST follow these numbered steps:

1. **REPRODUCE** - Prove the bug exists with concrete steps
2. **CLASSIFY BOUNDARY** - Identify where code execution stops
3. **GATHER EVIDENCE** - Capture requestId + logs + network traces
4. **INSTRUMENT** - Add minimal tracing (behind flags) if needed
5. **FIX** - Make the smallest safe change
6. **VERIFY** - Run `npm run doctor` and prove the fix works
7. **DOCUMENT** - Fill AI_DEBUG_BUNDLE.md template

### Core Rules

#### Evidence Requirements
- **"Code never reached" is NOT acceptable without proof**
- Must provide evidence at each boundary (see BOUNDARY CLASSIFICATION below)
- Every request MUST have a requestId that appears in both frontend and backend logs
- Never guess - always prove with logs, network traces, or debugger

#### Code Change Constraints
- **Default limits**: ≤ 5 files changed, ≤ 200 LOC total diff
- Larger changes require explicit justification in PR
- No unrelated refactors
- No "while we're here" improvements
- Keep diffs small, focused, and reviewable

#### Security
- **NEVER log secrets**: Authorization headers, cookies, tokens, passwords, API keys
- **NEVER log full request/response bodies** by default
- Only log: requestId, method, URL, status, duration, userId (if available)
- Use `DEBUG_TRACE=1` flag - never enable in production by default

#### PR Requirements
Every PR MUST include:
1. Filled AI_DEBUG_BUNDLE.md (copy into PR description)
2. Boundary classification with evidence
3. Root cause explanation
4. Fix description
5. Verification commands + output
6. `npm run doctor` passing (paste summary)
7. Tests added/updated OR explanation why not

---

## Boundary Classification

When debugging "code never reached", identify which boundary failed:

### 1. Frontend Event Never Fires
**Symptoms**: Button click, form submit, or user action doesn't trigger handler

**Evidence to capture**:
- Browser DevTools Console: event listener attached?
- React DevTools: component rendered?
- Add `console.log` in event handler (with requestId)

**Common causes**:
- Event listener not attached (component not mounted)
- Event propagation stopped
- Conditional rendering hiding the element
- Z-index / pointer-events CSS issue

---

### 2. Next.js Route Renders but Fetch Never Happens
**Symptoms**: Page loads, but API call never fires

**Evidence to capture**:
- Browser DevTools Console: fetch call logged?
- Network tab: request present?
- Component lifecycle: useEffect dependencies correct?

**Common causes**:
- useEffect dependency array missing trigger
- Conditional logic preventing fetch
- Early return in component
- Async race condition

---

### 3. Request Hits Browser Network but Not Backend
**Symptoms**: Network tab shows request, but backend has no log

**Evidence to capture**:
- Network tab: full URL, method, status, response
- Browser console: CORS errors?
- Backend entry log: request present? (see Payload entry logger)
- Environment: `NEXT_PUBLIC_CMS_URL` value

**Common causes**:
- Wrong base URL (localhost vs deployed URL)
- CORS blocking request
- Proxy misconfiguration
- Request cached by browser/CDN
- Network interceptor (MSW in tests)

---

### 4. Request Hits Backend Entry but Not Payload Handler/Hook
**Symptoms**: Entry logger shows request, but collection hook never runs

**Evidence to capture**:
- Entry log: requestId, path, method, status
- Payload handler: add debugTrace at start of hook
- Access control: does user have permission?
- Collection slug: correct?

**Common causes**:
- Access control denying operation (returns 403 or filters out docs)
- Wrong collection slug in request
- Middleware rejecting request early
- Route not matching Payload API pattern

---

### 5. Handler Runs but Branch Not Reached
**Symptoms**: Hook/handler executes, but specific code path doesn't run

**Evidence to capture**:
- Add debugTrace before and after conditional
- Log condition values: `debugTrace('condition', { flag: featureEnabled, role: user.role })`
- Check feature flags, RBAC, tenant context

**Common causes**:
- Feature flag disabled
- User role doesn't match
- Tenant/operator filter excluding data
- Conditional logic error (wrong operator, typo)

---

### 6. Async Never Fired
**Symptoms**: Job, event, or webhook should trigger but doesn't

**Evidence to capture**:
- What should trigger it? (afterChange hook, cron, external webhook)
- Queue/event system logs
- Database: job record created?
- Webhook delivery logs (if external)

**Common causes**:
- Event not emitted
- Queue worker not running
- Webhook URL unreachable
- Async handler threw error (check error logs)

---

## Debug Flags

### Frontend (Next.js)
```bash
NEXT_PUBLIC_DEBUG_TRACE=1 npm run dev
```
Enables:
- Request ID generation and propagation
- Fetch wrapper logging (method, URL, status, duration)
- Client-side boundary logging

### Backend (Payload CMS)
```bash
DEBUG_TRACE=1 npm run dev --workspace=apps/mindmap-cms
```
Enables:
- Entry logger (all requests logged with requestId)
- Hook tracer (when manually added via debugTrace helper)
- Server-side boundary logging

### Both
```bash
DEBUG_TRACE=1 NEXT_PUBLIC_DEBUG_TRACE=1 npm run dev
```

**IMPORTANT**: These flags are for development only. Never enable in production.

---

## Verification

Before submitting PR:

1. **Run doctor**:
   ```bash
   npm run doctor
   ```
   Must pass all checks (or use `--fast` to skip heavy builds)

2. **Run triage** (captures artifacts):
   ```bash
   npm run triage
   ```
   Generates:
   - `debug/latest-output.txt` - full output
   - `debug/latest-summary.json` - pass/fail matrix
   - `debug/latest-failures.json` - failure details

3. **Paste doctor summary in PR**

4. **Fill AI_DEBUG_BUNDLE.md** (see template in `debug/templates/`)

---

## Example: Debugging "Create Mindmap" Failure

### 1. REPRODUCE
```
Steps:
1. Login as test@example.com
2. Click "New Mindmap"
3. Enter title "Test Map"
4. Click "Create"
Expected: Mindmap created, redirected to editor
Actual: Button spins forever, no error shown
```

### 2. CLASSIFY BOUNDARY
Enable debug flags:
```bash
NEXT_PUBLIC_DEBUG_TRACE=1 npm run dev:web
DEBUG_TRACE=1 npm run dev:cms
```

Check browser Network tab:
- Request present? **YES** - POST to `http://localhost:3001/api/mindmaps`
- Status? **401 Unauthorized**

**Boundary**: Request hits backend but returns 401

### 3. GATHER EVIDENCE
Browser console:
```
[fetcher] POST http://localhost:3001/api/mindmaps | 401 | 45ms | requestId: req_abc123
```

Backend entry log:
```
[entry] POST /api/mindmaps | 401 | 12ms | requestId: req_abc123 | userId: null
```

**Evidence**: requestId matches, userId is null → user not authenticated

### 4. INSTRUMENT
Not needed - entry logger already shows userId is null

### 5. FIX
Root cause: Frontend not sending credentials

File: `apps/mindmap-web/lib/api.ts`
```diff
  const response = await fetch(`${CMS_URL}/api/mindmaps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
+   credentials: 'include', // Send cookies for auth
    body: JSON.stringify({ title, description }),
  })
```

### 6. VERIFY
```bash
npm run doctor
# All checks pass ✓

# Manual test:
# 1. Login
# 2. Create mindmap
# Result: Success, redirected to editor
```

### 7. DOCUMENT
Fill `debug/templates/AI_DEBUG_BUNDLE.md` and paste into PR description.

---

## Anti-Patterns (DO NOT DO THIS)

❌ **Guessing without evidence**
```
"The hook probably isn't running because of access control"
```
✅ **Prove with logs**
```
"Entry log shows 200 OK but hook debugTrace never appears → access control filtering docs"
```

❌ **Large refactor while fixing bug**
```
Changed: 15 files, 800 LOC
- Fixed auth bug
- Refactored API client
- Updated all error messages
- Added new feature
```
✅ **Minimal focused fix**
```
Changed: 1 file, 2 LOC
- Added credentials: 'include' to fetch call
```

❌ **Logging secrets**
```javascript
console.log('Request:', { headers, body, cookies })
```
✅ **Safe logging**
```javascript
debugTrace('request', { requestId, method, url, status })
```

❌ **Skipping verification**
```
"I tested it manually, looks good"
```
✅ **Run doctor + paste output**
```
npm run doctor
# Paste full summary in PR
```

