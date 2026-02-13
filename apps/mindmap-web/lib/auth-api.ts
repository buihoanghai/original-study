import type { ApiResult } from './api'

/**
 * Auth API Client
 *
 * Provides functions to interact with Payload CMS authentication endpoints.
 * All functions use cookie-based authentication and return ApiResult<T>.
 */

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3001'

/**
 * User type returned from Payload CMS
 */
export interface User {
  id: string
  email: string
  createdAt: string
  updatedAt: string
}

/**
 * Login response from Payload CMS
 */
interface LoginResponse {
  message?: string
  user: User
  token: string
  exp?: number
}

/**
 * Login with email and password
 */
export async function login(
  email: string,
  password: string
): Promise<ApiResult<User>> {
  try {
    const response = await fetch(`${CMS_URL}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for authentication
      body: JSON.stringify({
        email,
        password,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.errors?.[0]?.message || `Login failed: ${response.statusText}`,
      }
    }

    const data: LoginResponse = await response.json()
    return {
      success: true,
      data: data.user,
    }
  } catch (error) {
    return {
      success: false,
      error: `Login failed: ${error instanceof Error ? error.message : 'Network error'}`,
    }
  }
}

/**
 * Register a new user
 */
export async function register(
  email: string,
  password: string
): Promise<ApiResult<User>> {
  try {
    const response = await fetch(`${CMS_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for authentication
      body: JSON.stringify({
        email,
        password,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.errors?.[0]?.message || `Registration failed: ${response.statusText}`,
      }
    }

    const data = await response.json()
    return {
      success: true,
      data: data.doc,
    }
  } catch (error) {
    return {
      success: false,
      error: `Registration failed: ${error instanceof Error ? error.message : 'Network error'}`,
    }
  }
}

/**
 * Logout the current user
 */
export async function logout(): Promise<ApiResult<void>> {
  try {
    const response = await fetch(`${CMS_URL}/api/users/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for authentication
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.errors?.[0]?.message || `Logout failed: ${response.statusText}`,
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    return {
      success: false,
      error: `Logout failed: ${error instanceof Error ? error.message : 'Network error'}`,
    }
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<ApiResult<User>> {
  try {
    const response = await fetch(`${CMS_URL}/api/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for authentication
    })

    if (!response.ok) {
      // 401 means not authenticated - return null user instead of error
      if (response.status === 401) {
        return {
          success: false,
          error: 'Not authenticated',
        }
      }

      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.errors?.[0]?.message || `Failed to get current user: ${response.statusText}`,
      }
    }

    const data = await response.json()
    return {
      success: true,
      data: data.user,
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to get current user: ${error instanceof Error ? error.message : 'Network error'}`,
    }
  }
}

