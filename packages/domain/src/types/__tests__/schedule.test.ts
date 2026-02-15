import { describe, it, expect } from 'vitest'
import type { WeeklyTarget, DailyPlan } from '../schedule'

describe('WeeklyTarget type', () => {
  it('should have required fields', () => {
    const target: WeeklyTarget = {
      weekStartDate: new Date('2026-02-12'),
      targetSessions: 7,
      completedSessions: 5,
      streak: 10,
    }
    expect(target.weekStartDate).toBeDefined()
    expect(target.targetSessions).toBeDefined()
    expect(target.completedSessions).toBeDefined()
    expect(target.streak).toBeDefined()
  })

  it('should support streak as number', () => {
    const target: WeeklyTarget = {
      weekStartDate: new Date(),
      targetSessions: 7,
      completedSessions: 3,
      streak: 5,
    }
    expect(typeof target.streak).toBe('number')
    expect(target.streak).toBeGreaterThanOrEqual(0)
  })
})

describe('DailyPlan type', () => {
  it('should contain sessions array', () => {
    const plan: DailyPlan = {
      date: new Date('2026-02-15'),
      sessions: [],
      completed: false,
    }
    expect(Array.isArray(plan.sessions)).toBe(true)
    expect(plan.date).toBeDefined()
    expect(typeof plan.completed).toBe('boolean')
  })

  it('should support sessions with IDs', () => {
    const plan: DailyPlan = {
      date: new Date(),
      sessions: ['session_1', 'session_2', 'session_3'],
      completed: true,
    }
    expect(plan.sessions).toHaveLength(3)
    expect(plan.sessions[0]).toBe('session_1')
  })
})

