import { describe, it, expect } from 'vitest'
import { calculateMastery, shouldAutoComplete } from '../mastery'
import type { Flashcard } from '../../types/learning'
import type { SkillStatus } from '../../types/skill'

describe('Mastery Utilities', () => {
  describe('calculateMastery', () => {
    it('should return 0% for nodes with no flashcards', () => {
      const mastery = calculateMastery([])
      expect(mastery).toBe(0)
    })

    it('should return 100% for default SRS (ease=2.5)', () => {
      const flashcards: Flashcard[] = [
        {
          id: '1',
          nodeId: 'node-1',
          question: 'Q1',
          answer: 'A1',
          srs: { ease: 2.5, interval: 1, nextReview: new Date() },
        },
      ]

      const mastery = calculateMastery(flashcards)
      expect(mastery).toBe(100)
    })

    it('should calculate correct percentage for ease=1.3 (0%)', () => {
      const flashcards: Flashcard[] = [
        {
          id: '1',
          nodeId: 'node-1',
          question: 'Q1',
          answer: 'A1',
          srs: { ease: 1.3, interval: 1, nextReview: new Date() },
        },
      ]

      const mastery = calculateMastery(flashcards)
      expect(mastery).toBe(0)
    })

    it('should calculate correct percentage for ease=1.9 (50%)', () => {
      const flashcards: Flashcard[] = [
        {
          id: '1',
          nodeId: 'node-1',
          question: 'Q1',
          answer: 'A1',
          srs: { ease: 1.9, interval: 1, nextReview: new Date() },
        },
      ]

      const mastery = calculateMastery(flashcards)
      expect(mastery).toBe(50)
    })

    it('should calculate correct percentage for ease=3.0 (clamped to 100%)', () => {
      const flashcards: Flashcard[] = [
        {
          id: '1',
          nodeId: 'node-1',
          question: 'Q1',
          answer: 'A1',
          srs: { ease: 3.0, interval: 15, nextReview: new Date() },
        },
      ]

      const mastery = calculateMastery(flashcards)
      expect(mastery).toBe(100)
    })

    it('should clamp values below 0% to 0%', () => {
      const flashcards: Flashcard[] = [
        {
          id: '1',
          nodeId: 'node-1',
          question: 'Q1',
          answer: 'A1',
          srs: { ease: 1.0, interval: 1, nextReview: new Date() },
        },
      ]

      const mastery = calculateMastery(flashcards)
      expect(mastery).toBe(0)
    })

    it('should clamp values above 100% to 100%', () => {
      const flashcards: Flashcard[] = [
        {
          id: '1',
          nodeId: 'node-1',
          question: 'Q1',
          answer: 'A1',
          srs: { ease: 4.0, interval: 30, nextReview: new Date() },
        },
      ]

      const mastery = calculateMastery(flashcards)
      expect(mastery).toBe(100)
    })

    it('should handle flashcards without SRS metadata', () => {
      const flashcards: Flashcard[] = [
        {
          id: '1',
          nodeId: 'node-1',
          question: 'Q1',
          answer: 'A1',
        },
      ]

      const mastery = calculateMastery(flashcards)
      expect(mastery).toBe(0)
    })

    it('should average ease across multiple flashcards correctly', () => {
      const flashcards: Flashcard[] = [
        {
          id: '1',
          nodeId: 'node-1',
          question: 'Q1',
          answer: 'A1',
          srs: { ease: 3.0, interval: 15, nextReview: new Date() },
        },
        {
          id: '2',
          nodeId: 'node-1',
          question: 'Q2',
          answer: 'A2',
          srs: { ease: 2.8, interval: 10, nextReview: new Date() },
        },
        {
          id: '3',
          nodeId: 'node-1',
          question: 'Q3',
          answer: 'A3',
          srs: { ease: 2.2, interval: 3, nextReview: new Date() },
        },
        {
          id: '4',
          nodeId: 'node-1',
          question: 'Q4',
          answer: 'A4',
          srs: { ease: 1.5, interval: 1, nextReview: new Date() },
        },
      ]

      // Average ease = (3.0 + 2.8 + 2.2 + 1.5) / 4 = 2.375
      // Mastery = (2.375 - 1.3) / (2.5 - 1.3) * 100 = 89.58% → rounds to 90%
      const mastery = calculateMastery(flashcards)
      expect(mastery).toBe(90)
    })

    it('should handle mixed flashcards (some with SRS, some without)', () => {
      const flashcards: Flashcard[] = [
        {
          id: '1',
          nodeId: 'node-1',
          question: 'Q1',
          answer: 'A1',
          srs: { ease: 2.5, interval: 6, nextReview: new Date() },
        },
        {
          id: '2',
          nodeId: 'node-1',
          question: 'Q2',
          answer: 'A2',
          // No SRS metadata
        },
      ]

      // Should only count flashcards with SRS
      const mastery = calculateMastery(flashcards)
      expect(mastery).toBe(100) // Only card 1 with ease 2.5
    })
  })

  describe('shouldAutoComplete', () => {
    it('should return true when mastery >= 80% and status is in-progress', () => {
      const result = shouldAutoComplete('in-progress', 80)
      expect(result).toBe(true)
    })

    it('should return true when mastery > 80% and status is in-progress', () => {
      const result = shouldAutoComplete('in-progress', 85)
      expect(result).toBe(true)
    })

    it('should return false when mastery < 80%', () => {
      const result = shouldAutoComplete('in-progress', 79)
      expect(result).toBe(false)
    })

    it('should return false when status is already completed', () => {
      const result = shouldAutoComplete('completed', 85)
      expect(result).toBe(false)
    })

    it('should return false when status is not-started', () => {
      const result = shouldAutoComplete('not-started', 85)
      expect(result).toBe(false)
    })

    it('should return false when mastery is exactly 80% but status is completed', () => {
      const result = shouldAutoComplete('completed', 80)
      expect(result).toBe(false)
    })
  })
})

