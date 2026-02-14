/**
 * Debug Tracing Utilities for Payload CMS
 * 
 * Provides utilities for tracing requests and hooks in Payload.
 * Only active when DEBUG_TRACE=1
 * 
 * SECURITY: Never logs secrets (Authorization, cookies, tokens, passwords)
 */

import type { PayloadRequest } from 'payload'
import { nanoid } from 'nanoid'

/**
 * Check if debug tracing is enabled
 */
export function isDebugTraceEnabled(): boolean {
  return process.env.DEBUG_TRACE === '1'
}

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return `req_${nanoid(12)}`
}

/**
 * Get request ID from Payload request
 */
export function getRequestId(req: PayloadRequest): string | undefined {
  // Try to get from headers
  const headersRequestId = req.headers?.get?.('x-request-id')
  if (headersRequestId) return headersRequestId

  // Try to get from context (if we stored it there)
  return req.context?.requestId as string | undefined
}

/**
 * Set request ID in Payload request context
 */
export function setRequestId(req: PayloadRequest, requestId: string): void {
  if (!req.context) {
    req.context = {}
  }
  req.context.requestId = requestId
}

/**
 * Debug trace helper for hooks and handlers
 * 
 * Usage:
 *   debugTrace('hookName', { requestId, collection, operation, docId })
 * 
 * Only logs if DEBUG_TRACE=1
 * Never logs secrets
 */
export function debugTrace(
  label: string,
  data?: Record<string, any>
): void {
  if (!isDebugTraceEnabled()) return

  // Filter out sensitive data
  const safeData = data ? sanitizeLogData(data) : {}

  console.log(`[debug:${label}]`, safeData)
}

/**
 * Remove sensitive data from log objects
 */
function sanitizeLogData(data: Record<string, any>): Record<string, any> {
  const sensitive = [
    'authorization',
    'cookie',
    'password',
    'token',
    'secret',
    'apikey',
    'api_key',
  ]

  const sanitized: Record<string, any> = {}

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase()

    // Skip sensitive keys
    if (sensitive.some(s => lowerKey.includes(s))) {
      sanitized[key] = '[REDACTED]'
      continue
    }

    // Recursively sanitize objects
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeLogData(value)
      continue
    }

    // Keep safe values
    sanitized[key] = value
  }

  return sanitized
}

/**
 * Log entry point for Payload requests
 * 
 * Usage in onInit hook:
 *   payload.logger.info = createEntryLogger(payload.logger.info)
 */
export function logEntry(data: {
  requestId: string
  method: string
  path: string
  status?: number
  duration?: number
  userId?: string | null
  collection?: string
  operation?: string
}): void {
  if (!isDebugTraceEnabled()) return

  const {
    requestId,
    method,
    path,
    status,
    duration,
    userId,
    collection,
    operation,
  } = data

  const parts = [
    '[entry]',
    method,
    path,
  ]

  if (status !== undefined) parts.push(`| ${status}`)
  if (duration !== undefined) parts.push(`| ${duration}ms`)
  parts.push(`| requestId: ${requestId}`)
  if (userId !== undefined) parts.push(`| userId: ${userId || 'null'}`)
  if (collection) parts.push(`| collection: ${collection}`)
  if (operation) parts.push(`| operation: ${operation}`)

  console.log(parts.join(' '))
}

/**
 * Extract collection and operation from Payload request
 */
export function getCollectionAndOperation(req: PayloadRequest): {
  collection?: string
  operation?: string
} {
  return {
    collection: (req as any).collection?.slug,
    operation: req.context?.operation as string | undefined,
  }
}

