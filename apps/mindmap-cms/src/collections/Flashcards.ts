import type { CollectionConfig } from 'payload'

/**
 * Flashcards Collection
 *
 * Stores flashcards for spaced repetition learning.
 * Based on the Flashcard domain type from @mindmap/domain.
 *
 * Features:
 * - References MindmapNodes via stable nodeId
 * - Question/Answer pairs
 * - SRS (Spaced Repetition System) metadata
 * - User ownership
 */
export const Flashcards: CollectionConfig = {
  slug: 'flashcards',
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'nodeId', 'nextReview', 'updatedAt'],
  },
  access: {
    // Users can only read their own flashcards
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
      label: 'Node ID',
      admin: {
        description: 'References the stable nodeId from MindmapNodes collection',
      },
    },
    {
      name: 'question',
      type: 'textarea',
      required: true,
      label: 'Question',
    },
    {
      name: 'answer',
      type: 'textarea',
      required: true,
      label: 'Answer',
    },
    {
      name: 'srs',
      type: 'group',
      label: 'Spaced Repetition Metadata',
      fields: [
        {
          name: 'interval',
          type: 'number',
          label: 'Interval (days)',
          defaultValue: 1,
          admin: {
            description: 'Number of days until next review',
          },
        },
        {
          name: 'ease',
          type: 'number',
          label: 'Ease Factor',
          defaultValue: 2.5,
          admin: {
            description: 'Difficulty multiplier (higher = easier)',
          },
        },
        {
          name: 'nextReview',
          type: 'date',
          label: 'Next Review Date',
          admin: {
            description: 'When this flashcard should be reviewed next',
          },
        },
      ],
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

