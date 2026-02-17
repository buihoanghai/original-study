import 'dotenv/config'
import { getPayload } from 'payload'
import config from './src/payload.config.js'

const payload = await getPayload({ config })

console.log('🧹 Cleaning up old data...\n')

// Delete all edges
const edges = await payload.find({ collection: 'node-edges', limit: 1000 })
for (const edge of edges.docs) {
  await payload.delete({ collection: 'node-edges', id: edge.id })
}
console.log(`✓ Deleted ${edges.totalDocs} edges`)

// Delete all flashcards
const flashcards = await payload.find({ collection: 'flashcards', limit: 1000 })
for (const fc of flashcards.docs) {
  await payload.delete({ collection: 'flashcards', id: fc.id })
}
console.log(`✓ Deleted ${flashcards.totalDocs} flashcards`)

// Delete all nodes
const nodes = await payload.find({ collection: 'mindmap-nodes', limit: 1000 })
for (const node of nodes.docs) {
  await payload.delete({ collection: 'mindmap-nodes', id: node.id })
}
console.log(`✓ Deleted ${nodes.totalDocs} nodes`)

// Delete all node mastery
const mastery = await payload.find({ collection: 'node-mastery', limit: 1000 })
for (const m of mastery.docs) {
  await payload.delete({ collection: 'node-mastery', id: m.id })
}
console.log(`✓ Deleted ${mastery.totalDocs} node mastery records`)

// Delete all learning sessions
const sessions = await payload.find({ collection: 'learning-sessions', limit: 1000 })
for (const s of sessions.docs) {
  await payload.delete({ collection: 'learning-sessions', id: s.id })
}
console.log(`✓ Deleted ${sessions.totalDocs} learning sessions`)

// Delete mindmap
const mindmaps = await payload.find({
  collection: 'mindmaps',
  where: { title: { equals: 'Fullstack Developer Skill Tree' } },
  limit: 1,
})
if (mindmaps.totalDocs > 0) {
  await payload.delete({ collection: 'mindmaps', id: mindmaps.docs[0].id })
  console.log(`✓ Deleted mindmap: ${mindmaps.docs[0].title}`)
}

console.log('\n✅ Cleanup complete!\n')

process.exit(0)
