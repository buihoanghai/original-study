import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RegisterPage from '../page'
import { AuthProvider } from '@/contexts/AuthContext'

// Mock auth API
vi.mock('@/lib/auth-api', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  getCurrentUser: vi.fn().mockResolvedValue({ success: false, error: 'Not authenticated' }),
}))

// Mock Next.js navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/register',
  useSearchParams: () => new URLSearchParams(),
}))

// Helper to render with AuthProvider
function renderWithAuth(component: React.ReactElement) {
  return render(<AuthProvider>{component}</AuthProvider>)
}

describe('Register Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render registration form', () => {
    renderWithAuth(<RegisterPage />)

    expect(screen.getByText('Create an account')).toBeInTheDocument()
    expect(screen.getByText('Start organizing your knowledge today')).toBeInTheDocument()
    expect(screen.getByLabelText('Full name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('should have link to login page', () => {
    renderWithAuth(<RegisterPage />)

    const loginLink = screen.getByText('Sign in').closest('a')
    expect(loginLink).toHaveAttribute('href', '/login')
  })

  it('should show error when submitting empty form', async () => {
    renderWithAuth(<RegisterPage />)

    const submitButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('All fields are required')).toBeInTheDocument()
    })
  })

  it('should show error when passwords do not match', async () => {
    renderWithAuth(<RegisterPage />)

    const nameInput = screen.getByLabelText('Full name')
    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')
    const confirmPasswordInput = screen.getByLabelText('Confirm password')
    const submitButton = screen.getByRole('button', { name: /create account/i })

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })
  })

  it('should show error when password is too short', async () => {
    renderWithAuth(<RegisterPage />)

    const nameInput = screen.getByLabelText('Full name')
    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')
    const confirmPasswordInput = screen.getByLabelText('Confirm password')
    const submitButton = screen.getByRole('button', { name: /create account/i })

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'pass' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'pass' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
    })
  })

  it('should show loading state when submitting', async () => {
    const { register } = await import('@/lib/auth-api')
    vi.mocked(register).mockImplementation(() => new Promise(() => {})) // Never resolves to keep loading

    renderWithAuth(<RegisterPage />)

    const nameInput = screen.getByLabelText('Full name')
    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')
    const confirmPasswordInput = screen.getByLabelText('Confirm password')
    const submitButton = screen.getByRole('button', { name: /create account/i })

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Creating account...')).toBeInTheDocument()
    })
  })

  it('should show error on failed registration', async () => {
    const { register } = await import('@/lib/auth-api')
    vi.mocked(register).mockResolvedValue({ success: false, error: 'Email already exists' })

    renderWithAuth(<RegisterPage />)

    const nameInput = screen.getByLabelText('Full name')
    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')
    const confirmPasswordInput = screen.getByLabelText('Confirm password')
    const submitButton = screen.getByRole('button', { name: /create account/i })

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Registration failed. Please try again.')).toBeInTheDocument()
    })
  })

  it('should show password requirements hint', () => {
    renderWithAuth(<RegisterPage />)

    expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument()
  })

  it('should disable inputs when loading', async () => {
    const { register } = await import('@/lib/auth-api')
    vi.mocked(register).mockImplementation(() => new Promise(() => {})) // Never resolves to keep loading

    renderWithAuth(<RegisterPage />)

    const nameInput = screen.getByLabelText('Full name') as HTMLInputElement
    const emailInput = screen.getByLabelText('Email address') as HTMLInputElement
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement
    const confirmPasswordInput = screen.getByLabelText('Confirm password') as HTMLInputElement
    const submitButton = screen.getByRole('button', { name: /create account/i })

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(nameInput.disabled).toBe(true)
      expect(emailInput.disabled).toBe(true)
      expect(passwordInput.disabled).toBe(true)
      expect(confirmPasswordInput.disabled).toBe(true)
    })
  })
})

