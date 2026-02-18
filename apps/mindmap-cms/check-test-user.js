import 'dotenv/config'
import { getPayload } from 'payload'
import config from './dist/payload.config.js'

const payload = await getPayload({ config })

const users = await payload.find({
  collection: 'users',
  where: { email: { equals: 'test@example.com' } },
  limit: 1,
})

console.log('Test user exists:', users.totalDocs > 0)
if (users.totalDocs > 0) {
  console.log('User:', users.docs[0].email)
}

process.exit(0)
