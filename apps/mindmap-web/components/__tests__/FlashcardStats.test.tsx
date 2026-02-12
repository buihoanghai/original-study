import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FlashcardStats } from '../FlashcardStats'
import type { Flashcard } from '@mindmap/domain'

describe('FlashcardStats', () => {
  const createFlashcard = (id: string, daysUntilReview: number): Flashcard => {
    const nextReview = new Date()
    nextReview.setDate(nextReview.getDate() + daysUntilReview)

    return {
      id,
      nodeId: 'node-123',
      question: `Question ${id}`,
      answer: `Answer ${id}`,
      srs: {
        interval: Math.abs(daysUntilReview),
        ease: 2.5,
        nextReview,
      },
    }
  }

  it('should display total flashcard count', () => {
    const flashcards: Flashcard[] = [
      createFlashcard('1', 0),
      createFlashcard('2', 1),
      createFlashcard('3', 5),
    ]

    render(<FlashcardStats flashcards={flashcards} />)

    expect(screen.getByText('Total Cards')).toBeInTheDocument()
    const threeElements = screen.getAllByText('3')
    expect(threeElements.length).toBeGreaterThan(0) // Total and Due This Week both show 3
  })

  it('should display due today count', () => {
    const flashcards: Flashcard[] = [
      createFlashcard('1', -1), // Past due
      createFlashcard('2', 0), // Due today
      createFlashcard('3', 1), // Due tomorrow
    ]

    render(<FlashcardStats flashcards={flashcards} />)

    expect(screen.getByText('Due Today')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument() // -1 and 0
  })

  it('should display due this week count', () => {
    const flashcards: Flashcard[] = [
      createFlashcard('1', 0), // Due today
      createFlashcard('2', 3), // Due in 3 days
      createFlashcard('3', 6), // Due in 6 days
      createFlashcard('4', 8), // Due in 8 days (not this week)
    ]

    render(<FlashcardStats flashcards={flashcards} />)

    expect(screen.getByText('Due This Week')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument() // 0, 3, 6 days
  })

  it('should display new cards count', () => {
    const flashcards: Flashcard[] = [
      {
        id: '1',
        nodeId: 'node-123',
        question: 'Q1',
        answer: 'A1',
        // No SRS metadata = new card
      },
      {
        id: '2',
        nodeId: 'node-123',
        question: 'Q2',
        answer: 'A2',
        // No SRS metadata = new card
      },
      createFlashcard('3', 1), // Has SRS = not new
    ]

    render(<FlashcardStats flashcards={flashcards} />)

    expect(screen.getByText('New Cards')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('should handle empty flashcard array', () => {
    render(<FlashcardStats flashcards={[]} />)

    expect(screen.getByText('Total Cards')).toBeInTheDocument()
    expect(screen.getAllByText('0').length).toBeGreaterThan(0) // Multiple zeros
    expect(screen.getByText('Due Today')).toBeInTheDocument()
    expect(screen.getByText('Due This Week')).toBeInTheDocument()
    expect(screen.getByText('New Cards')).toBeInTheDocument()
  })

  it('should display all stats in a grid layout', () => {
    const flashcards: Flashcard[] = [
      createFlashcard('1', 0),
      createFlashcard('2', 3),
    ]

    const { container } = render(<FlashcardStats flashcards={flashcards} />)

    // Check that stats are displayed in a grid
    const statsContainer = container.querySelector('.grid')
    expect(statsContainer).toBeInTheDocument()
  })

  it('should show correct stats for mixed flashcards', () => {
    const flashcards: Flashcard[] = [
      // New cards (no SRS)
      { id: '1', nodeId: 'n1', question: 'Q1', answer: 'A1' },
      { id: '2', nodeId: 'n2', question: 'Q2', answer: 'A2' },
      // Due today
      createFlashcard('3', 0),
      createFlashcard('4', -1),
      // Due this week
      createFlashcard('5', 3),
      createFlashcard('6', 6),
      // Due later
      createFlashcard('7', 10),
      createFlashcard('8', 20),
    ]

    render(<FlashcardStats flashcards={flashcards} />)

    // Total: 8
    expect(screen.getByText('8')).toBeInTheDocument()
    // Due Today: 2 (flashcards 3 and 4)
    const twoElements = screen.getAllByText('2')
    expect(twoElements.length).toBe(2) // Due Today and New Cards both show 2
    // Due This Week: 4 (flashcards 3, 4, 5, 6)
    expect(screen.getByText('4')).toBeInTheDocument()
  })
})

