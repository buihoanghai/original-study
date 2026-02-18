import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NodeBreadcrumb } from '../NodeBreadcrumb'
import type { MindmapNode, NodeEdge } from '@mindmap/domain'

// Mock @mindmap/editor package
const mockUseEditorStore = vi.fn()
const mockBuildBreadcrumb = vi.fn()

vi.mock('@mindmap/editor', () => ({
  useEditorStore: (selector?: any) => mockUseEditorStore(selector),
  buildBreadcrumb: (nodes: MindmapNode[], edges: NodeEdge[], nodeId: string) =>
    mockBuildBreadcrumb(nodes, edges, nodeId),
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('NodeBreadcrumb', () => {
  const mockNodes: MindmapNode[] = [
    {
      nodeId: 'root',
      content: { title: 'Root Node', nodeType: 'concept' },
      position: { x: 0, y: 0 },
      metadata: { created: new Date(), updated: new Date(), author: 'test-user' },
    },
    {
      nodeId: 'child',
      content: { title: 'Child Node', nodeType: 'concept' },
      position: { x: 100, y: 100 },
      metadata: { created: new Date(), updated: new Date(), author: 'test-user' },
    },
    {
      nodeId: 'grandchild',
      content: { title: 'Grandchild Node', nodeType: 'concept' },
      position: { x: 200, y: 200 },
      metadata: { created: new Date(), updated: new Date(), author: 'test-user' },
    },
  ]

  const mockEdges: NodeEdge[] = [
    { from: 'root', to: 'child', type: 'parent-child' },
    { from: 'child', to: 'grandchild', type: 'parent-child' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()

    mockUseEditorStore.mockImplementation((selector?: any) => {
      const state = {
        nodes: mockNodes,
        edges: mockEdges,
      }
      if (!selector) {
        return state
      }
      return selector(state)
    })
  })

  it('should render breadcrumb path from root to current node', () => {
    mockBuildBreadcrumb.mockReturnValue([
      { nodeId: 'root', title: 'Root Node' },
      { nodeId: 'child', title: 'Child Node' },
      { nodeId: 'grandchild', title: 'Grandchild Node' },
    ])

    render(<NodeBreadcrumb mindmapId="mindmap-1" currentNodeId="grandchild" />)

    expect(screen.getByText('Root Node')).toBeInTheDocument()
    expect(screen.getByText('Child Node')).toBeInTheDocument()
    expect(screen.getByText('Grandchild Node')).toBeInTheDocument()
  })

  it('should have correct links for each breadcrumb item', () => {
    mockBuildBreadcrumb.mockReturnValue([
      { nodeId: 'root', title: 'Root Node' },
      { nodeId: 'child', title: 'Child Node' },
    ])

    const { container } = render(<NodeBreadcrumb mindmapId="mindmap-1" currentNodeId="child" />)

    const links = container.querySelectorAll('a')
    expect(links).toHaveLength(2)
    expect(links[0].getAttribute('href')).toBe('/editor/mindmap-1/root')
    expect(links[1].getAttribute('href')).toBe('/editor/mindmap-1/child')
  })

  it('should not render when currentNodeId is null', () => {
    const { container } = render(<NodeBreadcrumb mindmapId="mindmap-1" currentNodeId={null} />)

    expect(container.querySelector('nav')).not.toBeInTheDocument()
  })

  it('should render separators between breadcrumb items', () => {
    mockBuildBreadcrumb.mockReturnValue([
      { nodeId: 'root', title: 'Root Node' },
      { nodeId: 'child', title: 'Child Node' },
      { nodeId: 'grandchild', title: 'Grandchild Node' },
    ])

    const { container } = render(<NodeBreadcrumb mindmapId="mindmap-1" currentNodeId="grandchild" />)

    const separators = container.querySelectorAll('span.mx-2')
    expect(separators).toHaveLength(2) // 3 items = 2 separators
  })

  it('should call buildBreadcrumb with correct parameters', () => {
    mockBuildBreadcrumb.mockReturnValue([
      { nodeId: 'child', title: 'Child Node' },
    ])

    render(<NodeBreadcrumb mindmapId="mindmap-1" currentNodeId="child" />)

    expect(mockBuildBreadcrumb).toHaveBeenCalledWith(mockNodes, mockEdges, 'child')
  })
})

