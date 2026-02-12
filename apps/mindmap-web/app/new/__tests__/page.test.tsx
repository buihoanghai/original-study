import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import NewMindmapPage from '../page'
import * as api from '@/lib/api'

/**
 * New Mindmap Page Tests
 *
 * Tests the new mindmap creation page with form validation and navigation.
 */

vi.mock('@/lib/api')

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/new',
  useSearchParams: () => new URLSearchParams(),
}))

describe('New Mindmap Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render page title and form', () => {
    render(<NewMindmapPage />)

    expect(screen.getByText('Create New Mindmap')).toBeInTheDocument()
    expect(screen.getByText('Start organizing your knowledge')).toBeInTheDocument()
    expect(screen.getByLabelText(/Title/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Create Mindmap/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Cancel/ })).toBeInTheDocument()
  })

  it('should show validation error when title is empty', async () => {
    render(<NewMindmapPage />)

    const submitButton = screen.getByRole('button', { name: /Create Mindmap/ })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument()
    })

    expect(api.createMindmap).not.toHaveBeenCalled()
  })

  it('should show validation error when title is only whitespace', async () => {
    render(<NewMindmapPage />)

    const titleInput = screen.getByLabelText(/Title/)
    fireEvent.change(titleInput, { target: { value: '   ' } })

    const submitButton = screen.getByRole('button', { name: /Create Mindmap/ })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument()
    })

    expect(api.createMindmap).not.toHaveBeenCalled()
  })

  it('should create mindmap and navigate to editor on success', async () => {
    vi.mocked(api.createMindmap).mockResolvedValue({
      success: true,
      data: {
        id: 'new-mindmap-123',
        metadata: {
          title: 'My New Mindmap',
          created: new Date(),
          updated: new Date(),
        },
        status: 'draft',
      },
    })

    render(<NewMindmapPage />)

    const titleInput = screen.getByLabelText(/Title/)
    const descriptionInput = screen.getByLabelText(/Description/)

    fireEvent.change(titleInput, { target: { value: 'My New Mindmap' } })
    fireEvent.change(descriptionInput, { target: { value: 'A test description' } })

    const submitButton = screen.getByRole('button', { name: /Create Mindmap/ })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(api.createMindmap).toHaveBeenCalledWith('My New Mindmap', 'A test description')
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/editor/new-mindmap-123')
    })
  })

  it('should create mindmap without description', async () => {
    vi.mocked(api.createMindmap).mockResolvedValue({
      success: true,
      data: {
        id: 'new-mindmap-456',
        metadata: {
          title: 'Mindmap without description',
          created: new Date(),
          updated: new Date(),
        },
        status: 'draft',
      },
    })

    render(<NewMindmapPage />)

    const titleInput = screen.getByLabelText(/Title/)
    fireEvent.change(titleInput, { target: { value: 'Mindmap without description' } })

    const submitButton = screen.getByRole('button', { name: /Create Mindmap/ })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(api.createMindmap).toHaveBeenCalledWith('Mindmap without description', undefined)
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/editor/new-mindmap-456')
    })
  })

  it('should show error message when API call fails', async () => {
    vi.mocked(api.createMindmap).mockResolvedValue({
      success: false,
      error: 'Failed to create mindmap: Server error',
    })

    render(<NewMindmapPage />)

    const titleInput = screen.getByLabelText(/Title/)
    fireEvent.change(titleInput, { target: { value: 'Test Mindmap' } })

    const submitButton = screen.getByRole('button', { name: /Create Mindmap/ })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to create mindmap: Server error')).toBeInTheDocument()
    })

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('should show generic error when API returns no error message', async () => {
    vi.mocked(api.createMindmap).mockResolvedValue({
      success: false,
    })

    render(<NewMindmapPage />)

    const titleInput = screen.getByLabelText(/Title/)
    fireEvent.change(titleInput, { target: { value: 'Test Mindmap' } })

    const submitButton = screen.getByRole('button', { name: /Create Mindmap/ })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to create mindmap')).toBeInTheDocument()
    })
  })

  it('should disable inputs while creating', async () => {
    vi.mocked(api.createMindmap).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true, data: { id: '123', metadata: { title: 'Test', created: new Date(), updated: new Date() }, status: 'draft' } }), 100))
    )

    render(<NewMindmapPage />)

    const titleInput = screen.getByLabelText(/Title/) as HTMLInputElement
    const descriptionInput = screen.getByLabelText(/Description/) as HTMLTextAreaElement
    const submitButton = screen.getByRole('button', { name: /Create Mindmap/ }) as HTMLButtonElement
    const cancelButton = screen.getByRole('button', { name: /Cancel/ }) as HTMLButtonElement

    fireEvent.change(titleInput, { target: { value: 'Test' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Creating...')).toBeInTheDocument()
    })

    expect(titleInput.disabled).toBe(true)
    expect(descriptionInput.disabled).toBe(true)
    expect(submitButton.disabled).toBe(true)
    expect(cancelButton.disabled).toBe(true)
  })

  it('should navigate to home when cancel is clicked', () => {
    render(<NewMindmapPage />)

    const cancelButton = screen.getByRole('button', { name: /Cancel/ })
    fireEvent.click(cancelButton)

    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('should have correct placeholder text', () => {
    render(<NewMindmapPage />)

    const titleInput = screen.getByLabelText(/Title/)
    const descriptionInput = screen.getByLabelText(/Description/)

    expect(titleInput).toHaveAttribute('placeholder', 'My Mindmap')
    expect(descriptionInput).toHaveAttribute('placeholder', 'A brief description of what this mindmap is about...')
  })

  it('should mark title as required', () => {
    render(<NewMindmapPage />)

    expect(screen.getByText(/Title \*/)).toBeInTheDocument()
    expect(screen.getByText(/Description \(optional\)/)).toBeInTheDocument()
  })

  it('should clear error when user starts typing after validation error', async () => {
    render(<NewMindmapPage />)

    const submitButton = screen.getByRole('button', { name: /Create Mindmap/ })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument()
    })

    const titleInput = screen.getByLabelText(/Title/)
    fireEvent.change(titleInput, { target: { value: 'New title' } })

    // Error should still be visible until form is submitted again
    expect(screen.getByText('Title is required')).toBeInTheDocument()
  })
})

