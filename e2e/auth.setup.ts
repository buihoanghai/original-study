import { test as setup, expect } from '@playwright/test'
import path from 'path'

/**
 * Authentication Setup for E2E Tests
 *
 * This file sets up authentication state that can be reused across all tests.
 * It registers a test user (if needed) and logs in via the browser.
 */

const authFile = path.join(__dirname, '../playwright/.auth/user.json')

const testUser = {
  email: 'test@example.com',
  password: 'testpassword123',
}

setup('authenticate', async ({ page, request }) => {
  console.log('🔐 Setting up authentication...')

  // Try to login first via API
  console.log('  Attempting API login...')
  const loginResponse = await request.post('http://localhost:3001/api/users/login', {
    data: testUser,
  })

  if (loginResponse.ok()) {
    console.log('  ✓ API login successful')
  } else {
    console.log('  ✗ API login failed, attempting registration...')

    // If login fails, try to register
    const registerResponse = await request.post('http://localhost:3001/api/users', {
      data: testUser,
    })

    const registerStatus = registerResponse.status()
    console.log(`  Registration response: ${registerStatus}`)

    if (!registerResponse.ok() && registerStatus !== 400) {
      // 400 might mean user already exists, which is okay
      const errorText = await registerResponse.text()
      throw new Error(`Failed to register test user (${registerStatus}): ${errorText}`)
    }

    if (registerStatus === 201) {
      console.log('  ✓ User registered successfully')
    } else if (registerStatus === 400) {
      console.log('  ⚠ User might already exist (400), will try to login via browser')
    }
  }

  // Navigate to the login page (use localhost to match CMS domain for cookies)
  console.log('  Navigating to login page...')
  await page.goto('http://localhost:3000/login')

  // Wait for page to load
  await page.waitForLoadState('networkidle')
  console.log('  ✓ Login page loaded')

  // Listen for console messages to debug
  page.on('console', msg => console.log('  [Browser Console]:', msg.text()))

  // Listen for network responses to see what's happening
  page.on('response', async response => {
    if (response.url().includes('/api/users/login')) {
      console.log(`  [Network] POST /api/users/login: ${response.status()}`)
      try {
        const body = await response.json()
        console.log(`  [Network] Response body:`, JSON.stringify(body, null, 2))
      } catch (e) {
        console.log(`  [Network] Could not parse response body`)
      }
    }
  })

  // Fill in login form
  await page.fill('input[type="email"]', testUser.email)
  await page.fill('input[type="password"]', testUser.password)
  console.log('  ✓ Form filled')

  // Submit form
  await page.click('button[type="submit"]')
  console.log('  ✓ Form submitted, waiting for redirect...')

  // Wait a bit for the login request to complete
  await page.waitForTimeout(2000)

  // Wait for redirect to home page
  await page.waitForURL('http://localhost:3000/', { timeout: 15000 })
  console.log('  ✓ Redirected to home page')

  // Wait for page to fully load
  await page.waitForLoadState('networkidle')

  // Verify we're logged in by checking for user avatar (first letter of email)
  const firstLetter = testUser.email.charAt(0).toUpperCase()
  await expect(page.locator(`text=${firstLetter}`).first()).toBeVisible({ timeout: 5000 })
  console.log('  ✓ User avatar visible')

  // Check cookies before saving
  const cookies = await page.context().cookies()
  console.log(`  Cookies found: ${cookies.length}`)
  cookies.forEach(cookie => {
    console.log(`    - ${cookie.name}: ${cookie.domain}`)
  })

  // Save authentication state
  await page.context().storageState({ path: authFile })

  console.log('✓ Authentication state saved')
})

