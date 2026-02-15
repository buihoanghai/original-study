#!/usr/bin/env node

/**
 * Triage Script - Run Doctor and Capture Artifacts
 * 
 * Runs doctor.js and captures output to debug/ directory:
 * - debug/latest-output.txt - Full output
 * - debug/latest-summary.json - Pass/fail matrix with timestamps
 * - debug/latest-failures.json - Failure details with last 80 lines
 * 
 * Usage:
 *   node scripts/triage.js
 *   node scripts/triage.js --fast
 */

import { spawn } from 'child_process'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve } from 'path'

// Ensure debug directory exists
const debugDir = resolve(process.cwd(), 'debug')
if (!existsSync(debugDir)) {
  mkdirSync(debugDir, { recursive: true })
}

// Parse CLI args
const args = process.argv.slice(2)

console.log('🔬 Running Triage...\n')

// Capture output
let fullOutput = ''
const startTime = Date.now()

// Run doctor script
const doctorProcess = spawn('node', ['scripts/doctor.js', ...args], {
  cwd: process.cwd(),
  env: { ...process.env, FORCE_COLOR: '1' },
})

// Capture stdout
doctorProcess.stdout.on('data', (data) => {
  const text = data.toString()
  fullOutput += text
  process.stdout.write(text)
})

// Capture stderr
doctorProcess.stderr.on('data', (data) => {
  const text = data.toString()
  fullOutput += text
  process.stderr.write(text)
})

// On exit, save artifacts
doctorProcess.on('close', (exitCode) => {
  const endTime = Date.now()
  const duration = endTime - startTime

  console.log('\n📝 Saving artifacts...\n')

  // Save full output
  const outputPath = resolve(debugDir, 'latest-output.txt')
  writeFileSync(outputPath, fullOutput, 'utf-8')
  console.log(`✅ Saved: ${outputPath}`)

  // Parse results from output
  const results = parseResults(fullOutput)

  // Save summary JSON
  const summary = {
    timestamp: new Date().toISOString(),
    duration,
    exitCode,
    results,
    stats: {
      total: results.length,
      passed: results.filter(r => r.status === 'PASS').length,
      failed: results.filter(r => r.status === 'FAIL').length,
      skipped: results.filter(r => r.status === 'SKIP').length,
    },
  }

  const summaryPath = resolve(debugDir, 'latest-summary.json')
  writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf-8')
  console.log(`✅ Saved: ${summaryPath}`)

  // Save failures JSON
  const failures = results.filter(r => r.status === 'FAIL')
  const failuresData = {
    timestamp: new Date().toISOString(),
    count: failures.length,
    failures: failures.map(f => ({
      name: f.name,
      duration: f.duration,
      output: extractFailureContext(fullOutput, f.name),
    })),
  }

  const failuresPath = resolve(debugDir, 'latest-failures.json')
  writeFileSync(failuresPath, JSON.stringify(failuresData, null, 2), 'utf-8')
  console.log(`✅ Saved: ${failuresPath}`)

  console.log('\n' + '='.repeat(60))
  console.log('\n📊 Triage Summary:')
  console.log(`   Total: ${summary.stats.total}`)
  console.log(`   ✅ Passed: ${summary.stats.passed}`)
  console.log(`   ❌ Failed: ${summary.stats.failed}`)
  console.log(`   ⏭️  Skipped: ${summary.stats.skipped}`)
  console.log(`   ⏱️  Duration: ${duration}ms`)
  console.log('\n' + '='.repeat(60))

  if (exitCode !== 0) {
    console.log('\n❌ Triage FAILED - See artifacts in debug/\n')
  } else {
    console.log('\n✅ Triage PASSED\n')
  }

  process.exit(exitCode)
})

/**
 * Parse results from doctor output
 */
function parseResults(output) {
  const results = []
  const lines = output.split('\n')

  for (const line of lines) {
    // Match result lines: "✅ Frontend: Lint (1234ms)"
    const match = line.match(/^(✅|❌|⏭️)\s+(.+?)\s+(?:\((\d+)ms\))?\s*(?:-\s+(.+))?$/)
    if (match) {
      const [, icon, name, duration, reason] = match
      results.push({
        name: name.trim(),
        status: icon === '✅' ? 'PASS' : icon === '❌' ? 'FAIL' : 'SKIP',
        duration: duration ? parseInt(duration, 10) : undefined,
        reason: reason?.trim(),
      })
    }
  }

  return results
}

/**
 * Extract last 80 lines of context around a failure
 */
function extractFailureContext(output, checkName) {
  const lines = output.split('\n')
  const checkIndex = lines.findIndex(line => line.includes(checkName))

  if (checkIndex === -1) {
    return 'Context not found'
  }

  // Get 80 lines after the check name
  const contextLines = lines.slice(checkIndex, checkIndex + 80)
  return contextLines.join('\n')
}

