import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import NodeEditorPage from '../page'

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

