import type { CollectionConfig } from 'payload'

/**
 * NodeEdges Collection
 *
 * Stores relationships between mindmap nodes (parent-child and cross-references).
 * Based on the NodeEdge domain type from @mindmap/domain.
 *
 * Features:
 * - References nodes via stable nodeId
 * - Supports parent-child hierarchy
 * - Supports cross-reference links (prerequisites, related concepts)
 * - Enables graph-based navigation and visualization
 */
export const NodeEdges: CollectionConfig = {
  slug: 'node-edges',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['from', 'to', 'type', 'updatedAt'],
  },
  access: {
    // Inherit access from parent mindmap
    read: async ({ req: { user, payload }, id }) => {
      if (!user) return false
      
      // If checking a specific edge, verify user owns the nodes
      if (id) {
        const edge = await payload.findByID({
          collection: 'node-edges',
          id,
        })
        if (edge) {
          // Check if user owns the "from" node's mindmap
          const fromNode = await payload.find({
            collection: 'mindmap-nodes',
            where: { nodeId: { equals: edge.from } },
            limit: 1,
          })
          if (fromNode.docs.length > 0) {
            const mindmap = await payload.findByID({
              collection: 'mindmaps',
              id: typeof fromNode.docs[0].mindmap === 'string' 
                ? fromNode.docs[0].mindmap 
                : fromNode.docs[0].mindmap.id,
            })
            return mindmap?.owner === user.id
          }
        }
      }
      
      return true // Let query filter handle it
    },
    create: ({ req: { user } }) => Boolean(user),
    update: async ({ req: { user, payload }, id }) => {
      if (!user || !id) return false
      
      const edge = await payload.findByID({
        collection: 'node-edges',
        id,
      })
      if (edge) {
        const fromNode = await payload.find({
          collection: 'mindmap-nodes',
          where: { nodeId: { equals: edge.from } },
          limit: 1,
        })
        if (fromNode.docs.length > 0) {
          const mindmap = await payload.findByID({
            collection: 'mindmaps',
            id: typeof fromNode.docs[0].mindmap === 'string' 
              ? fromNode.docs[0].mindmap 
              : fromNode.docs[0].mindmap.id,
          })
          return mindmap?.owner === user.id
        }
      }
      return false
    },
    delete: async ({ req: { user, payload }, id }) => {
      if (!user || !id) return false
      
      const edge = await payload.findByID({
        collection: 'node-edges',
        id,
      })
      if (edge) {
        const fromNode = await payload.find({
          collection: 'mindmap-nodes',
          where: { nodeId: { equals: edge.from } },
          limit: 1,
        })
        if (fromNode.docs.length > 0) {
          const mindmap = await payload.findByID({
            collection: 'mindmaps',
            id: typeof fromNode.docs[0].mindmap === 'string' 
              ? fromNode.docs[0].mindmap 
              : fromNode.docs[0].mindmap.id,
          })
          return mindmap?.owner === user.id
        }
      }
      return false
    },
  },
  fields: [
    {
      name: 'from',
      type: 'text',
      required: true,
      index: true,
      label: 'From Node ID',
      admin: {
        description: 'Source node (parent in parent-child relationships)',
      },
    },
    {
      name: 'to',
      type: 'text',
      required: true,
      index: true,
      label: 'To Node ID',
      admin: {
        description: 'Target node (child in parent-child relationships)',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'parent-child',
      options: [
        { label: 'Parent-Child', value: 'parent-child' },
        { label: 'Reference', value: 'reference' },
      ],
      label: 'Edge Type',
      admin: {
        description: 'Type of relationship between nodes',
      },
    },
  ],
  timestamps: true,
}

