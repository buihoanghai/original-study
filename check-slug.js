import { MongoClient } from 'mongodb'

const DATABASE_URL = 'mongodb://localhost:27017/mindmap-dev'

const client = new MongoClient(DATABASE_URL)

try {
  await client.connect()
  const db = client.db()

  console.log('📊 All mindmaps in database:\n')
  const mindmaps = await db.collection('mindmaps').find({}).toArray()

  if (mindmaps.length === 0) {
    console.log('❌ No mindmaps found in database')
    console.log('Run seed script: cd apps/mindmap-cms && npm run seed:foundation')
  } else {
    mindmaps.forEach((mindmap, index) => {
      console.log(`${index + 1}. ${mindmap.title}`)
      console.log(`   ID: ${mindmap._id}`)
      console.log(`   Slug: ${mindmap.slug || '❌ NO SLUG'}`)
      console.log(`   URL with ID: /editor/${mindmap._id}`)
      if (mindmap.slug) {
        console.log(`   URL with slug: /editor/${mindmap.slug}`)
      }
      console.log('')
    })

    const targetMindmap = mindmaps.find(m => m.title === 'Fullstack Developer Skill Tree')
    if (targetMindmap) {
      console.log('✅ Target mindmap found!')
      console.log(`   Use: /editor/${targetMindmap.slug || targetMindmap._id}`)
    }
  }
} finally {
  await client.close()
}

