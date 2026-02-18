import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config.js'

async function checkMindmap() {
  const payload = await getPayload({ config })

  console.log('📋 Checking mindmaps and nodes...\n')

  // Find all mindmaps
  const mindmaps = await payload.find({
    collection: 'mindmaps',
    limit: 10
  })

  console.log(`Total mindmaps: ${mindmaps.totalDocs}\n`)

  for (const mindmap of mindmaps.docs) {
    console.log(`\n🗺️  Mindmap: ${mindmap.title}`)
    console.log(`   ID: ${mindmap.id}`)
    console.log(`   Created: ${mindmap.createdAt}`)

    // Find nodes for this mindmap
    const nodes = await payload.find({
      collection: 'mindmap-nodes',
      where: {
        mindmap: { equals: mindmap.id }
      },
      limit: 100,
      sort: 'nodeId'
    })

    console.log(`   Nodes: ${nodes.totalDocs}`)

    // Group by level
    const byLevel = {
      L1: [] as any[],
      L2: [] as any[],
      L3: [] as any[]
    }

    nodes.docs.forEach((node: any) => {
      const level = node.metadata?.level || 'Unknown'
      if (byLevel[level as keyof typeof byLevel]) {
        byLevel[level as keyof typeof byLevel].push(node)
      }
    })

    console.log(`\n   L1 nodes (${byLevel.L1.length}):`)
    byLevel.L1.forEach((node: any) => {
      console.log(`     - ${node.nodeId} | ${node.content?.title || 'No title'}`)
    })

    console.log(`\n   L2 nodes (${byLevel.L2.length}):`)
    byLevel.L2.forEach((node: any) => {
      console.log(`     - ${node.nodeId} | ${node.content?.title || 'No title'}`)
    })

    console.log(`\n   L3 nodes (${byLevel.L3.length}):`)
    byLevel.L3.forEach((node: any) => {
      console.log(`     - ${node.nodeId} | ${node.content?.title || 'No title'}`)
    })

    // Check edges
    const edges = await payload.find({
      collection: 'node-edges',
      limit: 100
    })

    console.log(`\n   Total edges: ${edges.totalDocs}`)
  }

  process.exit(0)
}

checkMindmap()

