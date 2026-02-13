import type { MindmapNode, NodeEdge, NodeContent } from '@mindmap/domain'
import { nanoid } from 'nanoid'

/**
 * Tree Operations
 *
 * Pure functions for manipulating the mindmap tree structure.
 * These functions do not mutate the input; they return new arrays.
 */

/**
 * Create a new node with default values
 */
export function createNode(
  content: NodeContent = { text: '' },
  position: { x: number; y: number } = { x: 0, y: 0 }
): MindmapNode {
  return {
    nodeId: nanoid(),
    content,
    position,
    metadata: {
      created: new Date(),
      updated: new Date(),
      author: 'current-user', // TODO: Get from auth context
    },
  }
}

/**
 * Add a child node to a parent
 */
export function addChildNode(
  nodes: MindmapNode[],
  edges: NodeEdge[],
  parentId: string
): { nodes: MindmapNode[]; edges: NodeEdge[]; newNodeId: string } {
  const parent = nodes.find((n) => n.nodeId === parentId)
  if (!parent) {
    throw new Error(`Parent node ${parentId} not found`)
  }

  // Calculate position for new child
  const childrenCount = edges.filter((e) => e.from === parentId).length
  const newNode = createNode(
    { text: '' },
    {
      x: parent.position.x + 200,
      y: parent.position.y + childrenCount * 80,
    }
  )

  const newEdge: NodeEdge = {
    from: parentId,
    to: newNode.nodeId,
    type: 'parent-child',
  }

  return {
    nodes: [...nodes, newNode],
    edges: [...edges, newEdge],
    newNodeId: newNode.nodeId,
  }
}

/**
 * Add a sibling node (same level as reference node)
 */
export function addSiblingNode(
  nodes: MindmapNode[],
  edges: NodeEdge[],
  referenceNodeId: string
): { nodes: MindmapNode[]; edges: NodeEdge[]; newNodeId: string } {
  const referenceNode = nodes.find((n) => n.nodeId === referenceNodeId)
  if (!referenceNode) {
    throw new Error(`Reference node ${referenceNodeId} not found`)
  }

  // Find parent of reference node
  const parentEdge = edges.find((e) => e.to === referenceNodeId && e.type === 'parent-child')

  if (!parentEdge) {
    // Reference node is root, can't add sibling
    throw new Error('Cannot add sibling to root node')
  }

  const parent = nodes.find((n) => n.nodeId === parentEdge.from)
  if (!parent) {
    throw new Error(`Parent node ${parentEdge.from} not found`)
  }

  // Calculate position for new sibling
  const siblingsCount = edges.filter((e) => e.from === parentEdge.from).length
  const newNode = createNode(
    { text: '' },
    {
      x: parent.position.x + 200,
      y: parent.position.y + siblingsCount * 80,
    }
  )

  const newEdge: NodeEdge = {
    from: parentEdge.from,
    to: newNode.nodeId,
    type: 'parent-child',
  }

  return {
    nodes: [...nodes, newNode],
    edges: [...edges, newEdge],
    newNodeId: newNode.nodeId,
  }
}

/**
 * Update node content
 */
export function updateNodeContent(
  nodes: MindmapNode[],
  nodeId: string,
  content: NodeContent
): MindmapNode[] {
  return nodes.map((node) =>
    node.nodeId === nodeId
      ? {
          ...node,
          content,
          metadata: {
            ...node.metadata,
            updated: new Date(),
          },
        }
      : node
  )
}

/**
 * Delete a node and all its descendants
 */
export function deleteNode(
  nodes: MindmapNode[],
  edges: NodeEdge[],
  nodeId: string
): { nodes: MindmapNode[]; edges: NodeEdge[] } {
  // Check if node is root (has no parent edge)
  const isRoot = !edges.some((e) => e.to === nodeId && e.type === 'parent-child')

  if (isRoot) {
    throw new Error('Cannot delete root node')
  }

  // Find all descendant node IDs
  const descendantIds = getDescendantIds(edges, nodeId)
  const allIdsToDelete = new Set([nodeId, ...descendantIds])

  return {
    nodes: nodes.filter((n) => !allIdsToDelete.has(n.nodeId)),
    edges: edges.filter((e) => !allIdsToDelete.has(e.from) && !allIdsToDelete.has(e.to)),
  }
}

/**
 * Get all descendant node IDs (recursive)
 */
function getDescendantIds(edges: NodeEdge[], nodeId: string): string[] {
  const children = edges.filter((e) => e.from === nodeId && e.type === 'parent-child').map((e) => e.to)

  const descendants: string[] = []
  for (const childId of children) {
    descendants.push(childId)
    descendants.push(...getDescendantIds(edges, childId))
  }

  return descendants
}

