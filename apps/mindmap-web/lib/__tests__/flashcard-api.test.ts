import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getFlashcardsByNode,
  getAllFlashcards,
  getDueFlashcards,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
  reviewFlashcard,
} from '../flashcard-api'
import type { Flashcard, SRSMetadata } from '@mindmap/domain'
import { createInitialSRS } from '@mindmap/flashcard'

// Mock fetch
global.fetch = vi.fn()

describe('Flashcard API', () => {
  const mockCmsUrl = 'http://localhost:3001'
  const mockFlashcard: Flashcard = {
    id: 'fc-123',
    nodeId: 'node-456',
    question: 'What is TypeScript?',
    answer: 'A typed superset of JavaScript',
    srs: createInitialSRS(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Set default CMS URL
    process.env.NEXT_PUBLIC_CMS_URL = mockCmsUrl
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getFlashcardsByNode', () => {
    it('should fetch flashcards for a specific node', async () => {
      const mockResponse = {
        docs: [mockFlashcard],
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await getFlashcardsByNode('node-456')

      expect(result.success).toBe(true)
      expect(result.data).toEqual([mockFlashcard])
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/flashcards'),
        expect.any(Object)
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('where[nodeId][equals]=node-456'),
        expect.any(Object)
      )
    })

    it('should return error on fetch failure', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      })

      const result = await getFlashcardsByNode('node-456')

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should handle network errors', async () => {
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      const result = await getFlashcardsByNode('node-456')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Network error')
    })
  })

  describe('getAllFlashcards', () => {
    it('should fetch all flashcards', async () => {
      const mockFlashcards = [mockFlashcard, { ...mockFlashcard, id: 'fc-456' }]
      const mockResponse = {
        docs: mockFlashcards,
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await getAllFlashcards()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockFlashcards)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/flashcards'),
        expect.any(Object)
      )
    })
  })

  describe('getDueFlashcards', () => {
    it('should fetch flashcards due for review', async () => {
      const mockResponse = {
        docs: [mockFlashcard],
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await getDueFlashcards()

      expect(result.success).toBe(true)
      expect(result.data).toEqual([mockFlashcard])
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('where[srs.nextReview][less_than_equal]'),
        expect.any(Object)
      )
    })
  })

  describe('createFlashcard', () => {
    it('should create a new flashcard with initial SRS', async () => {
      const newFlashcard = {
        ...mockFlashcard,
        id: 'new-fc-123',
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ doc: newFlashcard }),
      })

      const result = await createFlashcard('node-456', 'Question?', 'Answer!')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(newFlashcard)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/flashcards'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining('Question?'),
        })
      )
    })

    it('should include initial SRS metadata in request', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ doc: mockFlashcard }),
      })

      await createFlashcard('node-456', 'Q', 'A')

      const callArgs = (global.fetch as any).mock.calls[0]
      const body = JSON.parse(callArgs[1].body)

      expect(body.srs).toBeDefined()
      expect(body.srs.interval).toBe(1)
      expect(body.srs.ease).toBe(2.5)
      expect(body.srs.nextReview).toBeDefined()
    })
  })

  describe('updateFlashcard', () => {
    it('should update flashcard question and answer', async () => {
      const updatedFlashcard = {
        ...mockFlashcard,
        question: 'Updated question?',
        answer: 'Updated answer',
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ doc: updatedFlashcard }),
      })

      const result = await updateFlashcard('fc-123', {
        question: 'Updated question?',
        answer: 'Updated answer',
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(updatedFlashcard)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/flashcards/fc-123'),
        expect.objectContaining({
          method: 'PATCH',
        })
      )
    })
  })

  describe('deleteFlashcard', () => {
    it('should delete a flashcard', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      const result = await deleteFlashcard('fc-123')

      expect(result.success).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/flashcards/fc-123'),
        expect.objectContaining({
          method: 'DELETE',
        })
      )
    })

    it('should return error on delete failure', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      })

      const result = await deleteFlashcard('fc-123')

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('reviewFlashcard', () => {
    it('should update SRS metadata after review', async () => {
      const currentSRS: SRSMetadata = {
        interval: 1,
        ease: 2.5,
        nextReview: new Date(),
      }

      const updatedFlashcard = {
        ...mockFlashcard,
        srs: {
          interval: 6,
          ease: 2.5,
          nextReview: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        },
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ doc: updatedFlashcard }),
      })

      const result = await reviewFlashcard('fc-123', currentSRS, 2) // Rating: Good

      expect(result.success).toBe(true)
      expect(result.data?.srs?.interval).toBe(6)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/flashcards/fc-123'),
        expect.objectContaining({
          method: 'PATCH',
        })
      )
    })

    it('should calculate correct SRS for rating 0 (Again)', async () => {
      const currentSRS: SRSMetadata = {
        interval: 6,
        ease: 2.5,
        nextReview: new Date(),
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ doc: mockFlashcard }),
      })

      await reviewFlashcard('fc-123', currentSRS, 0)

      const callArgs = (global.fetch as any).mock.calls[0]
      const body = JSON.parse(callArgs[1].body)

      // Rating 0 should reset interval to 1
      expect(body.srs.interval).toBe(1)
      // Ease should decrease
      expect(body.srs.ease).toBeLessThan(2.5)
    })

    it('should calculate correct SRS for rating 3 (Easy)', async () => {
      const currentSRS: SRSMetadata = {
        interval: 1,
        ease: 2.5,
        nextReview: new Date(),
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ doc: mockFlashcard }),
      })

      await reviewFlashcard('fc-123', currentSRS, 3)

      const callArgs = (global.fetch as any).mock.calls[0]
      const body = JSON.parse(callArgs[1].body)

      // Rating 3 on first review should set interval to 6
      expect(body.srs.interval).toBe(6)
      // Ease should increase
      expect(body.srs.ease).toBeGreaterThan(2.5)
    })
  })
})

