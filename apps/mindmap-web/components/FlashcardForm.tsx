'use client'

import { useState } from 'react'
import type { Flashcard } from '@mindmap/domain'

interface FlashcardFormProps {
  nodeId: string
  initialData?: Flashcard
  onSubmit: (question: string, answer: string) => Promise<void>
  onCancel: () => void
}

/**
 * FlashcardForm Component
 *
 * Form for creating or editing flashcards.
 * Keyboard-accessible with Enter to submit, Escape to cancel.
 */
export function FlashcardForm({
  nodeId,
  initialData,
  onSubmit,
  onCancel,
}: FlashcardFormProps) {
  const [question, setQuestion] = useState(initialData?.question || '')
  const [answer, setAnswer] = useState(initialData?.answer || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!question.trim() || !answer.trim()) {
      setError('Both question and answer are required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onSubmit(question, answer)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save flashcard')
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="space-y-4 p-4 border border-zinc-200 rounded-lg bg-white"
    >
      <div>
        <label
          htmlFor="question"
          className="block text-sm font-medium text-zinc-700 mb-1"
        >
          Question
        </label>
        <textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter the question..."
          className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          disabled={isSubmitting}
          autoFocus
        />
      </div>

      <div>
        <label
          htmlFor="answer"
          className="block text-sm font-medium text-zinc-700 mb-1"
        >
          Answer
        </label>
        <textarea
          id="answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter the answer..."
          className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          disabled={isSubmitting}
        />
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50 disabled:opacity-50"
        >
          Cancel (Esc)
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting
            ? 'Saving...'
            : initialData
              ? 'Update Flashcard'
              : 'Create Flashcard'}
        </button>
      </div>
    </form>
  )
}

