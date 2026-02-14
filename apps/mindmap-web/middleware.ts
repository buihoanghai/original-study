/**
 * Next.js Middleware for Request ID Propagation
 * 
 * Ensures every request has an X-Request-Id header for tracing.
 * Only active when NEXT_PUBLIC_DEBUG_TRACE=1
 * 
 * Features:
 * - Reads X-Request-Id from incoming request (if present)
 * - Generates new ID if missing
 * - Adds X-Request-Id to response headers (visible in browser DevTools)
 * - Does NOT change routing logic
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { nanoid } from 'nanoid'

export function middleware(request: NextRequest) {
  // Only run if DEBUG_TRACE is enabled
  const debugTrace = process.env.NEXT_PUBLIC_DEBUG_TRACE === '1'
  
  if (!debugTrace) {
    return NextResponse.next()
  }
  
  // Get or generate request ID
  let requestId = request.headers.get('x-request-id')
  
  if (!requestId) {
    requestId = `req_${nanoid(12)}`
  }
  
  // Clone response and add request ID to headers
  const response = NextResponse.next()
  response.headers.set('X-Request-Id', requestId)
  
  // Log request (minimal)
  if (debugTrace) {
    console.log(
      `[middleware] ${request.method} ${request.nextUrl.pathname} | requestId: ${requestId}`
    )
  }
  
  return response
}

// Configure which routes to run middleware on
// Run on all routes except static files and Next.js internals
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

