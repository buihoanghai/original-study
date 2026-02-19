import type { MindmapNode, NodeEdge } from '@mindmap/domain'

/**
 * Balanced Mindmap Layout (XMind-like)
 *
 * Creates a deterministic two-side tree layout with:
 * - Root node centered
 * - First-level children balanced left/right by subtree height
 * - Vertical stacking of siblings
 * - Smooth spacing and alignment
 */

export interface BalancedLayoutOptions {
  /** Horizontal gap per depth level */
  levelGapX?: number
  /** Vertical gap between stacked siblings */
  vGap?: number
  /** Gap from root to first-level nodes */
  sideGapRoot?: number
  /** Node width for measurement */
  nodeWidth?: number
  /** Node height for measurement */
  nodeHeight?: number
  /** Compact mode (smaller spacing) */
  compact?: boolean
}

const DEFAULT_OPTIONS: Required<BalancedLayoutOptions> = {
  levelGapX: 280,
  vGap: 24,
  sideGapRoot: 300,
  nodeWidth: 200,
  nodeHeight: 80,
  compact: false,
}

interface TreeNode {
  nodeId: string
  children: TreeNode[]
  subtreeHeight: number
  depth: number
}

/**
 * Find the root node (node with no incoming parent-child edges)
 */
function findRootNode(nodes: MindmapNode[], edges: NodeEdge[]): MindmapNode | null {
  const childNodeIds = new Set(
    edges.filter((e) => e.type === 'parent-child').map((e) => e.to)
  )
  return nodes.find((node) => !childNodeIds.has(node.nodeId)) || null
}

/**
 * Build tree structure from edges
 */
function buildTree(
  rootId: string,
  nodes: MindmapNode[],
  edges: NodeEdge[],
  nodeHeight: number,
  vGap: number,
  depth = 0
): TreeNode {
  const children = edges
    .filter((e) => e.from === rootId && e.type === 'parent-child')
    .map((e) => e.to)
    .map((childId) => buildTree(childId, nodes, edges, nodeHeight, vGap, depth + 1))

  // Calculate subtree height
  let subtreeHeight: number
  if (children.length === 0) {
    subtreeHeight = nodeHeight
  } else {
    const totalChildrenHeight = children.reduce((sum, child) => sum + child.subtreeHeight, 0)
    const gapsHeight = (children.length - 1) * vGap
    subtreeHeight = Math.max(nodeHeight, totalChildrenHeight + gapsHeight)
  }

  return {
    nodeId: rootId,
    children,
    subtreeHeight,
    depth,
  }
}

/**
 * Balance children into left and right groups by subtree height
 */
function balanceChildren(children: TreeNode[]): { left: TreeNode[]; right: TreeNode[] } {
  if (children.length === 0) {
    return { left: [], right: [] }
  }

  // Sort by subtree height descending for better balancing
  const sorted = [...children].sort((a, b) => b.subtreeHeight - a.subtreeHeight)

  const left: TreeNode[] = []
  const right: TreeNode[] = []
  let leftHeight = 0
  let rightHeight = 0

  // Greedy assignment to the side with smaller accumulated height
  for (const child of sorted) {
    if (leftHeight <= rightHeight) {
      left.push(child)
      leftHeight += child.subtreeHeight
    } else {
      right.push(child)
      rightHeight += child.subtreeHeight
    }
  }

  return { left, right }
}

/**
 * Position nodes recursively
 */
function positionSubtree(
  tree: TreeNode,
  x: number,
  y: number,
  direction: 'left' | 'right',
  opts: Required<BalancedLayoutOptions>,
  positions: Map<string, { x: number; y: number }>
): void {
  // Position current node
  positions.set(tree.nodeId, { x, y })

  if (tree.children.length === 0) {
    return
  }

  // Calculate total height of children
  const totalChildrenHeight = tree.children.reduce((sum, child) => sum + child.subtreeHeight, 0)
  const gapsHeight = (tree.children.length - 1) * opts.vGap
  const totalHeight = totalChildrenHeight + gapsHeight

  // Start Y position for children (centered around parent Y)
  let currentY = y - totalHeight / 2

  // Direction multiplier
  const dirSign = direction === 'right' ? 1 : -1

  // Position each child
  for (const child of tree.children) {
    const childX = x + dirSign * opts.levelGapX
    const childY = currentY + child.subtreeHeight / 2

    positionSubtree(child, childX, childY, direction, opts, positions)

    currentY += child.subtreeHeight + opts.vGap
  }
}

/**
 * Apply balanced two-side tree layout
 */
export function applyBalancedLayout(
  nodes: MindmapNode[],
  edges: NodeEdge[],
  options: BalancedLayoutOptions = {}
): MindmapNode[] {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // Apply compact mode adjustments
  if (opts.compact) {
    opts.levelGapX = Math.floor(opts.levelGapX * 0.75)
    opts.vGap = Math.floor(opts.vGap * 0.75)
    opts.sideGapRoot = Math.floor(opts.sideGapRoot * 0.75)
  }

  // Find root node
  const root = findRootNode(nodes, edges)
  if (!root) {
    console.warn('[balancedLayout] No root node found')
    return nodes
  }

  // Build tree structure
  const tree = buildTree(root.nodeId, nodes, edges, opts.nodeHeight, opts.vGap)

  // Position map
  const positions = new Map<string, { x: number; y: number }>()

  // Root at center
  const rootX = 0
  const rootY = 0
  positions.set(root.nodeId, { x: rootX, y: rootY })

  // Balance first-level children
  const { left, right } = balanceChildren(tree.children)

  // Position left side
  if (left.length > 0) {
    const totalLeftHeight = left.reduce((sum, child) => sum + child.subtreeHeight, 0)
    const leftGapsHeight = (left.length - 1) * opts.vGap
    const totalHeight = totalLeftHeight + leftGapsHeight
    let currentY = rootY - totalHeight / 2

    for (const child of left) {
      const childX = rootX - opts.sideGapRoot
      const childY = currentY + child.subtreeHeight / 2

      positionSubtree(child, childX, childY, 'left', opts, positions)

      currentY += child.subtreeHeight + opts.vGap
    }
  }

  // Position right side
  if (right.length > 0) {
    const totalRightHeight = right.reduce((sum, child) => sum + child.subtreeHeight, 0)
    const rightGapsHeight = (right.length - 1) * opts.vGap
    const totalHeight = totalRightHeight + rightGapsHeight
    let currentY = rootY - totalHeight / 2

    for (const child of right) {
      const childX = rootX + opts.sideGapRoot
      const childY = currentY + child.subtreeHeight / 2

      positionSubtree(child, childX, childY, 'right', opts, positions)

      currentY += child.subtreeHeight + opts.vGap
    }
  }

  // Apply positions to nodes
  const layoutedNodes = nodes.map((node) => {
    const pos = positions.get(node.nodeId)
    if (!pos) {
      console.warn(`[balancedLayout] No position for node ${node.nodeId}`)
      return node
    }

    return {
      ...node,
      position: {
        x: pos.x - opts.nodeWidth / 2,
        y: pos.y - opts.nodeHeight / 2,
      },
    }
  })

  console.log('[balancedLayout] Applied balanced layout to', layoutedNodes.length, 'nodes')
  return layoutedNodes
}

