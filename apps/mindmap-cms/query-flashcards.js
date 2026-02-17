import 'dotenv/config'
import { getPayload } from 'payload'
import config from './src/payload.config.js'

const payload = await getPayload({ config })

// Get all flashcards
const flashcards = await payload.find({
  collection: 'flashcards',
  limit: 100,
})

console.log('\n=== FLASHCARDS ===')
console.log(`Total: ${flashcards.totalDocs}`)

// Group by nodeId
const byNode = {}
flashcards.docs.forEach(fc => {
  if (!byNode[fc.nodeId]) {
    byNode[fc.nodeId] = []
  }
  byNode[fc.nodeId].push(fc)
})

console.log('\nFlashcards by nodeId:')
Object.entries(byNode).forEach(([nodeId, cards]) => {
  console.log(`  ${nodeId}: ${cards.length} flashcards`)
})

// Get a sample node
const nodes = await payload.find({
  collection: 'mindmap-nodes',
  limit: 3,
})

console.log('\n=== SAMPLE NODES ===')
nodes.docs.forEach(node => {
  console.log(`Node: ${node.nodeId}`)
  console.log(`  Title: ${node.content?.text}`)
  console.log(`  Flashcards for this nodeId: ${byNode[node.nodeId]?.length || 0}`)
})

// Check edges
const edges = await payload.find({
  collection: 'node-edges',
  limit: 20,
})

console.log('\n=== EDGES ===')
console.log(`Total: ${edges.totalDocs}`)
edges.docs.forEach(edge => {
  console.log(`  ${edge.from} → ${edge.to} (${edge.type})`)
})

process.exit(0)
