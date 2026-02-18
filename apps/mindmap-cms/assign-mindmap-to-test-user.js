import 'dotenv/config'
import { getPayload } from 'payload'
import config from './src/payload.config.js'

const payload = await getPayload({ config })

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

const testUserId = users.docs[0].id
console.log(`Test user ID: ${testUserId}`)

// Update mindmap owner
await payload.update({
  collection: 'mindmaps',
  id: '6993f480d83b03ebaafc23f8',
  data: {
    owner: testUserId,
  },
})

console.log('✅ Mindmap assigned to test user')

process.exit(0)
