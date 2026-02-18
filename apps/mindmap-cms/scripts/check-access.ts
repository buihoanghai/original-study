import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config.js'

async function checkAccess() {
  const payload = await getPayload({ config })

  const mindmapId = '6993f480d83b03ebaafc23f8'

  console.log('🔍 Checking mindmap access...\n')

  // Find the mindmap
  const mindmap = await payload.findByID({
    collection: 'mindmaps',
    id: mindmapId
  })

  console.log(`Mindmap: ${mindmap.title}`)
  console.log(`Owner: ${typeof mindmap.owner === 'object' ? mindmap.owner.email : mindmap.owner}`)
  console.log(`Status: ${mindmap.status}`)
  console.log(`_status: ${mindmap._status}\n`)

  // Find test user
  const users = await payload.find({
    collection: 'users',
    where: {
      email: { equals: 'test@example.com' }
    },
    limit: 1
  })

  if (users.totalDocs === 0) {
    console.log('❌ test@example.com user not found!')
    console.log('   You need to create this user or use a different email.\n')
    
    // List all users
    const allUsers = await payload.find({
      collection: 'users',
      limit: 10
    })
    
    console.log(`Available users (${allUsers.totalDocs}):`)
    allUsers.docs.forEach((user: any) => {
      console.log(`  - ${user.email}`)
    })
  } else {
    const testUser = users.docs[0]
    console.log(`✅ Test user found: ${testUser.email}`)
    console.log(`   User ID: ${testUser.id}\n`)

    // Check if mindmap owner matches test user
    const ownerId = typeof mindmap.owner === 'object' ? mindmap.owner.id : mindmap.owner
    
    if (ownerId === testUser.id) {
      console.log('✅ Test user owns this mindmap')
    } else {
      console.log('❌ Test user does NOT own this mindmap')
      console.log(`   Mindmap owner ID: ${ownerId}`)
      console.log(`   Test user ID: ${testUser.id}`)
      console.log('\n   Updating mindmap owner to test user...')
      
      await payload.update({
        collection: 'mindmaps',
        id: mindmapId,
        data: {
          owner: testUser.id
        }
      })
      
      console.log('   ✅ Mindmap owner updated!')
    }
  }

  process.exit(0)
}

checkAccess()

