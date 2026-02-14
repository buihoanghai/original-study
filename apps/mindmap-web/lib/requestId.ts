/**
 * Request ID Generation and Propagation
 * 
 * Generates stable request IDs for tracing requests across frontend and backend.
 * Only active when NEXT_PUBLIC_DEBUG_TRACE=1
 */

import { nanoid } from 'nanoid'

/**
 * Generate a unique request ID
 * Format: req_[nanoid] for easy identification in logs
 */
export function generateRequestId(): string {
  return `req_${nanoid(12)}`
}

/**
 * Get or create request ID for current context
 * In browser: stores in sessionStorage for the current action
 * In server: generates new ID each time
 */
export function getOrCreateRequestId(key: string = 'default'): string {
  if (typeof window === 'undefined') {
    // Server-side: always generate new
    return generateRequestId()
  }

  // Client-side: reuse for same action
  const storageKey = `requestId:${key}`
  let requestId = sessionStorage.getItem(storageKey)
  
  if (!requestId) {
    requestId = generateRequestId()
    sessionStorage.setItem(storageKey, requestId)
  }

  return requestId
}

/**
 * Clear request ID for a specific action
 * Call this after action completes to get fresh ID next time
 */
export function clearRequestId(key: string = 'default'): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(`requestId:${key}`)
  }
}

/**
 * Check if debug tracing is enabled
 */
export function isDebugTraceEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DEBUG_TRACE === '1'
}

