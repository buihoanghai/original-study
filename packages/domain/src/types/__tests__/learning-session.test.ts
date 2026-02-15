import { describe, it, expect } from 'vitest'
import type { LearningSession, SessionType, SessionStatus } from '../learning-session'

describe('LearningSession type', () => {
  it('should have required fields', () => {
    // Scenario 1.2: Session structure
    const session: LearningSession = {
      sessionId: 'session_123',
      nodeId: 'node_abc',
      type: 'learn',
      scheduledDate: new Date('2026-02-16'),
      status: 'scheduled',
      owner: 'user_123',
    }
    expect(session.sessionId).toBeDefined()
    expect(session.nodeId).toBeDefined()
    expect(session.type).toBeDefined()
    expect(session.scheduledDate).toBeDefined()
    expect(session.status).toBeDefined()
    expect(session.owner).toBeDefined()
  })

  it('should accept valid session types', () => {
    // Scenario 2.3: Color-coded by type
    const types: SessionType[] = ['learn', 'review', 'practice', 'application']
    types.forEach((type) => {
      const session: LearningSession = {
        sessionId: 'session_123',
        nodeId: 'node_abc',
        type,
        scheduledDate: new Date(),
        status: 'scheduled',
        owner: 'user_123',
      }
      expect(session.type).toBe(type)
    })
  })

  it('should accept valid session statuses', () => {
    // Scenario 2.4, 2.5: Status icons
    const statuses: SessionStatus[] = ['scheduled', 'completed', 'skipped', 'missed']
    statuses.forEach((status) => {
      const session: LearningSession = {
        sessionId: 'session_123',
        nodeId: 'node_abc',
        type: 'learn',
        scheduledDate: new Date(),
        status,
        owner: 'user_123',
      }
      expect(session.status).toBe(status)
    })
  })

  it('should support optional performance and duration', () => {
    // Scenario 3.1: Performance score
    const session: LearningSession = {
      sessionId: 'session_123',
      nodeId: 'node_abc',
      type: 'learn',
      scheduledDate: new Date(),
      status: 'completed',
      owner: 'user_123',
      performance: 85,
      duration: 15,
      completedDate: new Date(),
    }
    expect(session.performance).toBe(85)
    expect(session.duration).toBe(15)
    expect(session.completedDate).toBeDefined()
  })

  it('should reference node via stable nodeId', () => {
    const session: LearningSession = {
      sessionId: 'session_123',
      nodeId: 'stable-node-id-789',
      type: 'learn',
      scheduledDate: new Date(),
      status: 'scheduled',
      owner: 'user_123',
    }
    expect(typeof session.nodeId).toBe('string')
    expect(session.nodeId).toBe('stable-node-id-789')
  })

  it('should have owner field for access control', () => {
    const session: LearningSession = {
      sessionId: 'session_123',
      nodeId: 'node_abc',
      type: 'learn',
      scheduledDate: new Date(),
      status: 'scheduled',
      owner: 'user_alice',
    }
    expect(session.owner).toBe('user_alice')
  })
})

