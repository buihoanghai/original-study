import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SyncStatus } from '../SyncStatus'
import { useEditorStore } from '@mindmap/editor'

describe('SyncStatus', () => {
  beforeEach(() => {
    // Reset store before each test
    useEditorStore.setState({
      isSyncing: false,
      lastSyncedAt: null,
      syncError: null,
    })
  })

  it('should render not saved state initially', () => {
    render(<SyncStatus />)
    
    expect(screen.getByText('Not saved')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  it('should show saved state with timestamp', () => {
    const now = new Date()
    useEditorStore.setState({
      lastSyncedAt: now,
      isSyncing: false,
      syncError: null,
    })

    render(<SyncStatus />)
    
    expect(screen.getByText('Saved')).toBeInTheDocument()
    expect(screen.getByText('Just now')).toBeInTheDocument()
  })

  it('should show saving state', () => {
    useEditorStore.setState({
      isSyncing: true,
      lastSyncedAt: null,
      syncError: null,
    })

    render(<SyncStatus />)
    
    expect(screen.getByText('Saving...')).toBeInTheDocument()
  })

  it('should show error state', () => {
    useEditorStore.setState({
      isSyncing: false,
      lastSyncedAt: null,
      syncError: 'Network error',
    })

    render(<SyncStatus />)
    
    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByText('Network error')).toBeInTheDocument()
  })

  it('should truncate long error messages', () => {
    const longError = 'This is a very long error message that should be truncated'
    useEditorStore.setState({
      isSyncing: false,
      lastSyncedAt: null,
      syncError: longError,
    })

    render(<SyncStatus />)
    
    expect(screen.getByText(/This is a very long error mess.../)).toBeInTheDocument()
  })

  it('should disable save button when syncing', () => {
    useEditorStore.setState({
      isSyncing: true,
      lastSyncedAt: null,
      syncError: null,
    })

    render(<SyncStatus />)
    
    const saveButton = screen.getByRole('button', { name: /saving/i })
    expect(saveButton).toBeDisabled()
  })

  it('should call save when save button is clicked', async () => {
    const mockSave = vi.fn().mockResolvedValue(undefined)

    render(<SyncStatus onSave={mockSave} />)

    const saveButton = screen.getByRole('button', { name: /save/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockSave).toHaveBeenCalled()
    })
  })

  it('should format timestamp correctly for minutes ago', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    useEditorStore.setState({
      lastSyncedAt: fiveMinutesAgo,
      isSyncing: false,
      syncError: null,
    })

    render(<SyncStatus />)
    
    expect(screen.getByText('5m ago')).toBeInTheDocument()
  })

  it('should format timestamp correctly for hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
    useEditorStore.setState({
      lastSyncedAt: twoHoursAgo,
      isSyncing: false,
      syncError: null,
    })

    render(<SyncStatus />)
    
    expect(screen.getByText('2h ago')).toBeInTheDocument()
  })

  it('should show correct status icons', () => {
    const { rerender } = render(<SyncStatus />)
    
    // Not saved
    expect(screen.getByRole('img', { name: /sync status/i })).toHaveTextContent('⚪')
    
    // Saved
    useEditorStore.setState({
      lastSyncedAt: new Date(),
      isSyncing: false,
      syncError: null,
    })
    rerender(<SyncStatus />)
    expect(screen.getByRole('img', { name: /sync status/i })).toHaveTextContent('✅')
    
    // Saving
    useEditorStore.setState({
      isSyncing: true,
      lastSyncedAt: null,
      syncError: null,
    })
    rerender(<SyncStatus />)
    expect(screen.getByRole('img', { name: /sync status/i })).toHaveTextContent('⏳')
    
    // Error
    useEditorStore.setState({
      isSyncing: false,
      lastSyncedAt: null,
      syncError: 'Error',
    })
    rerender(<SyncStatus />)
    expect(screen.getByRole('img', { name: /sync status/i })).toHaveTextContent('❌')
  })
})

