import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { KeyboardShortcutsHelp } from '../KeyboardShortcutsHelp'

describe('KeyboardShortcutsHelp', () => {
  it('should render help button when closed', () => {
    render(<KeyboardShortcutsHelp />)
    
    const button = screen.getByRole('button', { name: /show keyboard shortcuts/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('?')
  })

  it('should open help panel when button is clicked', () => {
    render(<KeyboardShortcutsHelp />)
    
    const button = screen.getByRole('button', { name: /show keyboard shortcuts/i })
    fireEvent.click(button)
    
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument()
  })

  it('should open help panel when ? key is pressed', () => {
    render(<KeyboardShortcutsHelp />)
    
    fireEvent.keyDown(window, { key: '?' })
    
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument()
  })

  it('should not open help panel when ? is pressed in input field', () => {
    const { container } = render(
      <div>
        <input type="text" />
        <KeyboardShortcutsHelp />
      </div>
    )
    
    const input = container.querySelector('input')!
    fireEvent.keyDown(input, { key: '?' })
    
    expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument()
  })

  it('should close help panel when close button is clicked', () => {
    render(<KeyboardShortcutsHelp />)
    
    // Open panel
    fireEvent.keyDown(window, { key: '?' })
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument()
    
    // Close panel
    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)
    
    expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument()
  })

  it('should close help panel when Escape key is pressed', () => {
    render(<KeyboardShortcutsHelp />)
    
    // Open panel
    fireEvent.keyDown(window, { key: '?' })
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument()
    
    // Close with Escape
    fireEvent.keyDown(window, { key: 'Escape' })
    
    expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument()
  })

  it('should display all shortcut categories', () => {
    render(<KeyboardShortcutsHelp />)
    
    // Open panel
    fireEvent.keyDown(window, { key: '?' })
    
    expect(screen.getByText('Node Operations')).toBeInTheDocument()
    expect(screen.getByText('Navigation')).toBeInTheDocument()
    expect(screen.getByText('View Controls')).toBeInTheDocument()
    expect(screen.getByText('History')).toBeInTheDocument()
    expect(screen.getByText('Sync & Save')).toBeInTheDocument()
    expect(screen.getByText('Other')).toBeInTheDocument()
  })

  it('should display key shortcuts', () => {
    render(<KeyboardShortcutsHelp />)
    
    // Open panel
    fireEvent.keyDown(window, { key: '?' })
    
    // Check for some key shortcuts
    expect(screen.getByText('Tab')).toBeInTheDocument()
    expect(screen.getByText('Enter')).toBeInTheDocument()
    expect(screen.getByText('Ctrl/Cmd + S')).toBeInTheDocument()
    expect(screen.getByText('Ctrl/Cmd + Z')).toBeInTheDocument()
    expect(screen.getByText('Arrow Keys')).toBeInTheDocument()
  })

  it('should display shortcut descriptions', () => {
    render(<KeyboardShortcutsHelp />)
    
    // Open panel
    fireEvent.keyDown(window, { key: '?' })
    
    // Check for some descriptions
    expect(screen.getByText('Add child node to selected node')).toBeInTheDocument()
    expect(screen.getByText('Add sibling node')).toBeInTheDocument()
    expect(screen.getByText('Save mindmap to CMS')).toBeInTheDocument()
    expect(screen.getByText('Undo last action')).toBeInTheDocument()
  })

  it('should toggle help panel when ? is pressed multiple times', () => {
    render(<KeyboardShortcutsHelp />)
    
    // Open
    fireEvent.keyDown(window, { key: '?' })
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument()
    
    // Close
    fireEvent.keyDown(window, { key: '?' })
    expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument()
    
    // Open again
    fireEvent.keyDown(window, { key: '?' })
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument()
  })
})

