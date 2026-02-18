import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config.js'

async function cleanup() {
  const payload = await getPayload({ config })

  console.log('🗑️  Cleaning up incorrectly created nodes...\n')

  // Find all nodes
  const allNodes = await payload.find({
    collection: 'mindmap-nodes',
    limit: 1000
  })

  console.log(`Total nodes: ${allNodes.totalDocs}`)

  // Delete all nodes (we'll recreate them with correct nodeIds)
  let deletedCount = 0
  for (const node of allNodes.docs) {
    try {
      await payload.delete({
        collection: 'mindmap-nodes',
        id: node.id
      })
      deletedCount++
      if (deletedCount % 10 === 0) {
        console.log(`  Deleted ${deletedCount} nodes...`)
      }
    } catch (error) {
      console.error(`  ✗ Failed to delete node ${node.id}:`, error)
    }
  }

  console.log(`\n✅ Deleted ${deletedCount} nodes`)

  // Also delete all edges
  const allEdges = await payload.find({
    collection: 'node-edges',
    limit: 1000
  })

  console.log(`\nTotal edges: ${allEdges.totalDocs}`)

  let deletedEdges = 0
  for (const edge of allEdges.docs) {
    try {
      await payload.delete({
        collection: 'node-edges',
        id: edge.id
      })
      deletedEdges++
    } catch (error) {
      console.error(`  ✗ Failed to delete edge ${edge.id}:`, error)
    }
  }

  console.log(`✅ Deleted ${deletedEdges} edges`)

  // Also delete all flashcards
  const allFlashcards = await payload.find({
    collection: 'flashcards',
    limit: 1000
  })

  console.log(`\nTotal flashcards: ${allFlashcards.totalDocs}`)

  let deletedFlashcards = 0
  for (const flashcard of allFlashcards.docs) {
    try {
      await payload.delete({
        collection: 'flashcards',
        id: flashcard.id
      })
      deletedFlashcards++
    } catch (error) {
      console.error(`  ✗ Failed to delete flashcard ${flashcard.id}:`, error)
    }
  }

  console.log(`✅ Deleted ${deletedFlashcards} flashcards`)

  console.log('\n✅ Cleanup complete! Now run: npm run seed:foundation')

  process.exit(0)
}

cleanup()

