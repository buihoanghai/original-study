import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '../page'
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
  usePathname: () => '/login',
  useSearchParams: () => new URLSearchParams(),
}))

// Helper to render with AuthProvider
function renderWithAuth(component: React.ReactElement) {
  return render(<AuthProvider>{component}</AuthProvider>)
}

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render login form', () => {
    renderWithAuth(<LoginPage />)

    expect(screen.getByText('Welcome back')).toBeInTheDocument()
    expect(screen.getByText('Sign in to your account to continue')).toBeInTheDocument()
    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('should have link to register page', () => {
    renderWithAuth(<LoginPage />)

    const registerLink = screen.getByText('Sign up').closest('a')
    expect(registerLink).toHaveAttribute('href', '/register')
  })

  it('should show error when submitting empty form', async () => {
    renderWithAuth(<LoginPage />)

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Email and password are required')).toBeInTheDocument()
    })
  })

  it('should show error when email is empty', async () => {
    renderWithAuth(<LoginPage />)

    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Email and password are required')).toBeInTheDocument()
    })
  })

  it('should show error when password is empty', async () => {
    renderWithAuth(<LoginPage />)

    const emailInput = screen.getByLabelText('Email address')
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Email and password are required')).toBeInTheDocument()
    })
  })

  it('should show loading state when submitting', async () => {
    const { login } = await import('@/lib/auth-api')
    vi.mocked(login).mockImplementation(() => new Promise(() => {})) // Never resolves to keep loading

    renderWithAuth(<LoginPage />)

    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Signing in...')).toBeInTheDocument()
    })
  })

  it('should show error on failed login', async () => {
    const { login } = await import('@/lib/auth-api')
    vi.mocked(login).mockResolvedValue({ success: false, error: 'Invalid credentials' })

    renderWithAuth(<LoginPage />)

    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
    })
  })

  it('should have remember me checkbox', () => {
    renderWithAuth(<LoginPage />)

    const rememberMeCheckbox = screen.getByLabelText('Remember me')
    expect(rememberMeCheckbox).toBeInTheDocument()
    expect(rememberMeCheckbox).toHaveAttribute('type', 'checkbox')
  })

  it('should have forgot password link', () => {
    renderWithAuth(<LoginPage />)

    expect(screen.getByText('Forgot password?')).toBeInTheDocument()
  })

  it('should disable inputs when loading', async () => {
    const { login } = await import('@/lib/auth-api')
    vi.mocked(login).mockImplementation(() => new Promise(() => {})) // Never resolves to keep loading

    renderWithAuth(<LoginPage />)

    const emailInput = screen.getByLabelText('Email address') as HTMLInputElement
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(emailInput.disabled).toBe(true)
      expect(passwordInput.disabled).toBe(true)
    })
  })
})

