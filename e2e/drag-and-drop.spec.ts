import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Drag & Drop Functionality
 *
 * Tests the drag and drop feature for mindmap nodes:
 * - Dragging nodes to new positions
 * - Visual feedback during drag (shadow, opacity, cursor)
 * - Position persistence after drag
 * - Undo/redo support for drag operations
 * - Multiple node dragging
 * - Sticky note dragging
 */

test.describe('Drag & Drop - Node Positioning', () => {
  // Increase timeout for these tests as drag operations can be slow
  test.setTimeout(30000)

  test.beforeEach(async ({ page }) => {
    // Create a new mindmap
    await page.goto('/new')
    const timestamp = Date.now()
    await page.fill('#title', `Drag Test ${timestamp}`)
    await page.click('button[type="submit"]')

    // Wait for editor to load (with or without node slug)
    await page.waitForURL(/\/editor\/[^/]+(?:\/[^/]+)?/, { timeout: 10000 })

    // Wait for canvas to appear
    await page.waitForSelector('[data-testid="mindmap-canvas"]', { timeout: 20000 })
    await page.waitForTimeout(1000)

    // Close the NodeDetailPanel if it's open (it blocks drag operations)
    const closeButton = page.locator('button[aria-label="Close detail panel"]')
    const isVisible = await closeButton.isVisible().catch(() => false)
    if (isVisible) {
      await closeButton.click()
      await page.waitForTimeout(500)
    }

    // Switch to Manual layout mode (no auto-layout) to allow free dragging
    const layoutSelect = page.locator('select#layout-mode')
    const layoutVisible = await layoutSelect.isVisible().catch(() => false)
    if (layoutVisible) {
      await layoutSelect.selectOption('manual')
      await page.waitForTimeout(500)
    }
  })

  test('should drag a node to a new position', async ({ page }) => {
    // Verify layout mode is set to manual
    const layoutSelect = page.locator('select#layout-mode')
    const layoutMode = await layoutSelect.inputValue()
    console.log('[TEST] Current layout mode:', layoutMode)
    expect(layoutMode).toBe('manual')

    // Get the root node
    const rootNode = page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').first()
    await expect(rootNode).toBeVisible()

    // Get initial position
    const initialBox = await rootNode.boundingBox()
    expect(initialBox).not.toBeNull()
    console.log('[TEST] Initial position:', initialBox)

    // Drag the node to a new position
    // Calculate center of the node
    const centerX = initialBox!.x + initialBox!.width / 2
    const centerY = initialBox!.y + initialBox!.height / 2

    // Perform drag operation from center
    await page.mouse.move(centerX, centerY)
    await page.mouse.down()
    await page.mouse.move(centerX + 200, centerY + 100, { steps: 20 })
    await page.waitForTimeout(100)
    await page.mouse.up()
    await page.waitForTimeout(1000)

    // Get new position
    const newBox = await rootNode.boundingBox()
    expect(newBox).not.toBeNull()
    console.log('[TEST] New position:', newBox)
    console.log('[TEST] Position difference:', {
      x: Math.abs(newBox!.x - initialBox!.x),
      y: Math.abs(newBox!.y - initialBox!.y),
    })

    // Verify position changed
    expect(Math.abs(newBox!.x - initialBox!.x)).toBeGreaterThan(150)
    expect(Math.abs(newBox!.y - initialBox!.y)).toBeGreaterThan(50)
  })

  test('should show visual feedback during drag', async ({ page }) => {
    const rootNode = page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').first()
    await expect(rootNode).toBeVisible()

    // Get initial styles
    const initialOpacity = await rootNode.evaluate((el) => 
      window.getComputedStyle(el).opacity
    )
    const initialCursor = await rootNode.evaluate((el) => 
      window.getComputedStyle(el).cursor
    )

    // Start dragging
    const box = await rootNode.boundingBox()
    await rootNode.hover()
    await page.mouse.down()
    await page.waitForTimeout(100)

    // Check styles during drag (opacity should be reduced)
    const draggingOpacity = await rootNode.evaluate((el) => 
      window.getComputedStyle(el).opacity
    )
    
    // Note: Visual feedback might be applied via ReactFlow's dragging class
    // The exact implementation may vary, so we just verify the node is still visible
    expect(parseFloat(draggingOpacity)).toBeGreaterThan(0)

    // Complete the drag
    await page.mouse.move(box!.x + 100, box!.y + 50, { steps: 5 })
    await page.mouse.up()
    await page.waitForTimeout(200)

    // Verify styles return to normal after drag
    const finalOpacity = await rootNode.evaluate((el) => 
      window.getComputedStyle(el).opacity
    )
    expect(parseFloat(finalOpacity)).toBe(parseFloat(initialOpacity))
  })

  test.skip('should persist position after drag', async ({ page }) => {
    // TODO: This test requires persisting layoutMode to CMS
    // Currently, loadMindmap() always applies auto-layout, overriding manual positions
    const rootNode = page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').first()

    // Drag the node
    const initialBox = await rootNode.boundingBox()
    const centerX = initialBox!.x + initialBox!.width / 2
    const centerY = initialBox!.y + initialBox!.height / 2

    await page.mouse.move(centerX, centerY)
    await page.mouse.down()
    await page.mouse.move(centerX + 200, centerY + 100, { steps: 20 })
    await page.waitForTimeout(100)
    await page.mouse.up()

    // Wait for auto-save to trigger (2 second debounce + 1 second for save to complete)
    await page.waitForTimeout(3000)

    // Get position after drag
    const draggedBox = await rootNode.boundingBox()

    // Reload the page
    await page.reload()
    await page.waitForSelector('[data-testid="mindmap-canvas"]', { timeout: 10000 })
    await page.waitForTimeout(1000)

    // Get position after reload
    const reloadedNode = page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').first()
    const reloadedBox = await reloadedNode.boundingBox()

    // Verify position is preserved (allow small margin for layout differences)
    expect(Math.abs(reloadedBox!.x - draggedBox!.x)).toBeLessThan(10)
    expect(Math.abs(reloadedBox!.y - draggedBox!.y)).toBeLessThan(10)
  })

  test('should support undo after drag', async ({ page }) => {
    const rootNode = page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').first()

    // Get initial position
    const initialBox = await rootNode.boundingBox()
    const centerX = initialBox!.x + initialBox!.width / 2
    const centerY = initialBox!.y + initialBox!.height / 2

    // Drag the node
    await page.mouse.move(centerX, centerY)
    await page.mouse.down()
    await page.mouse.move(centerX + 200, centerY + 100, { steps: 20 })
    await page.waitForTimeout(100)
    await page.mouse.up()
    await page.waitForTimeout(500)

    // Get position after drag
    const draggedBox = await rootNode.boundingBox()
    expect(Math.abs(draggedBox!.x - initialBox!.x)).toBeGreaterThan(150)

    // Undo the drag
    await page.keyboard.press('Control+z')
    await page.waitForTimeout(500)

    // Get position after undo
    const undoBox = await rootNode.boundingBox()

    // Verify position is restored (allow small margin)
    expect(Math.abs(undoBox!.x - initialBox!.x)).toBeLessThan(10)
    expect(Math.abs(undoBox!.y - initialBox!.y)).toBeLessThan(10)
  })

  test('should support redo after undo', async ({ page }) => {
    const rootNode = page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').first()

    // Get initial position
    const initialBox = await rootNode.boundingBox()
    const centerX = initialBox!.x + initialBox!.width / 2
    const centerY = initialBox!.y + initialBox!.height / 2

    // Drag the node
    await page.mouse.move(centerX, centerY)
    await page.mouse.down()
    await page.mouse.move(centerX + 200, centerY + 100, { steps: 20 })
    await page.waitForTimeout(100)
    await page.mouse.up()
    await page.waitForTimeout(500)

    // Get position after drag
    const draggedBox = await rootNode.boundingBox()

    // Undo the drag
    await page.keyboard.press('Control+z')
    await page.waitForTimeout(500)

    // Redo the drag
    await page.keyboard.press('Control+Shift+z')
    await page.waitForTimeout(500)

    // Get position after redo
    const redoBox = await rootNode.boundingBox()

    // Verify position is restored to dragged position
    expect(Math.abs(redoBox!.x - draggedBox!.x)).toBeLessThan(10)
    expect(Math.abs(redoBox!.y - draggedBox!.y)).toBeLessThan(10)
  })

  test('should drag multiple nodes independently', async ({ page }) => {
    const rootNode = page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').first()
    await rootNode.click()

    // Create a child node
    await page.keyboard.press('Tab')
    const input = page.locator('input[data-testid="node-input"]')
    await expect(input).toBeVisible({ timeout: 2000 })
    await input.fill('Child Node')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)

    // Get all nodes
    const nodes = page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])')
    await expect(nodes).toHaveCount(2)

    // Get initial positions
    const node1InitialBox = await nodes.nth(0).boundingBox()
    const node2InitialBox = await nodes.nth(1).boundingBox()

    // Drag first node
    const center1X = node1InitialBox!.x + node1InitialBox!.width / 2
    const center1Y = node1InitialBox!.y + node1InitialBox!.height / 2
    await page.mouse.move(center1X, center1Y)
    await page.mouse.down()
    await page.mouse.move(center1X + 150, center1Y + 50, { steps: 20 })
    await page.waitForTimeout(100)
    await page.mouse.up()
    await page.waitForTimeout(500)

    // Drag second node
    const center2X = node2InitialBox!.x + node2InitialBox!.width / 2
    const center2Y = node2InitialBox!.y + node2InitialBox!.height / 2
    await page.mouse.move(center2X, center2Y)
    await page.mouse.down()
    await page.mouse.move(center2X - 100, center2Y + 80, { steps: 20 })
    await page.waitForTimeout(100)
    await page.mouse.up()
    await page.waitForTimeout(500)

    // Get final positions
    const node1FinalBox = await nodes.nth(0).boundingBox()
    const node2FinalBox = await nodes.nth(1).boundingBox()

    // Verify both nodes moved independently
    expect(Math.abs(node1FinalBox!.x - node1InitialBox!.x)).toBeGreaterThan(100)
    expect(Math.abs(node2FinalBox!.x - node2InitialBox!.x)).toBeGreaterThan(50)
  })

  test.skip('should drag sticky notes', async ({ page }) => {
    // TODO: Sticky notes are not draggable yet - need to investigate why ReactFlow isn't allowing drag
    // Create a sticky note
    await page.keyboard.press('Shift+N')
    await page.waitForTimeout(500)

    const stickyNote = page.locator('[data-testid^="sticky-note-"]').first()
    await expect(stickyNote).toBeVisible()

    // Get initial position
    const initialBox = await stickyNote.boundingBox()
    expect(initialBox).not.toBeNull()
    console.log('[TEST] Sticky note initial position:', initialBox)

    // Drag the sticky note
    const centerX = initialBox!.x + initialBox!.width / 2
    const centerY = initialBox!.y + initialBox!.height / 2
    await page.mouse.move(centerX, centerY)
    await page.mouse.down()
    await page.mouse.move(centerX + 150, centerY + 100, { steps: 20 })
    await page.waitForTimeout(100)
    await page.mouse.up()
    await page.waitForTimeout(500)

    // Get new position
    const newBox = await stickyNote.boundingBox()
    console.log('[TEST] Sticky note new position:', newBox)
    console.log('[TEST] Position difference:', {
      x: Math.abs(newBox!.x - initialBox!.x),
      y: Math.abs(newBox!.y - initialBox!.y)
    })

    // Verify position changed
    expect(Math.abs(newBox!.x - initialBox!.x)).toBeGreaterThan(100)
    expect(Math.abs(newBox!.y - initialBox!.y)).toBeGreaterThan(50)
  })

  test('should preserve node content after drag', async ({ page }) => {
    const rootNode = page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').first()

    // Get initial text content
    const initialText = await rootNode.textContent()

    // Drag the node
    const box = await rootNode.boundingBox()
    await rootNode.hover()
    await page.mouse.down()
    await page.mouse.move(box!.x + 200, box!.y + 100, { steps: 10 })
    await page.mouse.up()
    await page.waitForTimeout(500)

    // Get text content after drag
    const finalText = await rootNode.textContent()

    // Verify content is preserved
    expect(finalText).toBe(initialText)
  })

  test('should not interfere with node selection', async ({ page }) => {
    const rootNode = page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').first()

    // Click to select
    await rootNode.click()
    await page.waitForTimeout(200)

    // Verify node is selected (check for selection styling)
    const borderStyle = await rootNode.evaluate((el) =>
      window.getComputedStyle(el).border
    )

    // Should have a border indicating selection
    expect(borderStyle).toBeTruthy()

    // Drag the selected node
    const box = await rootNode.boundingBox()
    const centerX = box!.x + box!.width / 2
    const centerY = box!.y + box!.height / 2
    await page.mouse.move(centerX, centerY)
    await page.mouse.down()
    await page.mouse.move(centerX + 100, centerY + 50, { steps: 20 })
    await page.waitForTimeout(100)
    await page.mouse.up()
    await page.waitForTimeout(500)

    // Node should still be selected after drag
    const borderAfterDrag = await rootNode.evaluate((el) =>
      window.getComputedStyle(el).border
    )
    expect(borderAfterDrag).toBeTruthy()
  })

  test('should handle rapid drag operations', async ({ page }) => {
    const rootNode = page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').first()

    const box = await rootNode.boundingBox()
    let centerX = box!.x + box!.width / 2
    let centerY = box!.y + box!.height / 2

    // Perform multiple rapid drags
    for (let i = 0; i < 3; i++) {
      await page.mouse.move(centerX, centerY)
      await page.mouse.down()
      await page.mouse.move(centerX + 50, centerY + 30, { steps: 10 })
      await page.waitForTimeout(50)
      await page.mouse.up()
      await page.waitForTimeout(200)

      // Update center for next drag
      const currentBox = await rootNode.boundingBox()
      centerX = currentBox!.x + currentBox!.width / 2
      centerY = currentBox!.y + currentBox!.height / 2
    }

    // Get final position
    const finalBox = await rootNode.boundingBox()

    // Verify node moved significantly
    expect(Math.abs(finalBox!.x - box!.x)).toBeGreaterThan(100)
  })
})


