import { test, expect } from '@playwright/test'

/**
 * Flashcard Panel E2E Tests
 *
 * Tests the flashcard panel in the editor:
 * - Open/close panel with Ctrl+Shift+F
 * - Create flashcard from selected node
 * - Edit existing flashcard
 * - Delete flashcard
 * - View flashcard list in panel
 */

test.describe('Flashcard Panel', () => {
  test.beforeEach(async ({ page }) => {
    // Create a new mindmap
    await page.goto('/new')
    await page.fill('#title', 'Test Mindmap - Flashcard Panel')
    await page.click('button[type="submit"]')

    // Wait for editor to load
    await page.waitForURL(/\/editor\/.*/, { timeout: 10000 })
    await page.waitForSelector('[data-testid="mindmap-canvas"]', { timeout: 10000 })
    await page.waitForTimeout(1000)
  })

  test('should open flashcard panel with Ctrl+Shift+F', async ({ page }) => {
    // Panel should not be visible initially
    const panel = page.locator('[data-testid="flashcard-panel"]')
    await expect(panel).not.toBeVisible()

    // Press Ctrl+Shift+F to open
    await page.keyboard.press('Control+Shift+f')
    await page.waitForTimeout(500)

    // Panel should be visible
    await expect(panel).toBeVisible()

    // Should see "Flashcards" heading
    await expect(page.locator('text=Flashcards')).toBeVisible()
  })

  test('should close flashcard panel with Ctrl+Shift+F', async ({ page }) => {
    // Open panel
    await page.keyboard.press('Control+Shift+f')
    await page.waitForTimeout(500)

    const panel = page.locator('[data-testid="flashcard-panel"]')
    await expect(panel).toBeVisible()

    // Press Ctrl+Shift+F again to close
    await page.keyboard.press('Control+Shift+f')
    await page.waitForTimeout(500)

    // Panel should be hidden
    await expect(panel).not.toBeVisible()
  })

  test('should create flashcard from selected node', async ({ page }) => {
    // Select root node and add content
    const rootNode = page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').first()
    await rootNode.dblclick()
    await page.keyboard.press('Control+a')
    await page.keyboard.type('What is TypeScript?')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    // Open flashcard panel
    await page.keyboard.press('Control+Shift+f')
    await page.waitForTimeout(500)

    // Click "Create Flashcard" button
    await page.click('button:has-text("Create Flashcard")')

    // Should see flashcard form
    await expect(page.locator('textarea[id="question"]')).toBeVisible()

    // Question should be pre-filled with node content
    await expect(page.locator('textarea[id="question"]')).toHaveValue('What is TypeScript?')

    // Fill in answer
    await page.fill('textarea[id="answer"]', 'A typed superset of JavaScript')

    // Save flashcard
    await page.click('button:has-text("Save")')
    await page.waitForTimeout(500)

    // Should see flashcard in panel list
    await expect(page.locator('text=What is TypeScript?')).toBeVisible()
  })

  test('should edit existing flashcard', async ({ page }) => {
    // Create a flashcard first
    const rootNode = page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').first()
    await rootNode.dblclick()
    await page.keyboard.type('Original Question')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    await page.keyboard.press('Control+Shift+f')
    await page.waitForTimeout(500)

    await page.click('button:has-text("Create Flashcard")')
    await page.fill('textarea[id="question"]', 'Original Question')
    await page.fill('textarea[id="answer"]', 'Original Answer')
    await page.click('button:has-text("Save")')
    await page.waitForTimeout(500)

    // Click edit button on the flashcard
    const flashcardItem = page.locator('text=Original Question').locator('..')
    await flashcardItem.hover()
    await flashcardItem.locator('button[aria-label="Edit"]').click()

    // Should see edit form
    await expect(page.locator('textarea[id="question"]')).toHaveValue('Original Question')

    // Update question and answer
    await page.fill('textarea[id="question"]', 'Updated Question')
    await page.fill('textarea[id="answer"]', 'Updated Answer')

    // Save changes
    await page.click('button:has-text("Save")')
    await page.waitForTimeout(500)

    // Should see updated flashcard
    await expect(page.locator('text=Updated Question')).toBeVisible()
    await expect(page.locator('text=Original Question')).not.toBeVisible()
  })

  test('should delete flashcard', async ({ page }) => {
    // Create a flashcard
    const rootNode = page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').first()
    await rootNode.dblclick()
    await page.keyboard.type('Question to Delete')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    await page.keyboard.press('Control+Shift+f')
    await page.waitForTimeout(500)

    await page.click('button:has-text("Create Flashcard")')
    await page.fill('textarea[id="question"]', 'Question to Delete')
    await page.fill('textarea[id="answer"]', 'Answer to Delete')
    await page.click('button:has-text("Save")')
    await page.waitForTimeout(500)

    // Count flashcards before deletion
    const countBefore = await page.locator('[data-testid="flashcard-item"]').count()

    // Click delete button
    const flashcardItem = page.locator('text=Question to Delete').locator('..')
    await flashcardItem.hover()
    await flashcardItem.locator('button[aria-label="Delete"]').click()

    // Confirm deletion
    await page.click('button:has-text("Delete")')
    await page.waitForTimeout(500)

    // Count flashcards after deletion
    const countAfter = await page.locator('[data-testid="flashcard-item"]').count()
    expect(countAfter).toBe(countBefore - 1)

    // Flashcard should not be visible
    await expect(page.locator('text=Question to Delete')).not.toBeVisible()
  })

  test('should show empty state when no flashcards', async ({ page }) => {
    // Open flashcard panel
    await page.keyboard.press('Control+Shift+f')
    await page.waitForTimeout(500)

    // Should see empty state message
    await expect(page.locator('text=/No flashcards yet/i')).toBeVisible()

    // Should see "Create Flashcard" button
    await expect(page.locator('button:has-text("Create Flashcard")')).toBeVisible()
  })

  test('should display flashcard count', async ({ page }) => {
    // Create multiple flashcards
    const rootNode = page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').first()
    
    // Create first flashcard
    await rootNode.dblclick()
    await page.keyboard.type('Question 1')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    await page.keyboard.press('Control+Shift+f')
    await page.waitForTimeout(500)

    await page.click('button:has-text("Create Flashcard")')
    await page.fill('textarea[id="question"]', 'Question 1')
    await page.fill('textarea[id="answer"]', 'Answer 1')
    await page.click('button:has-text("Save")')
    await page.waitForTimeout(500)

    // Create second flashcard
    await page.keyboard.press('Control+Shift+f') // Close panel
    await page.waitForTimeout(200)
    
    await page.keyboard.press('Tab') // Add child node
    const input = page.locator('input[data-testid="node-input"]')
    await expect(input).toBeVisible({ timeout: 2000 })
    await input.fill('Question 2')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    await page.keyboard.press('Control+Shift+f') // Open panel
    await page.waitForTimeout(500)

    await page.click('button:has-text("Create Flashcard")')
    await page.fill('textarea[id="question"]', 'Question 2')
    await page.fill('textarea[id="answer"]', 'Answer 2')
    await page.click('button:has-text("Save")')
    await page.waitForTimeout(500)

    // Should show flashcard count
    await expect(page.locator('text=/2 flashcards/i')).toBeVisible()
  })

  test('should cancel flashcard creation with Escape', async ({ page }) => {
    // Open panel
    await page.keyboard.press('Control+Shift+f')
    await page.waitForTimeout(500)

    // Start creating flashcard
    await page.click('button:has-text("Create Flashcard")')
    await page.fill('textarea[id="question"]', 'Incomplete question')

    // Press Escape to cancel
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)

    // Form should be closed
    await expect(page.locator('textarea[id="question"]')).not.toBeVisible()

    // Should see "Create Flashcard" button again
    await expect(page.locator('button:has-text("Create Flashcard")')).toBeVisible()
  })
})

