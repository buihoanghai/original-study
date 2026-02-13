/**
 * @mindmap/sync
 *
 * Synchronization package for editor ↔ CMS communication.
 *
 * Features:
 * - Explicit sync (no auto-sync)
 * - Save/load mindmaps and nodes
 * - Preserves stable nodeIds
 * - Error handling
 * - Retry logic with exponential backoff
 * - Offline detection
 */

export { SyncClient } from './client'
export type {
  SyncConfig,
  SaveResult,
  LoadResult,
  SyncedMindmap,
  SyncedNode,
} from './types'
export { SyncError, SyncErrorType } from './types'
export { withRetry, isOnline, waitForOnline } from './retry'
export type { RetryOptions } from './retry'

