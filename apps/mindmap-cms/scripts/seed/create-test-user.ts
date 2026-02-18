#!/usr/bin/env node
/**
 * Create Test User for E2E Tests
 * 
 * Creates a test user with credentials:
 * - Email: test@example.com
 * - Password: password123
 * 
 * This user is used by Playwright E2E tests.
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../../src/payload.config.js'

async function createTestUser() {
  console.log('🔧 Creating test user for E2E tests...\n')

  const payload = await getPayload({ config })

  try {
    // Check if test user already exists
    const existingUsers = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: 'test@example.com',
        },
      },
      limit: 1,
    })

    if (existingUsers.totalDocs > 0) {
      console.log('✅ Test user already exists')
      console.log(`   Email: test@example.com`)
      console.log(`   ID: ${existingUsers.docs[0].id}`)
      console.log('\n✨ No action needed - user is ready for E2E tests\n')
      process.exit(0)
    }

    // Create test user
    const testUser = await payload.create({
      collection: 'users',
      data: {
        email: 'test@example.com',
        password: 'password123',
      },
    })

    console.log('✅ Test user created successfully!')
    console.log(`   Email: test@example.com`)
    console.log(`   Password: password123`)
    console.log(`   ID: ${testUser.id}`)
    console.log('\n✨ E2E tests can now run successfully\n')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating test user:', error)
    process.exit(1)
  }
}

createTestUser()

