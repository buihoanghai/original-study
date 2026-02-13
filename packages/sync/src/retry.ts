/**
 * Retry Utility
 *
 * Provides retry logic for failed network requests with exponential backoff.
 */

export interface RetryOptions {
  /**
   * Maximum number of retry attempts
   * @default 3
   */
  maxAttempts?: number

  /**
   * Initial delay in milliseconds
   * @default 1000
   */
  initialDelay?: number

  /**
   * Maximum delay in milliseconds
   * @default 10000
   */
  maxDelay?: number

  /**
   * Backoff multiplier
   * @default 2
   */
  backoffMultiplier?: number

  /**
   * Function to determine if error is retryable
   */
  shouldRetry?: (error: Error, attempt: number) => boolean

  /**
   * Callback called before each retry
   */
  onRetry?: (error: Error, attempt: number, delay: number) => void
}

/**
 * Default retry options
 */
const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'onRetry'>> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  shouldRetry: (error: Error) => {
    // Retry on network errors, but not on auth or validation errors
    return (
      error.message.includes('Network') ||
      error.message.includes('fetch') ||
      error.message.includes('timeout')
    )
  },
}

/**
 * Execute a function with retry logic
 *
 * @param fn - Async function to execute
 * @param options - Retry options
 * @returns Promise that resolves with the function result
 *
 * @example
 * ```typescript
 * const result = await withRetry(
 *   async () => fetch('/api/data'),
 *   { maxAttempts: 3, initialDelay: 1000 }
 * )
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let lastError: Error | undefined
  let delay = opts.initialDelay

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Check if we should retry
      const shouldRetry = opts.shouldRetry(lastError, attempt)
      const isLastAttempt = attempt === opts.maxAttempts

      if (!shouldRetry || isLastAttempt) {
        throw lastError
      }

      // Call onRetry callback if provided
      if (options.onRetry) {
        options.onRetry(lastError, attempt, delay)
      }

      // Wait before retrying
      await sleep(delay)

      // Increase delay for next attempt (exponential backoff)
      delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelay)
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Retry failed')
}

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Check if the browser is online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

/**
 * Wait for the browser to come back online
 *
 * @param timeout - Maximum time to wait in milliseconds
 * @returns Promise that resolves when online or rejects on timeout
 */
export function waitForOnline(timeout: number = 30000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isOnline()) {
      resolve()
      return
    }

    const timeoutId = setTimeout(() => {
      window.removeEventListener('online', onlineHandler)
      reject(new Error('Timeout waiting for network connection'))
    }, timeout)

    const onlineHandler = () => {
      clearTimeout(timeoutId)
      window.removeEventListener('online', onlineHandler)
      resolve()
    }

    window.addEventListener('online', onlineHandler)
  })
}

