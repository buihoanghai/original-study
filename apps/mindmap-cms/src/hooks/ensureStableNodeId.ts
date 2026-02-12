import type { CollectionBeforeChangeHook } from 'payload'
import { v4 as uuidv4 } from 'uuid'

/**
 * ensureStableNodeId Hook
 *
 * ⚠️ CRITICAL: Enforces nodeId stability
 *
 * This hook ensures that:
 * 1. On CREATE: Auto-generates a unique nodeId if not provided
 * 2. On UPDATE: Prevents any modification to the nodeId
 *
 * Why this matters:
 * - Flashcards and Comments reference nodes via nodeId
 * - If nodeId changes, all references break
 * - This is a core architectural constraint
 *
 * @throws Error if nodeId is modified during update
 */
export const ensureStableNodeId: CollectionBeforeChangeHook = async ({
  data,
  operation,
  originalDoc,
}) => {
  // On CREATE: Auto-generate nodeId if not provided
  if (operation === 'create') {
    if (!data.nodeId) {
      data.nodeId = uuidv4()
    }
    return data
  }

  // On UPDATE: Prevent nodeId modification
  if (operation === 'update') {
    if (originalDoc && data.nodeId && data.nodeId !== originalDoc.nodeId) {
      throw new Error(
        `⚠️ CRITICAL ERROR: nodeId cannot be changed after creation. ` +
          `Original: ${originalDoc.nodeId}, Attempted: ${data.nodeId}. ` +
          `This is a core architectural constraint to maintain data integrity.`
      )
    }

    // Ensure nodeId is preserved (in case it was removed from data)
    if (originalDoc && originalDoc.nodeId) {
      data.nodeId = originalDoc.nodeId
    }
  }

  return data
}

