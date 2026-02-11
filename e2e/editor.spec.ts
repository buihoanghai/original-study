import { test, expect } from '@playwright/test'

test.describe('Editor Page - E2E Smoke Test', () => {
  test('should load the editor page', async ({ page }) => {
    await page.goto('/editor')
    
    // Check that the page loads without errors
    await expect(page).toHaveURL(/.*editor/)
    
    // Check that the page has a title
    await expect(page).toHaveTitle(/Mindmap Learning App/)
  })
})

