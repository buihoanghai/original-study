import type { CollectionConfig } from 'payload'
import { ensureStableNodeId } from '../hooks/ensureStableNodeId'

/**
 * MindmapNodes Collection
 *
 * Stores individual nodes within mindmaps.
 * Based on the MindmapNode domain type from @mindmap/domain.
 *
 * ⚠️ CRITICAL: nodeId is STABLE and IMMUTABLE
 * - Auto-generated on creation
 * - NEVER changes after creation (enforced by hook)
 * - Used for references from Flashcards and Comments
 *
 * Features:
 * - Stable nodeId (enforced by ensureStableNodeId hook)
 * - Content (text and richText)
 * - Position (x, y coordinates)
 * - Metadata (timestamps, author)
 * - Relationship to parent Mindmap
 */
export const MindmapNodes: CollectionConfig = {
  slug: 'mindmap-nodes',
  admin: {
    useAsTitle: 'nodeId',
    defaultColumns: ['nodeId', 'mindmap', 'updatedAt'],
  },
  hooks: {
    beforeChange: [ensureStableNodeId],
  },
  access: {
    // Inherit access from parent mindmap
    read: async ({ req: { user, payload }, id }) => {
      if (!user) return false
      
      // If checking a specific node, verify user owns the parent mindmap
      if (id) {
        const node = await payload.findByID({
          collection: 'mindmap-nodes',
          id,
        })
        if (node && node.mindmap) {
          const mindmap = await payload.findByID({
            collection: 'mindmaps',
            id: typeof node.mindmap === 'string' ? node.mindmap : node.mindmap.id,
          })
          return mindmap?.owner === user.id
        }
      }
      
      return true // Let query filter handle it
    },
    create: ({ req: { user } }) => Boolean(user),
    update: async ({ req: { user, payload }, id }) => {
      if (!user || !id) return false
      
      const node = await payload.findByID({
        collection: 'mindmap-nodes',
        id,
      })
      if (node && node.mindmap) {
        const mindmap = await payload.findByID({
          collection: 'mindmaps',
          id: typeof node.mindmap === 'string' ? node.mindmap : node.mindmap.id,
        })
        return mindmap?.owner === user.id
      }
      
      return false
    },
    delete: async ({ req: { user, payload }, id }) => {
      if (!user || !id) return false
      
      const node = await payload.findByID({
        collection: 'mindmap-nodes',
        id,
      })
      if (node && node.mindmap) {
        const mindmap = await payload.findByID({
          collection: 'mindmaps',
          id: typeof node.mindmap === 'string' ? node.mindmap : node.mindmap.id,
        })
        return mindmap?.owner === user.id
      }
      
      return false
    },
  },
  fields: [
    {
      name: 'nodeId',
      type: 'text',
      required: true,
      unique: true,
      label: 'Node ID',
      admin: {
        readOnly: true,
        description: '⚠️ STABLE ID - Never changes after creation. Auto-generated.',
      },
    },
    {
      name: 'mindmap',
      type: 'relationship',
      relationTo: 'mindmaps',
      required: true,
      hasMany: false,
      label: 'Parent Mindmap',
    },
    {
      name: 'content',
      type: 'group',
      label: 'Content',
      fields: [
        {
          name: 'text',
          type: 'textarea',
          label: 'Plain Text',
        },
        {
          name: 'richText',
          type: 'richText',
          label: 'Rich Text',
        },
      ],
    },
    {
      name: 'position',
      type: 'group',
      label: 'Position',
      fields: [
        {
          name: 'x',
          type: 'number',
          required: true,
          label: 'X Coordinate',
        },
        {
          name: 'y',
          type: 'number',
          required: true,
          label: 'Y Coordinate',
        },
      ],
    },
    {
      name: 'metadata',
      type: 'group',
      label: 'Metadata',
      fields: [
        {
          name: 'author',
          type: 'relationship',
          relationTo: 'users',
          label: 'Author',
          defaultValue: ({ user }) => user?.id,
        },
      ],
    },
  ],
  timestamps: true,
}

