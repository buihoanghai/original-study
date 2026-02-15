import { test, expect } from '@playwright/test'

/**
 * Authentication & Access Control E2E Tests
 *
 * Tests authentication flows and RBAC scenarios:
 * - Unauthenticated access (should redirect to login)
 * - Authenticated access (should see own mindmaps)
 * - Access control errors (should show proper error messages)
 * - Cookie-based authentication (credentials: 'include')
 */

test.describe('Authentication & Access Control', () => {
  test('should redirect to login when not authenticated', async ({ page, context }) => {
    // Clear all cookies to simulate unauthenticated state
    await context.clearCookies()

    // Try to access home page
    await page.goto('/')

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
  })

  test('should show error when accessing mindmaps without authentication', async ({ page, context }) => {
    // Clear all cookies
    await context.clearCookies()

    // Try to access home page
    await page.goto('/')

    // Wait for redirect to login
    await page.waitForURL(/\/login/, { timeout: 10000 })

    // Should show login form
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('authenticated user should see empty mindmap list', async ({ page }) => {
    // User is already authenticated via auth.setup.ts
    await page.goto('/')

    // Should be on home page
    await expect(page).toHaveURL('/')

    // Should see the page title
    await expect(page.locator('h1:has-text("My Mindmaps")')).toBeVisible()

    // Should either see mindmap list or empty state
    const hasMindmaps = await page.locator('[data-testid="mindmap-list"]').isVisible().catch(() => false)
    const hasEmptyState = await page.locator('text=/No mindmaps yet|Get started/i').isVisible().catch(() => false)

    // One of them should be visible
    expect(hasMindmaps || hasEmptyState).toBe(true)
  })

  test('should NOT show access denied error for authenticated user', async ({ page }) => {
    // User is already authenticated via auth.setup.ts
    await page.goto('/')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Should NOT see "Error Loading Mindmaps"
    const hasError = await page.locator('text=Error Loading Mindmaps').isVisible().catch(() => false)
    expect(hasError).toBe(false)

    // Should NOT see "You are not allowed to perform this action"
    const hasAccessDenied = await page.locator('text=/You are not allowed to perform this action/i').isVisible().catch(() => false)
    expect(hasAccessDenied).toBe(false)
  })

  test('should create mindmap and see it in list', async ({ page }) => {
    // Go to new mindmap page
    await page.goto('/new')

    // Fill in form
    await page.fill('#title', 'Test Mindmap - Access Control')
    await page.fill('#description', 'Testing access control')

    // Submit
    await page.click('button[type="submit"]')

    // Wait for redirect to editor
    await page.waitForURL(/\/editor\/.*/, { timeout: 10000 })

    // Go back to home
    await page.goto('/')

    // Should see the mindmap in the list
    await expect(page.locator('text=Test Mindmap - Access Control')).toBeVisible({ timeout: 5000 })
  })

  test('should handle API errors gracefully', async ({ page }) => {
    await page.goto('/')

    // Intercept API call and return 403 Forbidden
    await page.route('**/api/mindmaps*', route => {
      route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          errors: [
            {
              message: 'You are not allowed to perform this action',
            },
          ],
        }),
      })
    })

    // Reload page to trigger API call
    await page.reload()

    // Should show error message
    await expect(page.locator('text=Error Loading Mindmaps')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=/You are not allowed to perform this action/i')).toBeVisible()
  })

  test('should handle network errors gracefully', async ({ page, context }) => {
    await page.goto('/')

    // Simulate offline mode
    await context.setOffline(true)

    // Reload page
    await page.reload()

    // Should show error message
    await expect(page.locator('text=Error Loading Mindmaps')).toBeVisible({ timeout: 5000 })

    // Restore online mode
    await context.setOffline(false)
  })

  test('should maintain authentication across page reloads', async ({ page }) => {
    // Go to home page
    await page.goto('/')

    // Verify authenticated
    await expect(page.locator('h1:has-text("My Mindmaps")')).toBeVisible()

    // Reload page
    await page.reload()

    // Should still be authenticated
    await expect(page.locator('h1:has-text("My Mindmaps")')).toBeVisible()

    // Should NOT redirect to login
    await expect(page).toHaveURL('/')
  })

  test('should send credentials with API requests', async ({ page }) => {
    let hasCookies = false

    // Listen to API requests
    page.on('request', request => {
      if (request.url().includes('/api/mindmaps')) {
        const headers = request.headers()
        // Check if cookies are being sent
        hasCookies = !!headers['cookie']
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Verify cookies were sent with the request
    expect(hasCookies).toBe(true)
  })
})

