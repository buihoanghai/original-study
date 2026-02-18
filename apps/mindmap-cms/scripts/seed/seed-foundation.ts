import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../../src/payload.config.js'
import foundationData from './data/programming-fundamentals.json' assert { type: 'json' }

/**
 * Seed Foundation Skills for Fullstack Developer Skill Tree
 * 
 * Creates:
 * - Mindmap for Fullstack Developer Skill Tree
 * - Foundation nodes (L1, L2, L3)
 * - Flashcards for each node
 * - Auto-triggers NodeMastery and LearningSessions creation
 */

interface SeedNode {
  id: string
  title: string
  level: 'L1' | 'L2' | 'L3'
  parentId: string | null
  prerequisites: string[]
  estimatedHours: number
  difficultyScore: number
  tags: string[]
  reviewTTL: number
  content: any // Generic schema - can have sections array or legacy fields
  flashcards: Array<{
    type: 'definition' | 'pitfall' | 'scenario'
    question: string
    answer: string
  }>
}

export async function seedFoundation(userId: string) {
  const payload = await getPayload({ config })

  console.log('🌱 Seeding Foundation Skills...')

  // Check if mindmap already exists
  const existingMindmaps = await payload.find({
    collection: 'mindmaps',
    where: {
      title: { equals: 'Fullstack Developer Skill Tree' },
    },
    limit: 1,
  })

  let mindmap
  if (existingMindmaps.totalDocs > 0) {
    mindmap = existingMindmaps.docs[0]
    console.log(`✅ Using existing mindmap: ${mindmap.title}`)
  } else {
    // Create mindmap
    mindmap = await payload.create({
      collection: 'mindmaps',
      data: {
        title: 'Fullstack Developer Skill Tree',
        slug: 'fullstack-developer-skill-tree',
        description: 'Complete skill progression for fullstack developers - from Foundation to AI-Era Skills',
        status: 'published',
        owner: userId,
      },
      draft: false,
    })
    console.log(`✅ Created mindmap: ${mindmap.title}`)
  }

  // Map seed IDs to actual nodeIds
  const nodeIdMap = new Map<string, string>()

  // Create nodes
  const nodes = foundationData as SeedNode[]
  let createdCount = 0
  let updatedCount = 0
  let skippedCount = 0

  for (const node of nodes) {
    // Check if node already exists by nodeId
    const existing = await payload.find({
      collection: 'mindmap-nodes',
      where: {
        and: [
          { mindmap: { equals: mindmap.id } },
          { nodeId: { equals: node.id } },
        ],
      },
      limit: 1,
    })

    if (existing.totalDocs > 0 && existing.docs[0].nodeId) {
      // Update existing node with new content
      const existingNode = existing.docs[0]
      const nodeId = existingNode.nodeId
      if (!nodeId) continue // Type guard
      nodeIdMap.set(node.id, nodeId)

      try {
        await payload.update({
          collection: 'mindmap-nodes',
          id: existingNode.id,
          data: {
            content: {
              title: node.title,
              text: node.title,
              ...node.content,
              // Store learning metadata in content (JSON field allows any structure)
              level: node.level,
              estimatedHours: node.estimatedHours,
              difficultyScore: node.difficultyScore,
              tags: node.tags,
              reviewTTL: node.reviewTTL,
            },
          },
        })
        updatedCount++
        console.log(`  ✓ Updated node: ${node.title}`)
      } catch (error) {
        console.error(`  ✗ Failed to update node: ${node.title}`, error)
        skippedCount++
      }
      continue
    }

    // Calculate position (simple grid layout)
    const levelIndex = nodes.filter(n => n.level === node.level).indexOf(node)
    const levelOffset = { L1: 0, L2: 400, L3: 800 }[node.level]
    const position = {
      x: levelOffset,
      y: levelIndex * 150,
    }

    // Create node
    const createdNode = await payload.create({
      collection: 'mindmap-nodes',
      data: {
        nodeId: node.id, // Use the human-readable ID from JSON
        mindmap: mindmap.id,
        content: {
          title: node.title,
          text: node.title,
          ...node.content, // Include all content fields (sections, displayMode, etc.)
          // Store learning metadata in content (JSON field allows any structure)
          level: node.level,
          estimatedHours: node.estimatedHours,
          difficultyScore: node.difficultyScore,
          tags: node.tags,
          reviewTTL: node.reviewTTL,
        },
        position,
        metadata: {
          author: userId,
        },
      },
    })

    if (createdNode.nodeId) {
      nodeIdMap.set(node.id, createdNode.nodeId)
      createdCount++
      console.log(`  ✓ Created node: ${node.title} (${node.level})`)
    } else {
      console.error(`  ✗ Failed to create node: ${node.title} - no nodeId returned`)
    }
  }

  console.log(`\n📊 Nodes: ${createdCount} created, ${updatedCount} updated, ${skippedCount} skipped`)

  // Create flashcards
  console.log('\n🃏 Creating flashcards...')
  let flashcardCount = 0

  for (const node of nodes) {
    const nodeId = nodeIdMap.get(node.id)
    if (!nodeId) continue

    for (const flashcard of node.flashcards) {
      // Check if flashcard already exists
      const existing = await payload.find({
        collection: 'flashcards',
        where: {
          and: [
            { nodeId: { equals: nodeId } },
            { question: { equals: flashcard.question } },
          ],
        },
        limit: 1,
      })

      if (existing.totalDocs === 0) {
        await payload.create({
          collection: 'flashcards',
          data: {
            nodeId,
            question: flashcard.question,
            answer: flashcard.answer,
            owner: userId,
          },
        })
        flashcardCount++
      }
    }
  }

  console.log(`  ✓ Created ${flashcardCount} flashcards`)

  // Create edges for parent-child relationships
  console.log('\n🔗 Creating node edges...')
  let edgeCount = 0

  for (const node of nodes) {
    if (!node.parentId) continue // Skip root nodes

    const childNodeId = nodeIdMap.get(node.id)
    const parentNodeId = nodeIdMap.get(node.parentId)

    if (!childNodeId || !parentNodeId) {
      console.log(`  ⚠️  Skipping edge: ${node.id} → ${node.parentId} (node not found)`)
      continue
    }

    // Check if edge already exists
    const existingEdge = await payload.find({
      collection: 'node-edges',
      where: {
        and: [
          { from: { equals: parentNodeId } },
          { to: { equals: childNodeId } },
        ],
      },
      limit: 1,
    })

    if (existingEdge.totalDocs === 0) {
      await payload.create({
        collection: 'node-edges',
        data: {
          from: parentNodeId,
          to: childNodeId,
          type: 'parent-child',
        },
      })
      edgeCount++
    }
  }

  console.log(`  ✓ Created ${edgeCount} edges`)

  return {
    mindmap,
    nodesCreated: createdCount,
    nodesUpdated: updatedCount,
    nodesSkipped: skippedCount,
    flashcardsCreated: flashcardCount,
    edgesCreated: edgeCount,
    nodeIdMap,
  }
}

