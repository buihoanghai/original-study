import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from '../page'
import * as api from '@/lib/api'

/**
 * Home Page Tests
 *
 * Tests the home page rendering with mindmap list and error states.
 */

vi.mock('@/lib/api')
vi.mock('@/components/MindmapList', () => ({
  MindmapList: ({ mindmaps }: { mindmaps: any[] }) => (
    <div data-testid="mindmap-list">
      {mindmaps.length} mindmaps
    </div>
  ),
}))

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render page title and description', async () => {
    vi.mocked(api.getMindmaps).mockResolvedValue({
      success: true,
      data: [],
    })

    const page = await Home()
    render(page)

    expect(screen.getByText('My Mindmaps')).toBeInTheDocument()
    expect(screen.getByText('Organize knowledge, learn deeply, recall effectively')).toBeInTheDocument()
  })

  it('should render MindmapList when API call succeeds', async () => {
    const mockMindmaps = [
      {
        id: '1',
        metadata: {
          title: 'Test Mindmap 1',
          description: 'Description 1',
          created: new Date(),
          updated: new Date(),
        },
        status: 'published' as const,
      },
      {
        id: '2',
        metadata: {
          title: 'Test Mindmap 2',
          description: 'Description 2',
          created: new Date(),
          updated: new Date(),
        },
        status: 'draft' as const,
      },
    ]

    vi.mocked(api.getMindmaps).mockResolvedValue({
      success: true,
      data: mockMindmaps,
    })

    const page = await Home()
    render(page)

    expect(screen.getByTestId('mindmap-list')).toBeInTheDocument()
    expect(screen.getByText('2 mindmaps')).toBeInTheDocument()
  })

  it('should render empty list when no mindmaps', async () => {
    vi.mocked(api.getMindmaps).mockResolvedValue({
      success: true,
      data: [],
    })

    const page = await Home()
    render(page)

    expect(screen.getByTestId('mindmap-list')).toBeInTheDocument()
    expect(screen.getByText('0 mindmaps')).toBeInTheDocument()
  })

  it('should render error message when API call fails', async () => {
    vi.mocked(api.getMindmaps).mockResolvedValue({
      success: false,
      error: 'Failed to fetch mindmaps: Network error',
    })

    const page = await Home()
    render(page)

    expect(screen.getByText('Error Loading Mindmaps')).toBeInTheDocument()
    expect(screen.getByText('Failed to fetch mindmaps: Network error')).toBeInTheDocument()
    expect(screen.queryByTestId('mindmap-list')).not.toBeInTheDocument()
  })

  it('should handle undefined data gracefully', async () => {
    vi.mocked(api.getMindmaps).mockResolvedValue({
      success: true,
      data: undefined,
    })

    const page = await Home()
    render(page)

    expect(screen.getByTestId('mindmap-list')).toBeInTheDocument()
    expect(screen.getByText('0 mindmaps')).toBeInTheDocument()
  })

  it('should have correct CSS classes for styling', async () => {
    vi.mocked(api.getMindmaps).mockResolvedValue({
      success: true,
      data: [],
    })

    const page = await Home()
    const { container } = render(page)

    const main = container.querySelector('main')
    expect(main).toHaveClass('mx-auto', 'max-w-7xl', 'px-4', 'py-8')

    const heading = screen.getByText('My Mindmaps')
    expect(heading).toHaveClass('text-3xl', 'font-bold')
  })

  it('should render error with correct styling', async () => {
    vi.mocked(api.getMindmaps).mockResolvedValue({
      success: false,
      error: 'Test error',
    })

    const page = await Home()
    const { container } = render(page)

    const errorContainer = container.querySelector('.border-red-200')
    expect(errorContainer).toBeInTheDocument()
    expect(errorContainer).toHaveClass('rounded-lg', 'bg-red-50', 'p-6')
  })
})

