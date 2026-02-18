import { test, expect } from '@playwright/test'

/**
 * Slug-Based Navigation E2E Test
 *
 * Tests that navigation uses slugs instead of UUIDs in URLs for both mindmaps and nodes.
 *
 * Expected behavior:
 * 1. Click on "Fullstack Developer Skill Tree" → /editor/fullstack-developer-skill-tree
 * 2. Click on "Event Loop" node → /editor/fullstack-developer-skill-tree/event-loop
 * 3. URLs should use slugs derived from text, not UUIDs
 */

test.describe('Slug-Based Navigation', () => {
  test('should use mindmap slug and node slug in URL', async ({ page }) => {
    // Navigate to home page
    await page.goto('/')
    await page.waitForTimeout(500)

    // Find and click on "Fullstack Developer Skill Tree" mindmap
    const skillTreeLink = page.locator('text=Fullstack Developer Skill Tree').first()
    await expect(skillTreeLink).toBeVisible({ timeout: 10000 })
    await skillTreeLink.click()

    // Wait for editor to load with mindmap slug
    await page.waitForURL(/\/editor\/fullstack-developer-skill-tree/, { timeout: 10000 })
    await expect(page.locator('[data-testid="mindmap-canvas"]')).toBeVisible({ timeout: 10000 })

    // Verify URL uses mindmap slug, not UUID
    const initialUrl = page.url()
    expect(initialUrl).toContain('/editor/fullstack-developer-skill-tree')
    expect(initialUrl).not.toMatch(/\/editor\/[a-f0-9]{24}/) // Not MongoDB ObjectId
    expect(initialUrl).not.toMatch(/\/editor\/[a-f0-9-]{36}/) // Not UUID

    // Wait for nodes to load
    await page.waitForTimeout(1000)

    // Find a node with text "Event Loop" using React Flow node wrapper
    const eventLoopNode = page.locator('.react-flow__node').filter({ hasText: 'Event Loop' }).first()

    // If Event Loop doesn't exist, try another common node (skip first node which is root)
    const targetNode = await eventLoopNode.count() > 0
      ? eventLoopNode
      : page.locator('.react-flow__node').nth(1) // Get second node (first child)

    await expect(targetNode).toBeVisible({ timeout: 5000 })

    // Get the node text for slug verification
    const nodeText = await targetNode.textContent()
    expect(nodeText).toBeTruthy()

    // Click on the node (React Flow node wrapper)
    await targetNode.click()
    await page.waitForTimeout(1000) // Increased wait time for navigation

    // Check URL - should use both mindmap slug and node slug
    const newUrl = page.url()
    console.log('URL after clicking node:', newUrl)

    // Expected: /editor/fullstack-developer-skill-tree/{node-slug}
    // The URL should match pattern: /editor/fullstack-developer-skill-tree/{slug}
    // where slug is lowercase, hyphenated version of node text
    const expectedNodeSlug = nodeText!.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const expectedUrlPattern = new RegExp(`/editor/fullstack-developer-skill-tree/${expectedNodeSlug}`)

    // This should pass WITHOUT any intermediate UUID-based URL
    await expect(page).toHaveURL(expectedUrlPattern, { timeout: 5000 })

    // Verify no UUIDs in URL
    expect(newUrl).not.toMatch(/[a-f0-9]{24}/) // Not MongoDB ObjectId
    expect(newUrl).not.toMatch(/[a-f0-9-]{36}/) // Not UUID
  })

  test('should navigate directly to slug-based URL without UUID redirect', async ({ page }) => {
    // Navigate to home page
    await page.goto('/')
    await page.waitForTimeout(500)

    // Track URL changes
    const urlChanges: string[] = []
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) {
        urlChanges.push(frame.url())
      }
    })

    // Click on skill tree
    const skillTreeLink = page.locator('text=Fullstack Developer Skill Tree').first()
    await skillTreeLink.click()

    // Wait for editor
    await page.waitForURL(/\/editor\/fullstack-developer-skill-tree/, { timeout: 10000 })
    await page.waitForTimeout(1000)

    // Click on a node using React Flow node wrapper
    const targetNode = page.locator('.react-flow__node').nth(1)
    await targetNode.click()
    await page.waitForTimeout(1000)

    // Check that we didn't navigate through a UUID-based URL
    const hasUuidUrl = urlChanges.some(url => {
      // Check if URL contains UUID or MongoDB ObjectId
      return /[a-f0-9]{24}/.test(url) || /[a-f0-9-]{36}/.test(url)
    })

    // This should be false - we should go directly to slug-based URL
    expect(hasUuidUrl).toBe(false)
  })

  test('should use slug when navigating from MindmapList', async ({ page }) => {
    // Navigate to home page
    await page.goto('/')
    await page.waitForTimeout(500)

    // Click on any mindmap from the list
    const mindmapCard = page.locator('[data-testid="mindmap-card"]').first()
    
    // If no mindmap cards, skip test
    if (await mindmapCard.count() === 0) {
      test.skip()
      return
    }

    await mindmapCard.click()

    // Wait for editor to load
    await page.waitForURL(/\/editor\/[^/]+/, { timeout: 10000 })
    
    // The initial URL should be /editor/{id} (without node slug)
    const initialUrl = page.url()
    expect(initialUrl).toMatch(/\/editor\/[^/]+$/)

    // When a node is selected, URL should update to use slug
    await page.waitForTimeout(1000)
    const targetNode = page.locator('.react-flow__node').nth(1) // Skip first node (root)
    await targetNode.click()
    await page.waitForTimeout(1000) // Increased wait time for navigation

    // URL should now include slug
    const finalUrl = page.url()
    expect(finalUrl).toMatch(/\/editor\/[^/]+\/[a-z0-9-]+$/)
    
    // Verify it's not a UUID
    const slugPart = finalUrl.split('/').pop()
    expect(slugPart).not.toMatch(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i)
  })
})

