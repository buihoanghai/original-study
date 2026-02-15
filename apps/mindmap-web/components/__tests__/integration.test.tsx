import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Header } from '../Header'
import { MindmapList } from '../MindmapList'
import type { Mindmap } from '@mindmap/domain'
import { AuthProvider } from '@/contexts/AuthContext'

// Mock Next.js navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Helper to render with AuthProvider
const renderWithAuth = (component: React.ReactElement) => {
  return render(<AuthProvider>{component}</AuthProvider>)
}

describe('Component Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Header Component', () => {
    it('should render header with branding and navigation', () => {
      renderWithAuth(<Header />)

      expect(screen.getByText('Mindmap Learning')).toBeInTheDocument()
      expect(screen.getByText('My Mindmaps')).toBeInTheDocument()
      expect(screen.getByText('📚 Review')).toBeInTheDocument()
      expect(screen.getByText('New Mindmap')).toBeInTheDocument()
    })

    it('should have correct navigation links', () => {
      renderWithAuth(<Header />)

      const homeLink = screen.getByText('Mindmap Learning').closest('a')
      const mindmapsLink = screen.getByText('My Mindmaps').closest('a')
      const reviewLink = screen.getByText('📚 Review').closest('a')
      const newMindmapLink = screen.getByText('New Mindmap').closest('a')

      expect(homeLink).toHaveAttribute('href', '/')
      expect(mindmapsLink).toHaveAttribute('href', '/')
      expect(reviewLink).toHaveAttribute('href', '/review')
      expect(newMindmapLink).toHaveAttribute('href', '/new')
    })

    it('should show login link when not authenticated', () => {
      renderWithAuth(<Header />)

      expect(screen.getByText('Login')).toBeInTheDocument()
      const loginLink = screen.getByText('Login').closest('a')
      expect(loginLink).toHaveAttribute('href', '/login')
    })

    it('should apply correct CSS classes for styling', () => {
      renderWithAuth(<Header />)

      const header = screen.getByRole('banner')
      expect(header).toHaveClass('border-b', 'border-zinc-200', 'bg-white')
    })

    it('should have responsive navigation (hidden on mobile)', () => {
      renderWithAuth(<Header />)

      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('hidden', 'md:flex')
    })
  })

  describe('MindmapList Component', () => {
    describe('Empty State', () => {
      it('should render empty state when no mindmaps', () => {
        render(<MindmapList mindmaps={[]} />)

        expect(screen.getByText('No mindmaps yet')).toBeInTheDocument()
        expect(
          screen.getByText('Get started by creating your first mindmap.')
        ).toBeInTheDocument()
        expect(screen.getByText('Create Mindmap')).toBeInTheDocument()
      })

      it('should have link to create new mindmap in empty state', () => {
        render(<MindmapList mindmaps={[]} />)

        const createLink = screen.getByText('Create Mindmap').closest('a')
        expect(createLink).toHaveAttribute('href', '/new')
      })
    })

    describe('With Mindmaps', () => {
      const mockMindmaps: Mindmap[] = [
        {
          id: 'mindmap-1',
          metadata: {
            title: 'TypeScript Basics',
            description: 'Learn TypeScript fundamentals',
            created: new Date('2024-01-01'),
            updated: new Date('2024-01-15'),
          },
          status: 'published',
          ownerId: 'user-1',
        },
        {
          id: 'mindmap-2',
          metadata: {
            title: 'React Patterns',
            description: '',
            created: new Date('2024-01-10'),
            updated: new Date('2024-01-20'),
          },
          status: 'draft',
          ownerId: 'user-1',
        },
        {
          id: 'mindmap-3',
          metadata: {
            title: 'Archived Mindmap',
            description: 'Old content',
            created: new Date('2023-12-01'),
            updated: new Date('2023-12-15'),
          },
          status: 'archived',
          ownerId: 'user-1',
        },
      ]

      it('should render all mindmaps in a grid', () => {
        render(<MindmapList mindmaps={mockMindmaps} />)

        expect(screen.getByText('TypeScript Basics')).toBeInTheDocument()
        expect(screen.getByText('React Patterns')).toBeInTheDocument()
        expect(screen.getByText('Archived Mindmap')).toBeInTheDocument()
      })

      it('should display mindmap titles and descriptions', () => {
        render(<MindmapList mindmaps={mockMindmaps} />)

        expect(screen.getByText('TypeScript Basics')).toBeInTheDocument()
        expect(screen.getByText('Learn TypeScript fundamentals')).toBeInTheDocument()
        expect(screen.getByText('React Patterns')).toBeInTheDocument()
        expect(screen.getByText('Old content')).toBeInTheDocument()
      })

      it('should display status badges with correct colors', () => {
        render(<MindmapList mindmaps={mockMindmaps} />)

        const publishedBadge = screen.getByText('published')
        const draftBadge = screen.getByText('draft')
        const archivedBadge = screen.getByText('archived')

        expect(publishedBadge).toHaveClass('bg-green-100', 'text-green-800')
        expect(draftBadge).toHaveClass('bg-yellow-100', 'text-yellow-800')
        expect(archivedBadge).toHaveClass('bg-zinc-100', 'text-zinc-800')
      })

      it('should display formatted update dates', () => {
        render(<MindmapList mindmaps={mockMindmaps} />)

        // Check that dates are formatted (exact format depends on locale)
        const dateElements = screen.getAllByText(/Updated/)
        expect(dateElements.length).toBeGreaterThan(0)
      })

      it('should link each mindmap to its editor page', () => {
        render(<MindmapList mindmaps={mockMindmaps} />)

        const mindmap1Link = screen.getByText('TypeScript Basics').closest('a')
        const mindmap2Link = screen.getByText('React Patterns').closest('a')
        const mindmap3Link = screen.getByText('Archived Mindmap').closest('a')

        expect(mindmap1Link).toHaveAttribute('href', '/editor/mindmap-1')
        expect(mindmap2Link).toHaveAttribute('href', '/editor/mindmap-2')
        expect(mindmap3Link).toHaveAttribute('href', '/editor/mindmap-3')
      })

      it('should apply hover styles to mindmap cards', () => {
        render(<MindmapList mindmaps={mockMindmaps} />)

        const firstCard = screen.getByText('TypeScript Basics').closest('a')
        expect(firstCard).toHaveClass('group', 'hover:border-zinc-300', 'hover:shadow-md')
      })

      it('should use grid layout for responsive display', () => {
        const { container } = render(<MindmapList mindmaps={mockMindmaps} />)

        const grid = container.querySelector('.grid')
        expect(grid).toHaveClass('sm:grid-cols-2', 'lg:grid-cols-3')
      })
    })
  })

  describe('Header + MindmapList Integration', () => {
    it('should navigate from header to new mindmap page', () => {
      const { rerender } = renderWithAuth(
        <div>
          <Header />
          <MindmapList mindmaps={[]} />
        </div>
      )

      // Both header and empty state should have "New Mindmap" / "Create Mindmap" links
      const headerNewLink = screen.getByText('New Mindmap')
      const emptyStateLink = screen.getByText('Create Mindmap')

      expect(headerNewLink.closest('a')).toHaveAttribute('href', '/new')
      expect(emptyStateLink.closest('a')).toHaveAttribute('href', '/new')
    })

    it('should show consistent navigation between header and list', () => {
      const mockMindmaps: Mindmap[] = [
        {
          id: 'mindmap-1',
          metadata: {
            title: 'Test Mindmap',
            description: 'Test',
            created: new Date(),
            updated: new Date(),
          },
          status: 'draft',
          ownerId: 'user-1',
        },
      ]

      renderWithAuth(
        <div>
          <Header />
          <MindmapList mindmaps={mockMindmaps} />
        </div>
      )

      // Header should have "My Mindmaps" link to home
      const myMindmapsLink = screen.getByText('My Mindmaps')
      expect(myMindmapsLink.closest('a')).toHaveAttribute('href', '/')

      // List should have link to editor
      const mindmapLink = screen.getByText('Test Mindmap')
      expect(mindmapLink.closest('a')).toHaveAttribute('href', '/editor/mindmap-1')
    })
  })
})

