# Code Never Reached: Decision Tree & Checklists

## Overview

This document provides a systematic approach to debugging "code never reached" scenarios in our Payload CMS + Next.js stack.

**Golden Rule**: Never guess. Always prove with evidence.

---

## Decision Tree

```
Bug Report: "Code X never runs"
│
├─ Is this frontend code?
│  ├─ YES → Go to [1. Frontend Event Never Fires]
│  └─ NO → Continue
│
├─ Is this a Next.js API route or Server Component?
│  ├─ YES → Go to [2. Next.js Route/Fetch]
│  └─ NO → Continue
│
├─ Does browser Network tab show the request?
│  ├─ NO → Go to [2. Next.js Route/Fetch]
│  ├─ YES → Continue
│
├─ Does backend entry log show the request?
│  ├─ NO → Go to [3. Network Boundary]
│  ├─ YES → Continue
│
├─ Is this a Payload collection hook or handler?
│  ├─ YES → Does hook log appear?
│  │  ├─ NO → Go to [4. Backend Entry → Payload Handler]
│  │  └─ YES → Go to [5. Handler Runs but Branch Not Reached]
│  └─ NO → Continue
│
└─ Is this async (job/event/webhook)?
   └─ YES → Go to [6. Async Never Fired]
```

---

## 1. Frontend Event Never Fires

### Checklist

- [ ] **Component mounted?**
  - Open React DevTools
  - Find component in tree
  - Check props and state

- [ ] **Event listener attached?**
  - Browser DevTools → Elements → Event Listeners
  - Or add `console.log('Component mounted')` in useEffect

- [ ] **Element visible and clickable?**
  - Check CSS: `display`, `visibility`, `opacity`, `pointer-events`
  - Check z-index (another element on top?)
  - Try clicking with DevTools element selector

- [ ] **Conditional rendering?**
  - Check if element is in DOM
  - Review conditions: `{condition && <Button />}`

- [ ] **Event propagation stopped?**
  - Parent element calling `e.stopPropagation()`?
  - Form submit prevented?

### Evidence to Capture

```typescript
// Add to component
useEffect(() => {
  console.log('[DEBUG] Component mounted', { requestId: generateRequestId() })
}, [])

function handleClick() {
  const requestId = generateRequestId()
  console.log('[DEBUG] Click handler fired', { requestId })
  // ... rest of handler
}
```

### Common Causes & Fixes

| Cause | Evidence | Fix |
|-------|----------|-----|
| Component not mounted | Not in React DevTools tree | Check parent conditional rendering |
| Event listener not attached | No listener in DevTools | Check useEffect dependencies |
| Element not clickable | Element exists but click doesn't fire | Fix CSS (pointer-events, z-index) |
| Early return in handler | Log shows handler starts but not complete | Review conditional logic |

---

## 2. Next.js Route Renders but Fetch Never Happens

### Checklist

- [ ] **useEffect running?**
  - Add `console.log` at start of useEffect
  - Check dependency array

- [ ] **Conditional logic preventing fetch?**
  - Review all `if` statements before fetch
  - Check feature flags, auth state

- [ ] **Async race condition?**
  - Multiple useEffects?
  - State update causing re-render before fetch?

- [ ] **Error thrown before fetch?**
  - Wrap in try-catch
  - Check browser console for errors

### Evidence to Capture

```typescript
useEffect(() => {
  const requestId = generateRequestId()
  console.log('[DEBUG] useEffect running', { requestId, deps: { userId, mapId } })
  
  if (!userId) {
    console.log('[DEBUG] Early return: no userId', { requestId })
    return
  }
  
  console.log('[DEBUG] About to fetch', { requestId, url: `${API_URL}/mindmaps` })
  
  fetch(...)
    .then(res => console.log('[DEBUG] Fetch response', { requestId, status: res.status }))
    .catch(err => console.error('[DEBUG] Fetch error', { requestId, error: err.message }))
}, [userId, mapId])
```

### Common Causes & Fixes

| Cause | Evidence | Fix |
|-------|----------|-----|
| Missing dependency | useEffect doesn't re-run when expected | Add to dependency array |
| Conditional early return | Log shows early return | Fix condition or move fetch earlier |
| Error before fetch | Console shows error | Fix error or add error boundary |
| Race condition | Multiple logs, inconsistent order | Use cleanup function, abort controller |

---

## 3. Request Hits Browser Network but Not Backend

### Checklist

- [ ] **Correct base URL?**
  - Check `NEXT_PUBLIC_CMS_URL` in `.env.local`
  - Log the full URL being fetched
  - Verify it matches backend URL

- [ ] **CORS error?**
  - Browser console shows CORS error?
  - Check Network tab → Response headers
  - Backend CORS config allows origin?

- [ ] **Request cached?**
  - Network tab shows "(from cache)"?
  - Try hard refresh (Cmd+Shift+R)
  - Check Cache-Control headers

- [ ] **Proxy misconfiguration?**
  - Using Next.js rewrites?
  - Check `next.config.ts` → `rewrites()`

- [ ] **Network interceptor active?**
  - MSW (Mock Service Worker) running in tests?
  - Check for service worker in DevTools → Application

### Evidence to Capture

**Browser (Network tab)**:
- Full URL (copy as cURL)
- Method
- Status code
- Response headers
- Response body (if any)
- Timing (if request hangs)

**Backend (entry log)**:
```bash
# Enable entry logger
DEBUG_TRACE=1 npm run dev:cms

# Should see:
[entry] POST /api/mindmaps | 200 | 45ms | requestId: req_abc123 | userId: user_xyz
```

**Environment**:
```bash
# Frontend
echo $NEXT_PUBLIC_CMS_URL
# Should match backend URL

# Backend
echo $PAYLOAD_PUBLIC_SERVER_URL
```

### Common Causes & Fixes

| Cause | Evidence | Fix |
|-------|----------|-----|
| Wrong base URL | Network shows `localhost:3000` but backend is `localhost:3001` | Fix `NEXT_PUBLIC_CMS_URL` |
| CORS blocking | Console: "CORS policy" error | Add origin to Payload CORS config |
| Request cached | Network tab: "(from cache)" | Add `cache: 'no-store'` to fetch |
| Proxy issue | URL rewritten incorrectly | Fix `next.config.ts` rewrites |
| MSW intercepting | Service worker active in tests | Disable MSW or update handlers |

---

## 4. Request Hits Backend Entry but Not Payload Handler/Hook

### Checklist

- [ ] **Access control denying operation?**
  - Entry log shows 403 Forbidden?
  - Or 200 OK but empty `docs: []`?
  - Check collection access control rules

- [ ] **Correct collection slug?**
  - URL path matches collection slug?
  - `/api/mindmaps` → collection slug must be `mindmaps`

- [ ] **Hook type correct?**
  - `beforeChange` vs `afterChange`?
  - `beforeValidate` vs `beforeChange`?

- [ ] **Hook context preventing execution?**
  - Check for `context.skipHooks` flag
  - Review hook conditional logic

### Evidence to Capture

**Entry log**:
```
[entry] POST /api/mindmaps | 200 | 45ms | requestId: req_abc123 | userId: user_xyz
```

**Hook tracer** (add to hook):
```typescript
import { debugTrace } from '@/lib/debugTrace'

hooks: {
  beforeChange: [
    async ({ data, req, context }) => {
      debugTrace('beforeChange:mindmaps', {
        requestId: req.headers.get('x-request-id'),
        operation: req.operation,
        userId: req.user?.id,
        context,
      })
      // ... rest of hook
    }
  ]
}
```

**Access control** (add logging):
```typescript
access: {
  create: ({ req }) => {
    const allowed = req.user?.roles?.includes('admin')
    console.log('[ACCESS] create:mindmaps', {
      userId: req.user?.id,
      roles: req.user?.roles,
      allowed,
    })
    return allowed
  }
}
```

### Common Causes & Fixes

| Cause | Evidence | Fix |
|-------|----------|-----|
| Access control denying | 403 or empty docs | Fix access control rules or user roles |
| Wrong collection slug | 404 Not Found | Fix URL or collection slug |
| Hook not registered | No error, just doesn't run | Check collection config exports hook |
| Context flag skipping | debugTrace shows `skipHooks: true` | Remove context flag or fix logic |

---

## 5. Handler Runs but Branch Not Reached

### Checklist

- [ ] **Feature flag disabled?**
  - Log flag value before conditional
  - Check environment variables

- [ ] **User role doesn't match?**
  - Log user roles
  - Check RBAC logic

- [ ] **Tenant/operator filter?**
  - Multi-tenant app?
  - Log tenant context

- [ ] **Conditional logic error?**
  - Wrong operator (`&&` vs `||`)?
  - Typo in property name?
  - Falsy value (`0`, `''`, `false`)?

### Evidence to Capture

```typescript
// Before conditional
debugTrace('before-conditional', {
  requestId,
  featureEnabled: process.env.FEATURE_X,
  userRole: req.user?.role,
  tenant: req.user?.tenant,
})

if (featureEnabled && userRole === 'admin') {
  debugTrace('inside-conditional', { requestId })
  // ... code that should run
} else {
  debugTrace('conditional-skipped', {
    requestId,
    reason: !featureEnabled ? 'feature disabled' : 'not admin',
  })
}
```

### Common Causes & Fixes

| Cause | Evidence | Fix |
|-------|----------|-----|
| Feature flag off | Log shows `featureEnabled: undefined` | Set env var or fix flag name |
| Wrong role | Log shows `userRole: 'user'` but needs `'admin'` | Fix RBAC or assign role |
| Tenant mismatch | Log shows different tenant | Fix tenant filter or context |
| Logic error | Log shows unexpected values | Fix conditional logic |

---

## 6. Async Never Fired

### Checklist

- [ ] **Event emitted?**
  - Add log where event should be emitted
  - Check event name matches listener

- [ ] **Queue worker running?**
  - Check worker process logs
  - Verify queue connection (Redis, etc.)

- [ ] **Webhook URL reachable?**
  - Test webhook URL manually (curl)
  - Check firewall, network

- [ ] **Async handler threw error?**
  - Check error logs
  - Wrap handler in try-catch

- [ ] **Job created in database?**
  - Query jobs table
  - Check job status

### Evidence to Capture

**Event emission**:
```typescript
// Where event should be emitted
debugTrace('emit-event', { requestId, event: 'mindmap.created', docId: doc.id })
eventEmitter.emit('mindmap.created', { docId: doc.id })
```

**Event listener**:
```typescript
// Event listener
eventEmitter.on('mindmap.created', async ({ docId }) => {
  const requestId = generateRequestId()
  debugTrace('event-received', { requestId, event: 'mindmap.created', docId })
  // ... handler
})
```

**Webhook delivery**:
```bash
# Test webhook manually
curl -X POST https://example.com/webhook \
  -H "Content-Type: application/json" \
  -d '{"event":"test","requestId":"req_test123"}'
```

### Common Causes & Fixes

| Cause | Evidence | Fix |
|-------|----------|-----|
| Event not emitted | No "emit-event" log | Add event emission or fix condition |
| Event name mismatch | Emit log shows different name | Fix event name typo |
| Worker not running | No worker logs | Start worker process |
| Webhook unreachable | curl fails | Fix URL, firewall, or network |
| Handler error | Error logs present | Fix error in handler |

---

## Quick Reference: Evidence Checklist

For every "code never reached" bug, capture:

- [ ] **RequestId** - Same ID in frontend and backend logs
- [ ] **Browser Network tab** - Full request details (URL, method, status, headers, body)
- [ ] **Browser Console** - Errors, warnings, debug logs
- [ ] **Backend entry log** - Request received? (requestId, path, method, status, userId)
- [ ] **Handler/hook log** - Code executed? (debugTrace output)
- [ ] **Environment** - Relevant env vars (NEXT_PUBLIC_CMS_URL, feature flags)
- [ ] **User context** - userId, roles, tenant (if applicable)
- [ ] **Conditional values** - All variables in conditionals that might prevent execution

---

## Template: Evidence Pack

```markdown
## Evidence Pack

**RequestId**: `req_abc123`

**Environment**: Development
**Commit**: `abc123def`
**Branch**: `fix/create-mindmap-auth`

### Frontend
- Route: `/new`
- Network request:
  - URL: `http://localhost:3001/api/mindmaps`
  - Method: POST
  - Status: 401
  - Response: `{"errors":[{"message":"Unauthorized"}]}`
- Console log:
  ```
  [fetcher] POST http://localhost:3001/api/mindmaps | 401 | 45ms | requestId: req_abc123
  ```

### Backend (Payload)
- Entry log present: **YES**
  ```
  [entry] POST /api/mindmaps | 401 | 12ms | requestId: req_abc123 | userId: null
  ```
- Handler log present: **NO** (access control denied)

### Config Signals
- `NEXT_PUBLIC_CMS_URL`: `http://localhost:3001`
- Feature flags: None

### RBAC Context
- User role: N/A (not authenticated)
- Tenant: N/A

### Root Cause
Frontend not sending credentials with fetch request → backend sees unauthenticated request → access control denies → handler never runs

### Fix
Add `credentials: 'include'` to fetch call in `apps/mindmap-web/lib/api.ts`
```

