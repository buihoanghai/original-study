import React, { useCallback, useEffect, useMemo } from 'react'
import { ReactFlow, Background, Controls, MiniMap, Node, Edge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useEditorStore } from '../store/editorStore'
import { MindmapNode as DomainNode } from '@mindmap/domain'
import { NodeComponent, NodeData } from './NodeComponent'
import { StickyNoteComponent } from './StickyNoteComponent'
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
    visibleNodeIds,
    selectNode,
    startEditing,
    stopEditing,
    setZoom,
    setCenter,
  } = useEditorStore()

  // Filter nodes if focused view is active
  const filteredNodes = visibleNodeIds
    ? domainNodes.filter((n) => visibleNodeIds.has(n.nodeId))
    : domainNodes

  // Convert domain nodes to React Flow nodes
  const reactFlowNodes: Node<NodeData>[] = filteredNodes.map((node) => ({
    id: node.nodeId,
    type: node.content.nodeType === 'stickyNote' ? 'stickyNote' : 'mindmapNode',
    position: node.position,
    data: {
      node,
      isSelected: ui.selectedNodeId === node.nodeId,
      isEditing: ui.editingNodeId === node.nodeId,
      isCollapsed: ui.collapsedNodeIds.has(node.nodeId),
    },
  }))

  // Filter edges to only show edges between visible nodes
  const filteredEdges = visibleNodeIds
    ? domainEdges.filter((e) => visibleNodeIds.has(e.from) && visibleNodeIds.has(e.to))
    : domainEdges

  // Convert domain edges to React Flow edges
  const reactFlowEdges: Edge[] = filteredEdges.map((edge, index) => ({
    id: `${edge.from}-${edge.to}-${index}`,
    source: edge.from,
    target: edge.to,
    type: edge.type === 'reference' ? 'straight' : 'default', // Use bezier curves for smoother look
    hidden: edge.type === 'reference', // Hide reference edges by default
  }))

  console.log('[MindmapEditor] Rendering with:')
  console.log('[MindmapEditor] - Nodes:', reactFlowNodes.length)
  console.log('[MindmapEditor] - Edges:', reactFlowEdges.length)
  console.log('[MindmapEditor] - Selected node:', ui.selectedNodeId)
  console.log('[MindmapEditor] - Collapsed nodes:', Array.from(ui.collapsedNodeIds))

  // Debug: List all node IDs and titles
  console.log('[MindmapEditor] - All nodes:')
  domainNodes.forEach(node => {
    console.log(`    ${node.nodeId} | ${node.content.title || node.content.text || 'No title'}`)
  })

  // Debug: Find foundation-root node
  const foundationRoot = domainNodes.find(n => n.nodeId === 'foundation-root')
  if (foundationRoot) {
    console.log('[MindmapEditor] ✅ foundation-root found:', foundationRoot.content.title || foundationRoot.content.text)
    const childEdges = domainEdges.filter(e => e.from === foundationRoot.nodeId)
    console.log('[MindmapEditor] - foundation-root has', childEdges.length, 'child edges')
  } else {
    console.log('[MindmapEditor] ❌ foundation-root NOT FOUND in domainNodes!')
  }

  // Debug: Find Variables & Types node
  const variablesNode = domainNodes.find(n => n.nodeId === 'variables-and-types')
  if (variablesNode) {
    console.log('[MindmapEditor] ✅ variables-and-types found:', variablesNode.content.title || variablesNode.content.text)
    const childEdges = domainEdges.filter(e => e.from === variablesNode.nodeId)
    console.log('[MindmapEditor] Variables & Types node:', {
      nodeId: variablesNode.nodeId,
      isCollapsed: ui.collapsedNodeIds.has(variablesNode.nodeId),
      childEdges: childEdges.length,
      children: childEdges.map(e => {
        const child = domainNodes.find(n => n.nodeId === e.to)
        return child?.content.text || 'Unknown'
      })
    })
  }

  // Handle node click
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      console.log('[MindmapEditor] Node clicked:', node.id)
      console.log('[MindmapEditor] Node data:', node.data)
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
      stickyNote: StickyNoteComponent,
    }),
    []
  )

  // Initialize hotkeys
  useHotkeys()

  // Initialize navigation
  useNavigation()

  return (
    <div style={{ width: '100%', height: '100vh' }} data-testid="mindmap-canvas">
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

