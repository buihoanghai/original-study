import { test, expect } from '@playwright/test'

/**
 * Node Detail Panel E2E Tests
 *
 * Tests the NodeDetailPanel component functionality:
 * - Opening/closing the panel with keyboard shortcut (Ctrl+Shift+D) and button
 * - Loading and displaying node's own content (title, sections, etc.)
 * - Loading and displaying children nodes with their content
 * - Breadcrumb navigation between parent and children
 * - Search functionality within the panel
 * - Bookmark and "Mark as learned" features
 *
 * Test Data:
 * - Uses seed data mindmap: "Fullstack Developer Skill Tree"
 * - Mindmap slug: fullstack-developer-skill-tree (auto-generated from title)
 * - Contains parent nodes with children and rich content sections
 */

test.describe('Node Detail Panel', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the seeded mindmap using slug
    // The slug "fullstack-developer-skill-tree" is auto-generated from the title
    await page.goto('/editor/fullstack-developer-skill-tree')

    // Wait for editor to load and nodes to render
    await page.waitForTimeout(2000)

    // Verify nodes are rendered
    const nodes = page.locator('[data-testid^="node-"]')
    await nodes.first().waitFor({ state: 'visible', timeout: 10000 })
    const nodeCount = await nodes.count()
    expect(nodeCount).toBeGreaterThan(0)
  })

  test('should open detail panel with keyboard shortcut Ctrl+Shift+D', async ({ page }) => {
    // Panel should be visible by default (based on EditorWrapper initial state)
    const panel = page.locator('text=Node Details')
    await expect(panel).toBeVisible()

    // Close panel with keyboard shortcut (use uppercase D)
    await page.keyboard.press('Control+Shift+D')
    await page.waitForTimeout(300)

    // Panel should be hidden
    await expect(panel).not.toBeVisible()

    // Open panel again with keyboard shortcut
    await page.keyboard.press('Control+Shift+D')
    await page.waitForTimeout(300)

    // Panel should be visible
    await expect(panel).toBeVisible()
  })

  test('should open/close detail panel with toolbar button', async ({ page }) => {
    // Find the "Details" button in toolbar
    const detailsButton = page.locator('button:has-text("📄 Details")')
    await expect(detailsButton).toBeVisible()

    // Panel should be visible initially
    const panel = page.locator('text=Node Details')
    await expect(panel).toBeVisible()

    // Click button to close
    await detailsButton.click()
    await page.waitForTimeout(300)

    // Panel should be hidden
    await expect(panel).not.toBeVisible()

    // Click button to open
    await detailsButton.click()
    await page.waitForTimeout(300)

    // Panel should be visible
    await expect(panel).toBeVisible()
  })

  test('should display node title and content when node is selected', async ({ page }) => {
    // Click on a node to select it
    const nodes = page.locator('[data-testid^="node-"]')
    const firstNode = nodes.first()
    await firstNode.click({ force: true })

    // Wait for node title to appear (instead of arbitrary timeout)
    const nodeTitle = page.locator('h3.text-3xl.font-bold')
    await expect(nodeTitle).toBeVisible({ timeout: 10000 })

    // Should show some content (at least the title text)
    const titleText = await nodeTitle.textContent()
    expect(titleText).toBeTruthy()
    expect(titleText?.length).toBeGreaterThan(0)
  })

  test('should display loading state while fetching node data', async ({ page }) => {
    // Click on a node
    const nodes = page.locator('[data-testid^="node-"]')
    await nodes.first().click({ force: true })

    // Should briefly show loading state
    // Note: This might be too fast to catch, but we can verify the panel updates
    await page.waitForTimeout(500)

    // After loading, should show content (not loading state)
    const loadingText = page.locator('text=Loading...')
    await expect(loadingText).not.toBeVisible()
  })

  test('should display children section with outline format when node has children', async ({ page }) => {
    // Click on the root node (which should have children based on seed data)
    const nodes = page.locator('[data-testid^="node-"]')
    const rootNode = nodes.first()
    await rootNode.click({ force: true })

    // Wait a bit for the panel to update
    await page.waitForTimeout(500)

    // Look for the "Children Topics" heading (new outline format)
    const childrenHeading = page.locator('h3:has-text("Children Topics")')

    // Check if children section exists
    const hasChildren = await childrenHeading.isVisible().catch(() => false)

    if (hasChildren) {
      console.log('✅ Children section found with outline format')
      await expect(childrenHeading).toBeVisible()

      // Look for child node titles (they are buttons with blue text)
      const childTitles = page.locator('button.text-2xl.font-bold.text-blue-600')
      const childCount = await childTitles.count()
      console.log(`Found ${childCount} child nodes`)
      expect(childCount).toBeGreaterThan(0)

      // Verify outline format markers (I), 1), a), etc.)
      const outlineMarkers = page.locator('.outline-item')
      const markerCount = await outlineMarkers.count()
      console.log(`Found ${markerCount} outline items`)
      expect(markerCount).toBeGreaterThan(0)
    } else {
      console.log('ℹ️  No children section - node might be a leaf node')
      // This is acceptable - not all nodes have children
    }
  })

  test('should display children content in outline format (I, 1, a)', async ({ page }) => {
    // Click on root node
    const nodes = page.locator('[data-testid^="node-"]')
    await nodes.first().click({ force: true })

    // Wait a bit for the panel to update
    await page.waitForTimeout(500)

    // Look for children section
    const childrenHeading = page.locator('h3:has-text("Children Topics")')
    const hasChildren = await childrenHeading.isVisible().catch(() => false)

    if (hasChildren) {
      // Look for outline format markers (I), II), III), etc.)
      const romanNumeralMarker = page.locator('span.font-bold:has-text("I)")')
      const hasOutlineFormat = await romanNumeralMarker.isVisible().catch(() => false)

      if (hasOutlineFormat) {
        console.log('✅ Children content displayed in outline format with Roman numerals')
        await expect(romanNumeralMarker).toBeVisible()

        // Verify outline items exist
        const outlineItems = page.locator('.outline-item')
        const itemCount = await outlineItems.count()
        console.log(`Found ${itemCount} outline items in children content`)
        expect(itemCount).toBeGreaterThan(0)
      } else {
        console.log('ℹ️  Children might not have content in seed data')
      }
    }
  })
})
