# E2E Testing Guide

## Overview

This guide covers the E2E tests created for the Mindmap Learning App, focusing on authentication, access control, and API validation.

## Test Files

### 1. Authentication & Access Control (`e2e/auth-access-control.spec.ts`)

Tests the authentication flow and access control for mindmaps.

**Scenarios**:
- ✅ Redirect to login when not authenticated
- ✅ Show error when accessing mindmaps without authentication
- ✅ Authenticated user should see mindmap list
- ✅ Should NOT show "You are not allowed to perform this action" error
- ✅ Create mindmap and see it in list
- ✅ Handle API errors gracefully
- ✅ Handle network errors gracefully
- ✅ Maintain authentication across page reloads
- ✅ Send credentials with API requests

**Related Fix**: Cookie forwarding in Next.js Server Components
- See `docs/FIX_AUTH_ACCESS_CONTROL.md`

### 2. Mindmap Nodes API (`e2e/mindmap-nodes.spec.ts`)

Tests the creation and management of mindmap nodes via the API.

**Scenarios**:
- ✅ Create node without providing nodeId (auto-generated)
- ✅ Create node with custom nodeId
- ✅ Enforce nodeId immutability on update
- ✅ Require mindmap relationship
- ✅ Require position coordinates
- ✅ Fetch nodes for a mindmap

**Related Fix**: nodeId field validation
- See `docs/FIX_NODEID_VALIDATION.md`

## Running Tests

### Run All E2E Tests

```bash
npm run test:e2e
```

### Run Specific Test File

```bash
npm run test:e2e -- auth-access-control.spec.ts
npm run test:e2e -- mindmap-nodes.spec.ts
```

### Run in UI Mode (Interactive)

```bash
npx playwright test --ui
```

### Run in Debug Mode

```bash
npx playwright test --debug
```

## Test Setup

### Authentication Setup (`e2e/auth.setup.ts`)

- Creates a test user with email `test@example.com` and password `testpassword123`
- Logs in via the browser
- Saves authentication state to `playwright/.auth/user.json`
- This state is reused across all tests that require authentication

### Configuration (`playwright.config.ts`)

- Base URL: `http://localhost:3333` (Next.js web app)
- CMS URL: `http://localhost:3001` (Payload CMS)
- Timeout: 30 seconds per test
- Retries: 2 on CI, 0 locally
- Browsers: Chromium, Firefox, WebKit

## Common Issues

### 1. "You are not allowed to perform this action"

**Cause**: Server Components not forwarding cookies to backend API

**Fix**: Use `cookies()` from `next/headers` and pass to API functions
- See `docs/FIX_AUTH_ACCESS_CONTROL.md`

### 2. "The following field is invalid: nodeId"

**Cause**: Field validation runs before hooks, `required: true` fails before auto-generation

**Fix**: Change `nodeId` field to `required: false` in schema
- See `docs/FIX_NODEID_VALIDATION.md`

### 3. Dev Server Lock File

**Symptom**: Tests hang or fail to start dev servers

**Fix**:
```bash
rm -f apps/mindmap-web/.next/dev/lock
rm -f apps/mindmap-cms/.next/dev/lock
```

### 4. Port Already in Use

**Symptom**: `EADDRINUSE: address already in use`

**Fix**:
```bash
# Kill processes on ports 3333 and 3001
lsof -ti:3333,3001 | xargs kill -9
```

## Best Practices

### 1. Use Playwright's Request Context

For API testing, use `request` fixture instead of `fetch`:

```typescript
test('should create mindmap', async ({ request }) => {
  const response = await request.post(`${CMS_URL}/api/mindmaps`, {
    data: {
      title: 'Test Mindmap',
      status: 'draft',
    },
  })
  
  expect(response.ok()).toBeTruthy()
  const data = await response.json()
  expect(data.doc.title).toBe('Test Mindmap')
})
```

### 2. Clean Up Test Data

Always clean up test data in `afterAll` or `afterEach`:

```typescript
test.afterAll(async ({ request }) => {
  await request.delete(`${CMS_URL}/api/mindmaps/${mindmapId}`)
})
```

### 3. Use Descriptive Test Names

```typescript
// ✅ Good
test('should auto-generate nodeId when not provided')

// ❌ Bad
test('test nodeId')
```

### 4. Test Both Success and Failure Cases

```typescript
test('should create node with valid data', async ({ request }) => {
  // Test success case
})

test('should fail when mindmap relationship is missing', async ({ request }) => {
  // Test failure case
})
```

## Debugging Tips

### 1. Use `page.pause()` to Inspect

```typescript
test('debug test', async ({ page }) => {
  await page.goto('/')
  await page.pause() // Opens Playwright Inspector
})
```

### 2. Take Screenshots on Failure

```typescript
test('my test', async ({ page }) => {
  try {
    // Test code
  } catch (error) {
    await page.screenshot({ path: 'failure.png' })
    throw error
  }
})
```

### 3. Enable Verbose Logging

```bash
DEBUG=pw:api npm run test:e2e
```

## Next Steps

1. **Run the tests** to verify fixes work
2. **Add more scenarios** as new features are developed
3. **Integrate with CI/CD** to run tests automatically
4. **Monitor test flakiness** and fix unstable tests

## Related Documentation

- `docs/FIX_AUTH_ACCESS_CONTROL.md` - Cookie forwarding fix
- `docs/FIX_NODEID_VALIDATION.md` - nodeId validation fix
- `playwright.config.ts` - Playwright configuration
- `e2e/auth.setup.ts` - Authentication setup

