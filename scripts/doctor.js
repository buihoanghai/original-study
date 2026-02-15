#!/usr/bin/env node

/**
 * Doctor Script - Health Check for Mindmap Project
 * 
 * Runs checks for both Next.js frontend and Payload CMS backend:
 * - Lint
 * - Typecheck
 * - Tests
 * - Build (optional, skipped with --fast)
 * 
 * Usage:
 *   node scripts/doctor.js
 *   node scripts/doctor.js --fast
 *   node scripts/doctor.js --frontend
 *   node scripts/doctor.js --backend
 */

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { resolve } from 'path'

// Parse CLI args
const args = process.argv.slice(2)
const flags = {
  fast: args.includes('--fast'),
  frontend: args.includes('--frontend'),
  backend: args.includes('--backend'),
}

// If no specific target, run both
const runBoth = !flags.frontend && !flags.backend
if (runBoth) {
  flags.frontend = true
  flags.backend = true
}

// Detect package manager
function detectPackageManager() {
  if (existsSync('pnpm-lock.yaml')) return 'pnpm'
  if (existsSync('yarn.lock')) return 'yarn'
  if (existsSync('package-lock.json')) return 'npm'
  return 'npm'
}

const pm = detectPackageManager()
console.log(`📦 Detected package manager: ${pm}\n`)

// Run command and capture result
function runCheck(name, command, cwd = process.cwd()) {
  const startTime = Date.now()
  
  try {
    execSync(command, {
      cwd,
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '1' },
    })
    
    const duration = Date.now() - startTime
    return { name, status: 'PASS', duration }
  } catch (error) {
    const duration = Date.now() - startTime
    return { name, status: 'FAIL', duration, error }
  }
}

// Skip check
function skipCheck(name, reason) {
  return { name, status: 'SKIP', reason }
}

// Results storage
const results = []

console.log('🏥 Running Doctor Checks...\n')
console.log('=' .repeat(60))

// Frontend checks
if (flags.frontend) {
  console.log('\n📱 FRONTEND (Next.js - mindmap-web)\n')
  
  const webDir = resolve(process.cwd(), 'apps/mindmap-web')
  
  // Lint
  console.log('🔍 Linting...')
  results.push(runCheck('Frontend: Lint', `${pm} run lint`, webDir))
  
  // Typecheck
  console.log('\n🔧 Type checking...')
  results.push(runCheck('Frontend: Typecheck', 'npx tsc --noEmit', webDir))
  
  // Tests
  console.log('\n🧪 Running tests...')
  if (existsSync(resolve(webDir, 'vitest.config.ts'))) {
    results.push(runCheck('Frontend: Tests', `${pm} run test`, webDir))
  } else {
    results.push(skipCheck('Frontend: Tests', 'No test config found'))
  }
  
  // Build (skip if --fast)
  if (!flags.fast) {
    console.log('\n🏗️  Building...')
    results.push(runCheck('Frontend: Build', `${pm} run build`, webDir))
  } else {
    results.push(skipCheck('Frontend: Build', '--fast flag'))
  }
}

// Backend checks
if (flags.backend) {
  console.log('\n📡 BACKEND (Payload CMS - mindmap-cms)\n')
  
  const cmsDir = resolve(process.cwd(), 'apps/mindmap-cms')
  
  // Lint
  console.log('🔍 Linting...')
  results.push(runCheck('Backend: Lint', `${pm} run lint`, cmsDir))
  
  // Typecheck
  console.log('\n🔧 Type checking...')
  results.push(runCheck('Backend: Typecheck', 'npx tsc --noEmit', cmsDir))
  
  // Tests
  console.log('\n🧪 Running tests...')
  if (existsSync(resolve(cmsDir, 'vitest.config.mts'))) {
    results.push(runCheck('Backend: Tests', `${pm} run test:int`, cmsDir))
  } else {
    results.push(skipCheck('Backend: Tests', 'No test config found'))
  }
  
  // Build (skip if --fast)
  if (!flags.fast) {
    console.log('\n🏗️  Building...')
    results.push(runCheck('Backend: Build', `${pm} run build`, cmsDir))
  } else {
    results.push(skipCheck('Backend: Build', '--fast flag'))
  }
}

// Print summary
console.log('\n' + '='.repeat(60))
console.log('\n📊 SUMMARY\n')

const maxNameLength = Math.max(...results.map(r => r.name.length))

results.forEach(result => {
  const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️ '
  const name = result.name.padEnd(maxNameLength)
  const duration = result.duration ? `(${result.duration}ms)` : ''
  const reason = result.reason ? `- ${result.reason}` : ''
  
  console.log(`${icon} ${name} ${duration} ${reason}`)
})

// Exit code
const failures = results.filter(r => r.status === 'FAIL')
const passes = results.filter(r => r.status === 'PASS')
const skips = results.filter(r => r.status === 'SKIP')

console.log('\n' + '='.repeat(60))
console.log(`\n✅ Passed: ${passes.length}`)
console.log(`❌ Failed: ${failures.length}`)
console.log(`⏭️  Skipped: ${skips.length}`)

if (failures.length > 0) {
  console.log('\n❌ Doctor check FAILED\n')
  process.exit(1)
} else {
  console.log('\n✅ Doctor check PASSED\n')
  process.exit(0)
}

