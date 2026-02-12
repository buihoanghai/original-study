'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Flashcard } from '@mindmap/domain'
import type { ReviewRating } from '@mindmap/flashcard'
import { getReviewStats } from '@mindmap/flashcard'
import { FlashcardReview } from '@/components/FlashcardReview'
import { FlashcardStats } from '@/components/FlashcardStats'
import { getDueFlashcards, getAllFlashcards, reviewFlashcard } from '@/lib/flashcard-api'

/**
 * Review Page
 *
 * Dedicated page for reviewing flashcards using spaced repetition.
 * Shows due flashcards in a queue and tracks progress.
 *
 * Keyboard shortcuts:
 * - Space: Flip card
 * - 1-4: Rate flashcard
 * - Escape: Exit review
 */
export default function ReviewPage() {
  const router = useRouter()
  const [allFlashcards, setAllFlashcards] = useState<Flashcard[]>([])
  const [dueFlashcards, setDueFlashcards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reviewedCount, setReviewedCount] = useState(0)
  const [isReviewComplete, setIsReviewComplete] = useState(false)

  // Load flashcards on mount
  useEffect(() => {
    async function loadFlashcards() {
      setIsLoading(true)
      setError(null)

      try {
        // Load all flashcards for stats
        const allResult = await getAllFlashcards()
        if (!allResult.success) {
          throw new Error(allResult.error || 'Failed to load flashcards')
        }
        setAllFlashcards(allResult.data || [])

        // Load due flashcards for review
        const dueResult = await getDueFlashcards()
        if (!dueResult.success) {
          throw new Error(dueResult.error || 'Failed to load due flashcards')
        }
        setDueFlashcards(dueResult.data || [])

        if ((dueResult.data || []).length === 0) {
          setIsReviewComplete(true)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    loadFlashcards()
  }, [])

  const handleReview = async (rating: ReviewRating) => {
    const currentFlashcard = dueFlashcards[currentIndex]
    if (!currentFlashcard || !currentFlashcard.srs) return

    try {
      const result = await reviewFlashcard(
        currentFlashcard.id,
        currentFlashcard.srs,
        rating
      )

      if (!result.success) {
        throw new Error(result.error || 'Failed to review flashcard')
      }

      // Update the flashcard in allFlashcards
      setAllFlashcards((prev) =>
        prev.map((f) => (f.id === currentFlashcard.id ? result.data! : f))
      )

      setReviewedCount((prev) => prev + 1)

      // Move to next flashcard
      if (currentIndex < dueFlashcards.length - 1) {
        setCurrentIndex((prev) => prev + 1)
      } else {
        setIsReviewComplete(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to review flashcard')
    }
  }

  const handleSkip = () => {
    if (currentIndex < dueFlashcards.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      setIsReviewComplete(true)
    }
  }

  const handleExit = () => {
    router.push('/')
  }

  // Keyboard shortcut for exit (Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isReviewComplete) {
        e.preventDefault()
        handleExit()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isReviewComplete])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 mx-auto"></div>
          <p className="text-sm text-zinc-600">Loading flashcards...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6">
          <h3 className="text-lg font-semibold text-red-900">Error</h3>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 rounded-md bg-red-900 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  if (isReviewComplete) {
    const stats = getReviewStats(allFlashcards)

    return (
      <div className="min-h-screen bg-zinc-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">
              Review Complete!
            </h1>
            <p className="text-lg text-zinc-600">
              You reviewed {reviewedCount} flashcard{reviewedCount !== 1 ? 's' : ''} today
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">
              Your Progress
            </h2>
            <FlashcardStats flashcards={allFlashcards} />
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={handleExit}
              className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Back to Home (Esc)
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50"
            >
              Review Again
            </button>
          </div>

          {stats.dueToday === 0 && (
            <div className="mt-8 text-center">
              <p className="text-sm text-zinc-500">
                No more cards due today. Come back tomorrow! 📚
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  const currentFlashcard = dueFlashcards[currentIndex]
  const progress = ((currentIndex + 1) / dueFlashcards.length) * 100

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header with progress */}
      <div className="bg-white border-b border-zinc-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-semibold text-zinc-900">
              Flashcard Review
            </h1>
            <button
              onClick={handleExit}
              className="text-sm text-zinc-600 hover:text-zinc-900"
            >
              Exit (Esc)
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-zinc-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-sm font-medium text-zinc-700">
              {currentIndex + 1} / {dueFlashcards.length}
            </div>
          </div>
        </div>
      </div>

      {/* Review interface */}
      <div className="py-8">
        {currentFlashcard && (
          <FlashcardReview
            flashcard={currentFlashcard}
            onReview={handleReview}
            onSkip={handleSkip}
          />
        )}
      </div>

      {/* Stats footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-sm text-zinc-600 text-center">
            Reviewed: {reviewedCount} | Remaining: {dueFlashcards.length - currentIndex - 1}
          </div>
        </div>
      </div>
    </div>
  )
}
