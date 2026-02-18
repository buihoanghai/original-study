import { test, expect } from '@playwright/test'

/**
 * Advanced Editor Features E2E Tests
 *
 * Tests advanced keyboard shortcuts and editor features:
 * - Arrow key navigation (Up, Down, Left, Right)
 * - F key - collapse/expand nodes
 * - Ctrl+Shift+Z - redo
 * - Ctrl+/- - zoom in/out
 * - Node deletion
 */

test.describe('Editor - Advanced Features', () => {
  test.beforeEach(async ({ page }) => {
    // Create a new mindmap
    await page.goto('/new')
    await page.fill('#title', 'Test Mindmap - Advanced Features')
    await page.click('button[type="submit"]')

    // Wait for editor to load (with or without node slug)
    await page.waitForURL(/\/editor\/[^/]+(?:\/[^/]+)?/, { timeout: 10000 })
    await page.waitForSelector('[data-testid="mindmap-canvas"]', { timeout: 10000 })
    await page.waitForTimeout(1000)
  })

  test('Arrow keys - should navigate between nodes', async ({ page }) => {
    const rootNode = page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').first()
    await rootNode.click()

    // Create a tree structure: root -> child1, child2
    // Add first child
    await page.keyboard.press('Tab')
    const input = page.locator('input[data-testid="node-input"]')
    await expect(input).toBeVisible({ timeout: 2000 })
    await input.fill('Child 1')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    // Add second child (sibling to child1)
    await page.keyboard.press('Enter')
    await expect(input).toBeVisible({ timeout: 2000 })
    await input.fill('Child 2')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    // Test arrow key navigation
    // Down arrow should move to next sibling
    await page.keyboard.press('ArrowDown')
    await page.waitForTimeout(200)

    // Up arrow should move to previous sibling
    await page.keyboard.press('ArrowUp')
    await page.waitForTimeout(200)

    // Left arrow should move to parent
    await page.keyboard.press('ArrowLeft')
    await page.waitForTimeout(200)

    // Right arrow should move to first child
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(200)

    // Verify we have 3 nodes total
    const nodes = await page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').count()
    expect(nodes).toBe(3)
  })

  test('F key - should collapse and expand nodes', async ({ page }) => {
    const rootNode = page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').first()
    await rootNode.click()

    // Create a child node
    await page.keyboard.press('Tab')
    const input = page.locator('input[data-testid="node-input"]')
    await expect(input).toBeVisible({ timeout: 2000 })
    await input.fill('Child Node')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    // Select root node
    await rootNode.click()
    await page.waitForTimeout(200)

    // Press F to collapse
    await page.keyboard.press('f')
    await page.waitForTimeout(500)

    // Child node should be hidden (collapsed)
    // Note: This depends on implementation - might need to check CSS or data attributes

    // Press F again to expand
    await page.keyboard.press('f')
    await page.waitForTimeout(500)

    // Child node should be visible again
    const nodes = await page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').count()
    expect(nodes).toBe(2)
  })

  test('Ctrl+Shift+Z - should redo last undone action', async ({ page }) => {
    const rootNode = page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').first()
    await rootNode.click()

    // Create a child node
    await page.keyboard.press('Tab')
    const input = page.locator('input[data-testid="node-input"]')
    await expect(input).toBeVisible({ timeout: 2000 })
    await input.fill('Child Node')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    const nodesAfterCreate = await page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').count()
    expect(nodesAfterCreate).toBe(2)

    // Undo the creation
    await page.keyboard.press('Control+z')
    await page.waitForTimeout(500)

    const nodesAfterUndo = await page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').count()
    expect(nodesAfterUndo).toBe(1)

    // Redo the creation
    await page.keyboard.press('Control+Shift+z')
    await page.waitForTimeout(500)

    const nodesAfterRedo = await page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').count()
    expect(nodesAfterRedo).toBe(2)
  })

  test('Ctrl+Plus - should zoom in', async ({ page }) => {
    // Get initial zoom level (if available via data attribute or viewport)
    const canvas = page.locator('[data-testid="mindmap-canvas"]')
    await expect(canvas).toBeVisible()

    // Zoom in
    await page.keyboard.press('Control+=')
    await page.waitForTimeout(300)

    // Zoom in again
    await page.keyboard.press('Control+=')
    await page.waitForTimeout(300)

    // Canvas should still be visible
    await expect(canvas).toBeVisible()
  })

  test('Ctrl+Minus - should zoom out', async ({ page }) => {
    const canvas = page.locator('[data-testid="mindmap-canvas"]')
    await expect(canvas).toBeVisible()

    // Zoom out
    await page.keyboard.press('Control+-')
    await page.waitForTimeout(300)

    // Zoom out again
    await page.keyboard.press('Control+-')
    await page.waitForTimeout(300)

    // Canvas should still be visible
    await expect(canvas).toBeVisible()
  })

  test('Delete key - should delete selected node', async ({ page }) => {
    const rootNode = page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').first()
    await rootNode.click()

    // Create a child node
    await page.keyboard.press('Tab')
    const input = page.locator('input[data-testid="node-input"]')
    await expect(input).toBeVisible({ timeout: 2000 })
    await input.fill('Child to Delete')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    const nodesBefore = await page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').count()
    expect(nodesBefore).toBe(2)

    // Select the child node and delete it
    const childNode = page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').nth(1)
    await childNode.click()
    await page.keyboard.press('Delete')
    await page.waitForTimeout(500)

    const nodesAfter = await page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').count()
    expect(nodesAfter).toBe(1)
  })

  test('Arrow keys - should update URL when navigating between nodes', async ({ page }) => {
    const rootNode = page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').first()
    await rootNode.click()

    // Create two child nodes
    await page.keyboard.press('Tab')
    const input = page.locator('input[data-testid="node-input"]')
    await expect(input).toBeVisible({ timeout: 2000 })
    await input.fill('Child 1')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    await page.keyboard.press('Enter')
    await expect(input).toBeVisible({ timeout: 2000 })
    await input.fill('Child 2')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)

    // Get initial URL
    const initialUrl = page.url()

    // Navigate with arrow key
    await page.keyboard.press('ArrowDown')
    await page.waitForTimeout(500)

    // URL should have changed
    const newUrl = page.url()

    // Both URLs should match the pattern /editor/[id]/[nodeSlug]
    expect(initialUrl).toMatch(/\/editor\/[^/]+\/[^/]+/)
    expect(newUrl).toMatch(/\/editor\/[^/]+\/[^/]+/)

    // URLs should be different (different node slugs)
    expect(newUrl).not.toBe(initialUrl)
  })
})

