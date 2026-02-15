import { describe, it, expect } from 'vitest'
import type { NodeMastery, MasteryLevel } from '../mastery'

describe('NodeMastery type', () => {
  it('should have required fields', () => {
    // Scenario 1.1: Mastery structure
    const mastery: NodeMastery = {
      nodeId: 'node_abc',
      level: 'new',
      confidence: 0,
      totalSessions: 0,
      successRate: 0,
      nextReviewDate: new Date('2026-02-16'),
      owner: 'user_123',
    }
    expect(mastery.nodeId).toBeDefined()
    expect(mastery.level).toBeDefined()
    expect(mastery.confidence).toBeDefined()
    expect(mastery.totalSessions).toBeDefined()
    expect(mastery.successRate).toBeDefined()
    expect(mastery.nextReviewDate).toBeDefined()
    expect(mastery.owner).toBeDefined()
  })

  it('should accept valid mastery levels', () => {
    // Scenario 3.3-3.5: Level upgrades
    const levels: MasteryLevel[] = ['new', 'learning', 'familiar', 'mastered']
    levels.forEach((level) => {
      const mastery: NodeMastery = {
        nodeId: 'node_abc',
        level,
        confidence: 0,
        totalSessions: 0,
        successRate: 0,
        nextReviewDate: new Date(),
        owner: 'user_123',
      }
      expect(mastery.level).toBe(level)
    })
  })

  it('should support confidence as number 0-100', () => {
    // Scenario 4.2: Confidence scores
    const mastery: NodeMastery = {
      nodeId: 'node_abc',
      level: 'learning',
      confidence: 75,
      totalSessions: 5,
      successRate: 80,
      nextReviewDate: new Date(),
      owner: 'user_123',
    }
    expect(mastery.confidence).toBeGreaterThanOrEqual(0)
    expect(mastery.confidence).toBeLessThanOrEqual(100)
  })

  it('should support optional lastReviewed date', () => {
    const mastery: NodeMastery = {
      nodeId: 'node_abc',
      level: 'learning',
      confidence: 75,
      totalSessions: 5,
      successRate: 80,
      nextReviewDate: new Date(),
      lastReviewed: new Date('2026-02-15'),
      owner: 'user_123',
    }
    expect(mastery.lastReviewed).toBeDefined()
  })

  it('should reference node via stable nodeId', () => {
    const mastery: NodeMastery = {
      nodeId: 'stable-node-id-789',
      level: 'new',
      confidence: 0,
      totalSessions: 0,
      successRate: 0,
      nextReviewDate: new Date(),
      owner: 'user_123',
    }
    expect(typeof mastery.nodeId).toBe('string')
    expect(mastery.nodeId).toBe('stable-node-id-789')
  })

  it('should have owner field for access control', () => {
    const mastery: NodeMastery = {
      nodeId: 'node_abc',
      level: 'new',
      confidence: 0,
      totalSessions: 0,
      successRate: 0,
      nextReviewDate: new Date(),
      owner: 'user_alice',
    }
    expect(mastery.owner).toBe('user_alice')
  })
})

