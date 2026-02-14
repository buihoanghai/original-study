/**
 * Debug-Aware Fetch Wrapper
 * 
 * Wraps fetch to add request ID propagation and logging when DEBUG_TRACE is enabled.
 * 
 * Features:
 * - Adds X-Request-Id header
 * - Logs: requestId, method, url, status, duration_ms
 * - Never logs: Authorization, cookies, body (by default)
 * - Only active when NEXT_PUBLIC_DEBUG_TRACE=1
 * 
 * Usage:
 *   import { tracedFetch } from '@/lib/fetcher'
 *   const response = await tracedFetch('/api/mindmaps', { method: 'POST', ... })
 */

import { generateRequestId, isDebugTraceEnabled } from './requestId'

export interface TracedFetchOptions extends RequestInit {
  /**
   * Optional request ID to use (generates new one if not provided)
   */
  requestId?: string
  
  /**
   * Whether to log request/response (default: true if DEBUG_TRACE enabled)
   */
  trace?: boolean
}

/**
 * Fetch wrapper with request ID propagation and optional logging
 */
export async function tracedFetch(
  input: RequestInfo | URL,
  options: TracedFetchOptions = {}
): Promise<Response> {
  const { requestId: providedRequestId, trace, ...fetchOptions } = options
  
  // Generate or use provided request ID
  const requestId = providedRequestId || generateRequestId()
  
  // Determine if we should trace (default: enabled if DEBUG_TRACE=1)
  const shouldTrace = trace !== undefined ? trace : isDebugTraceEnabled()
  
  // Add X-Request-Id header
  const headers = new Headers(fetchOptions.headers)
  headers.set('X-Request-Id', requestId)
  
  // Get URL for logging
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
  const method = fetchOptions.method || 'GET'
  
  // Log request start
  if (shouldTrace) {
    console.log(`[fetcher] ${method} ${url} | requestId: ${requestId}`)
  }
  
  const startTime = Date.now()
  
  try {
    const response = await fetch(input, {
      ...fetchOptions,
      headers,
    })
    
    const duration = Date.now() - startTime
    
    // Log response
    if (shouldTrace) {
      console.log(
        `[fetcher] ${method} ${url} | ${response.status} | ${duration}ms | requestId: ${requestId}`
      )
    }
    
    return response
  } catch (error) {
    const duration = Date.now() - startTime
    
    // Log error
    if (shouldTrace) {
      console.error(
        `[fetcher] ${method} ${url} | ERROR | ${duration}ms | requestId: ${requestId}`,
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
    
    throw error
  }
}

/**
 * Helper to create a traced fetch function with a specific base URL
 * 
 * Example:
 *   const cmsApi = createTracedFetcher('http://localhost:3001')
 *   const response = await cmsApi('/api/mindmaps')
 */
export function createTracedFetcher(baseUrl: string) {
  return (input: RequestInfo | URL, options?: TracedFetchOptions) => {
    const url = typeof input === 'string' 
      ? `${baseUrl}${input.startsWith('/') ? input : `/${input}`}`
      : input
    
    return tracedFetch(url, options)
  }
}

/**
 * Extract request ID from response headers
 */
export function getRequestIdFromResponse(response: Response): string | null {
  return response.headers.get('X-Request-Id')
}

/**
 * Log a debug trace message (only if DEBUG_TRACE enabled)
 */
export function debugLog(message: string, data?: Record<string, any>): void {
  if (isDebugTraceEnabled()) {
    console.log(`[debug] ${message}`, data || '')
  }
}

