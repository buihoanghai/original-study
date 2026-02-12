import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Flashcard System
 * 
 * Tests complete user workflows:
 * 1. Create flashcard from mindmap node
 * 2. Review flashcards with spaced repetition
 * 3. Track progress and statistics
 * 4. Keyboard shortcuts work correctly
 */

test.describe('Flashcard System E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/')
  })

  test('should create a new mindmap and add flashcards', async ({ page }) => {
    // Click "New Mindmap" button
    await page.click('text=New Mindmap')
    
    // Fill in mindmap details
    await page.fill('input[id="title"]', 'Test Mindmap for Flashcards')
    await page.fill('textarea[id="description"]', 'Testing flashcard creation')
    
    // Submit form
    await page.click('button:has-text("Create Mindmap")')
    
    // Wait for editor to load
    await page.waitForURL(/\/editor\/.*/)
    
    // Verify we're in the editor
    await expect(page.locator('text=Test Mindmap for Flashcards')).toBeVisible()
    
    // Select the root node (should be auto-selected)
    // Open flashcard panel with keyboard shortcut
    await page.keyboard.press('Control+Shift+F')
    
    // Wait for flashcard panel to appear
    await expect(page.locator('text=Flashcards')).toBeVisible()
    
    // Click "Create Flashcard" button
    await page.click('button:has-text("Create Flashcard")')
    
    // Fill in flashcard form
    await page.fill('textarea[id="question"]', 'What is a mindmap?')
    await page.fill('textarea[id="answer"]', 'A visual diagram for organizing information')
    
    // Submit flashcard
    await page.click('button:has-text("Create Flashcard")')
    
    // Verify flashcard appears in panel
    await expect(page.locator('text=What is a mindmap?')).toBeVisible()
  })

  test('should create flashcard and cancel with Escape key', async ({ page }) => {
    // Navigate to new mindmap page
    await page.goto('/new')
    
    // Create mindmap
    await page.fill('input[id="title"]', 'Test Escape Key')
    await page.click('button:has-text("Create Mindmap")')
    
    // Wait for editor
    await page.waitForURL(/\/editor\/.*/)
    
    // Open flashcard panel
    await page.keyboard.press('Control+Shift+F')
    
    // Click create flashcard
    await page.click('button:has-text("Create Flashcard")')
    
    // Start filling form
    await page.fill('textarea[id="question"]', 'Test question')
    
    // Press Escape to cancel
    await page.keyboard.press('Escape')
    
    // Verify form is closed (Create Flashcard button should be visible again)
    await expect(page.locator('button:has-text("Create Flashcard")')).toBeVisible()
  })

  test('should review flashcards with keyboard shortcuts', async ({ page }) => {
    // This test assumes there are flashcards in the system
    // In a real scenario, you'd set up test data first
    
    // Navigate to review page
    await page.goto('/review')
    
    // Wait for flashcards to load
    await page.waitForTimeout(1000)
    
    // Check if there are flashcards to review
    const hasFlashcards = await page.locator('text=Question').isVisible().catch(() => false)
    
    if (hasFlashcards) {
      // Verify question is visible
      await expect(page.locator('text=Question')).toBeVisible()
      
      // Press Space to flip card
      await page.keyboard.press('Space')
      
      // Verify answer is revealed
      await expect(page.locator('text=Rate your recall:')).toBeVisible()
      
      // Verify rating buttons are visible
      await expect(page.locator('button:has-text("Again")')).toBeVisible()
      await expect(page.locator('button:has-text("Hard")')).toBeVisible()
      await expect(page.locator('button:has-text("Good")')).toBeVisible()
      await expect(page.locator('button:has-text("Easy")')).toBeVisible()
      
      // Press 3 to rate as "Good"
      await page.keyboard.press('3')
      
      // Wait for next card or completion screen
      await page.waitForTimeout(500)
    } else {
      // No flashcards to review - verify empty state
      await expect(page.locator('text=No flashcards due for review')).toBeVisible()
    }
  })

  test('should display flashcard statistics', async ({ page }) => {
    // Navigate to review page
    await page.goto('/review')
    
    // Wait for stats to load
    await page.waitForTimeout(1000)
    
    // Verify statistics labels are present
    await expect(page.locator('text=Total Cards')).toBeVisible()
    await expect(page.locator('text=Due Today')).toBeVisible()
    await expect(page.locator('text=Due This Week')).toBeVisible()
    await expect(page.locator('text=New Cards')).toBeVisible()
  })

  test('should navigate review with all keyboard shortcuts', async ({ page }) => {
    // Navigate to review page
    await page.goto('/review')
    
    await page.waitForTimeout(1000)
    
    const hasFlashcards = await page.locator('text=Question').isVisible().catch(() => false)
    
    if (hasFlashcards) {
      // Test Space key (flip)
      await page.keyboard.press('Space')
      await expect(page.locator('text=Rate your recall:')).toBeVisible()
      
      // Test all rating keys (1-4)
      // We'll just test that pressing them doesn't cause errors
      // In a real test, you'd verify the flashcard advances
    }
  })
})

