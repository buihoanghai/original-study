import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { MindmapEditor } from '../MindmapEditor'
import { useEditorStore } from '../../store/editorStore'
import type { MindmapNode, NodeEdge } from '@mindmap/domain'

// Mock @xyflow/react
vi.mock('@xyflow/react', () => ({
  ReactFlow: ({ nodes, edges }: { nodes: any[]; edges: any[] }) => (
    <div data-testid="react-flow">
      <div data-testid="node-count">{nodes.length}</div>
      <div data-testid="edge-count">{edges.length}</div>
    </div>
  ),
  Background: () => <div data-testid="background" />,
  Controls: () => <div data-testid="controls" />,
  MiniMap: () => <div data-testid="minimap" />,
}))

describe('MindmapEditor - Node Filtering', () => {
  const mockNodes: MindmapNode[] = [
    {
      nodeId: 'root',
      content: { title: 'Root', nodeType: 'concept' },
      position: { x: 0, y: 0 },
      metadata: { created: new Date(), updated: new Date(), author: 'test-user' },
    },
    {
      nodeId: 'child1',
      content: { title: 'Child 1', nodeType: 'concept' },
      position: { x: 100, y: 100 },
      metadata: { created: new Date(), updated: new Date(), author: 'test-user' },
    },
    {
      nodeId: 'child2',
      content: { title: 'Child 2', nodeType: 'concept' },
      position: { x: 100, y: 200 },
      metadata: { created: new Date(), updated: new Date(), author: 'test-user' },
    },
    {
      nodeId: 'grandchild',
      content: { title: 'Grandchild', nodeType: 'concept' },
      position: { x: 200, y: 100 },
      metadata: { created: new Date(), updated: new Date(), author: 'test-user' },
    },
  ]

  const mockEdges: NodeEdge[] = [
    { from: 'root', to: 'child1', type: 'parent-child' },
    { from: 'root', to: 'child2', type: 'parent-child' },
    { from: 'child1', to: 'grandchild', type: 'parent-child' },
  ]

  beforeEach(() => {
    useEditorStore.getState().reset()
  })

  it('should render all nodes when visibleNodeIds is null', () => {
    // Set up store with all nodes
    useEditorStore.setState({
      nodes: mockNodes,
      edges: mockEdges,
      visibleNodeIds: null,
    })

    const { getByTestId } = render(<MindmapEditor />)

    const nodeCount = getByTestId('node-count')
    expect(nodeCount.textContent).toBe('4') // All 4 nodes visible
  })

  it('should render only visible nodes when visibleNodeIds is set', () => {
    // Set up store with filtered nodes (child1 + root + grandchild)
    const visibleIds = new Set(['root', 'child1', 'grandchild'])
    
    useEditorStore.setState({
      nodes: mockNodes,
      edges: mockEdges,
      visibleNodeIds: visibleIds,
    })

    const { getByTestId } = render(<MindmapEditor />)

    const nodeCount = getByTestId('node-count')
    expect(nodeCount.textContent).toBe('3') // Only 3 nodes visible
  })

  it('should filter edges to only show edges between visible nodes', () => {
    // Set up store with filtered nodes (only root and child1)
    const visibleIds = new Set(['root', 'child1'])
    
    useEditorStore.setState({
      nodes: mockNodes,
      edges: mockEdges,
      visibleNodeIds: visibleIds,
    })

    const { getByTestId } = render(<MindmapEditor />)

    const edgeCount = getByTestId('edge-count')
    // Should only show edge between root and child1 (1 edge)
    // Edges to child2 and grandchild should be filtered out
    expect(edgeCount.textContent).toBe('1')
  })

  it('should show all edges when visibleNodeIds is null', () => {
    useEditorStore.setState({
      nodes: mockNodes,
      edges: mockEdges,
      visibleNodeIds: null,
    })

    const { getByTestId } = render(<MindmapEditor />)

    const edgeCount = getByTestId('edge-count')
    expect(edgeCount.textContent).toBe('3') // All 3 edges visible
  })

  it('should handle empty visibleNodeIds set', () => {
    const visibleIds = new Set<string>()
    
    useEditorStore.setState({
      nodes: mockNodes,
      edges: mockEdges,
      visibleNodeIds: visibleIds,
    })

    const { getByTestId } = render(<MindmapEditor />)

    const nodeCount = getByTestId('node-count')
    const edgeCount = getByTestId('edge-count')
    
    expect(nodeCount.textContent).toBe('0') // No nodes visible
    expect(edgeCount.textContent).toBe('0') // No edges visible
  })
})

