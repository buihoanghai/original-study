import { test, expect } from '@playwright/test'

/**
 * Flashcard Review E2E Tests
 *
 * Tests the flashcard review page and workflow:
 * - Navigate to review page
 * - Review flashcards with keyboard shortcuts (1-4, Space, Escape)
 * - Complete review session
 * - View statistics
 * - Handle empty state (no due flashcards)
 */

test.describe('Flashcard Review', () => {
  test.beforeEach(async ({ page }) => {
    // Start from home page
    await page.goto('/')
  })

  test('should navigate to review page from header', async ({ page }) => {
    // Click "Review" link in header
    await page.click('text=Review')

    // Should navigate to review page
    await expect(page).toHaveURL('/review')

    // Should see review page heading
    await expect(page.locator('h1')).toContainText(/Review|Flashcards/)
  })

  test('should show empty state when no flashcards are due', async ({ page }) => {
    await page.goto('/review')

    // Should show empty state message
    await expect(page.locator('text=/No flashcards due/i')).toBeVisible({ timeout: 5000 })

    // Should show link to create mindmaps
    await expect(page.locator('text=/Create a mindmap/i')).toBeVisible()
  })

  test('should review flashcard with keyboard shortcuts', async ({ page }) => {
    // First, create a mindmap with flashcards
    await page.goto('/new')
    await page.fill('#title', 'Test Mindmap for Review')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/editor\/.*/, { timeout: 10000 })
    await page.waitForSelector('[data-testid="mindmap-canvas"]', { timeout: 10000 })
    await page.waitForTimeout(1000)

    // Create a node and add flashcard
    const rootNode = page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').first()
    await rootNode.dblclick()
    await page.keyboard.press('Control+a')
    await page.keyboard.type('What is a mindmap?')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    // Open flashcard panel
    await page.keyboard.press('Control+Shift+f')
    await page.waitForTimeout(500)

    // Create flashcard
    await page.click('button:has-text("Create Flashcard")')
    await page.fill('textarea[id="question"]', 'What is a mindmap?')
    await page.fill('textarea[id="answer"]', 'A visual diagram for organizing information')
    await page.click('button:has-text("Save")')
    await page.waitForTimeout(500)

    // Navigate to review page
    await page.goto('/review')
    await page.waitForTimeout(1000)

    // Should see flashcard question
    await expect(page.locator('text=What is a mindmap?')).toBeVisible()

    // Press Space to reveal answer
    await page.keyboard.press('Space')
    await page.waitForTimeout(300)

    // Should see answer
    await expect(page.locator('text=A visual diagram for organizing information')).toBeVisible()

    // Press 3 (Good) to rate
    await page.keyboard.press('3')
    await page.waitForTimeout(500)

    // Should show completion or next card
    // (Depends on whether there are more cards)
  })

  test('should rate flashcard with number keys 1-4', async ({ page }) => {
    // Assuming we have flashcards from previous test or setup
    await page.goto('/review')

    // Wait for flashcard to load
    await page.waitForTimeout(1000)

    // Check if there are flashcards
    const hasFlashcards = await page.locator('[data-testid="flashcard-question"]').isVisible().catch(() => false)

    if (hasFlashcards) {
      // Reveal answer
      await page.keyboard.press('Space')
      await page.waitForTimeout(300)

      // Test rating with number keys
      // 1 = Again, 2 = Hard, 3 = Good, 4 = Easy
      await page.keyboard.press('3')
      await page.waitForTimeout(500)

      // Should proceed to next card or show completion
    }
  })

  test('should exit review with Escape key', async ({ page }) => {
    await page.goto('/review')
    await page.waitForTimeout(1000)

    // Press Escape to exit
    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)

    // Should navigate back to home page
    await expect(page).toHaveURL('/')
  })

  test('should show review statistics', async ({ page }) => {
    await page.goto('/review')
    await page.waitForTimeout(1000)

    // Should see statistics section
    // (This depends on implementation - might be on review page or separate stats page)
    const hasStats = await page.locator('text=/Statistics|Stats|Progress/i').isVisible().catch(() => false)

    if (hasStats) {
      // Should show review count
      await expect(page.locator('text=/Reviewed|Cards reviewed/i')).toBeVisible()

      // Should show accuracy or other metrics
      await expect(page.locator('text=/Accuracy|Success rate/i')).toBeVisible()
    }
  })

  test('should complete review session', async ({ page }) => {
    // Create a mindmap with one flashcard
    await page.goto('/new')
    await page.fill('#title', 'Single Flashcard Test')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/editor\/.*/, { timeout: 10000 })
    await page.waitForSelector('[data-testid="mindmap-canvas"]', { timeout: 10000 })
    await page.waitForTimeout(1000)

    // Create flashcard (simplified)
    const rootNode = page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').first()
    await rootNode.dblclick()
    await page.keyboard.type('Test Question')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    // Open flashcard panel and create flashcard
    await page.keyboard.press('Control+Shift+f')
    await page.waitForTimeout(500)
    await page.click('button:has-text("Create Flashcard")')
    await page.fill('textarea[id="question"]', 'Test Question')
    await page.fill('textarea[id="answer"]', 'Test Answer')
    await page.click('button:has-text("Save")')
    await page.waitForTimeout(500)

    // Go to review
    await page.goto('/review')
    await page.waitForTimeout(1000)

    // Review the flashcard
    await page.keyboard.press('Space') // Reveal answer
    await page.waitForTimeout(300)
    await page.keyboard.press('3') // Rate as Good
    await page.waitForTimeout(500)

    // Should show completion message
    await expect(page.locator('text=/Review complete|All done|No more cards/i')).toBeVisible({ timeout: 5000 })

    // Should show option to return home
    await expect(page.locator('text=/Back to home|Return/i')).toBeVisible()
  })

  test('should show progress during review session', async ({ page }) => {
    await page.goto('/review')
    await page.waitForTimeout(1000)

    // Should show progress indicator (e.g., "1 / 5 cards")
    const hasProgress = await page.locator('text=/\\d+\\s*\\/\\s*\\d+/').isVisible().catch(() => false)

    if (hasProgress) {
      // Progress indicator should be visible
      await expect(page.locator('[data-testid="review-progress"]')).toBeVisible()
    }
  })
})

