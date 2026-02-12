import { useEffect } from 'react'
import { useEditorStore } from '../store/editorStore'
import type { MindmapNode, NodeEdge } from '@mindmap/domain'

/**
 * useNavigation Hook
 *
 * Implements arrow key navigation through the mindmap tree.
 * Follows tree structure for up/down, spatial positioning for left/right.
 */
export const useNavigation = () => {
  const { nodes, edges, ui, selectNode } = useEditorStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { selectedNodeId, editingNodeId } = ui

      // Don't navigate when editing
      if (editingNodeId) {
        return
      }

      // Don't navigate if no node selected
      if (!selectedNodeId) {
        return
      }

      // Arrow key navigation
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()

        const currentNode = nodes.find((n) => n.nodeId === selectedNodeId)
        if (!currentNode) return

        let nextNodeId: string | null = null

        switch (e.key) {
          case 'ArrowRight':
            // Navigate to first child
            nextNodeId = getFirstChild(edges, selectedNodeId)
            break

          case 'ArrowLeft':
            // Navigate to parent
            nextNodeId = getParent(edges, selectedNodeId)
            break

          case 'ArrowDown':
            // Navigate to next sibling
            nextNodeId = getNextSibling(nodes, edges, selectedNodeId)
            break

          case 'ArrowUp':
            // Navigate to previous sibling
            nextNodeId = getPreviousSibling(nodes, edges, selectedNodeId)
            break
        }

        if (nextNodeId) {
          selectNode(nextNodeId)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nodes, edges, ui, selectNode])
}

/**
 * Get first child of a node
 */
function getFirstChild(edges: NodeEdge[], nodeId: string): string | null {
  const childEdge = edges.find((e) => e.from === nodeId && e.type === 'parent-child')
  return childEdge?.to || null
}

/**
 * Get parent of a node
 */
function getParent(edges: NodeEdge[], nodeId: string): string | null {
  const parentEdge = edges.find((e) => e.to === nodeId && e.type === 'parent-child')
  return parentEdge?.from || null
}

/**
 * Get next sibling (same parent, next in list)
 */
function getNextSibling(
  nodes: MindmapNode[],
  edges: NodeEdge[],
  nodeId: string
): string | null {
  const parentId = getParent(edges, nodeId)
  if (!parentId) return null

  const siblings = edges
    .filter((e) => e.from === parentId && e.type === 'parent-child')
    .map((e) => e.to)

  const currentIndex = siblings.indexOf(nodeId)
  if (currentIndex === -1 || currentIndex === siblings.length - 1) return null

  return siblings[currentIndex + 1]
}

/**
 * Get previous sibling (same parent, previous in list)
 */
function getPreviousSibling(
  nodes: MindmapNode[],
  edges: NodeEdge[],
  nodeId: string
): string | null {
  const parentId = getParent(edges, nodeId)
  if (!parentId) return null

  const siblings = edges
    .filter((e) => e.from === parentId && e.type === 'parent-child')
    .map((e) => e.to)

  const currentIndex = siblings.indexOf(nodeId)
  if (currentIndex <= 0) return null

  return siblings[currentIndex - 1]
}

