d .#!/usr/bin/env node

/**
 * Main Seed Script for Fullstack Developer Skill Tree
 *
 * Usage:
 *   npm run seed                    # Seed all phases
 *   npm run seed -- --phase=1       # Seed only Phase 1 (Foundation)
 *   npm run seed -- --user=email    # Use specific user
 *
 * Phases:
 *   1. Foundation (Programming, OOP, Git, Debugging, Testing)
 *   2. Backend (Web Core, API Design, Auth, Architecture)
 *   3. Frontend (HTML/CSS, JavaScript, React, State Management)
 *   4. Database (SQL, Schema Design, Performance, NoSQL)
 *   5. System & DevOps (Networking, Deployment, Scaling, Security)
 *   6. Observability (Logging, Monitoring, Tracing, Debugging)
 *   7. Distributed Systems (Messaging, Event Sourcing, Consistency)
 *   8. Engineering Analysis (Requirements, Trade-offs, RCA, Design)
 *   9. AI-Era Skills (Prompt Engineering, AI Integration, AI Safety)
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../../src/payload.config.js'
import { seedFoundation } from './seed-foundation.js'

// Parse CLI arguments
const args = process.argv.slice(2)
const phase = args.find(arg => arg.startsWith('--phase='))?.split('=')[1]
const userEmail = args.find(arg => arg.startsWith('--user='))?.split('=')[1] || 'dev@payloadcms.com'

async function main() {
  console.log('🌳 Fullstack Developer Skill Tree - Seed Script\n')

  const payload = await getPayload({ config })

  // Find or create user
  let user = await payload.find({
    collection: 'users',
    where: { email: { equals: userEmail } },
    limit: 1,
  })

  if (user.totalDocs === 0) {
    console.log(`👤 Creating user: ${userEmail}`)
    const created = await payload.create({
      collection: 'users',
      data: {
        email: userEmail,
        password: 'password123',
      },
    })
    user = { docs: [created], totalDocs: 1 } as any
  } else {
    console.log(`👤 Using existing user: ${userEmail}`)
  }

  const userId = user.docs[0].id

  // Determine which phases to run
  const phasesToRun = phase ? [parseInt(phase)] : [1] // Default to Phase 1 only

  console.log(`\n📋 Running phases: ${phasesToRun.join(', ')}\n`)

  const results: any[] = []

  // Phase 1: Foundation
  if (phasesToRun.includes(1)) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📦 PHASE 1: FOUNDATION')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    const result = await seedFoundation(userId)
    results.push({ phase: 1, name: 'Foundation', ...result })

    console.log('\n✅ Phase 1 complete!\n')
  }

  // TODO: Add other phases here
  // Phase 2: Backend
  // Phase 3: Frontend
  // etc.

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 SEED SUMMARY')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  for (const result of results) {
    console.log(`Phase ${result.phase}: ${result.name}`)
    console.log(`  Mindmap: ${result.mindmap.title}`)
    console.log(`  Nodes: ${result.nodesCreated} created, ${result.nodesSkipped} skipped`)
    console.log(`  Edges: ${result.edgesCreated || 0} created`)
    console.log(`  Flashcards: ${result.flashcardsCreated} created`)
    console.log()
  }

  console.log('✅ Seed complete!\n')
  console.log('🔗 Next steps:')
  console.log('  1. Open CMS Admin: http://localhost:3001/admin')
  console.log('  2. Login with:', userEmail)
  console.log('  3. Navigate to Mindmaps → Fullstack Developer Skill Tree')
  console.log('  4. Verify NodeMastery and LearningSessions were auto-created')
  console.log()

  process.exit(0)
}

main().catch(error => {
  console.error('❌ Seed failed:', error)
  process.exit(1)
})

