import { describe, it, expect } from 'vitest'
import type { Mindmap, MindmapMetadata, MindmapStatus } from '../mindmap'

describe('Mindmap Types', () => {
  describe('Mindmap', () => {
    it('should have required fields', () => {
      const mockMindmap: Mindmap = {
        id: 'mindmap-123',
        metadata: {
          title: 'Test Mindmap',
          slug: 'test-mindmap',
          description: 'A test mindmap',
          created: new Date(),
          updated: new Date(),
        },
        status: 'draft',
        ownerId: 'user-123',
      }

      expect(mockMindmap.id).toBeDefined()
      expect(mockMindmap.metadata).toBeDefined()
      expect(mockMindmap.status).toBeDefined()
      expect(mockMindmap.ownerId).toBeDefined()
    })

    it('should accept valid status values', () => {
      const draftMindmap: Mindmap = {
        id: '1',
        metadata: {
          title: 'Draft',
          slug: 'draft',
          description: '',
          created: new Date(),
          updated: new Date(),
        },
        status: 'draft',
        ownerId: 'user-1',
      }

      const publishedMindmap: Mindmap = {
        id: '2',
        metadata: {
          title: 'Published',
          slug: 'published',
          description: '',
          created: new Date(),
          updated: new Date(),
        },
        status: 'published',
        ownerId: 'user-1',
      }

      const archivedMindmap: Mindmap = {
        id: '3',
        metadata: {
          title: 'Archived',
          slug: 'archived',
          description: '',
          created: new Date(),
          updated: new Date(),
        },
        status: 'archived',
        ownerId: 'user-1',
      }

      expect(draftMindmap.status).toBe('draft')
      expect(publishedMindmap.status).toBe('published')
      expect(archivedMindmap.status).toBe('archived')
    })
  })

  describe('MindmapMetadata', () => {
    it('should have required fields', () => {
      const mockMetadata: MindmapMetadata = {
        title: 'Test Title',
        slug: 'test-title',
        description: 'Test Description',
        created: new Date(),
        updated: new Date(),
      }

      expect(mockMetadata.title).toBeDefined()
      expect(mockMetadata.description).toBeDefined()
      expect(mockMetadata.created).toBeDefined()
      expect(mockMetadata.updated).toBeDefined()
      expect(mockMetadata.created).toBeInstanceOf(Date)
      expect(mockMetadata.updated).toBeInstanceOf(Date)
    })
  })

  describe('MindmapStatus', () => {
    it('should be a union of valid statuses', () => {
      const draft: MindmapStatus = 'draft'
      const published: MindmapStatus = 'published'
      const archived: MindmapStatus = 'archived'

      expect(draft).toBe('draft')
      expect(published).toBe('published')
      expect(archived).toBe('archived')
    })
  })
})
