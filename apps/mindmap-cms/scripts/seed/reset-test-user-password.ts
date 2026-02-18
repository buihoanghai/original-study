#!/usr/bin/env node
/**
 * Reset Test User Password
 * 
 * Resets the test user password to ensure E2E tests can login.
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../../src/payload.config.js'

async function resetTestUserPassword() {
  console.log('🔧 Resetting test user password...\n')

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
      console.log('❌ Test user not found. Creating new user...')
      
      const newUser = await payload.create({
        collection: 'users',
        data: {
          email: 'test@example.com',
          password: 'password123',
        },
      })

      console.log('✅ Test user created successfully!')
      console.log(`   Email: test@example.com`)
      console.log(`   Password: password123`)
      console.log(`   ID: ${newUser.id}`)
      console.log('\n✨ E2E tests can now run successfully\n')
      process.exit(0)
    }

    // Update password
    const userId = users.docs[0].id
    await payload.update({
      collection: 'users',
      id: userId,
      data: {
        password: 'password123',
      },
    })

    console.log('✅ Test user password reset successfully!')
    console.log(`   Email: test@example.com`)
    console.log(`   Password: password123`)
    console.log(`   ID: ${userId}`)
    console.log('\n✨ E2E tests can now run successfully\n')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error resetting test user password:', error)
    process.exit(1)
  }
}

resetTestUserPassword()

