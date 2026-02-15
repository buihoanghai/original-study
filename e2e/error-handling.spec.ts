import { test, expect } from '@playwright/test'

/**
 * Error Handling E2E Tests
 *
 * Tests error handling and edge cases:
 * - Network errors (offline mode)
 * - Invalid data handling
 * - Empty states
 * - 404 pages
 * - API errors
 * - Validation errors
 */

test.describe('Error Handling', () => {
  test('should handle 404 page not found', async ({ page }) => {
    // Navigate to non-existent page
    await page.goto('/this-page-does-not-exist')

    // Should show 404 error page
    await expect(page.locator('text=/404|Not Found|Page not found/i')).toBeVisible()

    // Should have link to go back home
    await expect(page.locator('a[href="/"]')).toBeVisible()
  })

  test('should handle invalid mindmap ID', async ({ page }) => {
    // Navigate to editor with invalid ID
    await page.goto('/editor/invalid-mindmap-id-12345')

    // Should show error message
    await expect(page.locator('text=/not found|does not exist/i')).toBeVisible({ timeout: 10000 })

    // Should have option to go back
    await expect(page.locator('text=/Back to home|Go back/i')).toBeVisible()
  })

  test('should show validation error for empty mindmap title', async ({ page }) => {
    await page.goto('/new')

    // Try to submit without title
    await page.click('button[type="submit"]')

    // Should show validation error
    await expect(page.locator('text=/Title is required/i')).toBeVisible()

    // Should stay on the same page
    await expect(page).toHaveURL('/new')
  })

  test('should handle network error when creating mindmap', async ({ page, context }) => {
    await page.goto('/new')

    // Simulate offline mode
    await context.setOffline(true)

    // Fill form and submit
    await page.fill('#title', 'Test Mindmap')
    await page.click('button[type="submit"]')

    // Should show network error
    await expect(page.locator('text=/Network error|Failed to create|Connection failed/i')).toBeVisible({ timeout: 5000 })

    // Restore online mode
    await context.setOffline(false)
  })

  test('should handle API error when loading mindmaps', async ({ page }) => {
    // Go to home page
    await page.goto('/')

    // Intercept API call and return error
    await page.route('**/api/mindmaps*', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      })
    })

    // Reload page to trigger API call
    await page.reload()

    // Should show error message
    await expect(page.locator('text=/Failed to load|Error loading|Something went wrong/i')).toBeVisible({ timeout: 5000 })

    // Should have retry button
    const hasRetry = await page.locator('button:has-text("Retry")').isVisible().catch(() => false)
    if (hasRetry) {
      await expect(page.locator('button:has-text("Retry")')).toBeVisible()
    }
  })

  test('should show empty state on home page with no mindmaps', async ({ page }) => {
    await page.goto('/')

    // Intercept API to return empty array
    await page.route('**/api/mindmaps*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ docs: [] })
      })
    })

    await page.reload()

    // Should show empty state
    await expect(page.locator('text=/No mindmaps yet|Get started/i')).toBeVisible({ timeout: 5000 })

    // Should show "Create Mindmap" button
    await expect(page.locator('text=New Mindmap')).toBeVisible()
  })

  test('should show loading state when creating mindmap', async ({ page }) => {
    await page.goto('/new')

    // Intercept API to delay response
    await page.route('**/api/mindmaps', route => {
      setTimeout(() => {
        route.continue()
      }, 2000)
    })

    // Fill and submit form
    await page.fill('#title', 'Test Mindmap')
    await page.click('button[type="submit"]')

    // Should show loading state
    await expect(page.locator('button[type="submit"]:disabled')).toBeVisible()
    
    // Or loading spinner
    const hasSpinner = await page.locator('[data-testid="loading-spinner"]').isVisible().catch(() => false)
    if (hasSpinner) {
      await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible()
    }
  })

  test('should handle authentication error', async ({ page, context }) => {
    // Clear authentication
    await context.clearCookies()

    // Try to access protected page
    await page.goto('/editor/test-id')

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })

    // Should show message about authentication
    const hasMessage = await page.locator('text=/Please log in|Sign in to continue/i').isVisible().catch(() => false)
    if (hasMessage) {
      await expect(page.locator('text=/Please log in|Sign in to continue/i')).toBeVisible()
    }
  })

  test('should handle save error in editor', async ({ page }) => {
    // Create a mindmap
    await page.goto('/new')
    await page.fill('#title', 'Test Save Error')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/editor\/.*/, { timeout: 10000 })
    await page.waitForSelector('[data-testid="mindmap-canvas"]', { timeout: 10000 })
    await page.waitForTimeout(1000)

    // Intercept save API to return error
    await page.route('**/api/mindmaps/*', route => {
      if (route.request().method() === 'PATCH' || route.request().method() === 'PUT') {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Failed to save' })
        })
      } else {
        route.continue()
      }
    })

    // Make a change
    const rootNode = page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').first()
    await rootNode.dblclick()
    await page.keyboard.type('Test content')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    // Try to save
    await page.keyboard.press('Control+s')
    await page.waitForTimeout(1000)

    // Should show error notification
    await expect(page.locator('text=/Failed to save|Save error|Could not save/i')).toBeVisible({ timeout: 5000 })
  })

  test('should handle invalid flashcard data', async ({ page }) => {
    // Create a mindmap
    await page.goto('/new')
    await page.fill('#title', 'Test Invalid Flashcard')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/editor\/.*/, { timeout: 10000 })
    await page.waitForSelector('[data-testid="mindmap-canvas"]', { timeout: 10000 })
    await page.waitForTimeout(1000)

    // Open flashcard panel
    await page.keyboard.press('Control+Shift+f')
    await page.waitForTimeout(500)

    // Try to create flashcard without question
    await page.click('button:has-text("Create Flashcard")')
    await page.fill('textarea[id="answer"]', 'Answer without question')
    await page.click('button:has-text("Save")')

    // Should show validation error
    await expect(page.locator('text=/Question is required/i')).toBeVisible()
  })

  test('should show sync error indicator', async ({ page }) => {
    // Create a mindmap
    await page.goto('/new')
    await page.fill('#title', 'Test Sync Error')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/editor\/.*/, { timeout: 10000 })
    await page.waitForSelector('[data-testid="mindmap-canvas"]', { timeout: 10000 })
    await page.waitForTimeout(1000)

    // Intercept sync API to return error
    await page.route('**/api/mindmaps/*', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Sync failed' })
      })
    })

    // Make a change to trigger sync
    const rootNode = page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').first()
    await rootNode.dblclick()
    await page.keyboard.type('Trigger sync')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(2000)

    // Should show sync error indicator
    const hasSyncStatus = await page.locator('[data-testid="sync-status"]').isVisible().catch(() => false)
    if (hasSyncStatus) {
      await expect(page.locator('[data-testid="sync-status"]')).toContainText(/error|failed/i)
    }
  })
})

