import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StickyNoteComponent } from '../StickyNoteComponent'
import type { NodeProps } from 'reactflow'

describe('StickyNoteComponent', () => {
  const createMockProps = (id: string, text = 'Test note'): NodeProps => ({
    id,
    data: { text },
    selected: false,
    type: 'stickyNote',
    xPos: 0,
    yPos: 0,
    zIndex: 0,
    isConnectable: false,
    dragging: false,
  })

  describe('Rendering', () => {
    it('should render with default text', () => {
      const props = createMockProps('sticky-1')
      render(<StickyNoteComponent {...props} />)

      expect(screen.getByText('Test note')).toBeInTheDocument()
    })

    it('should render with placeholder text when no text provided', () => {
      const props = createMockProps('sticky-1', '')
      props.data.text = undefined
      render(<StickyNoteComponent {...props} />)

      expect(screen.getByText('Double-click to edit')).toBeInTheDocument()
    })

    it('should have sticky note styling', () => {
      const props = createMockProps('sticky-1')
      const { container } = render(<StickyNoteComponent {...props} />)

      const stickyNote = container.querySelector('[data-testid="sticky-note-sticky-1"]')
      expect(stickyNote).toBeInTheDocument()
      expect(stickyNote).toHaveStyle({
        width: '200px',
        height: '200px',
      })
    })

    it('should show pin emoji indicator', () => {
      const props = createMockProps('sticky-1')
      render(<StickyNoteComponent {...props} />)

      expect(screen.getByText('📌')).toBeInTheDocument()
    })
  })

  describe('Color Cycling', () => {
    it('should use yellow color for ID ending in 0', () => {
      const props = createMockProps('sticky-0')
      const { container } = render(<StickyNoteComponent {...props} />)

      const stickyNote = container.querySelector('[data-testid="sticky-note-sticky-0"]')
      expect(stickyNote).toHaveStyle({ background: '#fef3c7' })
    })

    it('should use pink color for ID ending in 1', () => {
      const props = createMockProps('sticky-1')
      const { container } = render(<StickyNoteComponent {...props} />)

      const stickyNote = container.querySelector('[data-testid="sticky-note-sticky-1"]')
      expect(stickyNote).toHaveStyle({ background: '#fce7f3' })
    })

    it('should use blue color for ID ending in 2', () => {
      const props = createMockProps('sticky-2')
      const { container } = render(<StickyNoteComponent {...props} />)

      const stickyNote = container.querySelector('[data-testid="sticky-note-sticky-2"]')
      expect(stickyNote).toHaveStyle({ background: '#dbeafe' })
    })

    it('should use green color for ID ending in 3', () => {
      const props = createMockProps('sticky-3')
      const { container } = render(<StickyNoteComponent {...props} />)

      const stickyNote = container.querySelector('[data-testid="sticky-note-sticky-3"]')
      expect(stickyNote).toHaveStyle({ background: '#d1fae5' })
    })

    it('should cycle colors for IDs > 3', () => {
      const props = createMockProps('sticky-4')
      const { container } = render(<StickyNoteComponent {...props} />)

      const stickyNote = container.querySelector('[data-testid="sticky-note-sticky-4"]')
      // ID 4 should cycle back to yellow (4 % 4 = 0)
      expect(stickyNote).toHaveStyle({ background: '#fef3c7' })
    })
  })

  describe('Editing', () => {
    it('should enter edit mode on double-click', () => {
      const props = createMockProps('sticky-1', 'Original text')
      render(<StickyNoteComponent {...props} />)

      const stickyNote = screen.getByTestId('sticky-note-sticky-1')
      fireEvent.doubleClick(stickyNote)

      // Should show textarea in edit mode
      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeInTheDocument()
      expect(textarea).toHaveValue('Original text')
    })

    it('should focus and select text when entering edit mode', () => {
      const props = createMockProps('sticky-1', 'Test text')
      render(<StickyNoteComponent {...props} />)

      const stickyNote = screen.getByTestId('sticky-note-sticky-1')
      fireEvent.doubleClick(stickyNote)

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      expect(textarea).toHaveFocus()
    })

    it('should update text when typing', () => {
      const props = createMockProps('sticky-1', 'Original')
      render(<StickyNoteComponent {...props} />)

      const stickyNote = screen.getByTestId('sticky-note-sticky-1')
      fireEvent.doubleClick(stickyNote)

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: 'Updated text' } })

      expect(textarea).toHaveValue('Updated text')
    })

    it('should exit edit mode on blur', () => {
      const props = createMockProps('sticky-1', 'Test')
      render(<StickyNoteComponent {...props} />)

      const stickyNote = screen.getByTestId('sticky-note-sticky-1')
      fireEvent.doubleClick(stickyNote)

      const textarea = screen.getByRole('textbox')
      fireEvent.blur(textarea)

      // Should no longer show textarea
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })

    it('should exit edit mode on Escape key', () => {
      const props = createMockProps('sticky-1', 'Test')
      render(<StickyNoteComponent {...props} />)

      const stickyNote = screen.getByTestId('sticky-note-sticky-1')
      fireEvent.doubleClick(stickyNote)

      const textarea = screen.getByRole('textbox')
      fireEvent.keyDown(textarea, { key: 'Escape' })

      // Should no longer show textarea
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })
  })

  describe('Selection State', () => {
    it('should show enhanced shadow when selected', () => {
      const props = createMockProps('sticky-1')
      props.selected = true
      const { container } = render(<StickyNoteComponent {...props} />)

      const stickyNote = container.querySelector('[data-testid="sticky-note-sticky-1"]')
      expect(stickyNote).toHaveStyle({
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
      })
    })

    it('should show normal shadow when not selected', () => {
      const props = createMockProps('sticky-1')
      props.selected = false
      const { container } = render(<StickyNoteComponent {...props} />)

      const stickyNote = container.querySelector('[data-testid="sticky-note-sticky-1"]')
      expect(stickyNote).toHaveStyle({
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      })
    })
  })
})

