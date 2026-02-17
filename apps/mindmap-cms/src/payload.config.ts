import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Mindmaps } from './collections/Mindmaps'
import { MindmapNodes } from './collections/MindmapNodes'
import { NodeEdges } from './collections/NodeEdges'
import { Flashcards } from './collections/Flashcards'
import { Comments } from './collections/Comments'
import { NodeMastery } from './collections/NodeMastery'
import { LearningSessions } from './collections/LearningSessions'
import { entryLoggerPlugin } from './lib/entryLogger'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Mindmaps,
    MindmapNodes,
    NodeEdges,
    Flashcards,
    Comments,
    NodeMastery,
    LearningSessions,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  sharp,
  plugins: [
    entryLoggerPlugin(),
  ],
  cors: [
    'http://localhost:3000',
    'http://localhost:3333',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3333',
  ],
  csrf: [
    'http://localhost:3000',
    'http://localhost:3333',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3333',
  ],
})
