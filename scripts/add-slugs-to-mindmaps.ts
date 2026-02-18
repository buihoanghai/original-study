/**
 * Migration Script: Add Slugs to Existing Mindmaps
 *
 * This script adds slug fields to all existing mindmaps that don't have one.
 * Run this after adding the slug field to the Mindmaps collection schema.
 *
 * Usage:
 *   npx tsx scripts/add-slugs-to-mindmaps.ts
 */

import { MongoClient } from 'mongodb'

/**
 * Convert text to URL-friendly slug
 */
function textToSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

async function addSlugsToMindmaps() {
  console.log('🚀 Starting migration: Add slugs to existing mindmaps\n')

  const MONGODB_URI = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/mindmap_db1'
  const client = new MongoClient(MONGODB_URI)

  try {
    // Connect to MongoDB
    console.log('📦 Connecting to MongoDB...')
    await client.connect()
    console.log('✅ Connected to MongoDB\n')

    const db = client.db()
    const mindmapsCollection = db.collection('mindmaps')

    // Fetch all mindmaps
    console.log('📊 Fetching all mindmaps...')
    const mindmaps = await mindmapsCollection.find({}).toArray()
    console.log(`✅ Found ${mindmaps.length} mindmaps\n`)

    // Filter mindmaps without slugs
    const mindmapsWithoutSlugs = mindmaps.filter((mindmap: any) => !mindmap.slug)
    console.log(`🔍 Found ${mindmapsWithoutSlugs.length} mindmaps without slugs\n`)

    if (mindmapsWithoutSlugs.length === 0) {
      console.log('✅ All mindmaps already have slugs. Nothing to do!')
      await client.close()
      process.exit(0)
    }

    // Update each mindmap
    let successCount = 0
    let errorCount = 0

    for (const mindmap of mindmapsWithoutSlugs) {
      const slug = textToSlug(mindmap.title)
      console.log(`📝 Updating "${mindmap.title}" → slug: "${slug}"`)

      try {
        await mindmapsCollection.updateOne(
          { _id: mindmap._id },
          { $set: { slug } }
        )
        successCount++
        console.log(`   ✅ Updated successfully`)
      } catch (error) {
        errorCount++
        console.error(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('📊 Migration Summary:')
    console.log(`   Total mindmaps: ${mindmaps.length}`)
    console.log(`   Updated: ${successCount}`)
    console.log(`   Errors: ${errorCount}`)
    console.log('='.repeat(50))

    await client.close()

    if (errorCount === 0) {
      console.log('\n✅ Migration completed successfully!')
    } else {
      console.log('\n⚠️  Migration completed with errors')
      process.exit(1)
    }
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    await client.close()
    process.exit(1)
  }
}

// Run the migration
addSlugsToMindmaps()

