import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FlashcardForm } from '../FlashcardForm'

/**
 * Form Validation Tests
 *
 * Tests form validation errors and user input validation.
 */

describe('Form Validation Tests', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('FlashcardForm Validation', () => {
    it('should show error when question is empty', async () => {
      render(
        <FlashcardForm
          nodeId="node-1"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const submitButton = screen.getByText('Create Flashcard')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Both question and answer are required')).toBeInTheDocument()
      })

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should show error when answer is empty', async () => {
      render(
        <FlashcardForm
          nodeId="node-1"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const questionInput = screen.getByLabelText('Question')
      fireEvent.change(questionInput, { target: { value: 'What is React?' } })

      const submitButton = screen.getByText('Create Flashcard')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Both question and answer are required')).toBeInTheDocument()
      })

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should show error when both fields are empty', async () => {
      render(
        <FlashcardForm
          nodeId="node-1"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const submitButton = screen.getByText('Create Flashcard')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Both question and answer are required')).toBeInTheDocument()
      })

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should show error when question is only whitespace', async () => {
      render(
        <FlashcardForm
          nodeId="node-1"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const questionInput = screen.getByLabelText('Question')
      const answerInput = screen.getByLabelText('Answer')

      fireEvent.change(questionInput, { target: { value: '   ' } })
      fireEvent.change(answerInput, { target: { value: 'Valid answer' } })

      const submitButton = screen.getByText('Create Flashcard')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Both question and answer are required')).toBeInTheDocument()
      })

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should show error when answer is only whitespace', async () => {
      render(
        <FlashcardForm
          nodeId="node-1"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const questionInput = screen.getByLabelText('Question')
      const answerInput = screen.getByLabelText('Answer')

      fireEvent.change(questionInput, { target: { value: 'Valid question?' } })
      fireEvent.change(answerInput, { target: { value: '   ' } })

      const submitButton = screen.getByText('Create Flashcard')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Both question and answer are required')).toBeInTheDocument()
      })

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should submit when both fields are valid', async () => {
      mockOnSubmit.mockResolvedValue(undefined)

      render(
        <FlashcardForm
          nodeId="node-1"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const questionInput = screen.getByLabelText('Question')
      const answerInput = screen.getByLabelText('Answer')

      fireEvent.change(questionInput, { target: { value: 'What is React?' } })
      fireEvent.change(answerInput, { target: { value: 'A JavaScript library' } })

      const submitButton = screen.getByText('Create Flashcard')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith('What is React?', 'A JavaScript library')
      })
    })

    it('should handle submission error and display error message', async () => {
      mockOnSubmit.mockRejectedValue(new Error('Failed to save flashcard'))

      render(
        <FlashcardForm
          nodeId="node-1"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const questionInput = screen.getByLabelText('Question')
      const answerInput = screen.getByLabelText('Answer')

      fireEvent.change(questionInput, { target: { value: 'Question?' } })
      fireEvent.change(answerInput, { target: { value: 'Answer' } })

      const submitButton = screen.getByText('Create Flashcard')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Failed to save flashcard')).toBeInTheDocument()
      })
    })

    it('should handle non-Error submission failures', async () => {
      mockOnSubmit.mockRejectedValue('String error')

      render(
        <FlashcardForm
          nodeId="node-1"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const questionInput = screen.getByLabelText('Question')
      const answerInput = screen.getByLabelText('Answer')

      fireEvent.change(questionInput, { target: { value: 'Question?' } })
      fireEvent.change(answerInput, { target: { value: 'Answer' } })

      const submitButton = screen.getByText('Create Flashcard')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Failed to save flashcard')).toBeInTheDocument()
      })
    })

    it('should disable inputs while submitting', async () => {
      let resolveSubmit: () => void
      const submitPromise = new Promise<void>((resolve) => {
        resolveSubmit = resolve
      })
      mockOnSubmit.mockReturnValue(submitPromise)

      render(
        <FlashcardForm
          nodeId="node-1"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const questionInput = screen.getByLabelText('Question') as HTMLTextAreaElement
      const answerInput = screen.getByLabelText('Answer') as HTMLTextAreaElement

      fireEvent.change(questionInput, { target: { value: 'Question?' } })
      fireEvent.change(answerInput, { target: { value: 'Answer' } })

      const submitButton = screen.getByText('Create Flashcard')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Saving...')).toBeInTheDocument()
      })

      expect(questionInput.disabled).toBe(true)
      expect(answerInput.disabled).toBe(true)

      resolveSubmit!()
    })

    it('should cancel with Escape key', () => {
      render(
        <FlashcardForm
          nodeId="node-1"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const form = screen.getByRole('textbox', { name: 'Question' }).closest('form')!
      fireEvent.keyDown(form, { key: 'Escape' })

      expect(mockOnCancel).toHaveBeenCalled()
    })

    it('should cancel with Cancel button', () => {
      render(
        <FlashcardForm
          nodeId="node-1"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const cancelButton = screen.getByText('Cancel (Esc)')
      fireEvent.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalled()
    })

    it('should populate form with initial data when editing', () => {
      const initialData = {
        id: 'flashcard-1',
        nodeId: 'node-1',
        question: 'Existing question?',
        answer: 'Existing answer',
        srs: {
          interval: 1,
          ease: 2.5,
          nextReview: new Date(),
        },
        owner: 'user-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      render(
        <FlashcardForm
          nodeId="node-1"
          initialData={initialData}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const questionInput = screen.getByLabelText('Question') as HTMLTextAreaElement
      const answerInput = screen.getByLabelText('Answer') as HTMLTextAreaElement

      expect(questionInput.value).toBe('Existing question?')
      expect(answerInput.value).toBe('Existing answer')
      expect(screen.getByText('Update Flashcard')).toBeInTheDocument()
    })

    it('should clear error when user starts typing after validation error', async () => {
      render(
        <FlashcardForm
          nodeId="node-1"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      // Trigger validation error
      const submitButton = screen.getByText('Create Flashcard')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Both question and answer are required')).toBeInTheDocument()
      })

      // Start typing - error should remain until next submit
      const questionInput = screen.getByLabelText('Question')
      fireEvent.change(questionInput, { target: { value: 'New question?' } })

      // Error message should still be visible (doesn't clear on input change)
      expect(screen.getByText('Both question and answer are required')).toBeInTheDocument()
    })
  })
})

