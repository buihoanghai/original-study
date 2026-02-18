#!/usr/bin/env node
/**
 * Create Admin User
 * 
 * Creates an admin user for the CMS.
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../../src/payload.config.js'

async function createAdminUser() {
  console.log('👤 Creating admin user...\n')

  const payload = await getPayload({ config })

  const email = process.env.ADMIN_EMAIL || 'admin@example.com'
  const password = process.env.ADMIN_PASSWORD || 'admin123'

  try {
    // Check if admin user already exists
    const users = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
      limit: 1,
    })

    if (users.totalDocs > 0) {
      console.log('⚠️  Admin user already exists!')
      console.log(`   Email: ${email}`)
      console.log(`   ID: ${users.docs[0].id}`)
      console.log('\n💡 To reset password, update the user in CMS Admin or delete and re-run this script.\n')
      process.exit(0)
    }

    // Create admin user
    const newUser = await payload.create({
      collection: 'users',
      data: {
        email,
        password,
      },
    })

    console.log('✅ Admin user created successfully!')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    console.log(`   ID: ${newUser.id}`)
    console.log('\n🔗 Login at: http://localhost:3001/admin')
    console.log('\n⚠️  IMPORTANT: Change the password after first login!\n')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    process.exit(1)
  }
}

createAdminUser()

