import { describe, it, expect } from 'vitest'
import {
  createInitialSRS,
  calculateNextReview,
  isDue,
  getDueFlashcards,
  getDueCount,
  getReviewStats,
  type ReviewRating,
} from '../srs'
import type { SRSMetadata, Flashcard } from '@mindmap/domain'

describe('SRS Algorithm', () => {
  describe('createInitialSRS', () => {
    it('should create initial SRS with correct defaults', () => {
      const srs = createInitialSRS()

      expect(srs.interval).toBe(1)
      expect(srs.ease).toBe(2.5)
      expect(srs.nextReview).toBeInstanceOf(Date)

      // Should be approximately 1 day from now
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
      const diff = Math.abs(srs.nextReview.getTime() - tomorrow.getTime())
      expect(diff).toBeLessThan(1000) // Within 1 second
    })
  })

  describe('calculateNextReview', () => {
    it('should reset interval to 1 for "Again" rating', () => {
      const current: SRSMetadata = {
        interval: 10,
        ease: 2.5,
        nextReview: new Date(),
      }

      const result = calculateNextReview(current, 0)

      expect(result.interval).toBe(1)
      expect(result.ease).toBeLessThan(current.ease)
      expect(result.ease).toBeGreaterThanOrEqual(1.3)
    })

    it('should reset interval to 1 for "Hard" rating', () => {
      const current: SRSMetadata = {
        interval: 10,
        ease: 2.5,
        nextReview: new Date(),
      }

      const result = calculateNextReview(current, 1)

      expect(result.interval).toBe(1)
      expect(result.ease).toBeLessThan(current.ease)
    })

    it('should set interval to 6 for first "Good" review', () => {
      const current: SRSMetadata = {
        interval: 1,
        ease: 2.5,
        nextReview: new Date(),
      }

      const result = calculateNextReview(current, 2)

      expect(result.interval).toBe(6)
      expect(result.ease).toBeGreaterThanOrEqual(1.3)
    })

    it('should multiply interval by ease for subsequent "Good" reviews', () => {
      const current: SRSMetadata = {
        interval: 6,
        ease: 2.5,
        nextReview: new Date(),
      }

      const result = calculateNextReview(current, 2)

      expect(result.interval).toBeGreaterThan(6)
      expect(result.interval).toBeLessThanOrEqual(Math.round(6 * result.ease))
    })

    it('should increase ease for "Easy" rating', () => {
      const current: SRSMetadata = {
        interval: 6,
        ease: 2.5,
        nextReview: new Date(),
      }

      const result = calculateNextReview(current, 3)

      expect(result.ease).toBeGreaterThan(current.ease)
      expect(result.interval).toBeGreaterThan(current.interval)
    })

    it('should never set ease below 1.3', () => {
      const current: SRSMetadata = {
        interval: 10,
        ease: 1.3,
        nextReview: new Date(),
      }

      const result = calculateNextReview(current, 0)

      expect(result.ease).toBeGreaterThanOrEqual(1.3)
    })

    it('should set nextReview to future date', () => {
      const current: SRSMetadata = {
        interval: 1,
        ease: 2.5,
        nextReview: new Date(),
      }

      const result = calculateNextReview(current, 2)

      expect(result.nextReview.getTime()).toBeGreaterThan(Date.now())
    })
  })

  describe('isDue', () => {
    it('should return true if nextReview is in the past', () => {
      const srs: SRSMetadata = {
        interval: 1,
        ease: 2.5,
        nextReview: new Date(Date.now() - 1000),
      }

      expect(isDue(srs)).toBe(true)
    })

    it('should return true if nextReview is now', () => {
      const now = new Date()
      const srs: SRSMetadata = {
        interval: 1,
        ease: 2.5,
        nextReview: now,
      }

      expect(isDue(srs, now)).toBe(true)
    })

    it('should return false if nextReview is in the future', () => {
      const srs: SRSMetadata = {
        interval: 1,
        ease: 2.5,
        nextReview: new Date(Date.now() + 1000),
      }

      expect(isDue(srs)).toBe(false)
    })
  })

  describe('getDueCount', () => {
    it('should count flashcards due today', () => {
      const flashcards: Flashcard[] = [
        {
          id: '1',
          nodeId: 'node1',
          question: 'Q1',
          answer: 'A1',
          srs: {
            interval: 1,
            ease: 2.5,
            nextReview: new Date(Date.now() - 1000),
          },
        },
        {
          id: '2',
          nodeId: 'node2',
          question: 'Q2',
          answer: 'A2',
          srs: {
            interval: 1,
            ease: 2.5,
            nextReview: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          },
        },
      ]

      const count = getDueCount(flashcards, 0)

      expect(count).toBe(1)
    })

    it('should count flashcards due within specified days', () => {
      const flashcards: Flashcard[] = [
        {
          id: '1',
          nodeId: 'node1',
          question: 'Q1',
          answer: 'A1',
          srs: {
            interval: 1,
            ease: 2.5,
            nextReview: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          },
        },
        {
          id: '2',
          nodeId: 'node2',
          question: 'Q2',
          answer: 'A2',
          srs: {
            interval: 1,
            ease: 2.5,
            nextReview: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          },
        },
      ]

      const count = getDueCount(flashcards, 7)

      expect(count).toBe(1)
    })
  })

  describe('getReviewStats', () => {
    it('should calculate correct statistics', () => {
      const flashcards: Flashcard[] = [
        {
          id: '1',
          nodeId: 'node1',
          question: 'Q1',
          answer: 'A1',
          srs: {
            interval: 1,
            ease: 2.5,
            nextReview: new Date(Date.now() - 1000),
          },
        },
        {
          id: '2',
          nodeId: 'node2',
          question: 'Q2',
          answer: 'A2',
          srs: {
            interval: 1,
            ease: 2.5,
            nextReview: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          },
        },
        {
          id: '3',
          nodeId: 'node3',
          question: 'Q3',
          answer: 'A3',
          // No SRS - new card
        },
      ]

      const stats = getReviewStats(flashcards)

      expect(stats.total).toBe(3)
      expect(stats.dueToday).toBe(1)
      expect(stats.dueThisWeek).toBe(2)
      expect(stats.newCards).toBe(1)
    })
  })

  describe('getDueFlashcards', () => {
    it('should return only due flashcards', () => {
      const flashcards: Flashcard[] = [
        {
          id: '1',
          nodeId: 'node1',
          question: 'Q1',
          answer: 'A1',
          srs: {
            interval: 1,
            ease: 2.5,
            nextReview: new Date(Date.now() - 1000),
          },
        },
        {
          id: '2',
          nodeId: 'node2',
          question: 'Q2',
          answer: 'A2',
          srs: {
            interval: 1,
            ease: 2.5,
            nextReview: new Date(Date.now() + 1000),
          },
        },
      ]

      const due = getDueFlashcards(flashcards)

      expect(due).toHaveLength(1)
      expect(due[0].id).toBe('1')
    })
  })
})

