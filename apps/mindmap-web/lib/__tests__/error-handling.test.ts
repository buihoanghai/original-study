import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getMindmaps, getMindmap, getMindmapNodes, createMindmap } from '../api'
import {
  getFlashcardsByNode,
  getAllFlashcards,
  getDueFlashcards,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
  reviewFlashcard,
} from '../flashcard-api'

/**
 * Error Handling Tests
 *
 * Tests network timeouts, invalid API responses, and error scenarios.
 */

describe('Error Handling Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  describe('Network Errors', () => {
    it('should handle network timeout for getMindmaps', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockRejectedValue(new Error('Network timeout'))

      const result = await getMindmaps()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network timeout')
    })

    it('should handle network timeout for getMindmap', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockRejectedValue(new Error('Failed to fetch'))

      const result = await getMindmap('test-id')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to fetch')
    })

    it('should handle network timeout for getMindmapNodes', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockRejectedValue(new Error('Connection refused'))

      const result = await getMindmapNodes('test-mindmap-id')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Connection refused')
    })

    it('should handle network timeout for createMindmap', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockRejectedValue(new Error('Request timeout'))

      const result = await createMindmap('Test Mindmap', 'Description')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Request timeout')
    })

    it('should handle network timeout for flashcard operations', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockRejectedValue(new Error('Network error'))

      const result1 = await getFlashcardsByNode('node-1')
      const result2 = await getAllFlashcards()
      const result3 = await getDueFlashcards()

      expect(result1.success).toBe(false)
      expect(result1.error).toBe('Network error')
      expect(result2.success).toBe(false)
      expect(result2.error).toBe('Network error')
      expect(result3.success).toBe(false)
      expect(result3.error).toBe('Network error')
    })
  })

  describe('HTTP Error Responses', () => {
    it('should handle 404 Not Found', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response)

      const result = await getMindmap('non-existent-id')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Not Found')
    })

    it('should handle 500 Internal Server Error', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response)

      const result = await getMindmaps()

      expect(result.success).toBe(false)
      expect(result.error).toContain('Internal Server Error')
    })

    it('should handle 401 Unauthorized', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      } as Response)

      const result = await createMindmap('Test', 'Description')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Unauthorized')
    })

    it('should handle 403 Forbidden', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      } as Response)

      const result = await deleteFlashcard('flashcard-id')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Forbidden')
    })

    it('should handle 400 Bad Request', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      } as Response)

      const result = await createFlashcard('node-1', '', '')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Bad Request')
    })
  })

  describe('Invalid API Responses', () => {
    it('should handle malformed JSON response', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as Response)

      const result = await getMindmaps()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid JSON')
    })

    it('should handle missing docs field in response', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response)

      const result = await getMindmaps()

      expect(result.success).toBe(true)
      expect(result.data).toEqual([])
    })

    it('should handle null response data', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(null),
      } as Response)

      const result = await getMindmaps()

      // When response.json() returns null, accessing null.docs throws an error
      // So the catch block returns success: false
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should handle unexpected error types', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockRejectedValue('String error instead of Error object')

      const result = await getMindmap('test-id')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unknown error')
    })

    it('should handle undefined error', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockRejectedValue(undefined)

      const result = await getAllFlashcards()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unknown error')
    })
  })

  describe('Flashcard API Error Handling', () => {
    it('should handle error when creating flashcard', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockRejectedValue(new Error('Database connection failed'))

      const result = await createFlashcard('node-1', 'Question?', 'Answer')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database connection failed')
    })

    it('should handle error when updating flashcard', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response)

      const result = await updateFlashcard('flashcard-1', {
        question: 'Updated question?',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Internal Server Error')
    })

    it('should handle error when deleting flashcard', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockRejectedValue(new Error('Network error'))

      const result = await deleteFlashcard('flashcard-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })

    it('should handle error when reviewing flashcard', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response)

      const result = await reviewFlashcard(
        'flashcard-1',
        {
          interval: 1,
          ease: 2.5,
          nextReview: new Date(),
        },
        'good'
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('Not Found')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty mindmap ID', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      } as Response)

      const result = await getMindmap('')

      expect(result.success).toBe(false)
    })

    it('should handle empty node ID for flashcards', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ docs: [] }),
      } as Response)

      const result = await getFlashcardsByNode('')

      expect(result.success).toBe(true)
      expect(result.data).toEqual([])
    })

    it('should handle very long mindmap title', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ doc: { id: '1', title: 'A'.repeat(10000) } }),
      } as Response)

      const longTitle = 'A'.repeat(10000)
      const result = await createMindmap(longTitle, 'Description')

      expect(result.success).toBe(true)
    })
  })
})


