/**
 * Mastery Calculation Logic
 *
 * Handles updating mastery records based on session completion.
 * Implements mastery level progression and confidence calculation.
 */

import type { NodeMastery, MasteryLevel } from '@mindmap/domain'

/**
 * Mastery level thresholds
 */
const MASTERY_THRESHOLDS = {
  new: { minSessions: 0, minConfidence: 0 },
  learning: { minSessions: 3, minConfidence: 0 },
  familiar: { minSessions: 5, minConfidence: 70 },
  mastered: { minSessions: 10, minConfidence: 90 },
}

/**
 * Update mastery record after session completion
 *
 * @param current - Current mastery record
 * @param performance - Performance score from completed session (0-100)
 * @returns Updated mastery record
 */
export function updateMastery(
  current: NodeMastery,
  performance: number
): NodeMastery {
  // Increment total sessions
  const newTotalSessions = current.totalSessions + 1

  // Calculate new success rate (weighted average)
  const newSuccessRate =
    (current.successRate * current.totalSessions + performance) /
    newTotalSessions

  // Calculate new confidence (weighted toward recent performance)
  const newConfidence = calculateConfidence(
    current.confidence,
    current.totalSessions,
    performance
  )

  // Determine new mastery level
  const newLevel = calculateMasteryLevel(
    newTotalSessions,
    newConfidence,
    current.level
  )

  return {
    ...current,
    level: newLevel,
    confidence: newConfidence,
    totalSessions: newTotalSessions,
    successRate: newSuccessRate,
    lastReviewed: new Date(),
  }
}

/**
 * Calculate confidence score with weighted average
 * Recent performance is weighted more heavily than historical average
 *
 * @param currentConfidence - Current confidence score
 * @param totalSessions - Total sessions completed so far
 * @param newPerformance - Performance from latest session
 * @returns New confidence score (0-100)
 */
export function calculateConfidence(
  currentConfidence: number,
  totalSessions: number,
  newPerformance: number
): number {
  // First session: use performance directly
  if (totalSessions === 0) {
    return Math.max(0, Math.min(100, newPerformance))
  }

  // Weight recent performance more heavily (70% new, 30% old)
  const weight = 0.7
  const confidence = currentConfidence * (1 - weight) + newPerformance * weight

  // Clamp to 0-100
  return Math.max(0, Math.min(100, confidence))
}

/**
 * Calculate mastery level based on sessions and confidence
 *
 * @param totalSessions - Total sessions completed
 * @param confidence - Current confidence score
 * @param currentLevel - Current mastery level
 * @returns New mastery level
 */
function calculateMasteryLevel(
  totalSessions: number,
  confidence: number,
  currentLevel: MasteryLevel
): MasteryLevel {
  // Check for mastered (highest level)
  if (
    totalSessions >= MASTERY_THRESHOLDS.mastered.minSessions &&
    confidence >= MASTERY_THRESHOLDS.mastered.minConfidence
  ) {
    return 'mastered'
  }

  // Check for familiar
  if (
    totalSessions >= MASTERY_THRESHOLDS.familiar.minSessions &&
    confidence >= MASTERY_THRESHOLDS.familiar.minConfidence
  ) {
    return 'familiar'
  }

  // Check for learning
  if (totalSessions >= MASTERY_THRESHOLDS.learning.minSessions) {
    return 'learning'
  }

  // Default to new
  return 'new'
}

