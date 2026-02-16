import { describe, it, expect } from 'vitest'
import type { SkillStatus, SkillMetadata } from '../skill'

describe('Skill Types', () => {
  describe('SkillStatus', () => {
    it('should accept valid status values', () => {
      const notStarted: SkillStatus = 'not-started'
      const inProgress: SkillStatus = 'in-progress'
      const completed: SkillStatus = 'completed'

      expect(notStarted).toBe('not-started')
      expect(inProgress).toBe('in-progress')
      expect(completed).toBe('completed')
    })
  })

  describe('SkillMetadata', () => {
    it('should have valid structure with all fields', () => {
      const metadata: SkillMetadata = {
        status: 'in-progress',
        masteryPercentage: 75,
        lastPracticed: new Date('2026-02-15'),
      }

      expect(metadata.status).toBe('in-progress')
      expect(metadata.masteryPercentage).toBe(75)
      expect(metadata.lastPracticed).toBeInstanceOf(Date)
    })

    it('should allow optional lastPracticed field', () => {
      const metadata: SkillMetadata = {
        status: 'not-started',
        masteryPercentage: 0,
      }

      expect(metadata.lastPracticed).toBeUndefined()
    })

    it('should have mastery percentage between 0-100', () => {
      const metadata1: SkillMetadata = {
        status: 'not-started',
        masteryPercentage: 0,
      }

      const metadata2: SkillMetadata = {
        status: 'completed',
        masteryPercentage: 100,
      }

      expect(metadata1.masteryPercentage).toBeGreaterThanOrEqual(0)
      expect(metadata1.masteryPercentage).toBeLessThanOrEqual(100)
      expect(metadata2.masteryPercentage).toBeGreaterThanOrEqual(0)
      expect(metadata2.masteryPercentage).toBeLessThanOrEqual(100)
    })
  })
})

