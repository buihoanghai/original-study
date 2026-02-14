# AI Debug Bundle Template

**INSTRUCTIONS**: Copy this template and fill in ALL sections. Paste completed bundle into PR description.

---

## Environment

- **Environment**: [dev / staging / prod]
- **Commit**: [git commit hash]
- **Branch**: [branch name]
- **Date**: [YYYY-MM-DD]

---

## Bug Description

### Repro Steps
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

---

## Suspected Code Path

- **File**: [path/to/file.ts]
- **Function/Hook**: [functionName or hookType]
- **Line**: [approximate line number]

---

## Boundary Classification

**Select one**:
- [ ] Frontend event never fires
- [ ] Next.js route renders but fetch never happens
- [ ] Request hits browser network but not backend
- [ ] Request hits backend entry but not Payload handler/hook
- [ ] Handler runs but branch not reached
- [ ] Async never fired (job/event/webhook)

---

## Evidence Pack

### RequestId
**RequestId**: `[req_xxxxx]`

### Frontend (Next.js)

**Route**: `[/path/to/route]`

**Network Request**:
- URL: `[full URL]`
- Method: `[GET/POST/PATCH/DELETE]`
- Status: `[200/401/403/404/500]`
- Response snippet:
  ```json
  [paste relevant response]
  ```

**Console Error/Log**:
```
[paste relevant console output]
```

### Backend (Payload CMS)

**Entry log present**: [YES / NO]

If YES, paste entry log:
```
[entry] [METHOD] [PATH] | [STATUS] | [DURATION]ms | requestId: [ID] | userId: [ID or null]
```

**Handler/Hook log present**: [YES / NO]

If YES, paste handler log:
```
[paste debugTrace output]
```

**Key log lines**:
```
[paste any other relevant backend logs]
```

---

## Config Signals (NO SECRETS)

**Frontend**:
- `NEXT_PUBLIC_CMS_URL`: `[value]`
- `NEXT_PUBLIC_DEBUG_TRACE`: `[0/1]`
- Other relevant env vars: `[list]`

**Backend**:
- `DEBUG_TRACE`: `[0/1]`
- `PAYLOAD_PUBLIC_SERVER_URL`: `[value]`
- Other relevant env vars: `[list]`

**Feature Flags** (if applicable):
- `[FLAG_NAME]`: `[value]`

---

## RBAC Context

**User**:
- User ID: `[user_xxxxx or "not authenticated"]`
- Email: `[email or N/A]`
- Roles: `[admin, editor, user, etc.]`

**Tenant/Operator** (if applicable):
- Tenant ID: `[tenant_xxxxx or N/A]`
- Operator: `[operator name or N/A]`

---

## Async Context (if applicable)

**What should trigger**:
[Describe what should happen: job queued, event emitted, webhook sent]

**Evidence it didn't**:
[Paste logs, database query results, or other proof]

**Queue/Event System**:
- System: `[Redis, EventEmitter, Webhook, etc.]`
- Queue name: `[queue name]`
- Job ID: `[job_xxxxx or N/A]`

---

## Root Cause

[Explain in 1-3 sentences what caused the bug]

Example:
> Frontend fetch call was missing `credentials: 'include'`, so cookies were not sent to backend. Backend saw unauthenticated request and access control denied the operation.

---

## Fix

**Files changed**: [number]
**Lines changed**: [number]

**Summary**:
[Describe the fix in 1-3 sentences]

**Code changes**:
```diff
[paste relevant diff]
```

---

## Verification

### Doctor Output

```bash
$ npm run doctor

[paste full doctor output or summary]
```

**Result**: [PASS / FAIL]

### Manual Testing

**Steps**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Result**: [PASS / FAIL]

**Evidence**:
```
[paste logs, screenshots, or other proof]
```

### Tests Added/Updated

- [ ] Unit tests added
- [ ] Integration tests added
- [ ] E2E tests added
- [ ] Existing tests updated
- [ ] No tests needed (explain why):

**Test files**:
- `[path/to/test.spec.ts]`

**Test output**:
```bash
[paste test run output]
```

---

## Checklist

Before submitting PR, verify:

- [ ] AI_DEBUG_BUNDLE.md filled completely
- [ ] RequestId captured and present in both frontend and backend logs
- [ ] Boundary classification done with evidence
- [ ] Root cause identified and explained
- [ ] Fix is minimal (≤ 5 files, ≤ 200 LOC unless justified)
- [ ] No unrelated refactors
- [ ] No secrets logged
- [ ] `npm run doctor` passes
- [ ] Doctor output pasted above
- [ ] Tests added/updated OR explanation provided
- [ ] Manual testing done and verified

---

## Additional Notes

[Any other relevant information, context, or observations]

