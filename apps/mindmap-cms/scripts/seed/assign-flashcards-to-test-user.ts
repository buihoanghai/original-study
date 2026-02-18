#!/usr/bin/env node
/**
 * Assign Flashcards to Test User
 * 
 * Updates all flashcards to be owned by the test user for E2E testing.
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../../src/payload.config.js'

async function assignFlashcardsToTestUser() {
  console.log('🎴 Assigning flashcards to test user...\n')

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
      console.log('❌ Test user not found. Please run create-test-user.ts first.')
      process.exit(1)
    }

    const testUserId = users.docs[0].id
    console.log(`✅ Test user found: ${testUserId}\n`)

    // Get all flashcards
    const flashcards = await payload.find({
      collection: 'flashcards',
      limit: 1000,
    })

    console.log(`📊 Found ${flashcards.totalDocs} flashcards\n`)

    // Update each flashcard to be owned by test user
    let updated = 0
    for (const flashcard of flashcards.docs) {
      await payload.update({
        collection: 'flashcards',
        id: flashcard.id,
        data: {
          owner: testUserId,
        },
      })
      updated++
    }

    console.log(`✅ Updated ${updated} flashcards to be owned by test user`)
    console.log(`   Test user ID: ${testUserId}`)
    console.log('\n✨ E2E tests can now access flashcards\n')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error assigning flashcards:', error)
    process.exit(1)
  }
}

assignFlashcardsToTestUser()

