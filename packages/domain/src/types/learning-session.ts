/**
 * Learning Session Types
 *
 * These types define scheduled learning activities for mindmap nodes.
 * Sessions are auto-generated when nodes are created and track completion.
 */

/**
 * Type of learning session
 *
 * - learn: Initial learning session (first exposure)
 * - review: Spaced repetition review session
 * - practice: Practice session for skill reinforcement
 * - application: Application session for real-world use
 */
export type SessionType = 'learn' | 'review' | 'practice' | 'application'

/**
 * Status of a learning session
 *
 * - scheduled: Session is scheduled for future
 * - completed: Session was completed successfully
 * - skipped: Session was intentionally skipped
 * - missed: Session was not completed by deadline
 */
export type SessionStatus = 'scheduled' | 'completed' | 'skipped' | 'missed'

/**
 * A scheduled learning session for a mindmap node
 *
 * Sessions are auto-created when nodes are created and when previous
 * sessions are completed. They track when and how well a user learns.
 */
export interface LearningSession {
  /** Unique identifier for the session */
  sessionId: string

  /**
   * Reference to the mindmap node this session is for
   * Uses stable nodeId that never changes
   */
  nodeId: string

  /** Type of session (learn, review, practice, application) */
  type: SessionType

  /** When this session is scheduled */
  scheduledDate: Date

  /** Current status of the session */
  status: SessionStatus

  /** ID of the user who owns this session */
  owner: string

  /**
   * Performance score (0-100) if completed
   * Optional - only present when status is 'completed'
   */
  performance?: number

  /**
   * Duration in minutes if completed
   * Optional - only present when status is 'completed'
   */
  duration?: number

  /**
   * When the session was completed
   * Optional - only present when status is 'completed'
   */
  completedDate?: Date
}

