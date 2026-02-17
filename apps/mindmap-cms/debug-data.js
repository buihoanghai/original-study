import 'dotenv/config'
import { getPayload } from 'payload'
import config from './src/payload.config.js'

const payload = await getPayload({ config })

// Get mindmap
const mindmaps = await payload.find({
  collection: 'mindmaps',
  where: { title: { equals: 'Fullstack Developer Skill Tree' } },
  limit: 1,
})

if (mindmaps.totalDocs === 0) {
  console.log('❌ No mindmap found!')
  process.exit(1)
}

const mindmap = mindmaps.docs[0]
console.log(`\n✅ Mindmap: ${mindmap.title} (ID: ${mindmap.id})`)

// Get all nodes
const nodes = await payload.find({
  collection: 'mindmap-nodes',
  where: { mindmap: { equals: mindmap.id } },
  limit: 100,
})

console.log(`\n📊 Nodes: ${nodes.totalDocs}`)
nodes.docs.forEach(node => {
  console.log(`  - ${node.content?.text} (nodeId: ${node.nodeId})`)
})

// Get all edges
const edges = await payload.find({
  collection: 'node-edges',
  limit: 100,
})

console.log(`\n🔗 Edges: ${edges.totalDocs}`)

// Build a map of node titles by nodeId
const nodeMap = {}
nodes.docs.forEach(node => {
  nodeMap[node.nodeId] = node.content?.text || 'Untitled'
})

// Show edges with node titles
edges.docs.forEach(edge => {
  const fromTitle = nodeMap[edge.from] || edge.from
  const toTitle = nodeMap[edge.to] || edge.to
  console.log(`  ${fromTitle} → ${toTitle} (${edge.type})`)
})

// Get flashcards for first node
const firstNode = nodes.docs[0]
const flashcards = await payload.find({
  collection: 'flashcards',
  where: { nodeId: { equals: firstNode.nodeId } },
  limit: 10,
})

console.log(`\n🃏 Flashcards for "${firstNode.content?.text}": ${flashcards.totalDocs}`)
flashcards.docs.forEach(fc => {
  console.log(`  Q: ${fc.question.substring(0, 60)}...`)
})

process.exit(0)
