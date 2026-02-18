import 'dotenv/config'
import { getPayload } from 'payload'
import config from './src/payload.config.js'

const payload = await getPayload({ config })

// Get all nodes for the mindmap
const nodes = await payload.find({
  collection: 'mindmap-nodes',
  where: {
    mindmap: {
      equals: '6993f480d83b03ebaafc23f8',
    },
  },
  limit: 100,
})

console.log(`\n📍 Found ${nodes.totalDocs} nodes\n`)

// For each node, check if it has flashcards
for (const node of nodes.docs) {
  const flashcards = await payload.find({
    collection: 'flashcards',
    where: {
      nodeId: {
        equals: node.nodeId,
      },
    },
    limit: 100,
  })
  
  if (flashcards.totalDocs > 0) {
    console.log(`✅ Node: ${node.title} (${node.nodeId})`)
    console.log(`   Flashcards: ${flashcards.totalDocs}`)
  }
}

process.exit(0)
