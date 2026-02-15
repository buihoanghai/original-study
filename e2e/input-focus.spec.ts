import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Input Focus Behavior
 *
 * CRITICAL: Tests that input is automatically focused when creating new nodes.
 * This is essential for keyboard-first UX - users should be able to type immediately
 * after pressing Tab or Enter without needing to click.
 *
 * Issue: Input not focused when creating new node
 * Expected: Input should be auto-focused and ready for typing
 */

test.describe('Input Focus - Critical UX Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Create a new mindmap
    await page.goto('/new')
    await page.fill('#title', 'Focus Test Mindmap')
    await page.click('button[type="submit"]')

    // Wait for editor to load
    await page.waitForURL(/\/editor\/.*/, { timeout: 10000 })
    await page.waitForSelector('[data-testid="mindmap-canvas"]', { timeout: 10000 })
    await page.waitForTimeout(1000)
  })

  test('CRITICAL: Tab should create child with auto-focused input', async ({ page }) => {
    // Click on root node to select it
    const rootNode = page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').first()
    await rootNode.click()
    await page.waitForTimeout(200)

    // Press Tab to create child
    await page.keyboard.press('Tab')
    await page.waitForTimeout(300)

    // Verify input exists and is visible
    const input = page.locator('input[data-testid="node-input"]')
    await expect(input).toBeVisible({ timeout: 2000 })

    // CRITICAL: Verify input is focused
    await expect(input).toBeFocused()

    // CRITICAL: Verify user can type immediately without clicking
    await page.keyboard.type('Child node text')
    await expect(input).toHaveValue('Child node text')
  })

  test('CRITICAL: Enter should create sibling with auto-focused input', async ({ page }) => {
    // Click on root node
    const rootNode = page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').first()
    await rootNode.click()

    // Create first child
    await page.keyboard.press('Tab')
    const input = page.locator('input[data-testid="node-input"]')
    await expect(input).toBeVisible({ timeout: 2000 })
    await page.keyboard.type('First child')

    // Press Enter while editing to create sibling
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)

    // Verify new input is visible
    const newInput = page.locator('input[data-testid="node-input"]')
    await expect(newInput).toBeVisible()

    // CRITICAL: Verify new input is focused
    await expect(newInput).toBeFocused()

    // CRITICAL: Verify user can type immediately
    await page.keyboard.type('Second child')
    await expect(newInput).toHaveValue('Second child')
  })

  test('CRITICAL: Tab while editing should create child with auto-focused input', async ({ page }) => {
    // Click on root node
    const rootNode = page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').first()
    await rootNode.click()

    // Create first child
    await page.keyboard.press('Tab')
    const input = page.locator('input[data-testid="node-input"]')
    await expect(input).toBeVisible({ timeout: 2000 })
    await page.keyboard.type('Parent node')

    // Press Tab while editing to create child of child
    await page.keyboard.press('Tab')
    await page.waitForTimeout(300)

    // Verify new input is visible
    const newInput = page.locator('input[data-testid="node-input"]')
    await expect(newInput).toBeVisible()

    // CRITICAL: Verify new input is focused
    await expect(newInput).toBeFocused()

    // CRITICAL: Verify user can type immediately
    await page.keyboard.type('Grandchild node')
    await expect(newInput).toHaveValue('Grandchild node')
  })

  test('CRITICAL: Double-click should focus input for editing', async ({ page }) => {
    // Click on root node
    const rootNode = page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').first()
    await rootNode.click()

    // Create a child
    await page.keyboard.press('Tab')
    await page.keyboard.type('Test node')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    // Double-click the child node to edit it
    const childNode = page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').nth(1)
    await childNode.dblclick()
    await page.waitForTimeout(200)

    // Verify input is visible
    const input = page.locator('input[data-testid="node-input"]')
    await expect(input).toBeVisible()

    // CRITICAL: Verify input is focused
    await expect(input).toBeFocused()

    // CRITICAL: Verify user can type immediately
    await page.keyboard.press('Control+a')
    await page.keyboard.type('Updated text')
    await expect(input).toHaveValue('Updated text')
  })

  test('Focus should persist across multiple node creations', async ({ page }) => {
    // Click on root node
    const rootNode = page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').first()
    await rootNode.click()

    // Create multiple nodes in sequence
    for (let i = 1; i <= 3; i++) {
      // Press Tab to create child (or Enter for sibling after first)
      await page.keyboard.press(i === 1 ? 'Tab' : 'Enter')
      await page.waitForTimeout(200)

      const input = page.locator('input[data-testid="node-input"]')
      
      // Verify input is focused each time
      await expect(input).toBeFocused()
      
      // Type immediately without clicking
      await page.keyboard.type(`Node ${i}`)
      await expect(input).toHaveValue(`Node ${i}`)
    }
  })

  test('Focus should work after Escape and re-entering edit mode', async ({ page }) => {
    // Click on root node
    const rootNode = page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').first()
    await rootNode.click()

    // Create a child
    await page.keyboard.press('Tab')
    const input = page.locator('input[data-testid="node-input"]')
    await expect(input).toBeFocused()
    await page.keyboard.type('Test')

    // Exit editing mode
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    // Re-enter editing mode by double-clicking
    const childNode = page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').nth(1)
    await childNode.dblclick()
    await page.waitForTimeout(200)

    // Verify input is focused again
    const inputAgain = page.locator('input[data-testid="node-input"]')
    await expect(inputAgain).toBeFocused()
    
    // Verify can type immediately
    await page.keyboard.press('End')
    await page.keyboard.type(' more text')
    await expect(inputAgain).toHaveValue('Test more text')
  })
})

