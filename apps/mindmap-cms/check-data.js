import 'dotenv/config'
import { getPayload } from 'payload'
import config from './src/payload.config.js'

const payload = await getPayload({ config })

console.log('\n=== CHECKING DATABASE DATA ===\n')

// Check mindmaps
const mindmaps = await payload.find({
  collection: 'mindmaps',
  limit: 10,
})
console.log('📊 Mindmaps:', mindmaps.totalDocs)
mindmaps.docs.forEach(m => {
  console.log(`  - ${m.title} (id: ${m.id})`)
})

// Check nodes
const nodes = await payload.find({
  collection: 'mindmap-nodes',
  limit: 100,
})
console.log('\n📍 Nodes:', nodes.totalDocs)
console.log('  First 5 nodes:')
nodes.docs.slice(0, 5).forEach(n => {
  console.log(`  - ${n.nodeId}: ${n.content?.text || 'No text'} (mindmap: ${n.mindmap})`)
})

// Check edges
const edges = await payload.find({
  collection: 'node-edges',
  limit: 100,
})
console.log('\n🔗 Edges:', edges.totalDocs)
console.log('  First 5 edges:')
edges.docs.slice(0, 5).forEach(e => {
  console.log(`  - ${e.from} → ${e.to} (${e.type})`)
})

// Check flashcards
const flashcards = await payload.find({
  collection: 'flashcards',
  limit: 100,
})
console.log('\n🎴 Flashcards:', flashcards.totalDocs)
console.log('  First 5 flashcards:')
flashcards.docs.slice(0, 5).forEach(f => {
  console.log(`  - Node ${f.nodeId}: ${f.question?.substring(0, 50)}...`)
})

// Check if edges match nodes
console.log('\n=== VALIDATION ===\n')

const nodeIds = new Set(nodes.docs.map(n => n.nodeId))
console.log('✓ Unique node IDs:', nodeIds.size)

let validEdges = 0
let invalidEdges = 0
edges.docs.forEach(e => {
  if (nodeIds.has(e.from) && nodeIds.has(e.to)) {
    validEdges++
  } else {
    invalidEdges++
    console.log(`  ❌ Invalid edge: ${e.from} → ${e.to}`)
  }
})
console.log(`✓ Valid edges: ${validEdges}`)
console.log(`✗ Invalid edges: ${invalidEdges}`)

// Check flashcard linkage
let linkedFlashcards = 0
let orphanFlashcards = 0
flashcards.docs.forEach(f => {
  if (nodeIds.has(f.nodeId)) {
    linkedFlashcards++
  } else {
    orphanFlashcards++
    console.log(`  ❌ Orphan flashcard: ${f.nodeId}`)
  }
})
console.log(`✓ Linked flashcards: ${linkedFlashcards}`)
console.log(`✗ Orphan flashcards: ${orphanFlashcards}`)

process.exit(0)
