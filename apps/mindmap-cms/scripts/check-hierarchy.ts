import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config.js'

async function checkHierarchy() {
  const payload = await getPayload({ config })

  const mindmapId = '69952aab26e32fc66bbe4988'

  console.log('🔍 Checking node hierarchy...\n')

  // Get all nodes
  const nodes = await payload.find({
    collection: 'mindmap-nodes',
    where: {
      mindmap: { equals: mindmapId }
    },
    limit: 100,
    sort: 'nodeId'
  })

  console.log(`Total nodes: ${nodes.totalDocs}\n`)

  // Get all edges
  const edges = await payload.find({
    collection: 'node-edges',
    limit: 100
  })

  console.log(`Total edges: ${edges.totalDocs}\n`)

  // Build hierarchy
  const nodeMap = new Map()
  nodes.docs.forEach((node: any) => {
    nodeMap.set(node.nodeId, {
      nodeId: node.nodeId,
      title: node.content?.title || node.content?.text || 'No title',
      level: node.metadata?.level || 'Unknown',
      children: []
    })
  })

  // Add children based on edges
  edges.docs.forEach((edge: any) => {
    const parent = nodeMap.get(edge.from)
    const child = nodeMap.get(edge.to)
    if (parent && child) {
      parent.children.push(child.nodeId)
    }
  })

  // Find root nodes (nodes with no incoming edges)
  const childNodeIds = new Set(edges.docs.map((e: any) => e.to))
  const rootNodes = Array.from(nodeMap.values()).filter(
    node => !childNodeIds.has(node.nodeId)
  )

  console.log(`Root nodes (${rootNodes.length}):\n`)
  rootNodes.forEach(root => {
    console.log(`  📌 ${root.nodeId} | ${root.title} | ${root.level}`)
    console.log(`     Children: ${root.children.length}`)
    if (root.children.length > 0) {
      root.children.forEach((childId: string) => {
        const child = nodeMap.get(childId)
        console.log(`       - ${childId} | ${child?.title}`)
      })
    }
    console.log()
  })

  // Check for orphaned nodes (nodes with no edges at all)
  const nodesInEdges = new Set([
    ...edges.docs.map((e: any) => e.from),
    ...edges.docs.map((e: any) => e.to)
  ])
  
  const orphanedNodes = Array.from(nodeMap.values()).filter(
    node => !nodesInEdges.has(node.nodeId)
  )

  if (orphanedNodes.length > 0) {
    console.log(`\n⚠️  Orphaned nodes (${orphanedNodes.length}) - no edges:\n`)
    orphanedNodes.forEach(node => {
      console.log(`  - ${node.nodeId} | ${node.title} | ${node.level}`)
    })
  }

  // Check foundation-root specifically
  const foundationRoot = nodeMap.get('foundation-root')
  if (foundationRoot) {
    console.log(`\n✅ foundation-root exists:`)
    console.log(`   Title: ${foundationRoot.title}`)
    console.log(`   Level: ${foundationRoot.level}`)
    console.log(`   Children: ${foundationRoot.children.length}`)
    console.log(`   Children IDs: ${foundationRoot.children.join(', ')}`)
  } else {
    console.log(`\n❌ foundation-root NOT FOUND!`)
  }

  process.exit(0)
}

checkHierarchy()

