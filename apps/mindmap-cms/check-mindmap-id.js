import 'dotenv/config'
import { getPayload } from 'payload'
import config from './src/payload.config.js'

const payload = await getPayload({ config })

const mindmaps = await payload.find({
  collection: 'mindmaps',
  where: {
    title: {
      equals: 'Fullstack Developer Skill Tree',
    },
  },
  limit: 1,
})

if (mindmaps.totalDocs > 0) {
  const mindmap = mindmaps.docs[0]
  console.log('Mindmap found:')
  console.log('  ID:', mindmap.id)
  console.log('  Title:', mindmap.title)
  console.log('  URL:', `/editor/${mindmap.id}`)
} else {
  console.log('Mindmap not found')
}

process.exit(0)
