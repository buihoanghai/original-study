import React, { useCallback, useEffect, useMemo } from 'react'
import { ReactFlow, Background, Controls, MiniMap, Node, Edge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useEditorStore } from '../store/editorStore'
import { MindmapNode as DomainNode } from '@mindmap/domain'
import { NodeComponent, NodeData } from './NodeComponent'
import { useHotkeys } from '../hooks/useHotkeys'
import { useNavigation } from '../hooks/useNavigation'

/**
 * MindmapEditor Component
 *
 * Main editor component that renders the mindmap canvas with React Flow.
 * Handles keyboard shortcuts, navigation, and node interactions.
 */
export const MindmapEditor: React.FC = () => {
  const {
    nodes: domainNodes,
    edges: domainEdges,
    ui,
    selectNode,
    startEditing,
    stopEditing,
    setZoom,
    setCenter,
  } = useEditorStore()

  // Convert domain nodes to React Flow nodes
  const reactFlowNodes: Node<NodeData>[] = domainNodes.map((node) => ({
    id: node.nodeId,
    type: 'mindmapNode',
    position: node.position,
    data: {
      node,
      isSelected: ui.selectedNodeId === node.nodeId,
      isEditing: ui.editingNodeId === node.nodeId,
      isCollapsed: ui.collapsedNodeIds.has(node.nodeId),
    },
  }))

  // Convert domain edges to React Flow edges
  const reactFlowEdges: Edge[] = domainEdges.map((edge, index) => ({
    id: `${edge.from}-${edge.to}-${index}`,
    source: edge.from,
    target: edge.to,
    type: edge.type === 'reference' ? 'straight' : 'smoothstep',
    hidden: edge.type === 'reference', // Hide reference edges by default
  }))

  // Handle node click
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      selectNode(node.id)
    },
    [selectNode]
  )

  // Handle node double click (start editing)
  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      startEditing(node.id)
    },
    [startEditing]
  )

  // Handle canvas click (deselect)
  const onPaneClick = useCallback(() => {
    if (ui.editingNodeId) {
      stopEditing()
    } else {
      selectNode(null)
    }
  }, [ui.editingNodeId, selectNode, stopEditing])

  // Handle zoom change
  const onMove = useCallback(
    (_event: any, viewport: { x: number; y: number; zoom: number }) => {
      setZoom(viewport.zoom)
      setCenter(viewport.x, viewport.y)
    },
    [setZoom, setCenter]
  )

  // Custom node types
  const nodeTypes = useMemo(
    () => ({
      mindmapNode: NodeComponent,
    }),
    []
  )

  // Initialize hotkeys
  useHotkeys()

  // Initialize navigation
  useNavigation()

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onPaneClick={onPaneClick}
        onMove={onMove}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
        }}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}

