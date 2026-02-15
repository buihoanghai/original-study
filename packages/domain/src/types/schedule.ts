/**
 * Schedule and Planning Types
 *
 * These types support weekly planning, daily targets, and streak tracking.
 */

/**
 * Weekly learning target and progress
 *
 * Tracks goals and achievements for a calendar week.
 */
export interface WeeklyTarget {
  /** Start date of the week (typically Monday) */
  weekStartDate: Date

  /** Target number of sessions to complete this week */
  targetSessions: number

  /** Number of sessions completed so far this week */
  completedSessions: number

  /**
   * Current streak (consecutive days with at least one completed session)
   * Resets to 0 if a day is missed
   */
  streak: number
}

/**
 * Daily plan with scheduled sessions
 *
 * Represents a single day in the calendar with all scheduled sessions.
 */
export interface DailyPlan {
  /** The date for this plan */
  date: Date

  /**
   * Array of session IDs scheduled for this day
   * Can be empty if no sessions scheduled
   */
  sessions: string[]

  /**
   * Whether all sessions for this day have been completed
   * True if sessions array is empty or all sessions are completed
   */
  completed: boolean
}

