import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { ReactFlow, Background, Controls, MiniMap, Node, Edge, NodeChange } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useEditorStore } from '../store/editorStore'
import { MindmapNode as DomainNode } from '@mindmap/domain'
import { NodeComponent, NodeData } from './NodeComponent'
import { StickyNoteComponent } from './StickyNoteComponent'
import { CurvedEdge } from './CurvedEdge'
import { LayoutControls } from './LayoutControls'
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
    updateNodePosition,
    saveHistory,
    triggerSave,
  } = useEditorStore()

  // Debounced auto-save for position changes
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Get all descendants of collapsed nodes (these should be hidden)
  const getDescendantIds = (nodeId: string): string[] => {
    const children = domainEdges
      .filter((e) => e.from === nodeId && e.type === 'parent-child')
      .map((e) => e.to)

    const descendants: string[] = []
    for (const childId of children) {
      descendants.push(childId)
      descendants.push(...getDescendantIds(childId))
    }

    return descendants
  }

  // Build set of hidden node IDs (descendants of collapsed nodes)
  const hiddenNodeIds = new Set<string>()
  ui.collapsedNodeIds.forEach((collapsedId) => {
    const descendants = getDescendantIds(collapsedId)
    descendants.forEach((id) => hiddenNodeIds.add(id))
  })

  // Filter nodes: apply focused view filter AND hide descendants of collapsed nodes
  let filteredNodes = visibleNodeIds
    ? domainNodes.filter((n) => visibleNodeIds.has(n.nodeId))
    : domainNodes

  // Remove hidden nodes (descendants of collapsed nodes)
  filteredNodes = filteredNodes.filter((n) => !hiddenNodeIds.has(n.nodeId))

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

  // Filter edges to only show edges between visible nodes (not hidden by collapse or focus)
  let filteredEdges = visibleNodeIds
    ? domainEdges.filter((e) => visibleNodeIds.has(e.from) && visibleNodeIds.has(e.to))
    : domainEdges

  // Also filter out edges connected to hidden nodes (descendants of collapsed nodes)
  filteredEdges = filteredEdges.filter(
    (e) => !hiddenNodeIds.has(e.from) && !hiddenNodeIds.has(e.to)
  )

  // Convert domain edges to React Flow edges with correct handle positions
  const reactFlowEdges: Edge[] = filteredEdges.map((edge, index) => {
    // Find source and target nodes to determine relative positions
    const sourceNode = domainNodes.find((n) => n.nodeId === edge.from)
    const targetNode = domainNodes.find((n) => n.nodeId === edge.to)

    // Determine handle positions based on relative X positions
    let sourceHandle = 'right'
    let targetHandle = 'left'

    if (sourceNode && targetNode) {
      const sourceX = sourceNode.position?.x ?? 0
      const targetX = targetNode.position?.x ?? 0

      // If target is to the left of source, flip the handles
      if (targetX < sourceX) {
        sourceHandle = 'left'
        targetHandle = 'right'
      }
    }

    return {
      id: `${edge.from}-${edge.to}-${index}`,
      source: edge.from,
      target: edge.to,
      sourceHandle,
      targetHandle,
      type: edge.type === 'reference' ? 'straight' : 'curved', // Use custom curved edges
      hidden: edge.type === 'reference', // Hide reference edges by default
    }
  })

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

  // Handle node changes (drag & drop)
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      changes.forEach((change) => {
        // Only handle position changes when drag ends
        if (change.type === 'position' && change.position && !change.dragging) {
          console.log('[MindmapEditor] Node position changed:', change.id, change.position)
          updateNodePosition(change.id, change.position)
          saveHistory() // Save to history for undo/redo

          // Auto-save position changes after 2 seconds of inactivity
          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
          }
          saveTimeoutRef.current = setTimeout(() => {
            console.log('[MindmapEditor] Auto-saving position changes...')
            triggerSave()
          }, 2000)
        }
      })
    },
    [updateNodePosition, saveHistory, triggerSave]
  )

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  // Custom node types
  const nodeTypes = useMemo(
    () => ({
      mindmapNode: NodeComponent,
      stickyNote: StickyNoteComponent,
    }),
    []
  )

  // Custom edge types
  const edgeTypes = useMemo(
    () => ({
      curved: CurvedEdge,
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
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodesChange={onNodesChange}
        onPaneClick={onPaneClick}
        onMove={onMove}
        nodesDraggable={true}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'curved',
        }}
      >
        <Background />
        <Controls />
        <MiniMap />
        <LayoutControls />
      </ReactFlow>
    </div>
  )
}

