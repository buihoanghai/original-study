import 'dotenv/config'
import { getPayload } from 'payload'
import config from './src/payload.config.js'

const payload = await getPayload({ config })

const flashcards = await payload.find({
  collection: 'flashcards',
  limit: 5,
})

console.log(`\n🎴 Found ${flashcards.totalDocs} flashcards\n`)

for (const flashcard of flashcards.docs) {
  console.log(`Flashcard: ${flashcard.question.substring(0, 50)}...`)
  console.log(`  Owner: ${typeof flashcard.owner === 'object' ? flashcard.owner.id : flashcard.owner}`)
  console.log(`  NodeId: ${flashcard.nodeId}`)
  console.log()
}

// Get test user ID
const testUser = await payload.find({
  collection: 'users',
  where: {
    email: {
      equals: 'test@example.com',
    },
  },
  limit: 1,
})

if (testUser.totalDocs > 0) {
  console.log(`\n✅ Test user ID: ${testUser.docs[0].id}\n`)
}

process.exit(0)
