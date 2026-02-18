import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import EditorPage from '../page'

/**
 * Editor Page Tests
 *
 * Tests the editor page rendering with dynamic ID parameter.
 */

// Mock Next.js cookies API
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    toString: () => 'mock-cookie-string',
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    has: vi.fn(),
    getAll: vi.fn(() => []),
  })),
}))

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
}))

// Mock API
vi.mock('@/lib/api', () => ({
  getMindmapBySlug: vi.fn((slug: string) =>
    Promise.resolve({
      success: true,
      data: {
        id: slug,
        metadata: {
          title: 'Test Mindmap',
          slug: slug,
          description: 'Test description',
          created: new Date(),
          updated: new Date(),
        },
        status: 'published',
        ownerId: 'test-user',
      },
    })
  ),
}))

vi.mock('@/components/EditorWrapper', () => ({
  EditorWrapper: ({ mindmapId }: { mindmapId: string }) => (
    <div data-testid="editor-wrapper" data-mindmap-id={mindmapId}>
      Editor for {mindmapId}
    </div>
  ),
}))

describe('Editor Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render EditorWrapper with correct mindmap ID', async () => {
    const mockParams = Promise.resolve({ id: 'test-mindmap-123' })
    const page = await EditorPage({ params: mockParams })
    render(page)

    const editorWrapper = screen.getByTestId('editor-wrapper')
    expect(editorWrapper).toBeInTheDocument()
    expect(editorWrapper).toHaveAttribute('data-mindmap-id', 'test-mindmap-123')
    expect(screen.getByText('Editor for test-mindmap-123')).toBeInTheDocument()
  })

  it('should handle different mindmap IDs', async () => {
    const mockParams = Promise.resolve({ id: 'another-mindmap-456' })
    const page = await EditorPage({ params: mockParams })
    render(page)

    const editorWrapper = screen.getByTestId('editor-wrapper')
    expect(editorWrapper).toHaveAttribute('data-mindmap-id', 'another-mindmap-456')
    expect(screen.getByText('Editor for another-mindmap-456')).toBeInTheDocument()
  })

  it('should have correct container height', async () => {
    const mockParams = Promise.resolve({ id: 'test-id' })
    const page = await EditorPage({ params: mockParams })
    const { container } = render(page)

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('h-[calc(100vh-4rem)]')
  })

  it('should handle UUID format IDs', async () => {
    const mockParams = Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440000' })
    const page = await EditorPage({ params: mockParams })
    render(page)

    const editorWrapper = screen.getByTestId('editor-wrapper')
    expect(editorWrapper).toHaveAttribute('data-mindmap-id', '550e8400-e29b-41d4-a716-446655440000')
  })

  it('should handle numeric IDs', async () => {
    const mockParams = Promise.resolve({ id: '12345' })
    const page = await EditorPage({ params: mockParams })
    render(page)

    const editorWrapper = screen.getByTestId('editor-wrapper')
    expect(editorWrapper).toHaveAttribute('data-mindmap-id', '12345')
  })

  it('should handle IDs with special characters', async () => {
    const mockParams = Promise.resolve({ id: 'mindmap-test_123' })
    const page = await EditorPage({ params: mockParams })
    render(page)

    const editorWrapper = screen.getByTestId('editor-wrapper')
    expect(editorWrapper).toHaveAttribute('data-mindmap-id', 'mindmap-test_123')
  })

  it('should await params before rendering', async () => {
    let resolveParams: (value: { id: string }) => void
    const mockParams = new Promise<{ id: string }>((resolve) => {
      resolveParams = resolve
    })

    const pagePromise = EditorPage({ params: mockParams })

    // Resolve params after a delay
    setTimeout(() => resolveParams!({ id: 'delayed-id' }), 10)

    const page = await pagePromise
    render(page)

    const editorWrapper = screen.getByTestId('editor-wrapper')
    expect(editorWrapper).toHaveAttribute('data-mindmap-id', 'delayed-id')
  })
})

