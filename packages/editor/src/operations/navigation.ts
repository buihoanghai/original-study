import type { NodeEdge, MindmapNode } from '@mindmap/domain'

/**
 * Navigation Operations
 *
 * Pure functions for navigating the mindmap tree structure.
 * Used for breadcrumb navigation and tree traversal.
 */

/**
 * Get ancestor path from node to root
 * Returns array of nodeIds: [currentNode, parent, grandparent, ..., root]
 *
 * @example
 * // For a tree: root -> parent -> child
 * getAncestorPath(edges, 'child') // ['child', 'parent', 'root']
 */
export function getAncestorPath(
  edges: NodeEdge[],
  nodeId: string
): string[] {
  const path: string[] = [nodeId]
  let currentId = nodeId

  // Traverse up the tree until we reach root (no parent)
  // Safety limit to prevent infinite loops
  let iterations = 0
  const MAX_ITERATIONS = 100

  while (iterations < MAX_ITERATIONS) {
    const parentEdge = edges.find(
      (e) => e.to === currentId && e.type === 'parent-child'
    )

    if (!parentEdge) break // Reached root

    path.push(parentEdge.from)
    currentId = parentEdge.from
    iterations++
  }

  return path
}

/**
 * Get direct children of a node
 * Returns array of child nodeIds
 *
 * @example
 * getChildren(edges, 'parent') // ['child1', 'child2']
 */
export function getChildren(
  edges: NodeEdge[],
  nodeId: string
): string[] {
  return edges
    .filter((e) => e.from === nodeId && e.type === 'parent-child')
    .map((e) => e.to)
}

/**
 * Build breadcrumb data with node titles
 * Returns array from root to current node
 *
 * @example
 * buildBreadcrumb(nodes, edges, 'child')
 * // [
 * //   { nodeId: 'root', title: 'Foundation' },
 * //   { nodeId: 'parent', title: 'Programming' },
 * //   { nodeId: 'child', title: 'Variables' }
 * // ]
 */
export function buildBreadcrumb(
  nodes: MindmapNode[],
  edges: NodeEdge[],
  nodeId: string
): Array<{ nodeId: string; title: string }> {
  const path = getAncestorPath(edges, nodeId)

  // Reverse to get root -> current order
  return path.reverse().map((id) => {
    const node = nodes.find((n) => n.nodeId === id)
    return {
      nodeId: id,
      title: node?.content.text || 'Untitled',
    }
  })
}

