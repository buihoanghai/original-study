import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Sticky Note Annotations
 *
 * Tests the Mindmup-style sticky note feature for brainstorming and annotations.
 * Sticky notes are created with Shift+N and are independent from the mindmap tree.
 *
 * Features tested:
 * - Shift+N hotkey creates sticky note
 * - Double-click to edit
 * - Color cycling
 * - No connection to mindmap nodes
 */

test.describe('Sticky Notes - Annotation Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Create a new mindmap
    await page.goto('/new')
    await page.fill('#title', 'Sticky Notes Test')
    await page.click('button[type="submit"]')

    // Wait for editor to load
    await page.waitForURL(/\/editor\/.*/, { timeout: 10000 })
    await page.waitForSelector('[data-testid="mindmap-canvas"]', { timeout: 10000 })
    await page.waitForTimeout(1000)
  })

  test('Shift+N should create a sticky note', async ({ page }) => {
    // Press Shift+N to create sticky note
    await page.keyboard.press('Shift+N')
    await page.waitForTimeout(500)

    // Verify sticky note exists
    const stickyNote = page.locator('[data-testid^="sticky-note-"]').first()
    await expect(stickyNote).toBeVisible({ timeout: 2000 })

    // Verify default text
    await expect(stickyNote).toContainText('Double-click to edit')

    // Verify pin emoji indicator
    await expect(stickyNote).toContainText('📌')
  })

  test('Sticky note should have correct styling', async ({ page }) => {
    // Create sticky note
    await page.keyboard.press('Shift+N')
    await page.waitForTimeout(500)

    const stickyNote = page.locator('[data-testid^="sticky-note-"]').first()
    await expect(stickyNote).toBeVisible()

    // Check dimensions
    const box = await stickyNote.boundingBox()
    expect(box?.width).toBe(200)
    expect(box?.height).toBe(200)

    // Check styling (background color should be one of the sticky colors)
    const bgColor = await stickyNote.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    )
    
    // Should have a colored background (not white or transparent)
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(bgColor).not.toBe('rgb(255, 255, 255)')
  })

  test('Double-click should enable editing mode', async ({ page }) => {
    // Create sticky note
    await page.keyboard.press('Shift+N')
    await page.waitForTimeout(500)

    const stickyNote = page.locator('[data-testid^="sticky-note-"]').first()
    await expect(stickyNote).toBeVisible()

    // Double-click to edit
    await stickyNote.dblclick()
    await page.waitForTimeout(200)

    // Verify textarea appears
    const textarea = stickyNote.locator('textarea')
    await expect(textarea).toBeVisible()
    await expect(textarea).toBeFocused()
  })

  test('Should be able to edit sticky note text', async ({ page }) => {
    // Create sticky note
    await page.keyboard.press('Shift+N')
    await page.waitForTimeout(500)

    const stickyNote = page.locator('[data-testid^="sticky-note-"]').first()
    
    // Double-click to edit
    await stickyNote.dblclick()
    await page.waitForTimeout(200)

    // Type new text
    const textarea = stickyNote.locator('textarea')
    await textarea.fill('My brainstorming note')
    
    // Click outside to save
    await page.click('[data-testid="mindmap-canvas"]', { position: { x: 10, y: 10 } })
    await page.waitForTimeout(200)

    // Verify text is saved
    await expect(stickyNote).toContainText('My brainstorming note')
  })

  test('Escape key should exit edit mode', async ({ page }) => {
    // Create sticky note
    await page.keyboard.press('Shift+N')
    await page.waitForTimeout(500)

    const stickyNote = page.locator('[data-testid^="sticky-note-"]').first()
    
    // Double-click to edit
    await stickyNote.dblclick()
    await page.waitForTimeout(200)

    const textarea = stickyNote.locator('textarea')
    await expect(textarea).toBeVisible()

    // Press Escape
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    // Textarea should be hidden
    await expect(textarea).not.toBeVisible()
  })

  test('Multiple sticky notes should cycle through colors', async ({ page }) => {
    // Create 4 sticky notes
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Shift+N')
      await page.waitForTimeout(300)
    }

    // Get all sticky notes
    const stickyNotes = page.locator('[data-testid^="sticky-note-"]')
    await expect(stickyNotes).toHaveCount(4)

    // Verify they have different background colors
    const colors = []
    for (let i = 0; i < 4; i++) {
      const bgColor = await stickyNotes.nth(i).evaluate((el) =>
        window.getComputedStyle(el).backgroundColor
      )
      colors.push(bgColor)
    }

    // All 4 should have different colors (cycling through yellow, pink, blue, green)
    const uniqueColors = new Set(colors)
    expect(uniqueColors.size).toBe(4)
  })

  test('Sticky notes should not connect to mindmap nodes', async ({ page }) => {
    // Click on root node
    const rootNode = page.locator('div[data-testid^="node-"]:not([data-testid^="sticky-note-"])').first()
    await rootNode.click()
    await page.waitForTimeout(200)

    // Create a child node
    await page.keyboard.press('Tab')
    await page.waitForTimeout(500)

    // Create a sticky note
    await page.keyboard.press('Shift+N')
    await page.waitForTimeout(500)

    // Verify sticky note exists
    const stickyNote = page.locator('[data-testid^="sticky-note-"]').first()
    await expect(stickyNote).toBeVisible()

    // Sticky notes should not have connection handles
    // (This is a visual check - sticky notes don't render Handle components)
    const handles = stickyNote.locator('.react-flow__handle')
    await expect(handles).toHaveCount(0)
  })
})

