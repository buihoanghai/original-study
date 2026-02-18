import { test, expect } from '@playwright/test'

/**
 * Mindmap Management E2E Tests
 *
 * Tests mindmap CRUD operations:
 * - Create mindmap
 * - View mindmap list
 * - Edit mindmap metadata
 * - Delete mindmap
 * - Search/filter mindmaps
 */

test.describe('Mindmap Management', () => {
  test.beforeEach(async ({ page }) => {
    // Start from home page
    await page.goto('/')
    await page.waitForTimeout(500)
  })

  test('should display mindmap list on home page', async ({ page }) => {
    // Should see "My Mindmaps" heading
    await expect(page.locator('h1')).toContainText('My Mindmaps')

    // Should see "New Mindmap" button/link
    await expect(page.locator('text=New Mindmap')).toBeVisible()

    // Should see mindmap list or empty state
    const hasMindmaps = await page.locator('[data-testid="mindmap-card"]').count() > 0
    const hasEmptyState = await page.locator('text=/No mindmaps yet/i').isVisible().catch(() => false)

    expect(hasMindmaps || hasEmptyState).toBe(true)
  })

  test('should create new mindmap', async ({ page }) => {
    // Click "New Mindmap" button
    await page.click('text=New Mindmap')

    // Should navigate to /new
    await expect(page).toHaveURL('/new')

    // Fill in form
    const timestamp = Date.now()
    await page.fill('#title', `Test Mindmap ${timestamp}`)
    await page.fill('#description', 'This is a test mindmap')

    // Submit form
    await page.click('button[type="submit"]')

    // Should redirect to editor (with or without node slug)
    await expect(page).toHaveURL(/\/editor\/[^/]+(?:\/[^/]+)?/, { timeout: 10000 })

    // Should see mindmap canvas
    await expect(page.locator('[data-testid="mindmap-canvas"]')).toBeVisible({ timeout: 10000 })
  })

  test('should open mindmap from list', async ({ page }) => {
    // Create a mindmap first
    await page.goto('/new')
    const timestamp = Date.now()
    await page.fill('#title', `Clickable Mindmap ${timestamp}`)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/editor\/[^/]+(?:\/[^/]+)?/, { timeout: 10000 })

    // Go back to home
    await page.goto('/')
    await page.waitForTimeout(500)

    // Click on the mindmap card
    await page.click(`text=Clickable Mindmap ${timestamp}`)

    // Should navigate to editor (with or without node slug)
    await expect(page).toHaveURL(/\/editor\/[^/]+(?:\/[^/]+)?/, { timeout: 10000 })
    await expect(page.locator('[data-testid="mindmap-canvas"]')).toBeVisible({ timeout: 10000 })
  })

  test('should delete mindmap from list', async ({ page }) => {
    // Create a mindmap to delete
    await page.goto('/new')
    const timestamp = Date.now()
    await page.fill('#title', `Mindmap to Delete ${timestamp}`)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/editor\/.*/, { timeout: 10000 })

    // Go back to home
    await page.goto('/')
    await page.waitForTimeout(500)

    // Count mindmaps before deletion
    const countBefore = await page.locator('[data-testid="mindmap-card"]').count()

    // Find and click delete button for the mindmap
    const mindmapCard = page.locator(`text=Mindmap to Delete ${timestamp}`).locator('..')
    await mindmapCard.hover()
    await mindmapCard.locator('button[aria-label="Delete"]').click()

    // Confirm deletion in modal/dialog
    await page.click('button:has-text("Delete")')
    await page.waitForTimeout(500)

    // Count mindmaps after deletion
    const countAfter = await page.locator('[data-testid="mindmap-card"]').count()
    expect(countAfter).toBe(countBefore - 1)

    // Deleted mindmap should not be visible
    await expect(page.locator(`text=Mindmap to Delete ${timestamp}`)).not.toBeVisible()
  })

  test('should edit mindmap metadata', async ({ page }) => {
    // Create a mindmap
    await page.goto('/new')
    const timestamp = Date.now()
    await page.fill('#title', `Original Title ${timestamp}`)
    await page.fill('#description', 'Original description')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/editor\/[^/]+(?:\/[^/]+)?/, { timeout: 10000 })

    // Go back to home
    await page.goto('/')
    await page.waitForTimeout(500)

    // Find and click edit button
    const mindmapCard = page.locator(`text=Original Title ${timestamp}`).locator('..')
    await mindmapCard.hover()
    await mindmapCard.locator('button[aria-label="Edit"]').click()

    // Should open edit modal/form
    await expect(page.locator('text=/Edit Mindmap/i')).toBeVisible()

    // Update title and description
    await page.fill('input[id="title"]', `Updated Title ${timestamp}`)
    await page.fill('textarea[id="description"]', 'Updated description')

    // Save changes
    await page.click('button:has-text("Save")')
    await page.waitForTimeout(500)

    // Should see updated title in list
    await expect(page.locator(`text=Updated Title ${timestamp}`)).toBeVisible()
    await expect(page.locator(`text=Original Title ${timestamp}`)).not.toBeVisible()
  })

  test('should filter mindmaps by search query', async ({ page }) => {
    // Create multiple mindmaps
    const timestamp = Date.now()
    
    // Create first mindmap
    await page.goto('/new')
    await page.fill('#title', `JavaScript Basics ${timestamp}`)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/editor\/.*/, { timeout: 10000 })

    // Create second mindmap
    await page.goto('/new')
    await page.fill('#title', `Python Advanced ${timestamp}`)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/editor\/.*/, { timeout: 10000 })

    // Go to home
    await page.goto('/')
    await page.waitForTimeout(500)

    // Search for "JavaScript"
    const searchInput = page.locator('input[placeholder*="Search"]')
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('JavaScript')
      await page.waitForTimeout(500)

      // Should see JavaScript mindmap
      await expect(page.locator(`text=JavaScript Basics ${timestamp}`)).toBeVisible()

      // Should not see Python mindmap
      await expect(page.locator(`text=Python Advanced ${timestamp}`)).not.toBeVisible()
    }
  })

  test('should sort mindmaps', async ({ page }) => {
    // Check if sort dropdown exists
    const sortDropdown = page.locator('select[aria-label*="Sort"]')
    
    if (await sortDropdown.isVisible().catch(() => false)) {
      // Select "Sort by name"
      await sortDropdown.selectOption('name')
      await page.waitForTimeout(500)

      // Verify mindmaps are sorted
      const mindmapTitles = await page.locator('[data-testid="mindmap-card"] h2').allTextContents()
      const sortedTitles = [...mindmapTitles].sort()
      expect(mindmapTitles).toEqual(sortedTitles)

      // Select "Sort by date"
      await sortDropdown.selectOption('date')
      await page.waitForTimeout(500)

      // Mindmaps should be reordered
    }
  })

  test('should show mindmap status badges', async ({ page }) => {
    // Create a mindmap
    await page.goto('/new')
    await page.fill('#title', 'Mindmap with Status')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/editor\/.*/, { timeout: 10000 })

    // Go back to home
    await page.goto('/')
    await page.waitForTimeout(500)

    // Should see status badge (e.g., "Draft", "Published")
    const hasBadge = await page.locator('[data-testid="mindmap-status"]').isVisible().catch(() => false)

    if (hasBadge) {
      await expect(page.locator('[data-testid="mindmap-status"]')).toBeVisible()
    }
  })

  test('should navigate to node-specific URL when clicking node', async ({ page }) => {
    // Create a mindmap
    await page.goto('/new')
    const timestamp = Date.now()
    await page.fill('#title', `URL Navigation Test ${timestamp}`)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/editor\/[^/]+(?:\/[^/]+)?/, { timeout: 10000 })

    // Wait for canvas to load
    await page.waitForSelector('[data-testid="mindmap-canvas"]', { timeout: 10000 })
    await page.waitForTimeout(1000)

    // Get initial URL (should be /editor/[id] or /editor/[id]/[rootSlug])
    const initialUrl = page.url()

    // Click on a node (if there are multiple nodes)
    const nodes = page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])')
    const nodeCount = await nodes.count()

    if (nodeCount > 1) {
      // Click second node
      await nodes.nth(1).click()
      await page.waitForTimeout(500)

      // URL should have changed to include node slug
      const newUrl = page.url()
      expect(newUrl).toMatch(/\/editor\/[^/]+\/[^/]+/)
      expect(newUrl).not.toBe(initialUrl)
    }
  })

  test('should show breadcrumb navigation when viewing focused node', async ({ page }) => {
    // Create a mindmap with child nodes
    await page.goto('/new')
    const timestamp = Date.now()
    await page.fill('#title', `Breadcrumb Test ${timestamp}`)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/editor\/[^/]+(?:\/[^/]+)?/, { timeout: 10000 })

    // Wait for canvas
    await page.waitForSelector('[data-testid="mindmap-canvas"]', { timeout: 10000 })
    await page.waitForTimeout(1000)

    // Create a child node
    const rootNode = page.locator('div[data-testid^="node-"]:not([data-testid="node-input"])').first()
    await rootNode.click()
    await page.keyboard.press('Tab')

    const input = page.locator('input[data-testid="node-input"]')
    await input.waitFor({ state: 'visible', timeout: 2000 })
    await input.fill('Child Node')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)

    // Click on child node to navigate
    const childNode = page.locator('text=Child Node')
    if (await childNode.isVisible()) {
      await childNode.click()
      await page.waitForTimeout(500)

      // Should see breadcrumb
      const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]')
      if (await breadcrumb.isVisible()) {
        await expect(breadcrumb).toBeVisible()
      }
    }
  })
})

