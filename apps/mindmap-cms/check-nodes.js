import 'dotenv/config'
import { getPayload } from 'payload'
import config from './dist/payload.config.js'

const payload = await getPayload({ config })

const mindmap = await payload.find({
  collection: 'mindmaps',
  where: {
    id: { equals: '6993f480d83b03ebaafc23f8' }
  }
})

console.log('\n📊 Mindmap:', mindmap.docs[0]?.metadata?.title)

const nodes = await payload.find({
  collection: 'mindmap-nodes',
  where: {
    mindmap: { equals: '6993f480d83b03ebaafc23f8' }
  },
  limit: 100
})

console.log(`\n📍 Total nodes: ${nodes.totalDocs}`)
console.log('\nNodes by title:')
nodes.docs.forEach((node, i) => {
  console.log(`  ${i + 1}. ${node.content.text}`)
})

const edges = await payload.find({
  collection: 'node-edges',
  where: {
    mindmap: { equals: '6993f480d83b03ebaafc23f8' }
  },
  limit: 100
})

console.log(`\n🔗 Total edges: ${edges.totalDocs}`)

process.exit(0)
