import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config.js'

async function checkApiResponse() {
  const payload = await getPayload({ config })

  const mindmapId = '6993f480d83b03ebaafc23f8'

  console.log('🔍 Simulating frontend API call...\n')
  console.log(`Mindmap ID: ${mindmapId}\n`)

  // Simulate what the frontend does: fetch nodes for this mindmap
  const nodes = await payload.find({
    collection: 'mindmap-nodes',
    where: {
      mindmap: { equals: mindmapId }
    },
    limit: 100,
    sort: 'nodeId'
  })

  console.log(`Total nodes found: ${nodes.totalDocs}\n`)

  if (nodes.totalDocs === 0) {
    console.log('❌ No nodes found for this mindmap!')
    console.log('   This explains why the frontend shows no nodes.\n')
    
    // Check if nodes exist but with different mindmap ID
    const allNodes = await payload.find({
      collection: 'mindmap-nodes',
      limit: 10
    })
    
    console.log(`Total nodes in database: ${allNodes.totalDocs}`)
    console.log('\nFirst 10 nodes:')
    allNodes.docs.forEach((node: any) => {
      console.log(`  - ${node.nodeId} | mindmap: ${typeof node.mindmap === 'object' ? node.mindmap.id : node.mindmap}`)
    })
  } else {
    console.log('✅ Nodes found! Listing all nodes:\n')
    
    nodes.docs.forEach((node: any) => {
      const mindmapId = typeof node.mindmap === 'object' ? node.mindmap.id : node.mindmap
      console.log(`  - ${node.nodeId} | ${node.content?.title || 'No title'} | mindmap: ${mindmapId}`)
    })

    // Check edges
    console.log('\n🔗 Checking edges...\n')
    const nodeIds = nodes.docs.map((n: any) => n.nodeId)
    
    const edges = await payload.find({
      collection: 'node-edges',
      where: {
        from: { in: nodeIds }
      },
      limit: 100
    })

    console.log(`Total edges: ${edges.totalDocs}\n`)
    
    if (edges.totalDocs > 0) {
      console.log('Sample edges:')
      edges.docs.slice(0, 10).forEach((edge: any) => {
        console.log(`  ${edge.from} → ${edge.to} (${edge.type})`)
      })
    }
  }

  process.exit(0)
}

checkApiResponse()

