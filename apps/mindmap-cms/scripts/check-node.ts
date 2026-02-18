import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config.js'

async function checkNode() {
  const payload = await getPayload({ config })

  // Find Variables & Types node
  const node = await payload.find({
    collection: 'mindmap-nodes',
    where: {
      nodeId: { equals: 'variables-and-types' }
    },
    limit: 1
  })

  if (node.totalDocs === 0) {
    console.log('❌ Node not found')
    process.exit(1)
  }

  const doc = node.docs[0]
  console.log('📄 Node Details:\n')
  console.log(JSON.stringify(doc, null, 2))

  process.exit(0)
}

checkNode()

