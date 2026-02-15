import { describe, it, expect } from 'vitest'
import type { NodeMastery } from '@mindmap/domain'
import { calculateNextReviewDate, getIntervalForLevel } from '../interval-calculator'

describe('calculateNextReviewDate', () => {
  it('should schedule 1 day for new level', () => {
    // Scenario 3.7: Review intervals
    const mastery: NodeMastery = {
      nodeId: 'node_abc',
      level: 'new',
      confidence: 50,
      totalSessions: 1,
      successRate: 50,
      nextReviewDate: new Date(),
      owner: 'user_123',
    }
    const nextDate = calculateNextReviewDate(mastery)
    const now = new Date()
    const expected = new Date(now)
    expected.setDate(expected.getDate() + 1)
    
    // Check dates are same day (ignore time)
    expect(nextDate.toDateString()).toBe(expected.toDateString())
  })

  it('should schedule 3 days for learning level', () => {
    // Scenario 3.7: Review intervals
    const mastery: NodeMastery = {
      nodeId: 'node_abc',
      level: 'learning',
      confidence: 70,
      totalSessions: 4,
      successRate: 70,
      nextReviewDate: new Date(),
      owner: 'user_123',
    }
    const nextDate = calculateNextReviewDate(mastery)
    const now = new Date()
    const expected = new Date(now)
    expected.setDate(expected.getDate() + 3)
    
    expect(nextDate.toDateString()).toBe(expected.toDateString())
  })

  it('should schedule 7 days for familiar level', () => {
    const mastery: NodeMastery = {
      nodeId: 'node_abc',
      level: 'familiar',
      confidence: 80,
      totalSessions: 7,
      successRate: 80,
      nextReviewDate: new Date(),
      owner: 'user_123',
    }
    const nextDate = calculateNextReviewDate(mastery)
    const now = new Date()
    const expected = new Date(now)
    expected.setDate(expected.getDate() + 7)
    
    expect(nextDate.toDateString()).toBe(expected.toDateString())
  })

  it('should schedule 30 days for mastered level', () => {
    const mastery: NodeMastery = {
      nodeId: 'node_abc',
      level: 'mastered',
      confidence: 95,
      totalSessions: 12,
      successRate: 95,
      nextReviewDate: new Date(),
      owner: 'user_123',
    }
    const nextDate = calculateNextReviewDate(mastery)
    const now = new Date()
    const expected = new Date(now)
    expected.setDate(expected.getDate() + 30)
    
    expect(nextDate.toDateString()).toBe(expected.toDateString())
  })
})

describe('getIntervalForLevel', () => {
  it('should return 1 for new level', () => {
    expect(getIntervalForLevel('new')).toBe(1)
  })

  it('should return 3 for learning level', () => {
    expect(getIntervalForLevel('learning')).toBe(3)
  })

  it('should return 7 for familiar level', () => {
    expect(getIntervalForLevel('familiar')).toBe(7)
  })

  it('should return 30 for mastered level', () => {
    expect(getIntervalForLevel('mastered')).toBe(30)
  })
})

