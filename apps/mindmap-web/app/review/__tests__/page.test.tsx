import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ReviewPage from '../page'
import * as flashcardApi from '@/lib/flashcard-api'
import type { Flashcard } from '@mindmap/domain'

/**
 * Review Page Tests
 *
 * Tests the flashcard review page with loading, error, and review states.
 */

vi.mock('@/lib/flashcard-api')
vi.mock('@mindmap/flashcard', () => ({
  getReviewStats: (flashcards: Flashcard[]) => ({
    total: flashcards.length,
    dueToday: flashcards.filter((f) => f.srs && new Date(f.srs.nextReview) <= new Date()).length,
    learning: flashcards.filter((f) => f.srs && f.srs.interval < 21).length,
    mature: flashcards.filter((f) => f.srs && f.srs.interval >= 21).length,
  }),
}))

vi.mock('@/components/FlashcardReview', () => ({
  FlashcardReview: ({ flashcard, onReview, onSkip }: any) => (
    <div data-testid="flashcard-review">
      <div data-testid="flashcard-question">{flashcard.question}</div>
      <button onClick={() => onReview(3)}>Rate Good</button>
      <button onClick={onSkip}>Skip</button>
    </div>
  ),
}))

vi.mock('@/components/FlashcardStats', () => ({
  FlashcardStats: ({ flashcards }: { flashcards: Flashcard[] }) => (
    <div data-testid="flashcard-stats">{flashcards.length} total flashcards</div>
  ),
}))

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/review',
  useSearchParams: () => new URLSearchParams(),
}))

describe('Review Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createMockFlashcard = (id: string, question: string, nextReview: Date): Flashcard => ({
    id,
    nodeId: 'node-1',
    question,
    answer: 'Answer',
    srs: {
      interval: 1,
      repetitions: 0,
      easeFactor: 2.5,
      nextReview,
    },
  })

  it('should show loading state initially', () => {
    vi.mocked(flashcardApi.getAllFlashcards).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )
    vi.mocked(flashcardApi.getDueFlashcards).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    render(<ReviewPage />)

    expect(screen.getByText('Loading flashcards...')).toBeInTheDocument()
  })

  it('should show error state when loading fails', async () => {
    vi.mocked(flashcardApi.getAllFlashcards).mockResolvedValue({
      success: false,
      error: 'Failed to load flashcards',
    })
    vi.mocked(flashcardApi.getDueFlashcards).mockResolvedValue({
      success: true,
      data: [],
    })

    render(<ReviewPage />)

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument()
      expect(screen.getByText('Failed to load flashcards')).toBeInTheDocument()
    })

    const goHomeButton = screen.getByRole('button', { name: /Go Home/ })
    expect(goHomeButton).toBeInTheDocument()
  })

  it('should navigate to home when Go Home button is clicked in error state', async () => {
    vi.mocked(flashcardApi.getAllFlashcards).mockResolvedValue({
      success: false,
      error: 'Test error',
    })
    vi.mocked(flashcardApi.getDueFlashcards).mockResolvedValue({
      success: true,
      data: [],
    })

    render(<ReviewPage />)

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument()
    })

    const goHomeButton = screen.getByRole('button', { name: /Go Home/ })
    fireEvent.click(goHomeButton)

    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('should show review complete when no due flashcards', async () => {
    const allFlashcards = [
      createMockFlashcard('1', 'Question 1', new Date(Date.now() + 86400000)), // Tomorrow
      createMockFlashcard('2', 'Question 2', new Date(Date.now() + 86400000)), // Tomorrow
    ]

    vi.mocked(flashcardApi.getAllFlashcards).mockResolvedValue({
      success: true,
      data: allFlashcards,
    })
    vi.mocked(flashcardApi.getDueFlashcards).mockResolvedValue({
      success: true,
      data: [],
    })

    render(<ReviewPage />)

    await waitFor(() => {
      expect(screen.getByText('Review Complete!')).toBeInTheDocument()
      expect(screen.getByText('You reviewed 0 flashcards today')).toBeInTheDocument()
    })

    expect(screen.getByText('No more cards due today. Come back tomorrow! 📚')).toBeInTheDocument()
  })

  it('should show flashcard review interface when there are due flashcards', async () => {
    const dueFlashcards = [
      createMockFlashcard('1', 'Question 1', new Date(Date.now() - 1000)),
      createMockFlashcard('2', 'Question 2', new Date(Date.now() - 1000)),
    ]

    vi.mocked(flashcardApi.getAllFlashcards).mockResolvedValue({
      success: true,
      data: dueFlashcards,
    })
    vi.mocked(flashcardApi.getDueFlashcards).mockResolvedValue({
      success: true,
      data: dueFlashcards,
    })

    render(<ReviewPage />)

    await waitFor(() => {
      expect(screen.getByText('Flashcard Review')).toBeInTheDocument()
    })

    expect(screen.getByTestId('flashcard-review')).toBeInTheDocument()
    expect(screen.getByTestId('flashcard-question')).toHaveTextContent('Question 1')
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
  })

  it('should move to next flashcard after review', async () => {
    const dueFlashcards = [
      createMockFlashcard('1', 'Question 1', new Date(Date.now() - 1000)),
      createMockFlashcard('2', 'Question 2', new Date(Date.now() - 1000)),
    ]

    vi.mocked(flashcardApi.getAllFlashcards).mockResolvedValue({
      success: true,
      data: dueFlashcards,
    })
    vi.mocked(flashcardApi.getDueFlashcards).mockResolvedValue({
      success: true,
      data: dueFlashcards,
    })
    vi.mocked(flashcardApi.reviewFlashcard).mockResolvedValue({
      success: true,
      data: { ...dueFlashcards[0], srs: { ...dueFlashcards[0].srs!, interval: 2 } },
    })

    render(<ReviewPage />)

    await waitFor(() => {
      expect(screen.getByTestId('flashcard-question')).toHaveTextContent('Question 1')
    })

    const rateButton = screen.getByRole('button', { name: /Rate Good/ })
    fireEvent.click(rateButton)

    await waitFor(() => {
      expect(screen.getByTestId('flashcard-question')).toHaveTextContent('Question 2')
    })

    expect(screen.getByText('2 / 2')).toBeInTheDocument()
    expect(screen.getByText(/Reviewed: 1/)).toBeInTheDocument()
  })

  it('should show review complete after last flashcard', async () => {
    const dueFlashcards = [createMockFlashcard('1', 'Question 1', new Date(Date.now() - 1000))]

    vi.mocked(flashcardApi.getAllFlashcards).mockResolvedValue({
      success: true,
      data: dueFlashcards,
    })
    vi.mocked(flashcardApi.getDueFlashcards).mockResolvedValue({
      success: true,
      data: dueFlashcards,
    })
    vi.mocked(flashcardApi.reviewFlashcard).mockResolvedValue({
      success: true,
      data: { ...dueFlashcards[0], srs: { ...dueFlashcards[0].srs!, interval: 2 } },
    })

    render(<ReviewPage />)

    await waitFor(() => {
      expect(screen.getByTestId('flashcard-question')).toHaveTextContent('Question 1')
    })

    const rateButton = screen.getByRole('button', { name: /Rate Good/ })
    fireEvent.click(rateButton)

    await waitFor(() => {
      expect(screen.getByText('Review Complete!')).toBeInTheDocument()
      expect(screen.getByText('You reviewed 1 flashcard today')).toBeInTheDocument()
    })
  })

  it('should handle skip functionality', async () => {
    const dueFlashcards = [
      createMockFlashcard('1', 'Question 1', new Date(Date.now() - 1000)),
      createMockFlashcard('2', 'Question 2', new Date(Date.now() - 1000)),
    ]

    vi.mocked(flashcardApi.getAllFlashcards).mockResolvedValue({
      success: true,
      data: dueFlashcards,
    })
    vi.mocked(flashcardApi.getDueFlashcards).mockResolvedValue({
      success: true,
      data: dueFlashcards,
    })

    render(<ReviewPage />)

    await waitFor(() => {
      expect(screen.getByTestId('flashcard-question')).toHaveTextContent('Question 1')
    })

    const skipButton = screen.getByRole('button', { name: /Skip/ })
    fireEvent.click(skipButton)

    await waitFor(() => {
      expect(screen.getByTestId('flashcard-question')).toHaveTextContent('Question 2')
    })

    expect(flashcardApi.reviewFlashcard).not.toHaveBeenCalled()
    expect(screen.getByText(/Reviewed: 0/)).toBeInTheDocument()
  })

  it('should show error when review fails', async () => {
    const dueFlashcards = [createMockFlashcard('1', 'Question 1', new Date(Date.now() - 1000))]

    vi.mocked(flashcardApi.getAllFlashcards).mockResolvedValue({
      success: true,
      data: dueFlashcards,
    })
    vi.mocked(flashcardApi.getDueFlashcards).mockResolvedValue({
      success: true,
      data: dueFlashcards,
    })
    vi.mocked(flashcardApi.reviewFlashcard).mockResolvedValue({
      success: false,
      error: 'Failed to review flashcard',
    })

    render(<ReviewPage />)

    await waitFor(() => {
      expect(screen.getByTestId('flashcard-question')).toHaveTextContent('Question 1')
    })

    const rateButton = screen.getByRole('button', { name: /Rate Good/ })
    fireEvent.click(rateButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to review flashcard')).toBeInTheDocument()
    })
  })

  it('should navigate to home when exit is clicked', async () => {
    const dueFlashcards = [createMockFlashcard('1', 'Question 1', new Date(Date.now() - 1000))]

    vi.mocked(flashcardApi.getAllFlashcards).mockResolvedValue({
      success: true,
      data: dueFlashcards,
    })
    vi.mocked(flashcardApi.getDueFlashcards).mockResolvedValue({
      success: true,
      data: dueFlashcards,
    })

    render(<ReviewPage />)

    await waitFor(() => {
      expect(screen.getByText('Flashcard Review')).toBeInTheDocument()
    })

    const exitButton = screen.getByRole('button', { name: /Exit/ })
    fireEvent.click(exitButton)

    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('should show progress bar', async () => {
    const dueFlashcards = [
      createMockFlashcard('1', 'Question 1', new Date(Date.now() - 1000)),
      createMockFlashcard('2', 'Question 2', new Date(Date.now() - 1000)),
    ]

    vi.mocked(flashcardApi.getAllFlashcards).mockResolvedValue({
      success: true,
      data: dueFlashcards,
    })
    vi.mocked(flashcardApi.getDueFlashcards).mockResolvedValue({
      success: true,
      data: dueFlashcards,
    })

    render(<ReviewPage />)

    await waitFor(() => {
      expect(screen.getByText('Flashcard Review')).toBeInTheDocument()
    })

    const { container } = render(<ReviewPage />)
    await waitFor(() => {
      const progressBar = container.querySelector('.bg-blue-600')
      expect(progressBar).toBeInTheDocument()
    })
  })
})

