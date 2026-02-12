'use client'

import { useState, useEffect } from 'react'
import type { Flashcard } from '@mindmap/domain'
import type { ReviewRating } from '@mindmap/flashcard'

interface FlashcardReviewProps {
  flashcard: Flashcard
  onReview: (rating: ReviewRating) => Promise<void>
  onSkip: () => void
}

/**
 * FlashcardReview Component
 *
 * Interface for reviewing flashcards with spaced repetition.
 * Keyboard shortcuts:
 * - Space: Flip card
 * - 1: Again (rating 0)
 * - 2: Hard (rating 1)
 * - 3: Good (rating 2)
 * - 4: Easy (rating 3)
 * - Escape: Skip
 */
export function FlashcardReview({
  flashcard,
  onReview,
  onSkip,
}: FlashcardReviewProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isReviewing, setIsReviewing] = useState(false)

  // Reset flip state when flashcard changes
  useEffect(() => {
    setIsFlipped(false)
  }, [flashcard.id])

  const handleReview = async (rating: ReviewRating) => {
    if (!isFlipped || isReviewing) return

    setIsReviewing(true)
    try {
      await onReview(rating)
    } catch (error) {
      console.error('Failed to review flashcard:', error)
      setIsReviewing(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isReviewing) return

    switch (e.key) {
      case ' ':
        e.preventDefault()
        setIsFlipped(!isFlipped)
        break
      case '1':
        e.preventDefault()
        handleReview(0)
        break
      case '2':
        e.preventDefault()
        handleReview(1)
        break
      case '3':
        e.preventDefault()
        handleReview(2)
        break
      case '4':
        e.preventDefault()
        handleReview(3)
        break
      case 'Escape':
        e.preventDefault()
        onSkip()
        break
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div
        className="relative h-64 cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`absolute inset-0 flex items-center justify-center p-6 border-2 border-zinc-300 rounded-lg bg-white transition-opacity duration-200 ${
            isFlipped ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="text-center">
            <div className="text-sm text-zinc-500 mb-2">Question</div>
            <div className="text-xl font-medium">{flashcard.question}</div>
          </div>
        </div>

        <div
          className={`absolute inset-0 flex items-center justify-center p-6 border-2 border-blue-500 rounded-lg bg-blue-50 transition-opacity duration-200 ${
            isFlipped ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="text-center">
            <div className="text-sm text-blue-600 mb-2">Answer</div>
            <div className="text-xl font-medium text-blue-900">
              {flashcard.answer}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center text-sm text-zinc-500">
        {!isFlipped ? 'Press Space to reveal answer' : 'Rate your recall:'}
      </div>

      {isFlipped && (
        <div className="mt-6 grid grid-cols-4 gap-3">
          <button
            onClick={() => handleReview(0)}
            disabled={isReviewing}
            className="px-4 py-3 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            Again (1)
          </button>
          <button
            onClick={() => handleReview(1)}
            disabled={isReviewing}
            className="px-4 py-3 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 disabled:opacity-50"
          >
            Hard (2)
          </button>
          <button
            onClick={() => handleReview(2)}
            disabled={isReviewing}
            className="px-4 py-3 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Good (3)
          </button>
          <button
            onClick={() => handleReview(3)}
            disabled={isReviewing}
            className="px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Easy (4)
          </button>
        </div>
      )}
    </div>
  )
}

