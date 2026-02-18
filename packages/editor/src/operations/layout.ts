import dagre from 'dagre'
import type { MindmapNode, NodeEdge } from '@mindmap/domain'

/**
 * Layout Operations
 *
 * Functions for calculating hierarchical tree layouts using dagre.
 */

export interface LayoutOptions {
  /**
   * Direction of the layout
   * - 'TB': Top to bottom (default)
   * - 'LR': Left to right
   * - 'BT': Bottom to top
   * - 'RL': Right to left
   */
  direction?: 'TB' | 'LR' | 'BT' | 'RL'

  /**
   * Horizontal spacing between nodes
   */
  nodeSpacing?: number

  /**
   * Vertical spacing between ranks/levels
   */
  rankSpacing?: number

  /**
   * Node width (for layout calculation)
   */
  nodeWidth?: number

  /**
   * Node height (for layout calculation)
   */
  nodeHeight?: number
}

const DEFAULT_OPTIONS: Required<LayoutOptions> = {
  direction: 'LR', // Left to right for mindmaps
  nodeSpacing: 100,
  rankSpacing: 250,
  nodeWidth: 200,
  nodeHeight: 80,
}

/**
 * Apply hierarchical tree layout to nodes using dagre
 *
 * @param nodes - Array of nodes to layout
 * @param edges - Array of edges defining the tree structure
 * @param options - Layout options
 * @returns New array of nodes with updated positions
 */
export function applyTreeLayout(
  nodes: MindmapNode[],
  edges: NodeEdge[],
  options: LayoutOptions = {}
): MindmapNode[] {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // Create a new directed graph
  const graph = new dagre.graphlib.Graph()

  // Set graph options
  graph.setGraph({
    rankdir: opts.direction,
    nodesep: opts.nodeSpacing,
    ranksep: opts.rankSpacing,
    marginx: 50,
    marginy: 50,
  })

  // Default edge configuration
  graph.setDefaultEdgeLabel(() => ({}))

  // Add nodes to the graph
  nodes.forEach((node) => {
    graph.setNode(node.nodeId, {
      width: opts.nodeWidth,
      height: opts.nodeHeight,
    })
  })

  // Add edges to the graph (only parent-child edges for layout)
  edges
    .filter((edge) => edge.type === 'parent-child')
    .forEach((edge) => {
      graph.setEdge(edge.from, edge.to)
    })

  // Calculate layout
  dagre.layout(graph)

  // Update node positions based on layout
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = graph.node(node.nodeId)

    if (!nodeWithPosition) {
      // Node not in graph (shouldn't happen), keep original position
      console.warn(`[layout] Node ${node.nodeId} not found in graph`)
      return node
    }

    return {
      ...node,
      position: {
        // Dagre returns center position, adjust to top-left
        x: nodeWithPosition.x - opts.nodeWidth / 2,
        y: nodeWithPosition.y - opts.nodeHeight / 2,
      },
    }
  })

  console.log('[layout] Applied tree layout to', layoutedNodes.length, 'nodes')
  return layoutedNodes
}

/**
 * Find the root node (node with no incoming parent-child edges)
 *
 * @param nodes - Array of nodes
 * @param edges - Array of edges
 * @returns Root node or null if not found
 */
export function findRootNode(
  nodes: MindmapNode[],
  edges: NodeEdge[]
): MindmapNode | null {
  const childNodeIds = new Set(
    edges.filter((e) => e.type === 'parent-child').map((e) => e.to)
  )

  const rootNode = nodes.find((node) => !childNodeIds.has(node.nodeId))

  return rootNode || null
}

/**
 * Get the depth/level of each node in the tree
 *
 * @param nodes - Array of nodes
 * @param edges - Array of edges
 * @returns Map of nodeId to depth (root = 0)
 */
export function getNodeDepths(
  nodes: MindmapNode[],
  edges: NodeEdge[]
): Map<string, number> {
  const depths = new Map<string, number>()
  const root = findRootNode(nodes, edges)

  if (!root) {
    return depths
  }

  // BFS to calculate depths
  const queue: Array<{ nodeId: string; depth: number }> = [
    { nodeId: root.nodeId, depth: 0 },
  ]

  while (queue.length > 0) {
    const { nodeId, depth } = queue.shift()!
    depths.set(nodeId, depth)

    // Find children
    const children = edges
      .filter((e) => e.from === nodeId && e.type === 'parent-child')
      .map((e) => e.to)

    children.forEach((childId) => {
      queue.push({ nodeId: childId, depth: depth + 1 })
    })
  }

  return depths
}

