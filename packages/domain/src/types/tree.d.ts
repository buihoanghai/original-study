/**
 * Tree Structure Types
 *
 * These types define how nodes are connected in a tree hierarchy.
 * Edges represent relationships between nodes (parent-child or references).
 */
import type { MindmapNode } from './node';
/**
 * Type of edge connecting nodes
 */
export type EdgeType = 'parent-child' | 'reference';
/**
 * An edge connecting two nodes
 *
 * Edges reference nodes by their stable nodeId (string).
 */
export interface NodeEdge {
    /** Source node ID (stable nodeId) */
    from: string;
    /** Target node ID (stable nodeId) */
    to: string;
    /** Type of relationship */
    type: EdgeType;
}
/**
 * Complete tree structure of a mindmap
 *
 * Contains all nodes and their relationships (edges).
 */
export interface MindmapTree {
    /** All nodes in the tree */
    nodes: MindmapNode[];
    /** All edges connecting nodes */
    edges: NodeEdge[];
    /** ID of the root node (stable nodeId) */
    rootId: string;
}
//# sourceMappingURL=tree.d.ts.map