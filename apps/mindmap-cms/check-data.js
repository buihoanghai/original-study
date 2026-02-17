import 'dotenv/config'
import { getPayload } from 'payload'
import config from './src/payload.config.js'

const payload = await getPayload({ config })

// Check nodes
const nodes = await payload.find({
  collection: 'mindmap-nodes',
  limit: 5,
})

console.log('\n=== NODES ===')
console.log(`Total: ${nodes.totalDocs}`)
nodes.docs.forEach(node => {
  console.log(`- ${node.nodeId}: ${node.content?.text}`)
  console.log(`  parentId in content: ${node.content?.parentId}`)
})

// Check flashcards
const flashcards = await payload.find({
  collection: 'flashcards',
  limit: 5,
})

console.log('\n=== FLASHCARDS ===')
console.log(`Total: ${flashcards.totalDocs}`)
flashcards.docs.forEach(fc => {
  console.log(`- ${fc.id}: nodeId=${fc.nodeId}`)
  console.log(`  Q: ${fc.question?.substring(0, 50)}...`)
})

// Check if flashcards match nodes
if (nodes.docs.length > 0 && flashcards.docs.length > 0) {
  const firstNodeId = nodes.docs[0].nodeId
  const matchingFlashcards = await payload.find({
    collection: 'flashcards',
    where: {
      nodeId: { equals: firstNodeId }
    }
  })
  console.log(`\n=== FLASHCARDS FOR NODE ${firstNodeId} ===`)
  console.log(`Found: ${matchingFlashcards.totalDocs}`)
}

process.exit(0)
