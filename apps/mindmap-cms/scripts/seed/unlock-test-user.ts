#!/usr/bin/env node
/**
 * Unlock Test User
 * 
 * Unlocks the test user and resets login attempts.
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../../src/payload.config.js'

async function unlockTestUser() {
  console.log('🔓 Unlocking test user...\n')

  const payload = await getPayload({ config })

  try {
    // Find test user
    const users = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: 'test@example.com',
        },
      },
      limit: 1,
    })

    if (users.totalDocs === 0) {
      console.log('❌ Test user not found')
      process.exit(1)
    }

    // Update user to unlock and reset password
    const userId = users.docs[0].id
    await payload.update({
      collection: 'users',
      id: userId,
      data: {
        password: 'password123',
        loginAttempts: 0,
        lockUntil: null,
      },
    })

    console.log('✅ Test user unlocked successfully!')
    console.log(`   Email: test@example.com`)
    console.log(`   Password: password123`)
    console.log(`   ID: ${userId}`)
    console.log(`   Login attempts: 0`)
    console.log(`   Lock status: Unlocked`)
    console.log('\n✨ E2E tests can now run successfully\n')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error unlocking test user:', error)
    process.exit(1)
  }
}

unlockTestUser()

