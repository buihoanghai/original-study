import { describe, it, expect } from 'vitest'
import type { NodeMastery } from '@mindmap/domain'
import { updateMastery, calculateConfidence } from '../mastery-calculator'

describe('updateMastery', () => {
  it('should increment totalSessions on completion', () => {
    // Scenario 3.2: Update statistics
    const current: NodeMastery = {
      nodeId: 'node_abc',
      level: 'new',
      confidence: 0,
      totalSessions: 0,
      successRate: 0,
      nextReviewDate: new Date('2026-02-16'),
      owner: 'user_123',
    }
    const updated = updateMastery(current, 85)
    expect(updated.totalSessions).toBe(1)
  })

  it('should calculate success rate correctly', () => {
    // Scenario 3.2: Success rate calculation
    const current: NodeMastery = {
      nodeId: 'node_abc',
      level: 'new',
      confidence: 0,
      totalSessions: 2,
      successRate: 70, // avg of previous sessions
      nextReviewDate: new Date(),
      owner: 'user_123',
    }
    const updated = updateMastery(current, 90)
    // (70*2 + 90) / 3 = 76.67
    expect(updated.successRate).toBeCloseTo(76.67, 1)
  })

  it('should upgrade level from new to learning after 3 sessions', () => {
    // Scenario 3.3: Level upgrade
    const current: NodeMastery = {
      nodeId: 'node_abc',
      level: 'new',
      confidence: 75,
      totalSessions: 2,
      successRate: 75,
      nextReviewDate: new Date(),
      owner: 'user_123',
    }
    const updated = updateMastery(current, 80)
    expect(updated.level).toBe('learning')
    expect(updated.totalSessions).toBe(3)
  })

  it('should upgrade level from learning to familiar', () => {
    // Scenario 3.4: Level upgrade
    const current: NodeMastery = {
      nodeId: 'node_abc',
      level: 'learning',
      confidence: 72,
      totalSessions: 4,
      successRate: 72,
      nextReviewDate: new Date(),
      owner: 'user_123',
    }
    const updated = updateMastery(current, 75)
    expect(updated.level).toBe('familiar')
    expect(updated.confidence).toBeGreaterThanOrEqual(70)
  })

  it('should upgrade level from familiar to mastered', () => {
    // Scenario 3.5: Level upgrade
    const current: NodeMastery = {
      nodeId: 'node_abc',
      level: 'familiar',
      confidence: 91,
      totalSessions: 9,
      successRate: 91,
      nextReviewDate: new Date(),
      owner: 'user_123',
    }
    const updated = updateMastery(current, 95)
    expect(updated.level).toBe('mastered')
    expect(updated.confidence).toBeGreaterThanOrEqual(90)
    expect(updated.totalSessions).toBeGreaterThanOrEqual(10)
  })

  it('should update lastReviewed to current date', () => {
    const current: NodeMastery = {
      nodeId: 'node_abc',
      level: 'new',
      confidence: 0,
      totalSessions: 0,
      successRate: 0,
      nextReviewDate: new Date(),
      owner: 'user_123',
    }
    const before = new Date()
    const updated = updateMastery(current, 80)
    const after = new Date()
    
    expect(updated.lastReviewed).toBeDefined()
    expect(updated.lastReviewed!.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(updated.lastReviewed!.getTime()).toBeLessThanOrEqual(after.getTime())
  })
})

describe('calculateConfidence', () => {
  it('should return performance for first session', () => {
    const confidence = calculateConfidence(0, 0, 85)
    expect(confidence).toBe(85)
  })

  it('should weight recent performance more heavily', () => {
    // Previous: 60, New: 90
    // Should be closer to 90 than simple average (75)
    const confidence = calculateConfidence(60, 1, 90)
    expect(confidence).toBeGreaterThan(75)
    expect(confidence).toBeLessThanOrEqual(90)
  })

  it('should cap confidence at 100', () => {
    const confidence = calculateConfidence(95, 5, 100)
    expect(confidence).toBeLessThanOrEqual(100)
  })

  it('should floor confidence at 0', () => {
    const confidence = calculateConfidence(10, 1, 0)
    expect(confidence).toBeGreaterThanOrEqual(0)
  })
})

