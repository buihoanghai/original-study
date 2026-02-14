/**
 * Payload Entry Logger Middleware
 * 
 * Logs all incoming requests to Payload API with:
 * - requestId (from header or generated)
 * - method, path, status, duration
 * - userId (if authenticated)
 * - collection/operation (if detectable)
 * 
 * Only active when DEBUG_TRACE=1
 * Never logs secrets or full payloads
 */

import type { Config } from 'payload'
import {
  generateRequestId,
  getRequestId,
  setRequestId,
  logEntry,
  isDebugTraceEnabled,
  getCollectionAndOperation,
} from './debugTrace'

/**
 * Create entry logger plugin for Payload
 * 
 * Usage in payload.config.ts:
 *   import { entryLoggerPlugin } from './lib/entryLogger'
 *   
 *   export default buildConfig({
 *     plugins: [entryLoggerPlugin()],
 *   })
 */
export const entryLoggerPlugin = () => (config: Config): Config => {
  // Only add hooks if DEBUG_TRACE is enabled
  if (!isDebugTraceEnabled()) {
    return config
  }

  return {
    ...config,
    hooks: {
      ...config.hooks,
      // Add global afterOperation hook to log all operations
      afterOperation: [
        ...(config.hooks?.afterOperation || []),
        async (args) => {
          const { req, operation, result } = args

          // Get or generate request ID
          let requestId = getRequestId(req)
          if (!requestId) {
            requestId = generateRequestId()
            setRequestId(req, requestId)
          }

          // Extract collection and operation info
          const { collection } = getCollectionAndOperation(req)

          // Log the operation
          logEntry({
            requestId,
            method: operation,
            path: collection ? `/api/${collection}` : '/api',
            userId: req.user?.id || null,
            collection,
            operation,
          })

          return result
        },
      ],
    },
    onInit: async (payload) => {
      // Call original onInit if it exists
      if (config.onInit) {
        await config.onInit(payload)
      }

      // Log that entry logger is active
      if (isDebugTraceEnabled()) {
        payload.logger.info('[entryLogger] Debug tracing enabled (DEBUG_TRACE=1)')
      }
    },
  }
}

/**
 * Express middleware for logging HTTP requests
 * 
 * This is an alternative approach if you have access to the Express app.
 * Use this in a custom server setup.
 * 
 * Usage:
 *   import express from 'express'
 *   import { entryLoggerMiddleware } from './lib/entryLogger'
 *   
 *   const app = express()
 *   app.use(entryLoggerMiddleware)
 */
export function entryLoggerMiddleware(
  req: any,
  res: any,
  next: () => void
): void {
  if (!isDebugTraceEnabled()) {
    return next()
  }

  // Get or generate request ID
  let requestId = req.headers['x-request-id']
  if (!requestId) {
    requestId = generateRequestId()
    req.headers['x-request-id'] = requestId
  }

  // Add request ID to response headers
  res.setHeader('X-Request-Id', requestId)

  // Track start time
  const startTime = Date.now()

  // Log on response finish
  res.on('finish', () => {
    const duration = Date.now() - startTime

    logEntry({
      requestId,
      method: req.method,
      path: req.path || req.url,
      status: res.statusCode,
      duration,
      userId: req.user?.id || null,
    })
  })

  next()
}

