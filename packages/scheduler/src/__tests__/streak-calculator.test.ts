import { describe, it, expect } from 'vitest'
import { updateStreak, shouldIncrementStreak, shouldResetStreak } from '../streak-calculator'

describe('updateStreak', () => {
  it('should increment streak on first completion of the day', () => {
    // Scenario 5.1: Streak increment
    const currentStreak = 5
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const newStreak = updateStreak(currentStreak, yesterday, new Date())
    expect(newStreak).toBe(6)
  })

  it('should maintain streak if already completed today', () => {
    // Scenario 5.2: No double increment
    const currentStreak = 5
    const today = new Date()
    const newStreak = updateStreak(currentStreak, today, new Date())
    expect(newStreak).toBe(5) // no change
  })

  it('should reset streak to 0 if day was missed', () => {
    // Scenario 5.3: Streak reset
    const currentStreak = 7
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
    const newStreak = updateStreak(currentStreak, twoDaysAgo, new Date())
    expect(newStreak).toBe(0)
  })

  it('should start streak at 1 on first completion', () => {
    // Scenario 5.4: First completion
    const currentStreak = 0
    const newStreak = updateStreak(currentStreak, null, new Date())
    expect(newStreak).toBe(1)
  })
})

describe('shouldIncrementStreak', () => {
  it('should return true if last completion was yesterday', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    expect(shouldIncrementStreak(yesterday, new Date())).toBe(true)
  })

  it('should return false if last completion was today', () => {
    const today = new Date()
    expect(shouldIncrementStreak(today, new Date())).toBe(false)
  })

  it('should return false if last completion was 2+ days ago', () => {
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
    expect(shouldIncrementStreak(twoDaysAgo, new Date())).toBe(false)
  })

  it('should return true if no previous completion (first time)', () => {
    expect(shouldIncrementStreak(null, new Date())).toBe(true)
  })
})

describe('shouldResetStreak', () => {
  it('should return true if last completion was 2+ days ago', () => {
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
    expect(shouldResetStreak(twoDaysAgo, new Date())).toBe(true)
  })

  it('should return false if last completion was yesterday', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    expect(shouldResetStreak(yesterday, new Date())).toBe(false)
  })

  it('should return false if last completion was today', () => {
    const today = new Date()
    expect(shouldResetStreak(today, new Date())).toBe(false)
  })

  it('should return false if no previous completion', () => {
    expect(shouldResetStreak(null, new Date())).toBe(false)
  })
})

