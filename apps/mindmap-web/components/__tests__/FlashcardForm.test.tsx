import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FlashcardForm } from '../FlashcardForm'
import type { Flashcard } from '@mindmap/domain'

describe('FlashcardForm', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()
  const nodeId = 'test-node-123'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Create Mode', () => {
    it('should render empty form in create mode', () => {
      render(
        <FlashcardForm
          nodeId={nodeId}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByLabelText(/question/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/answer/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create flashcard/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('should have empty textarea values', () => {
      render(
        <FlashcardForm
          nodeId={nodeId}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const questionInput = screen.getByLabelText(/question/i) as HTMLTextAreaElement
      const answerInput = screen.getByLabelText(/answer/i) as HTMLTextAreaElement

      expect(questionInput.value).toBe('')
      expect(answerInput.value).toBe('')
    })

    it('should call onSubmit with question and answer when form is submitted', async () => {
      render(
        <FlashcardForm
          nodeId={nodeId}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const questionInput = screen.getByLabelText(/question/i)
      const answerInput = screen.getByLabelText(/answer/i)
      const submitButton = screen.getByRole('button', { name: /create flashcard/i })

      fireEvent.change(questionInput, { target: { value: 'What is TypeScript?' } })
      fireEvent.change(answerInput, { target: { value: 'A typed superset of JavaScript' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          'What is TypeScript?',
          'A typed superset of JavaScript'
        )
      })
    })

    it('should not submit if question is empty', async () => {
      render(
        <FlashcardForm
          nodeId={nodeId}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const answerInput = screen.getByLabelText(/answer/i)
      const submitButton = screen.getByRole('button', { name: /create flashcard/i })

      fireEvent.change(answerInput, { target: { value: 'An answer' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled()
      })
    })

    it('should not submit if answer is empty', async () => {
      render(
        <FlashcardForm
          nodeId={nodeId}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const questionInput = screen.getByLabelText(/question/i)
      const submitButton = screen.getByRole('button', { name: /create flashcard/i })

      fireEvent.change(questionInput, { target: { value: 'A question?' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled()
      })
    })

    it('should call onCancel when cancel button is clicked', () => {
      render(
        <FlashcardForm
          nodeId={nodeId}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalled()
    })

    it('should call onCancel when Escape key is pressed', () => {
      const { container } = render(
        <FlashcardForm
          nodeId={nodeId}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const form = container.querySelector('form')!
      fireEvent.keyDown(form, { key: 'Escape' })

      expect(mockOnCancel).toHaveBeenCalled()
    })
  })

  describe('Edit Mode', () => {
    const initialData: Flashcard = {
      id: 'fc-123',
      nodeId: 'node-456',
      question: 'Original question?',
      answer: 'Original answer',
    }

    it('should render form with initial data in edit mode', () => {
      render(
        <FlashcardForm
          nodeId={nodeId}
          initialData={initialData}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const questionInput = screen.getByLabelText(/question/i) as HTMLTextAreaElement
      const answerInput = screen.getByLabelText(/answer/i) as HTMLTextAreaElement

      expect(questionInput.value).toBe('Original question?')
      expect(answerInput.value).toBe('Original answer')
      expect(screen.getByRole('button', { name: /update flashcard/i })).toBeInTheDocument()
    })
  })
})

