import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EditorWrapper } from '../EditorWrapper'
import { FlashcardPanel } from '../FlashcardPanel'
import type { Flashcard } from '@mindmap/domain'

// Mock @mindmap/editor package
const mockUseEditorStore = vi.fn()
const mockUseSyncMindmap = vi.fn()
const mockMindmapEditor = vi.fn(() => <div data-testid="mindmap-editor">Editor Canvas</div>)

vi.mock('@mindmap/editor', () => ({
  useEditorStore: (selector: any) => mockUseEditorStore(selector),
  useSyncMindmap: () => mockUseSyncMindmap(),
  MindmapEditor: () => mockMindmapEditor(),
}))

// Mock flashcard API
const mockGetFlashcardsByNode = vi.fn()
const mockCreateFlashcard = vi.fn()
const mockUpdateFlashcard = vi.fn()
const mockDeleteFlashcard = vi.fn()

vi.mock('@/lib/flashcard-api', () => ({
  getFlashcardsByNode: (nodeId: string) => mockGetFlashcardsByNode(nodeId),
  createFlashcard: (nodeId: string, question: string, answer: string) =>
    mockCreateFlashcard(nodeId, question, answer),
  updateFlashcard: (id: string, data: any) => mockUpdateFlashcard(id, data),
  deleteFlashcard: (id: string) => mockDeleteFlashcard(id),
}))

// Mock window.confirm
global.confirm = vi.fn(() => true)

describe('Editor Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock implementations
    mockUseEditorStore.mockImplementation((selector) => {
      const state = {
        ui: { selectedNodeId: null },
        setSaveCallback: vi.fn(),
        isSyncing: false,
        lastSyncedAt: null,
        syncError: null,
      }
      // If no selector provided, return entire state (for destructuring)
      if (!selector) {
        return state
      }
      // Otherwise call selector with state
      return selector(state)
    })

    mockUseSyncMindmap.mockReturnValue({
      save: vi.fn(),
      load: vi.fn().mockResolvedValue(undefined),
    })

    mockGetFlashcardsByNode.mockResolvedValue({
      success: true,
      data: [],
    })
  })

  describe('EditorWrapper Component', () => {
    it('should show loading state initially', () => {
      const mockLoad = vi.fn(() => new Promise(() => {})) // Never resolves
      mockUseSyncMindmap.mockReturnValue({
        save: vi.fn(),
        load: mockLoad,
      })

      render(<EditorWrapper mindmapId="test-mindmap-123" />)

      expect(screen.getByText('Loading mindmap...')).toBeInTheDocument()
      expect(mockLoad).toHaveBeenCalledWith('test-mindmap-123')
    })

    it('should load mindmap on mount', async () => {
      const mockLoad = vi.fn().mockResolvedValue(undefined)
      mockUseSyncMindmap.mockReturnValue({
        save: vi.fn(),
        load: mockLoad,
      })

      render(<EditorWrapper mindmapId="test-mindmap-123" />)

      await waitFor(() => {
        expect(mockLoad).toHaveBeenCalledWith('test-mindmap-123')
      })
    })

    it('should render editor after successful load', async () => {
      const mockLoad = vi.fn().mockResolvedValue(undefined)
      mockUseSyncMindmap.mockReturnValue({
        save: vi.fn(),
        load: mockLoad,
      })

      render(<EditorWrapper mindmapId="test-mindmap-123" />)

      await waitFor(() => {
        expect(screen.getByTestId('mindmap-editor')).toBeInTheDocument()
      })
    })

    it('should show error state when load fails', async () => {
      const mockLoad = vi.fn().mockRejectedValue(new Error('Network error'))
      mockUseSyncMindmap.mockReturnValue({
        save: vi.fn(),
        load: mockLoad,
      })

      render(<EditorWrapper mindmapId="test-mindmap-123" />)

      await waitFor(() => {
        expect(screen.getByText('Error Loading Mindmap')).toBeInTheDocument()
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })
    })

    it('should have retry button in error state', async () => {
      const mockLoad = vi.fn().mockRejectedValue(new Error('Failed'))
      mockUseSyncMindmap.mockReturnValue({
        save: vi.fn(),
        load: mockLoad,
      })

      // Mock window.location.reload
      const mockReload = vi.fn()
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true,
      })

      render(<EditorWrapper mindmapId="test-mindmap-123" />)

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument()
      })

      const retryButton = screen.getByText('Retry')
      fireEvent.click(retryButton)

      expect(mockReload).toHaveBeenCalled()
    })

    it('should render flashcard panel toggle button', async () => {
      const mockLoad = vi.fn().mockResolvedValue(undefined)
      mockUseSyncMindmap.mockReturnValue({
        save: vi.fn(),
        load: mockLoad,
      })

      render(<EditorWrapper mindmapId="test-mindmap-123" />)

      await waitFor(() => {
        expect(screen.getByText('📇 Flashcards')).toBeInTheDocument()
      })
    })

    it('should toggle flashcard panel when button clicked', async () => {
      const mockLoad = vi.fn().mockResolvedValue(undefined)
      mockUseSyncMindmap.mockReturnValue({
        save: vi.fn(),
        load: mockLoad,
      })

      render(<EditorWrapper mindmapId="test-mindmap-123" />)

      await waitFor(() => {
        expect(screen.getByText('📇 Flashcards')).toBeInTheDocument()
      })

      const toggleButton = screen.getByText('📇 Flashcards')

      // Panel should not be visible initially
      expect(screen.queryByText('Flashcards')).not.toBeInTheDocument()

      // Click to show panel
      fireEvent.click(toggleButton)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Flashcards/ })).toBeInTheDocument()
      })
    })
  })

  describe('FlashcardPanel Component', () => {
    describe('Visibility', () => {
      it('should not render when isVisible is false', () => {
        render(
          <FlashcardPanel nodeId="node-123" isVisible={false} onClose={vi.fn()} />
        )

        expect(screen.queryByText('Flashcards')).not.toBeInTheDocument()
      })

      it('should render when isVisible is true', () => {
        render(
          <FlashcardPanel nodeId="node-123" isVisible={true} onClose={vi.fn()} />
        )

        expect(screen.getByText(/Flashcards/)).toBeInTheDocument()
      })

      it('should call onClose when close button clicked', () => {
        const mockOnClose = vi.fn()

        render(
          <FlashcardPanel nodeId="node-123" isVisible={true} onClose={mockOnClose} />
        )

        const closeButton = screen.getByLabelText('Close panel')
        fireEvent.click(closeButton)

        expect(mockOnClose).toHaveBeenCalled()
      })
    })

    describe('No Node Selected', () => {
      it('should show message when nodeId is null', () => {
        render(
          <FlashcardPanel nodeId={null} isVisible={true} onClose={vi.fn()} />
        )

        expect(
          screen.getByText('Select a node to manage flashcards')
        ).toBeInTheDocument()
      })

      it('should not load flashcards when nodeId is null', () => {
        render(
          <FlashcardPanel nodeId={null} isVisible={true} onClose={vi.fn()} />
        )

        expect(mockGetFlashcardsByNode).not.toHaveBeenCalled()
      })
    })

    describe('Loading Flashcards', () => {
      it('should load flashcards when nodeId is provided', async () => {
        mockGetFlashcardsByNode.mockResolvedValue({
          success: true,
          data: [],
        })

        render(
          <FlashcardPanel nodeId="node-123" isVisible={true} onClose={vi.fn()} />
        )

        await waitFor(() => {
          expect(mockGetFlashcardsByNode).toHaveBeenCalledWith('node-123')
        })
      })

      it('should show loading state while fetching', () => {
        mockGetFlashcardsByNode.mockReturnValue(new Promise(() => {})) // Never resolves

        render(
          <FlashcardPanel nodeId="node-123" isVisible={true} onClose={vi.fn()} />
        )

        expect(screen.getByText('Loading flashcards...')).toBeInTheDocument()
      })

      it('should show error message when load fails', async () => {
        mockGetFlashcardsByNode.mockResolvedValue({
          success: false,
          error: 'Failed to fetch flashcards',
        })

        render(
          <FlashcardPanel nodeId="node-123" isVisible={true} onClose={vi.fn()} />
        )

        await waitFor(() => {
          expect(screen.getByText('Failed to fetch flashcards')).toBeInTheDocument()
        })
      })
    })

    describe('Empty State', () => {
      it('should show empty state when no flashcards', async () => {
        mockGetFlashcardsByNode.mockResolvedValue({
          success: true,
          data: [],
        })

        render(
          <FlashcardPanel nodeId="node-123" isVisible={true} onClose={vi.fn()} />
        )

        await waitFor(() => {
          expect(
            screen.getByText('No flashcards yet. Create one to start learning!')
          ).toBeInTheDocument()
        })
      })

      it('should show create button in empty state', async () => {
        mockGetFlashcardsByNode.mockResolvedValue({
          success: true,
          data: [],
        })

        render(
          <FlashcardPanel nodeId="node-123" isVisible={true} onClose={vi.fn()} />
        )

        await waitFor(() => {
          expect(screen.getByText('+ Create Flashcard')).toBeInTheDocument()
        })
      })
    })

    describe('Flashcard List', () => {
      const mockFlashcards: Flashcard[] = [
        {
          id: 'fc-1',
          nodeId: 'node-123',
          question: 'What is TypeScript?',
          answer: 'A typed superset of JavaScript',
        },
        {
          id: 'fc-2',
          nodeId: 'node-123',
          question: 'What is React?',
          answer: 'A JavaScript library for building UIs',
        },
      ]

      it('should display flashcard count in header', async () => {
        mockGetFlashcardsByNode.mockResolvedValue({
          success: true,
          data: mockFlashcards,
        })

        render(
          <FlashcardPanel nodeId="node-123" isVisible={true} onClose={vi.fn()} />
        )

        await waitFor(() => {
          expect(screen.getByText('Flashcards (2)')).toBeInTheDocument()
        })
      })

      it('should render all flashcards', async () => {
        mockGetFlashcardsByNode.mockResolvedValue({
          success: true,
          data: mockFlashcards,
        })

        render(
          <FlashcardPanel nodeId="node-123" isVisible={true} onClose={vi.fn()} />
        )

        await waitFor(() => {
          expect(screen.getByText('Q: What is TypeScript?')).toBeInTheDocument()
          expect(screen.getByText('A: A typed superset of JavaScript')).toBeInTheDocument()
          expect(screen.getByText('Q: What is React?')).toBeInTheDocument()
          expect(screen.getByText('A: A JavaScript library for building UIs')).toBeInTheDocument()
        })
      })

      it('should have edit and delete buttons for each flashcard', async () => {
        mockGetFlashcardsByNode.mockResolvedValue({
          success: true,
          data: mockFlashcards,
        })

        render(
          <FlashcardPanel nodeId="node-123" isVisible={true} onClose={vi.fn()} />
        )

        await waitFor(() => {
          const editButtons = screen.getAllByText('Edit')
          const deleteButtons = screen.getAllByText('Delete')

          expect(editButtons).toHaveLength(2)
          expect(deleteButtons).toHaveLength(2)
        })
      })
    })

    describe('Create Flashcard', () => {
      it('should show create form when create button clicked', async () => {
        mockGetFlashcardsByNode.mockResolvedValue({
          success: true,
          data: [],
        })

        render(
          <FlashcardPanel nodeId="node-123" isVisible={true} onClose={vi.fn()} />
        )

        await waitFor(() => {
          expect(screen.getByText('+ Create Flashcard')).toBeInTheDocument()
        })

        const createButton = screen.getByText('+ Create Flashcard')
        fireEvent.click(createButton)

        await waitFor(() => {
          expect(screen.getByLabelText(/question/i)).toBeInTheDocument()
          expect(screen.getByLabelText(/answer/i)).toBeInTheDocument()
        })
      })

      it('should create flashcard and update list', async () => {
        mockGetFlashcardsByNode.mockResolvedValue({
          success: true,
          data: [],
        })

        const newFlashcard: Flashcard = {
          id: 'fc-new',
          nodeId: 'node-123',
          question: 'New question?',
          answer: 'New answer',
        }

        mockCreateFlashcard.mockResolvedValue({
          success: true,
          data: newFlashcard,
        })

        render(
          <FlashcardPanel nodeId="node-123" isVisible={true} onClose={vi.fn()} />
        )

        await waitFor(() => {
          expect(screen.getByText('+ Create Flashcard')).toBeInTheDocument()
        })

        const createButton = screen.getByText('+ Create Flashcard')
        fireEvent.click(createButton)

        await waitFor(() => {
          expect(screen.getByLabelText(/question/i)).toBeInTheDocument()
        })

        const questionInput = screen.getByLabelText(/question/i)
        const answerInput = screen.getByLabelText(/answer/i)
        const submitButton = screen.getByRole('button', { name: /create flashcard/i })

        fireEvent.change(questionInput, { target: { value: 'New question?' } })
        fireEvent.change(answerInput, { target: { value: 'New answer' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
          expect(mockCreateFlashcard).toHaveBeenCalledWith(
            'node-123',
            'New question?',
            'New answer'
          )
        })
      })
    })

    describe('Delete Flashcard', () => {
      const mockFlashcards: Flashcard[] = [
        {
          id: 'fc-1',
          nodeId: 'node-123',
          question: 'What is TypeScript?',
          answer: 'A typed superset of JavaScript',
        },
      ]

      it('should delete flashcard when delete button clicked', async () => {
        mockGetFlashcardsByNode.mockResolvedValue({
          success: true,
          data: mockFlashcards,
        })

        mockDeleteFlashcard.mockResolvedValue({
          success: true,
        })

        render(
          <FlashcardPanel nodeId="node-123" isVisible={true} onClose={vi.fn()} />
        )

        await waitFor(() => {
          expect(screen.getByText('Q: What is TypeScript?')).toBeInTheDocument()
        })

        const deleteButton = screen.getByText('Delete')
        fireEvent.click(deleteButton)

        await waitFor(() => {
          expect(mockDeleteFlashcard).toHaveBeenCalledWith('fc-1')
        })
      })

      it('should show confirmation dialog before deleting', async () => {
        mockGetFlashcardsByNode.mockResolvedValue({
          success: true,
          data: mockFlashcards,
        })

        const mockConfirm = vi.fn(() => false)
        global.confirm = mockConfirm

        render(
          <FlashcardPanel nodeId="node-123" isVisible={true} onClose={vi.fn()} />
        )

        await waitFor(() => {
          expect(screen.getByText('Delete')).toBeInTheDocument()
        })

        const deleteButton = screen.getByText('Delete')
        fireEvent.click(deleteButton)

        expect(mockConfirm).toHaveBeenCalledWith(
          'Are you sure you want to delete this flashcard?'
        )
        expect(mockDeleteFlashcard).not.toHaveBeenCalled()
      })
    })
  })

  describe('EditorWrapper + FlashcardPanel Integration', () => {
    it('should pass selected node to flashcard panel', async () => {
      const mockLoad = vi.fn().mockResolvedValue(undefined)
      mockUseSyncMindmap.mockReturnValue({
        save: vi.fn(),
        load: mockLoad,
      })

      // Mock selected node
      mockUseEditorStore.mockImplementation((selector) => {
        const state = {
          ui: { selectedNodeId: 'node-selected-123' },
          setSaveCallback: vi.fn(),
          isSyncing: false,
          lastSyncedAt: null,
          syncError: null,
        }
        // If no selector provided, return entire state
        if (!selector) {
          return state
        }
        return selector(state)
      })

      mockGetFlashcardsByNode.mockResolvedValue({
        success: true,
        data: [],
      })

      render(<EditorWrapper mindmapId="test-mindmap-123" />)

      await waitFor(() => {
        expect(screen.getByText('📇 Flashcards')).toBeInTheDocument()
      })

      const toggleButton = screen.getByText('📇 Flashcards')
      fireEvent.click(toggleButton)

      await waitFor(() => {
        expect(mockGetFlashcardsByNode).toHaveBeenCalledWith('node-selected-123')
      })
    })

    it('should update flashcard panel when selected node changes', async () => {
      const mockLoad = vi.fn().mockResolvedValue(undefined)
      mockUseSyncMindmap.mockReturnValue({
        save: vi.fn(),
        load: mockLoad,
      })

      let selectedNodeId = 'node-1'

      mockUseEditorStore.mockImplementation((selector) => {
        const state = {
          ui: { selectedNodeId },
          setSaveCallback: vi.fn(),
          isSyncing: false,
          lastSyncedAt: null,
          syncError: null,
        }
        // If no selector provided, return entire state
        if (!selector) {
          return state
        }
        return selector(state)
      })

      mockGetFlashcardsByNode.mockResolvedValue({
        success: true,
        data: [],
      })

      const { rerender } = render(<EditorWrapper mindmapId="test-mindmap-123" />)

      await waitFor(() => {
        expect(screen.getByText('📇 Flashcards')).toBeInTheDocument()
      })

      const toggleButton = screen.getByText('📇 Flashcards')
      fireEvent.click(toggleButton)

      await waitFor(() => {
        expect(mockGetFlashcardsByNode).toHaveBeenCalledWith('node-1')
      })

      // Change selected node
      selectedNodeId = 'node-2'
      mockUseEditorStore.mockImplementation((selector) => {
        const state = {
          ui: { selectedNodeId },
          setSaveCallback: vi.fn(),
          isSyncing: false,
          lastSyncedAt: null,
          syncError: null,
        }
        // If no selector provided, return entire state
        if (!selector) {
          return state
        }
        return selector(state)
      })

      rerender(<EditorWrapper mindmapId="test-mindmap-123" />)

      await waitFor(() => {
        expect(mockGetFlashcardsByNode).toHaveBeenCalledWith('node-2')
      })
    })
  })
})
