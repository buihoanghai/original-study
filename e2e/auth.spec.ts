import { test, expect } from '@playwright/test'

/**
 * Authentication E2E Tests
 *
 * Tests user authentication flows:
 * - Login
 * - Registration
 * - Logout
 * - Protected routes
 * - Session persistence
 */

// Run these tests without authentication setup
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Authentication', () => {
  test.describe('Login', () => {
    test('should login with valid credentials', async ({ page }) => {
      await page.goto('/login')

      // Fill in login form
      await page.fill('input[type="email"]', 'test@example.com')
      await page.fill('input[type="password"]', 'password123')

      // Submit form
      await page.click('button[type="submit"]')

      // Should redirect to home page
      await expect(page).toHaveURL('/', { timeout: 10000 })

      // Should see user avatar/menu in header
      await expect(page.locator('[data-testid="user-avatar"]')).toBeVisible()
    })

    test('should show error with invalid credentials', async ({ page }) => {
      await page.goto('/login')

      await page.fill('input[type="email"]', 'wrong@example.com')
      await page.fill('input[type="password"]', 'wrongpassword')
      await page.click('button[type="submit"]')

      // Should show error message
      await expect(page.locator('text=/Invalid email or password/i')).toBeVisible()

      // Should stay on login page
      await expect(page).toHaveURL('/login')
    })

    test('should validate required fields', async ({ page }) => {
      await page.goto('/login')

      // Try to submit without filling fields
      await page.click('button[type="submit"]')

      // Should show validation error
      await expect(page.locator('text=/required/i')).toBeVisible()
    })

    test('should redirect to returnUrl after login', async ({ page }) => {
      // Try to access protected page
      await page.goto('/editor/test-id')

      // Should redirect to login with returnUrl
      await expect(page).toHaveURL(/\/login\?returnUrl=/)

      // Login
      await page.fill('input[type="email"]', 'test@example.com')
      await page.fill('input[type="password"]', 'password123')
      await page.click('button[type="submit"]')

      // Should redirect back to original page
      await expect(page).toHaveURL(/\/editor\/test-id/, { timeout: 10000 })
    })
  })

  test.describe('Registration', () => {
    test('should register new user', async ({ page }) => {
      await page.goto('/register')

      // Fill in registration form
      const timestamp = Date.now()
      await page.fill('input[id="name"]', 'Test User')
      await page.fill('input[type="email"]', `test${timestamp}@example.com`)
      await page.fill('input[id="password"]', 'password123')
      await page.fill('input[id="confirmPassword"]', 'password123')

      // Submit form
      await page.click('button[type="submit"]')

      // Should redirect to home page
      await expect(page).toHaveURL('/', { timeout: 10000 })
    })

    test('should validate password match', async ({ page }) => {
      await page.goto('/register')

      await page.fill('input[id="name"]', 'Test User')
      await page.fill('input[type="email"]', 'test@example.com')
      await page.fill('input[id="password"]', 'password123')
      await page.fill('input[id="confirmPassword"]', 'different')

      await page.click('button[type="submit"]')

      // Should show error
      await expect(page.locator('text=/Passwords do not match/i')).toBeVisible()
    })

    test('should validate password length', async ({ page }) => {
      await page.goto('/register')

      await page.fill('input[id="name"]', 'Test User')
      await page.fill('input[type="email"]', 'test@example.com')
      await page.fill('input[id="password"]', 'short')
      await page.fill('input[id="confirmPassword"]', 'short')

      await page.click('button[type="submit"]')

      // Should show error
      await expect(page.locator('text=/at least 8 characters/i')).toBeVisible()
    })

    test('should navigate to login page', async ({ page }) => {
      await page.goto('/register')

      // Click "Sign in" link
      await page.click('text=Sign in')

      // Should navigate to login page
      await expect(page).toHaveURL('/login')
    })
  })

  test.describe('Logout', () => {
    test('should logout user', async ({ page }) => {
      // Login first
      await page.goto('/login')
      await page.fill('input[type="email"]', 'test@example.com')
      await page.fill('input[type="password"]', 'password123')
      await page.click('button[type="submit"]')
      await expect(page).toHaveURL('/', { timeout: 10000 })

      // Open user menu
      await page.click('[data-testid="user-avatar"]')

      // Click logout
      await page.click('text=Logout')

      // Should redirect to login page
      await expect(page).toHaveURL('/login', { timeout: 10000 })

      // User avatar should not be visible
      await expect(page.locator('[data-testid="user-avatar"]')).not.toBeVisible()
    })
  })
})

