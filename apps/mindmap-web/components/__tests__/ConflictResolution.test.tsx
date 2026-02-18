import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConflictResolution, type ConflictData } from '../ConflictResolution'
import type { Mindmap } from '@mindmap/domain'

describe('ConflictResolution', () => {
  const mockLocalMindmap: Mindmap = {
    id: 'mindmap-1',
    metadata: {
      title: 'Local Version',
      slug: 'local-version',
      description: 'Local description',
      created: new Date('2024-01-01'),
      updated: new Date('2024-01-02T10:00:00Z'),
    },
    status: 'draft',
    ownerId: 'user-1',
  }

  const mockRemoteMindmap: Mindmap = {
    id: 'mindmap-1',
    metadata: {
      title: 'Remote Version',
      slug: 'remote-version',
      description: 'Remote description',
      created: new Date('2024-01-01'),
      updated: new Date('2024-01-02T12:00:00Z'),
    },
    status: 'published',
    ownerId: 'user-1',
  }

  const mockConflict: ConflictData = {
    local: mockLocalMindmap,
    remote: mockRemoteMindmap,
    localUpdated: new Date('2024-01-02T10:00:00Z'),
    remoteUpdated: new Date('2024-01-02T12:00:00Z'),
  }

  it('should render conflict modal with local and remote versions', () => {
    const onResolve = vi.fn()
    render(<ConflictResolution conflict={mockConflict} onResolve={onResolve} />)

    expect(screen.getByText('⚠️ Sync Conflict Detected')).toBeInTheDocument()
    expect(screen.getByText('Your Local Version')).toBeInTheDocument()
    expect(screen.getByText('Remote Version (Server)')).toBeInTheDocument()
    expect(screen.getByText('Local Version')).toBeInTheDocument()
    expect(screen.getByText('Remote Version')).toBeInTheDocument()
  })

  it('should display local version details', () => {
    const onResolve = vi.fn()
    render(<ConflictResolution conflict={mockConflict} onResolve={onResolve} />)

    expect(screen.getByText('Local description')).toBeInTheDocument()
    expect(screen.getByText('draft')).toBeInTheDocument()
  })

  it('should display remote version details', () => {
    const onResolve = vi.fn()
    render(<ConflictResolution conflict={mockConflict} onResolve={onResolve} />)

    expect(screen.getByText('Remote description')).toBeInTheDocument()
    expect(screen.getByText('published')).toBeInTheDocument()
  })

  it('should allow selecting local version', () => {
    const onResolve = vi.fn()
    render(<ConflictResolution conflict={mockConflict} onResolve={onResolve} />)

    const localRadio = screen.getAllByRole('radio')[0]
    fireEvent.click(localRadio)

    expect(localRadio).toBeChecked()
    expect(screen.getByText('Keep Local Version')).toBeInTheDocument()
  })

  it('should allow selecting remote version', () => {
    const onResolve = vi.fn()
    render(<ConflictResolution conflict={mockConflict} onResolve={onResolve} />)

    const remoteRadio = screen.getAllByRole('radio')[1]
    fireEvent.click(remoteRadio)

    expect(remoteRadio).toBeChecked()
    expect(screen.getByText('Keep Remote Version')).toBeInTheDocument()
  })

  it('should call onResolve with "local" when keeping local version', () => {
    const onResolve = vi.fn()
    render(<ConflictResolution conflict={mockConflict} onResolve={onResolve} />)

    const localRadio = screen.getAllByRole('radio')[0]
    fireEvent.click(localRadio)

    const resolveButton = screen.getByText('Keep Local Version')
    fireEvent.click(resolveButton)

    expect(onResolve).toHaveBeenCalledWith('local')
  })

  it('should call onResolve with "remote" when keeping remote version', () => {
    const onResolve = vi.fn()
    render(<ConflictResolution conflict={mockConflict} onResolve={onResolve} />)

    const remoteRadio = screen.getAllByRole('radio')[1]
    fireEvent.click(remoteRadio)

    const resolveButton = screen.getByText('Keep Remote Version')
    fireEvent.click(resolveButton)

    expect(onResolve).toHaveBeenCalledWith('remote')
  })

  it('should call onResolve with "cancel" when clicking cancel', () => {
    const onResolve = vi.fn()
    render(<ConflictResolution conflict={mockConflict} onResolve={onResolve} />)

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(onResolve).toHaveBeenCalledWith('cancel')
  })

  it('should disable resolve button when no version is selected', () => {
    const onResolve = vi.fn()
    render(<ConflictResolution conflict={mockConflict} onResolve={onResolve} />)

    const resolveButton = screen.getByText('Select a Version')
    expect(resolveButton).toBeDisabled()
  })

  it('should show warning message', () => {
    const onResolve = vi.fn()
    render(<ConflictResolution conflict={mockConflict} onResolve={onResolve} />)

    expect(
      screen.getByText(/Choosing a version will overwrite the other/)
    ).toBeInTheDocument()
  })

  it('should handle empty description', () => {
    const conflictWithoutDesc: ConflictData = {
      ...mockConflict,
      local: {
        ...mockLocalMindmap,
        metadata: { ...mockLocalMindmap.metadata, description: '' },
      },
    }

    const onResolve = vi.fn()
    render(<ConflictResolution conflict={conflictWithoutDesc} onResolve={onResolve} />)

    expect(screen.getByText('(none)')).toBeInTheDocument()
  })
})

