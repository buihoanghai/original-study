import type { CollectionConfig } from 'payload'

/**
 * NodeMastery Collection
 *
 * Tracks learning progress and mastery level for each mindmap node.
 * Based on the NodeMastery domain type from @mindmap/domain.
 *
 * Features:
 * - References MindmapNodes via stable nodeId
 * - Mastery level progression (new → learning → familiar → mastered)
 * - Confidence scoring (0-100)
 * - Session statistics
 * - Next review scheduling
 * - User ownership
 */
export const NodeMastery: CollectionConfig = {
  slug: 'node-mastery',
  admin: {
    useAsTitle: 'nodeId',
    defaultColumns: ['nodeId', 'level', 'confidence', 'nextReviewDate', 'updatedAt'],
  },
  access: {
    // Users can only read their own mastery records
    read: ({ req: { user } }) => {
      if (!user) return false
      return {
        owner: {
          equals: user.id,
        },
      }
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => {
      if (!user) return false
      return {
        owner: {
          equals: user.id,
        },
      }
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      return {
        owner: {
          equals: user.id,
        },
      }
    },
  },
  fields: [
    {
      name: 'nodeId',
      type: 'text',
      required: true,
      index: true,
      label: 'Node ID',
      admin: {
        description: 'References the stable nodeId from MindmapNodes collection',
      },
    },
    {
      name: 'level',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Learning', value: 'learning' },
        { label: 'Familiar', value: 'familiar' },
        { label: 'Mastered', value: 'mastered' },
      ],
      label: 'Mastery Level',
      admin: {
        description: 'Current mastery level for this node',
      },
    },
    {
      name: 'confidence',
      type: 'number',
      required: true,
      defaultValue: 0,
      min: 0,
      max: 100,
      label: 'Confidence Score',
      admin: {
        description: 'Confidence score (0-100)',
      },
    },
    {
      name: 'totalSessions',
      type: 'number',
      required: true,
      defaultValue: 0,
      min: 0,
      label: 'Total Sessions',
      admin: {
        description: 'Total number of learning sessions completed',
      },
    },
    {
      name: 'successRate',
      type: 'number',
      required: true,
      defaultValue: 0,
      min: 0,
      max: 100,
      label: 'Success Rate',
      admin: {
        description: 'Average performance across all sessions (0-100)',
      },
    },
    {
      name: 'nextReviewDate',
      type: 'date',
      required: true,
      index: true,
      label: 'Next Review Date',
      admin: {
        description: 'When this node should be reviewed next',
      },
    },
    {
      name: 'lastReviewed',
      type: 'date',
      label: 'Last Reviewed',
      admin: {
        description: 'When this node was last reviewed',
      },
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
      label: 'Owner',
      defaultValue: ({ user }) => user?.id,
      admin: {
        readOnly: true,
      },
    },
  ],
  timestamps: true,
}

