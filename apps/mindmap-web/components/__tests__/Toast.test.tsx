import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ToastContainer, useToast, type ToastMessage } from '../Toast'
import { renderHook, act } from '@testing-library/react'

describe('ToastContainer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render toast messages', () => {
    const toasts: ToastMessage[] = [
      { id: '1', type: 'success', message: 'Success message' },
      { id: '2', type: 'error', message: 'Error message' },
    ]
    const onClose = vi.fn()

    render(<ToastContainer toasts={toasts} onClose={onClose} />)

    expect(screen.getByText('Success message')).toBeInTheDocument()
    expect(screen.getByText('Error message')).toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', async () => {
    const toasts: ToastMessage[] = [
      { id: '1', type: 'info', message: 'Info message' },
    ]
    const onClose = vi.fn()

    render(<ToastContainer toasts={toasts} onClose={onClose} />)

    const closeButton = screen.getByRole('button', { name: /close notification/i })
    fireEvent.click(closeButton)

    // Wait for exit animation
    await act(async () => {
      vi.advanceTimersByTime(300)
    })

    expect(onClose).toHaveBeenCalledWith('1')
  })

  it('should auto-dismiss toast after duration', async () => {
    const toasts: ToastMessage[] = [
      { id: '1', type: 'success', message: 'Auto dismiss', duration: 3000 },
    ]
    const onClose = vi.fn()

    render(<ToastContainer toasts={toasts} onClose={onClose} />)

    // Fast-forward time
    await act(async () => {
      vi.advanceTimersByTime(3300) // duration + exit animation
    })

    expect(onClose).toHaveBeenCalledWith('1')
  })

  it('should render correct icons for different toast types', () => {
    const toasts: ToastMessage[] = [
      { id: '1', type: 'success', message: 'Success' },
      { id: '2', type: 'error', message: 'Error' },
      { id: '3', type: 'warning', message: 'Warning' },
      { id: '4', type: 'info', message: 'Info' },
    ]
    const onClose = vi.fn()

    render(<ToastContainer toasts={toasts} onClose={onClose} />)

    const alerts = screen.getAllByRole('alert')
    expect(alerts).toHaveLength(4)
    
    // Check icons are present
    expect(screen.getByLabelText('success')).toBeInTheDocument()
    expect(screen.getByLabelText('error')).toBeInTheDocument()
    expect(screen.getByLabelText('warning')).toBeInTheDocument()
    expect(screen.getByLabelText('info')).toBeInTheDocument()
  })

  it('should not auto-dismiss if duration is not provided', async () => {
    const toasts: ToastMessage[] = [
      { id: '1', type: 'info', message: 'No auto dismiss' },
    ]
    const onClose = vi.fn()

    render(<ToastContainer toasts={toasts} onClose={onClose} />)

    // Fast-forward time
    await act(async () => {
      vi.advanceTimersByTime(10000)
    })

    expect(onClose).not.toHaveBeenCalled()
  })
})

describe('useToast', () => {
  it('should add toast when showToast is called', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.showToast('success', 'Test message')
    })

    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].message).toBe('Test message')
    expect(result.current.toasts[0].type).toBe('success')
  })

  it('should remove toast when closeToast is called', () => {
    const { result } = renderHook(() => useToast())

    let toastId: string
    act(() => {
      toastId = result.current.showToast('info', 'Test message')
    })

    expect(result.current.toasts).toHaveLength(1)

    act(() => {
      result.current.closeToast(toastId)
    })

    expect(result.current.toasts).toHaveLength(0)
  })

  it('should add success toast', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.success('Success!')
    })

    expect(result.current.toasts[0].type).toBe('success')
    expect(result.current.toasts[0].message).toBe('Success!')
  })

  it('should add error toast', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.error('Error!')
    })

    expect(result.current.toasts[0].type).toBe('error')
    expect(result.current.toasts[0].message).toBe('Error!')
  })

  it('should add warning toast', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.warning('Warning!')
    })

    expect(result.current.toasts[0].type).toBe('warning')
    expect(result.current.toasts[0].message).toBe('Warning!')
  })

  it('should add info toast', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.info('Info!')
    })

    expect(result.current.toasts[0].type).toBe('info')
    expect(result.current.toasts[0].message).toBe('Info!')
  })
})

