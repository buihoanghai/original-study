import { describe, it, expect } from 'vitest'
import type { Flashcard, SRSMetadata } from '../learning'

describe('Learning Types', () => {
  describe('Flashcard', () => {
    it('should have required fields', () => {
      const mockFlashcard: Flashcard = {
        id: 'flashcard-123',
        nodeId: 'node-456',
        question: 'What is TypeScript?',
        answer: 'A typed superset of JavaScript',
      }

      expect(mockFlashcard.id).toBeDefined()
      expect(mockFlashcard.nodeId).toBeDefined()
      expect(mockFlashcard.question).toBeDefined()
      expect(mockFlashcard.answer).toBeDefined()
    })

    it('should reference node via nodeId', () => {
      const mockFlashcard: Flashcard = {
        id: 'fc-1',
        nodeId: 'stable-node-id-789',
        question: 'Test question',
        answer: 'Test answer',
      }

      expect(mockFlashcard.nodeId).toBeDefined()
      expect(typeof mockFlashcard.nodeId).toBe('string')
    })

    it('nodeId reference should be stable (string type)', () => {
      // The nodeId is a stable reference to a MindmapNode
      // It should be a string that never changes
      const flashcard: Flashcard = {
        id: 'fc-2',
        nodeId: 'immutable-node-reference',
        question: 'Q',
        answer: 'A',
      }

      const nodeIdReference = flashcard.nodeId
      expect(typeof nodeIdReference).toBe('string')
      expect(nodeIdReference).toBe('immutable-node-reference')
    })
  })

  describe('SRSMetadata', () => {
    it('should have spaced repetition fields', () => {
      const mockSRS: SRSMetadata = {
        interval: 7,
        ease: 2.5,
        nextReview: new Date('2024-02-01'),
      }

      expect(mockSRS.interval).toBeDefined()
      expect(mockSRS.ease).toBeDefined()
      expect(mockSRS.nextReview).toBeDefined()
    })

    it('interval should be number', () => {
      const mockSRS: SRSMetadata = {
        interval: 14,
        ease: 2.3,
        nextReview: new Date(),
      }

      expect(typeof mockSRS.interval).toBe('number')
      expect(mockSRS.interval).toBeGreaterThanOrEqual(0)
    })

    it('nextReview should be Date', () => {
      const reviewDate = new Date('2024-03-15')
      const mockSRS: SRSMetadata = {
        interval: 30,
        ease: 2.8,
        nextReview: reviewDate,
      }

      expect(mockSRS.nextReview).toBeInstanceOf(Date)
      expect(mockSRS.nextReview).toBe(reviewDate)
    })

    it('ease factor should be number', () => {
      const mockSRS: SRSMetadata = {
        interval: 1,
        ease: 2.5,
        nextReview: new Date(),
      }

      expect(typeof mockSRS.ease).toBe('number')
      expect(mockSRS.ease).toBeGreaterThan(0)
    })
  })
})
