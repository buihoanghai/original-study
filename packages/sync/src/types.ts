import type { Mindmap, MindmapNode } from '@mindmap/domain'

/**
 * Sync Package Types
 *
 * Defines types for synchronization between local editor and Payload CMS.
 */

/**
 * Configuration for the sync client
 */
export interface SyncConfig {
  /**
   * Base URL of the Payload CMS API
   * @example "http://localhost:3001"
   */
  cmsUrl: string

  /**
   * Authentication token for API requests
   * Optional - if not provided, requests will be unauthenticated
   */
  authToken?: string
}

/**
 * Result of a save operation
 */
export interface SaveResult<T> {
  /**
   * Whether the save was successful
   */
  success: boolean

  /**
   * The saved data (with CMS IDs)
   */
  data?: T

  /**
   * Error message if save failed
   */
  error?: string

  /**
   * Conflict data if a conflict was detected
   */
  conflict?: {
    local: T
    remote: T
    localUpdated: Date
    remoteUpdated: Date
  }
}

/**
 * Result of a load operation
 */
export interface LoadResult<T> {
  /**
   * Whether the load was successful
   */
  success: boolean

  /**
   * The loaded data
   */
  data?: T

  /**
   * Error message if load failed
   */
  error?: string
}

/**
 * Mindmap with CMS metadata
 * Extends domain Mindmap with CMS-specific fields
 */
export interface SyncedMindmap extends Omit<Mindmap, 'id'> {
  /**
   * CMS document ID (optional for new mindmaps)
   */
  id?: string

  /**
   * CMS created timestamp
   */
  createdAt?: string

  /**
   * CMS updated timestamp
   */
  updatedAt?: string
}

/**
 * MindmapNode with CMS metadata
 * Extends domain MindmapNode with CMS-specific fields
 */
export interface SyncedNode extends MindmapNode {
  /**
   * CMS document ID
   */
  id?: string

  /**
   * Reference to parent mindmap (CMS ID)
   */
  mindmap?: string

  /**
   * CMS created timestamp
   */
  createdAt?: string

  /**
   * CMS updated timestamp
   */
  updatedAt?: string
}

/**
 * Sync error types
 */
export enum SyncErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Sync error with type and details
 */
export class SyncError extends Error {
  constructor(
    public type: SyncErrorType,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'SyncError'
  }
}

