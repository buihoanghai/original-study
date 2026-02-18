import type { CollectionConfig } from 'payload'

/**
 * Notes Collection
 *
 * Stores personal notes that users can add to mindmap nodes.
 * Each note is associated with a specific node and user.
 *
 * Features:
 * - References MindmapNodes via stable nodeId
 * - User ownership (each user has their own notes)
 * - Rich text content
 * - Timestamps for tracking when notes were created/updated
 */
export const Notes: CollectionConfig = {
  slug: 'notes',
  admin: {
    useAsTitle: 'nodeId',
    defaultColumns: ['nodeId', 'author', 'updatedAt'],
  },
  access: {
    // Users can only create their own notes
    create: ({ req: { user } }) => !!user,
    
    // Users can only read their own notes
    read: ({ req: { user } }) => {
      if (!user) return false
      return {
        author: {
          equals: user.id,
        },
      }
    },
    
    // Users can only update their own notes
    update: ({ req: { user } }) => {
      if (!user) return false
      return {
        author: {
          equals: user.id,
        },
      }
    },
    
    // Users can only delete their own notes
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
        description: 'The stable nodeId this note is attached to',
      },
      index: true,
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Author',
      defaultValue: ({ user }) => user?.id,
      admin: {
        readOnly: true,
        description: 'The user who created this note',
      },
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      label: 'Note Content',
      admin: {
        description: 'Your personal notes about this node',
      },
    },
  ],
  timestamps: true,
}

