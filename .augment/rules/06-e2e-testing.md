# E2E Testing Workflow - Mandatory for All E2E Test Work

**Type**: `always` - Automatically loaded in every AI session

---

## CRITICAL: E2E Test Execution Strategy

When working with E2E tests, ALWAYS follow this workflow. No exceptions.

### The Mandatory Workflow

1. **START SERVERS** - Ensure dev environment is running
2. **RUN ALL TESTS** - Get complete picture of failures
3. **LIST ALL ERRORS** - Document every failure with details
4. **FIX ONE BY ONE** - Fix each error individually and verify
5. **VERIFY FIX** - Re-run specific test to confirm fix works
6. **REPEAT** - Continue until all tests pass

---

## Prerequisites - MUST CHECK BEFORE RUNNING TESTS

### 1. MongoDB Must Be Running

```bash
# Check if MongoDB is running
make dev-db

# Or check manually
lsof -i :27017
```

**If MongoDB is not running, E2E tests WILL FAIL.**

### 2. Dev Servers Must Be Running

```bash
# Start both CMS and Web in dev mode
make dev-all

# Or start individually:
make dev-cms   # Runs on http://localhost:3001
make dev-web   # Runs on http://localhost:3000
```

**E2E tests expect:**
- CMS at `http://localhost:3001`
- Web at `http://localhost:3333` (Playwright config)

### 3. Check Server Health

```bash
# Verify servers are responding
curl http://localhost:3001/api/health
curl http://localhost:3333
```

---

## Running E2E Tests

### Strategy 1: Run All Tests First (RECOMMENDED)

**Purpose**: Get complete picture of all failures before fixing

```bash
# Run all E2E tests
make test-e2e
```

**Expected Output**:
- List of all test files
- Pass/fail status for each test
- Error messages for failures
- Summary: X passed, Y failed

**What to Do Next**:
1. **Document all failures** - Copy error messages
2. **Categorize errors** - Group by type (timeout, assertion, navigation, etc.)
3. **Prioritize fixes** - Fix blocking issues first
4. **Fix one by one** - Use Strategy 2 for each failing test

### Strategy 2: Run Specific Test File (FOR FIXING)

**Purpose**: Quickly verify a single fix without running entire suite

```bash
# Run specific test file
make test-e2e FILE=e2e/mindmap-management.spec.ts

# Other examples:
make test-e2e FILE=e2e/editor-advanced.spec.ts
make test-e2e FILE=apps/mindmap-web/e2e/learning-system.spec.ts
```

**When to Use**:
- After fixing a specific test
- When working on a specific feature
- During iterative debugging

**Workflow**:
1. Run specific test
2. Read error message carefully
3. Make ONE focused fix
4. Re-run same test
5. Verify fix works
6. Move to next failing test

---

## E2E Test Locations

```
project-root/
├── e2e/                              # Root-level E2E tests
│   ├── auth.spec.ts                  # Authentication tests
│   ├── editor.spec.ts                # Basic editor tests
│   ├── editor-advanced.spec.ts       # Advanced editor features
│   ├── editor-complete.spec.ts       # Complete editor workflow
│   ├── flashcard-review.spec.ts      # Flashcard review system
│   ├── mindmap-management.spec.ts    # CRUD operations
│   └── auth.setup.ts                 # Auth setup for tests
│
├── apps/mindmap-web/e2e/             # Web-specific E2E tests
│   ├── flashcard.spec.ts
│   ├── flashcard-panel.spec.ts
│   └── learning-system.spec.ts
│
└── apps/mindmap-cms/tests/e2e/       # CMS-specific E2E tests
    ├── admin.e2e.spec.ts
    └── frontend.e2e.spec.ts
```

---

## Common E2E Test Errors and Fixes

### Error 1: Timeout Waiting for Selector

```
Error: Timeout 30000ms exceeded waiting for selector "button:has-text('Create')"
```

**Root Causes**:
- Element doesn't exist on page
- Element is hidden or not visible
- Page didn't load correctly
- Wrong selector

**How to Fix**:
1. Check if element exists in the actual UI
2. Verify selector is correct
3. Add `await page.waitForLoadState('networkidle')` before interaction
4. Increase timeout if needed: `{ timeout: 60000 }`

### Error 2: Navigation Timeout

```
Error: page.goto: Timeout 30000ms exceeded
```

**Root Causes**:
- Server not running
- Server crashed
- Network issue
- Page has infinite loading

**How to Fix**:
1. Check server logs for errors
2. Verify server is running: `curl http://localhost:3333`
3. Check for JavaScript errors in browser console
4. Add `await page.waitForLoadState('domcontentloaded')`

### Error 3: URL Mismatch

```
Error: expect(received).toHaveURL(expected)
Expected pattern: /\/editor\/[^/]+(?:\/[^/]+)?/
Received string:  "http://localhost:3333/"
```

**Root Causes**:
- Navigation didn't happen
- Wrong URL pattern
- Redirect occurred
- Feature not implemented

**How to Fix**:
1. Check if navigation code exists
2. Verify URL pattern matches actual URLs
3. Add `await page.waitForURL(pattern)` before assertion
4. Check browser network tab for redirects

---

## Debugging E2E Tests

### Enable Headed Mode (See Browser)

```bash
# Run with visible browser
npx playwright test e2e/mindmap-management.spec.ts --headed

# Run with slow motion
npx playwright test e2e/mindmap-management.spec.ts --headed --slow-mo=1000
```

### Enable Debug Mode

```bash
# Run with Playwright Inspector
npx playwright test e2e/mindmap-management.spec.ts --debug
```

### Check Screenshots and Videos

After test failure, check:
```
test-results/
├── screenshots/
└── videos/
```

---

## E2E Test Best Practices

### DO:
- ✅ Run all tests first to see complete picture
- ✅ Fix one test at a time
- ✅ Re-run specific test after each fix
- ✅ Check server logs when tests fail
- ✅ Use headed mode for debugging
- ✅ Add `data-testid` attributes for reliable selectors
- ✅ Wait for network idle before assertions

### DON'T:
- ❌ Fix multiple tests without verifying each one
- ❌ Run tests without checking servers are running
- ❌ Ignore timeout errors (they indicate real problems)
- ❌ Use fragile selectors (text content, nth-child)
- ❌ Skip documenting failures before fixing

---

## Quick Reference

```bash
# Check prerequisites
make dev-db                                    # Start MongoDB
make dev-all                                   # Start both servers
lsof -i :3001 :3333                           # Verify servers running

# Run tests
make test-e2e                                  # All tests
make test-e2e FILE=e2e/auth.spec.ts           # Specific file

# Debug tests
npx playwright test FILE --headed              # See browser
npx playwright test FILE --debug               # Step through
npx playwright show-report                     # View HTML report
```

---

## Example: Complete E2E Fix Workflow

```bash
# 1. Start environment
make dev-db
make dev-all

# 2. Run all tests to see failures
make test-e2e
# Output: 15 passed, 5 failed

# 3. Document failures
# - auth.spec.ts: Login button not found
# - editor.spec.ts: URL navigation timeout
# - mindmap-management.spec.ts: Create button timeout
# - flashcard.spec.ts: Assertion failed
# - learning-system.spec.ts: Element not visible

# 4. Fix first failure (auth.spec.ts)
make test-e2e FILE=e2e/auth.spec.ts
# Read error, make fix, re-run
make test-e2e FILE=e2e/auth.spec.ts
# ✅ Passes

# 5. Fix second failure (editor.spec.ts)
make test-e2e FILE=e2e/editor.spec.ts
# Read error, make fix, re-run
make test-e2e FILE=e2e/editor.spec.ts
# ✅ Passes

# 6. Continue until all pass
# ...

# 7. Final verification
make test-e2e
# Output: 20 passed, 0 failed ✅
```

