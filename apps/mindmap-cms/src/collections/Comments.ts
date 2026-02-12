import type { CollectionConfig } from 'payload'

/**
 * Comments Collection
 *
 * Stores user comments on mindmap nodes.
 * Based on the Comment domain type from @mindmap/domain.
 *
 * Features:
 * - References MindmapNodes via stable nodeId
 * - Moderation workflow (pending/approved/rejected)
 * - Author tracking
 * - Content moderation
 */
export const Comments: CollectionConfig = {
  slug: 'comments',
  admin: {
    useAsTitle: 'content',
    defaultColumns: ['content', 'author', 'status', 'createdAt'],
  },
  access: {
    // Users can read approved comments, or their own comments
    read: ({ req: { user } }) => {
      if (!user) {
        return {
          status: {
            equals: 'approved',
          },
        }
      }

      // Logged in users can see approved comments or their own
      return true // Simplified for now - can be refined later
    },
    // Any logged-in user can create comments
    create: ({ req: { user } }) => Boolean(user),
    // Users can only update their own comments
    update: ({ req: { user } }) => {
      if (!user) return false
      return {
        author: {
          equals: user.id,
        },
      }
    },
    // Users can only delete their own comments
    delete: ({ req: { user } }) => {
      if (!user) return false
      return {
        author: {
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
      name: 'content',
      type: 'textarea',
      required: true,
      label: 'Comment Content',
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
      label: 'Author',
      defaultValue: ({ user }) => user?.id,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        {
          label: 'Pending',
          value: 'pending',
        },
        {
          label: 'Approved',
          value: 'approved',
        },
        {
          label: 'Rejected',
          value: 'rejected',
        },
      ],
      label: 'Moderation Status',
      admin: {
        description: 'Comments must be approved before being publicly visible',
      },
    },
  ],
  timestamps: true,
}

