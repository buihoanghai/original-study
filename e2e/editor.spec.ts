import { test, expect } from '@playwright/test'

test.describe('Editor Page - E2E Smoke Test', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/')

    // Check that the page loads without errors
    await expect(page).toHaveURL('/')

    // Check that the page has a title
    await expect(page).toHaveTitle(/Mindmap Learning/)

    // Check that the main heading is visible
    await expect(page.locator('h1')).toContainText('My Mindmaps')
  })

  test('should navigate to new mindmap page', async ({ page }) => {
    await page.goto('/')

    // Click "New Mindmap" link
    await page.click('text=New Mindmap')

    // Verify we're on the new mindmap page
    await expect(page).toHaveURL('/new')
    await expect(page.locator('h1')).toContainText('Create New Mindmap')
  })
})

