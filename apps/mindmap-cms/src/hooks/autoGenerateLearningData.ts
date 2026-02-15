import type { CollectionAfterChangeHook } from 'payload'
import { v4 as uuidv4 } from 'uuid'

/**
 * autoGenerateLearningData Hook
 *
 * Automatically creates NodeMastery and initial LearningSession
 * when a new MindmapNode is created.
 *
 * This implements AC1 from Task 007:
 * - Auto-create mastery record with default values
 * - Auto-create initial learning session scheduled for tomorrow
 *
 * ⚠️ IMPORTANT: Only runs on CREATE, not UPDATE
 * ⚠️ IMPORTANT: Uses req to maintain transaction atomicity
 */
export const autoGenerateLearningData: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
  context,
}) => {
  // Only run on CREATE operation
  if (operation !== 'create') {
    return doc
  }

  // Skip if context flag is set (prevents infinite loops)
  if (context.skipLearningGeneration) {
    return doc
  }

  // Ensure we have a nodeId and owner
  if (!doc.nodeId) {
    req.payload.logger.error('Cannot generate learning data: nodeId is missing')
    return doc
  }

  const owner = doc.metadata?.author || req.user?.id
  if (!owner) {
    req.payload.logger.error('Cannot generate learning data: owner is missing')
    return doc
  }

  try {
    // Calculate tomorrow's date for initial session
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0) // Schedule for 9 AM

    // Create NodeMastery record
    await req.payload.create({
      collection: 'node-mastery',
      data: {
        nodeId: doc.nodeId,
        level: 'new',
        confidence: 0,
        totalSessions: 0,
        successRate: 0,
        nextReviewDate: tomorrow.toISOString(),
        owner,
      },
      req, // CRITICAL: Pass req for transaction atomicity
      context: { skipLearningGeneration: true }, // Prevent infinite loops
    })

    // Create initial LearningSession
    await req.payload.create({
      collection: 'learning-sessions',
      data: {
        sessionId: uuidv4(),
        nodeId: doc.nodeId,
        type: 'learn',
        scheduledDate: tomorrow.toISOString(),
        status: 'scheduled',
        owner,
      },
      req, // CRITICAL: Pass req for transaction atomicity
      context: { skipLearningGeneration: true }, // Prevent infinite loops
    })

    req.payload.logger.info(
      `Auto-generated learning data for node ${doc.nodeId}`
    )
  } catch (error) {
    req.payload.logger.error(
      `Failed to auto-generate learning data for node ${doc.nodeId}: ${error}`
    )
    // Don't throw - allow node creation to succeed even if learning data fails
  }

  return doc
}

