import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config.js'

async function debugEdges() {
  const payload = await getPayload({ config })

  // List ALL nodes to see what's in the database
  console.log('📋 Listing all nodes in database...\n')
  const allNodes = await payload.find({
    collection: 'mindmap-nodes',
    limit: 100,
    sort: 'nodeId'
  })

  console.log(`Total nodes: ${allNodes.totalDocs}\n`)
  allNodes.docs.forEach((node: any) => {
    console.log(`  - ${node.nodeId} | ${node.content?.title || 'No title'}`)
  })

  // Find Variables & Types node by nodeId
  const nodeId = 'variables-and-types'
  const varNode = await payload.find({
    collection: 'mindmap-nodes',
    where: {
      nodeId: { equals: nodeId }
    },
    limit: 1
  })

  if (varNode.totalDocs === 0) {
    console.log('\n❌ Variables & Types node NOT FOUND!')
    console.log('   This explains why it\'s missing from the frontend!')
    process.exit(1)
  }

  console.log('\n✅ Variables & Types node found')
  console.log('   NodeID:', nodeId)
  console.log('   Content:', varNode.docs[0].content)

  // Find edges TO this node (parent → Variables & Types)
  const edgesTo = await payload.find({
    collection: 'node-edges',
    where: {
      to: { equals: nodeId }
    }
  })

  console.log('\n🔗 Edges TO Variables & Types:', edgesTo.totalDocs)
  edgesTo.docs.forEach(edge => {
    console.log('   From:', edge.from, '→ To:', edge.to, '(Type:', edge.type, ')')
  })

  // Find edges FROM this node (Variables & Types → children)
  const edgesFrom = await payload.find({
    collection: 'node-edges',
    where: {
      from: { equals: nodeId }
    }
  })

  console.log('\n🔗 Edges FROM Variables & Types:', edgesFrom.totalDocs)
  edgesFrom.docs.forEach(edge => {
    console.log('   From:', edge.from, '→ To:', edge.to, '(Type:', edge.type, ')')
  })

  // Find Programming Fundamentals node
  const rootNodeId = 'foundation-root'
  const rootNode = await payload.find({
    collection: 'mindmap-nodes',
    where: {
      nodeId: { equals: rootNodeId }
    },
    limit: 1
  })

  if (rootNode.totalDocs > 0) {
    console.log('\n✅ Programming Fundamentals node found')
    console.log('   NodeID:', rootNodeId)

    // Check if edge exists from root to Variables & Types
    const rootToVar = await payload.find({
      collection: 'node-edges',
      where: {
        and: [
          { from: { equals: rootNodeId } },
          { to: { equals: nodeId } }
        ]
      }
    })

    if (rootToVar.totalDocs > 0) {
      console.log('\n✅ Edge exists: Programming Fundamentals → Variables & Types')
    } else {
      console.log('\n❌ Edge MISSING: Programming Fundamentals → Variables & Types')
      console.log('   Creating edge...')
      
      await payload.create({
        collection: 'node-edges',
        data: {
          from: rootNodeId,
          to: nodeId,
          type: 'parent-child'
        }
      })
      
      console.log('   ✅ Edge created!')
    }
  }

  process.exit(0)
}

debugEdges()

