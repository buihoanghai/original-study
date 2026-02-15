import type { CollectionConfig } from 'payload'

/**
 * LearningSessions Collection
 *
 * Stores scheduled and completed learning sessions for mindmap nodes.
 * Based on the LearningSession domain type from @mindmap/domain.
 *
 * Features:
 * - References MindmapNodes via stable nodeId
 * - Session types (learn, review, practice, application)
 * - Session status (scheduled, completed, skipped, missed)
 * - Performance tracking
 * - Duration tracking
 * - User ownership
 */
export const LearningSessions: CollectionConfig = {
  slug: 'learning-sessions',
  admin: {
    useAsTitle: 'sessionId',
    defaultColumns: ['sessionId', 'nodeId', 'type', 'status', 'scheduledDate', 'updatedAt'],
  },
  access: {
    // Users can only read their own sessions
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
      name: 'sessionId',
      type: 'text',
      required: true,
      unique: true,
      label: 'Session ID',
      admin: {
        description: 'Unique identifier for this session',
      },
    },
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
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Learn', value: 'learn' },
        { label: 'Review', value: 'review' },
        { label: 'Practice', value: 'practice' },
        { label: 'Application', value: 'application' },
      ],
      label: 'Session Type',
      admin: {
        description: 'Type of learning session',
      },
    },
    {
      name: 'scheduledDate',
      type: 'date',
      required: true,
      index: true,
      label: 'Scheduled Date',
      admin: {
        description: 'When this session is scheduled',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'scheduled',
      options: [
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Completed', value: 'completed' },
        { label: 'Skipped', value: 'skipped' },
        { label: 'Missed', value: 'missed' },
      ],
      label: 'Status',
      admin: {
        description: 'Current status of this session',
      },
    },
    {
      name: 'performance',
      type: 'number',
      min: 0,
      max: 100,
      label: 'Performance Score',
      admin: {
        description: 'Performance score for completed session (0-100)',
      },
    },
    {
      name: 'duration',
      type: 'number',
      min: 0,
      label: 'Duration (minutes)',
      admin: {
        description: 'Time spent on this session in minutes',
      },
    },
    {
      name: 'completedDate',
      type: 'date',
      label: 'Completed Date',
      admin: {
        description: 'When this session was completed',
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

