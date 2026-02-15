/**
 * Streak Tracking Logic
 *
 * Handles daily streak calculation and maintenance.
 * Streak increments when sessions are completed on consecutive days.
 */

/**
 * Update streak based on completion date
 *
 * @param currentStreak - Current streak count
 * @param lastCompletedDate - Date of last completed session (null if first time)
 * @param completionDate - Date of current completion
 * @returns New streak count
 */
export function updateStreak(
  currentStreak: number,
  lastCompletedDate: Date | null,
  completionDate: Date
): number {
  // First completion ever
  if (lastCompletedDate === null) {
    return 1
  }

  // Check if should reset (missed a day)
  if (shouldResetStreak(lastCompletedDate, completionDate)) {
    return 0
  }

  // Check if should increment (consecutive day)
  if (shouldIncrementStreak(lastCompletedDate, completionDate)) {
    return currentStreak + 1
  }

  // Same day - no change
  return currentStreak
}

/**
 * Check if streak should be incremented
 * True if last completion was yesterday
 *
 * @param lastDate - Last completion date
 * @param currentDate - Current completion date
 * @returns True if streak should increment
 */
export function shouldIncrementStreak(
  lastDate: Date | null,
  currentDate: Date
): boolean {
  if (lastDate === null) {
    return true // First completion
  }

  const daysDiff = getDaysDifference(lastDate, currentDate)
  return daysDiff === 1 // Exactly 1 day apart
}

/**
 * Check if streak should be reset
 * True if last completion was 2+ days ago
 *
 * @param lastDate - Last completion date
 * @param currentDate - Current completion date
 * @returns True if streak should reset
 */
export function shouldResetStreak(
  lastDate: Date | null,
  currentDate: Date
): boolean {
  if (lastDate === null) {
    return false // No previous completion
  }

  const daysDiff = getDaysDifference(lastDate, currentDate)
  return daysDiff >= 2 // 2 or more days apart
}

/**
 * Get number of days between two dates
 * Ignores time component, only compares dates
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Number of days difference
 */
function getDaysDifference(date1: Date, date2: Date): number {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate())
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate())
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

