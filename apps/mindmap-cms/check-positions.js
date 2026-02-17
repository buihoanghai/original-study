import 'dotenv/config'
import { getPayload } from 'payload'
import config from './src/payload.config.js'

const payload = await getPayload({ config })

const nodes = await payload.find({
  collection: 'mindmap-nodes',
  limit: 100,
})

console.log('\n📍 Node Positions:\n')
nodes.docs.forEach(node => {
  console.log(`${node.content?.text}:`)
  console.log(`  Position: (${node.position?.x}, ${node.position?.y})`)
})

process.exit(0)
