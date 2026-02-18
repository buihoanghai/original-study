import { test, expect } from '@playwright/test'

/**
 * E2E Test for Flashcard Panel Bug
 * 
 * Reproduces user-reported issue:
 * - User clicks on a node in the mindmap
 * - Flashcard panel should show flashcards for that node
 * - BUG: Panel shows "Select a node to manage flashcards" instead
 * 
 * This test will help identify where the execution stops:
 * 1. Frontend event never fires (onClick not working)
 * 2. Node selection not updating state
 * 3. Flashcard API not being called
 * 4. Flashcards exist but not rendering
 */

test.describe('Flashcard Panel - Node Selection Bug', () => {
  test.beforeEach(async ({ page }) => {
    // Enable console logging to capture debug output
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('[')) {
        console.log(`BROWSER: ${msg.text()}`)
      }
    })

    // Navigate to login page
    await page.goto('/login', { waitUntil: 'networkidle' })

    // Login with test user
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')

    // Click submit and wait for navigation
    await Promise.all([
      page.waitForURL('/', { timeout: 10000 }),
      page.click('button[type="submit"]')
    ])

    // Wait a bit for the page to settle
    await page.waitForTimeout(1000)
  })

  test('should show flashcards when clicking on a node', async ({ page }) => {
    // Navigate to the Fullstack Developer Skill Tree mindmap
    // (This should exist from seed data)
    // ID: 6993f480d83b03ebaafc23f8
    await page.goto('/editor/6993f480d83b03ebaafc23f8')

    // Wait for editor to load and nodes to render
    await page.waitForTimeout(2000)

    // STEP 1: Verify nodes are rendered
    console.log('STEP 1: Checking if nodes are rendered...')
    const nodes = page.locator('[data-testid^="node-"]')

    // Wait for at least one node to appear
    await nodes.first().waitFor({ state: 'visible', timeout: 10000 })

    const nodeCount = await nodes.count()
    console.log(`Found ${nodeCount} nodes`)
    expect(nodeCount).toBeGreaterThan(0)
    
    // STEP 2: Verify edges are rendered
    console.log('STEP 2: Checking if edges are rendered...')
    const edges = page.locator('.react-flow__edge')
    const edgeCount = await edges.count()
    console.log(`Found ${edgeCount} edges`)
    expect(edgeCount).toBeGreaterThan(0)
    
    // STEP 3: Open flashcard panel
    console.log('STEP 3: Opening flashcard panel...')
    await page.click('button:has-text("Flashcards")')
    await page.waitForTimeout(500)
    
    // Verify panel is visible
    const panel = page.locator('[data-testid="flashcard-panel"]')
    await expect(panel).toBeVisible()
    
    // STEP 4: Click on a node (use force to bypass overlay)
    console.log('STEP 4: Clicking on first node...')
    const firstNode = nodes.first()
    await firstNode.click({ force: true })
    await page.waitForTimeout(1000)
    
    // STEP 5: Check console logs for node selection
    console.log('STEP 5: Checking if node selection was logged...')
    // (Console logs are captured by the beforeEach handler)
    
    // STEP 6: Verify flashcards are loaded
    console.log('STEP 6: Checking if flashcards are displayed...')
    
    // Check if we see the empty state (BUG)
    const emptyState = page.locator('text=Select a node to manage flashcards')
    const hasEmptyState = await emptyState.isVisible().catch(() => false)
    
    if (hasEmptyState) {
      console.log('❌ BUG REPRODUCED: Empty state is showing')
      console.log('Expected: Flashcards should be visible')
      console.log('Actual: "Select a node to manage flashcards" message')
      
      // This is the bug - fail the test
      throw new Error('Flashcards not showing after node click - BUG REPRODUCED')
    }
    
    // Check if flashcards are visible (EXPECTED)
    const flashcardList = page.locator('[data-testid="flashcard-list"]')
    const hasFlashcards = await flashcardList.isVisible().catch(() => false)
    
    if (hasFlashcards) {
      console.log('✅ SUCCESS: Flashcards are visible')
      const flashcardCount = await page.locator('[data-testid="flashcard-item"]').count()
      console.log(`Found ${flashcardCount} flashcards`)
      expect(flashcardCount).toBeGreaterThan(0)
    } else {
      console.log('⚠️  No flashcards found - checking if node has flashcards in database')
      // This could be expected if the node has no flashcards
      // But based on seed data, nodes should have 3 flashcards each
      throw new Error('Flashcard list not visible - possible rendering issue')
    }
  })

  test('should show correct flashcard count in panel header', async ({ page }) => {
    await page.goto('/editor/6993f480d83b03ebaafc23f8')
    await page.waitForTimeout(3000)

    // Open flashcard panel
    await page.click('button:has-text("Flashcards")')
    await page.waitForTimeout(500)

    // Click on a node (use force to bypass overlay)
    const nodes = page.locator('[data-testid^="node-"]')
    await nodes.first().click({ force: true })
    await page.waitForTimeout(1500)

    // Check panel header shows flashcard count
    // The header is an h2 with text "Flashcards (N)"
    const header = page.locator('h2:has-text("Flashcards")')
    await expect(header).toBeVisible()
    const headerText = await header.textContent()

    console.log(`Panel header: ${headerText}`)

    // Should show something like "Flashcards (3)" if node has 3 flashcards
    expect(headerText).toMatch(/Flashcards \(\d+\)/)
  })

  test('should update flashcards when clicking different nodes', async ({ page }) => {
    await page.goto('/editor/6993f480d83b03ebaafc23f8')
    await page.waitForTimeout(3000)
    
    // Open flashcard panel
    await page.click('button:has-text("Flashcards")')

    const nodes = page.locator('[data-testid^="node-"]')
    const nodeCount = await nodes.count()
    
    if (nodeCount >= 2) {
      // Click first node (use force to bypass overlay)
      await nodes.nth(0).click({ force: true })
      await page.waitForTimeout(500)

      const firstNodeFlashcards = await page.locator('[data-testid="flashcard-item"]').count()
      console.log(`First node has ${firstNodeFlashcards} flashcards`)

      // Click second node (use force to bypass overlay)
      await nodes.nth(1).click({ force: true })
      await page.waitForTimeout(500)
      
      const secondNodeFlashcards = await page.locator('[data-testid="flashcard-item"]').count()
      console.log(`Second node has ${secondNodeFlashcards} flashcards`)
      
      // Both should have flashcards (based on seed data)
      expect(firstNodeFlashcards).toBeGreaterThan(0)
      expect(secondNodeFlashcards).toBeGreaterThan(0)
    }
  })
})

