import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FlashcardReview } from '../FlashcardReview'
import type { Flashcard } from '@mindmap/domain'
import { createInitialSRS } from '@mindmap/flashcard'

describe('FlashcardReview', () => {
  const mockOnReview = vi.fn()
  const mockOnSkip = vi.fn()

  const mockFlashcard: Flashcard = {
    id: 'fc-123',
    nodeId: 'node-456',
    question: 'What is TypeScript?',
    answer: 'A typed superset of JavaScript',
    srs: createInitialSRS(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Card Display', () => {
    it('should render question initially', () => {
      render(
        <FlashcardReview
          flashcard={mockFlashcard}
          onReview={mockOnReview}
          onSkip={mockOnSkip}
        />
      )

      expect(screen.getByText('What is TypeScript?')).toBeInTheDocument()
      expect(screen.getByText('A typed superset of JavaScript')).toBeInTheDocument() // Both are in DOM, but answer has opacity-0
      expect(screen.getByText('Press Space to reveal answer')).toBeInTheDocument()
    })

    it('should show hint text before flip', () => {
      render(
        <FlashcardReview
          flashcard={mockFlashcard}
          onReview={mockOnReview}
          onSkip={mockOnSkip}
        />
      )

      expect(screen.getByText('Press Space to reveal answer')).toBeInTheDocument()
    })

    it('should flip card when card is clicked', async () => {
      const { container } = render(
        <FlashcardReview
          flashcard={mockFlashcard}
          onReview={mockOnReview}
          onSkip={mockOnSkip}
        />
      )

      const card = container.querySelector('.cursor-pointer')!
      fireEvent.click(card)

      await waitFor(() => {
        expect(screen.getByText('Rate your recall:')).toBeInTheDocument()
      })
    })

    it('should flip card when Space key is pressed', async () => {
      render(
        <FlashcardReview
          flashcard={mockFlashcard}
          onReview={mockOnReview}
          onSkip={mockOnSkip}
        />
      )

      fireEvent.keyDown(window, { key: ' ' })

      await waitFor(() => {
        expect(screen.getByText('A typed superset of JavaScript')).toBeInTheDocument()
      })
    })
  })

  describe('Rating Buttons', () => {
    it('should not show rating buttons before card is flipped', () => {
      render(
        <FlashcardReview
          flashcard={mockFlashcard}
          onReview={mockOnReview}
          onSkip={mockOnSkip}
        />
      )

      expect(screen.queryByRole('button', { name: /again/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /hard/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /good/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /easy/i })).not.toBeInTheDocument()
    })

    it('should show rating buttons after card is flipped', async () => {
      const { container } = render(
        <FlashcardReview
          flashcard={mockFlashcard}
          onReview={mockOnReview}
          onSkip={mockOnSkip}
        />
      )

      const card = container.querySelector('.cursor-pointer')!
      fireEvent.click(card)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /again.*1/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /hard.*2/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /good.*3/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /easy.*4/i })).toBeInTheDocument()
      })
    })

    it('should call onReview with rating 0 when Again button is clicked', async () => {
      const { container } = render(
        <FlashcardReview
          flashcard={mockFlashcard}
          onReview={mockOnReview}
          onSkip={mockOnSkip}
        />
      )

      // Flip card first
      const card = container.querySelector('.cursor-pointer')!
      fireEvent.click(card)

      await waitFor(() => {
        const againButton = screen.getByRole('button', { name: /again.*1/i })
        fireEvent.click(againButton)
      })

      expect(mockOnReview).toHaveBeenCalledWith(0)
    })

    it('should call onReview with rating 1 when Hard button is clicked', async () => {
      const { container } = render(
        <FlashcardReview
          flashcard={mockFlashcard}
          onReview={mockOnReview}
          onSkip={mockOnSkip}
        />
      )

      const card = container.querySelector('.cursor-pointer')!
      fireEvent.click(card)

      await waitFor(() => {
        const hardButton = screen.getByRole('button', { name: /hard.*2/i })
        fireEvent.click(hardButton)
      })

      expect(mockOnReview).toHaveBeenCalledWith(1)
    })

    it('should call onReview with rating 2 when Good button is clicked', async () => {
      const { container } = render(
        <FlashcardReview
          flashcard={mockFlashcard}
          onReview={mockOnReview}
          onSkip={mockOnSkip}
        />
      )

      const card = container.querySelector('.cursor-pointer')!
      fireEvent.click(card)

      await waitFor(() => {
        const goodButton = screen.getByRole('button', { name: /good.*3/i })
        fireEvent.click(goodButton)
      })

      expect(mockOnReview).toHaveBeenCalledWith(2)
    })

    it('should call onReview with rating 3 when Easy button is clicked', async () => {
      const { container } = render(
        <FlashcardReview
          flashcard={mockFlashcard}
          onReview={mockOnReview}
          onSkip={mockOnSkip}
        />
      )

      const card = container.querySelector('.cursor-pointer')!
      fireEvent.click(card)

      await waitFor(() => {
        const easyButton = screen.getByRole('button', { name: /easy.*4/i })
        fireEvent.click(easyButton)
      })

      expect(mockOnReview).toHaveBeenCalledWith(3)
    })
  })

  describe('Keyboard Shortcuts', () => {
    it('should call onReview with rating 0 when 1 key is pressed after flip', async () => {
      render(
        <FlashcardReview
          flashcard={mockFlashcard}
          onReview={mockOnReview}
          onSkip={mockOnSkip}
        />
      )

      // Flip card first
      fireEvent.keyDown(window, { key: ' ' })

      await waitFor(() => {
        fireEvent.keyDown(window, { key: '1' })
      })

      expect(mockOnReview).toHaveBeenCalledWith(0)
    })
  })
})

