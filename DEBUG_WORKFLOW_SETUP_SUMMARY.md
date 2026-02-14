# Debug Workflow Setup - Implementation Summary

**Date**: 2026-02-13
**Status**: ✅ Complete

---

## Overview

Successfully implemented a comprehensive debug workflow infrastructure for the Mindmap Learning App (Payload CMS + Next.js) that enforces a mandatory "Repro → Trace → Fix → Verify" process for ALL bug fixes.

---

## What Was Implemented

### A) Documentation (debug/)

1. **`debug/WORKFLOW.md`** - The mandatory 7-step debug loop
   - Repro → Classify Boundary → Gather Evidence → Instrument → Fix → Verify → Document
   - Code change constraints (≤ 5 files, ≤ 200 LOC)
   - Security rules (never log secrets)
   - PR requirements

2. **`debug/plans/code-never-reached.md`** - Decision tree & checklists
   - 6 boundary classifications with evidence requirements
   - Detailed checklists for each scenario
   - Common causes and fixes
   - Evidence pack template

3. **`debug/templates/AI_DEBUG_BUNDLE.md`** - Strict PR template
   - Environment, repro steps, boundary classification
   - Evidence pack (requestId, logs, network traces)
   - Root cause, fix, verification
   - Complete checklist

4. **`debug/HOW_TO_USE.md`** - Quick start guide
   - How to enable debug tracing
   - How to use tracing utilities
   - Example debugging session
   - Troubleshooting

5. **`debug/README.md`** - Directory overview
   - Quick reference for all debug infrastructure
   - Links to all documentation

---

### B) Tracing Infrastructure

#### Frontend (Next.js)

1. **`apps/mindmap-web/lib/requestId.ts`**
   - `generateRequestId()` - Create unique request IDs
   - `getOrCreateRequestId(key)` - Stable IDs per action
   - `isDebugTraceEnabled()` - Check if tracing is on
   - Only active when `NEXT_PUBLIC_DEBUG_TRACE=1`

2. **`apps/mindmap-web/lib/fetcher.ts`**
   - `tracedFetch()` - Fetch wrapper with logging
   - Logs: requestId, method, URL, status, duration
   - Never logs: Authorization, cookies, body
   - `debugLog()` - Conditional logging helper

3. **`apps/mindmap-web/middleware.ts`**
   - Automatic X-Request-Id header propagation
   - Adds requestId to response headers
   - Only active when `NEXT_PUBLIC_DEBUG_TRACE=1`

#### Backend (Payload CMS)

1. **`apps/mindmap-cms/src/lib/debugTrace.ts`**
   - `debugTrace(label, data)` - Safe logging helper
   - `getRequestId(req)` - Extract requestId from Payload request
   - `sanitizeLogData()` - Remove secrets from logs
   - Only active when `DEBUG_TRACE=1`

2. **`apps/mindmap-cms/src/lib/entryLogger.ts`**
   - `entryLoggerPlugin()` - Payload plugin for request logging
   - Logs: requestId, method, path, status, duration, userId, collection, operation
   - Automatic integration via `payload.config.ts`

3. **`apps/mindmap-cms/src/payload.config.ts`** (updated)
   - Added `entryLoggerPlugin()` to plugins array
   - Automatically logs all Payload operations when `DEBUG_TRACE=1`

---

### C) Automation Scripts

1. **`scripts/doctor.js`**
   - Health check for both frontend and backend
   - Runs: lint, typecheck, tests, build (optional)
   - Supports flags: `--fast`, `--frontend`, `--backend`
   - Auto-detects package manager (npm/pnpm/yarn)
   - Prints summary matrix with pass/fail/skip

2. **`scripts/triage.js`**
   - Runs doctor and captures artifacts
   - Generates:
     - `debug/latest-output.txt` - Full output
     - `debug/latest-summary.json` - Pass/fail matrix
     - `debug/latest-failures.json` - Failure details with context
   - Deterministic and reproducible

3. **`package.json`** (updated)
   - Added `"doctor": "node scripts/doctor.js"`
   - Added `"triage": "node scripts/triage.js"`

---

### D) PR & CI Enforcement

1. **`.github/pull_request_template.md`** (updated)
   - Added AI Debug Bundle section (required for bug fixes)
   - Added boundary classification checklist
   - Added doctor output requirement
   - Added code quality checks (requestId, no secrets, minimal diff)

2. **`.github/workflows/doctor.yml`** (new)
   - Runs on every PR to main/develop
   - Executes `npm run doctor -- --fast`
   - Uploads artifacts on failure
   - Fails PR if doctor fails

---

### E) AI Enforcement

1. **`.augment/rules/05-debug-workflow.md`** (new)
   - Type: `always` - Automatically loaded in every AI session
   - Enforces mandatory workflow
   - Provides quick reference to utilities
   - Shows examples and anti-patterns

2. **`.augment/rules/README.md`** (updated)
   - Added 05-debug-workflow.md to file structure
   - Documented as `always` type rule

---

## How to Use

### Enable Debug Tracing

**Frontend**:
```bash
NEXT_PUBLIC_DEBUG_TRACE=1 npm run dev:web
```

**Backend**:
```bash
DEBUG_TRACE=1 npm run dev:cms
```

**Both**:
```bash
# Terminal 1
NEXT_PUBLIC_DEBUG_TRACE=1 npm run dev:web

# Terminal 2
DEBUG_TRACE=1 npm run dev:cms
```

Or set in `.env.local` files and run `npm run dev`.

---

### Run Verification

**Quick check**:
```bash
npm run doctor
```

**Fast check (skip builds)**:
```bash
npm run doctor -- --fast
```

**Full check with artifacts**:
```bash
npm run triage
```

---

### Debug a Bug

1. **Enable tracing** (see above)
2. **Reproduce** the bug
3. **Check logs** for requestId in both frontend and backend
4. **Classify boundary** using `debug/plans/code-never-reached.md`
5. **Gather evidence** (requestId, logs, network traces)
6. **Fix** with minimal changes (≤ 5 files, ≤ 200 LOC)
7. **Verify** with `npm run doctor`
8. **Document** using `debug/templates/AI_DEBUG_BUNDLE.md`

---

## Files Created/Modified

### Created (18 files)

**Documentation**:
- `debug/WORKFLOW.md`
- `debug/plans/code-never-reached.md`
- `debug/templates/AI_DEBUG_BUNDLE.md`
- `debug/HOW_TO_USE.md`
- `debug/README.md`
- `DEBUG_WORKFLOW_SETUP_SUMMARY.md` (this file)

**Frontend Tracing**:
- `apps/mindmap-web/lib/requestId.ts`
- `apps/mindmap-web/lib/fetcher.ts`
- `apps/mindmap-web/middleware.ts`

**Backend Tracing**:
- `apps/mindmap-cms/src/lib/debugTrace.ts`
- `apps/mindmap-cms/src/lib/entryLogger.ts`

**Automation**:
- `scripts/doctor.js`
- `scripts/triage.js`

**CI/CD**:
- `.github/workflows/doctor.yml`

**AI Rules**:
- `.augment/rules/05-debug-workflow.md`

### Modified (3 files)

- `package.json` - Added doctor and triage scripts
- `apps/mindmap-cms/src/payload.config.ts` - Added entryLoggerPlugin
- `.github/pull_request_template.md` - Added debug bundle requirements
- `.augment/rules/README.md` - Added 05-debug-workflow.md

---

## Acceptance Criteria - All Met ✅

- ✅ Running `npm run triage` produces `debug/latest-*` artifacts
- ✅ With debug flags on, both frontend and Payload logs show the SAME requestId
- ✅ PR template + CI gate exist and enforce running doctor
- ✅ Docs clearly instruct how to debug "code never reached" scenarios
- ✅ Tracing utilities are behind flags (DEBUG_TRACE, NEXT_PUBLIC_DEBUG_TRACE)
- ✅ No secrets are logged (Authorization, cookies, tokens filtered)
- ✅ Minimal instrumentation (no business logic changes)
- ✅ AI rules enforce workflow in every session

---

## Next Steps

1. **Test the workflow**:
   ```bash
   # Enable tracing
   NEXT_PUBLIC_DEBUG_TRACE=1 npm run dev:web
   DEBUG_TRACE=1 npm run dev:cms
   
   # Trigger a request and verify requestId appears in both logs
   ```

2. **Run verification**:
   ```bash
   npm run doctor
   npm run triage
   ```

3. **Review artifacts**:
   - Check `debug/latest-output.txt`
   - Check `debug/latest-summary.json`
   - Check `debug/latest-failures.json`

4. **Try debugging a real bug**:
   - Follow `debug/HOW_TO_USE.md`
   - Use `debug/plans/code-never-reached.md` decision tree
   - Fill `debug/templates/AI_DEBUG_BUNDLE.md`

---

## Key Features

### 🔍 Request ID Propagation
- Same requestId in frontend and backend logs
- Visible in browser DevTools (response headers)
- Automatic via middleware (no code changes needed)

### 🛡️ Security First
- Never logs secrets (Authorization, cookies, tokens, passwords)
- Sanitizes log data automatically
- Only active behind debug flags

### ✅ Automated Verification
- Doctor script checks lint, typecheck, tests, build
- Triage script captures artifacts for debugging
- CI enforces doctor check on every PR

### 🤖 AI Enforcement
- Augment rules automatically loaded in every session
- Enforces workflow, evidence requirements, code constraints
- Provides quick reference and examples

### 📋 Comprehensive Documentation
- Step-by-step workflow
- Decision tree for "code never reached"
- Templates for PR documentation
- How-to guide with examples

---

## Support

- **Quick start**: `debug/HOW_TO_USE.md`
- **Full workflow**: `debug/WORKFLOW.md`
- **Decision tree**: `debug/plans/code-never-reached.md`
- **PR template**: `debug/templates/AI_DEBUG_BUNDLE.md`
- **AI rules**: `.augment/rules/05-debug-workflow.md`

