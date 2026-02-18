/**
 * Core Mindmap Types
 *
 * These types define the structure of a mindmap document,
 * including metadata and status information.
 */

/**
 * Status of a mindmap document
 */
export type MindmapStatus = 'draft' | 'published' | 'archived'

/**
 * Metadata for a mindmap document
 */
export interface MindmapMetadata {
  /** Title of the mindmap */
  title: string

  /** URL-friendly slug (auto-generated from title) */
  slug: string

  /** Optional description */
  description: string

  /** Creation timestamp */
  created: Date

  /** Last update timestamp */
  updated: Date
}

/**
 * Main mindmap document
 */
export interface Mindmap {
  /** Unique identifier for the mindmap */
  id: string

  /** Mindmap metadata (title, description, timestamps) */
  metadata: MindmapMetadata

  /** Current status of the mindmap */
  status: MindmapStatus

  /** ID of the user who owns this mindmap */
  ownerId: string
}
