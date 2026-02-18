import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import NodeEditorPage from '../page'

// Mock Next.js cookies API
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    toString: () => 'mock-cookie-string',
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    has: vi.fn(),
    getAll: vi.fn(() => []),
  })),
}))

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
}))

// Mock API
vi.mock('@/lib/api', () => ({
  getMindmapBySlug: vi.fn((slug: string) =>
    Promise.resolve({
      success: true,
      data: {
        id: slug,
        metadata: {
          title: 'Test Mindmap',
          slug: slug,
          description: 'Test description',
          created: new Date(),
          updated: new Date(),
        },
        status: 'published',
        ownerId: 'test-user',
      },
    })
  ),
}))

// Mock EditorWrapper component
vi.mock('@/components/EditorWrapper', () => ({
  EditorWrapper: ({ mindmapId, focusNodeSlug }: { mindmapId: string; focusNodeSlug?: string }) => (
    <div data-testid="editor-wrapper">
      <div data-testid="mindmap-id">{mindmapId}</div>
      {focusNodeSlug && <div data-testid="focus-node-slug">{focusNodeSlug}</div>}
    </div>
  ),
}))

describe('NodeEditorPage', () => {
  it('should render EditorWrapper with mindmapId and focusNodeSlug', async () => {
    const params = Promise.resolve({
      id: 'test-mindmap-id',
      nodeSlug: 'test-node-slug',
    })

    const page = await NodeEditorPage({ params })
    const { container } = render(page)

    expect(container.querySelector('[data-testid="editor-wrapper"]')).toBeTruthy()
    expect(container.querySelector('[data-testid="mindmap-id"]')?.textContent).toBe('test-mindmap-id')
    expect(container.querySelector('[data-testid="focus-node-slug"]')?.textContent).toBe('test-node-slug')
  })

  it('should handle different node slugs', async () => {
    const params = Promise.resolve({
      id: '69952aab26e32fc66bbe4988',
      nodeSlug: 'variables-and-types',
    })

    const page = await NodeEditorPage({ params })
    const { container } = render(page)

    expect(container.querySelector('[data-testid="mindmap-id"]')?.textContent).toBe('69952aab26e32fc66bbe4988')
    expect(container.querySelector('[data-testid="focus-node-slug"]')?.textContent).toBe('variables-and-types')
  })
})

