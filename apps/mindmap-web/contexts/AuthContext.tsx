'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { User } from '@/lib/auth-api'
import * as authApi from '@/lib/auth-api'

/**
 * Auth Context
 *
 * Provides authentication state and functions to the entire app.
 * Uses cookie-based authentication with Payload CMS.
 */

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Refresh user from server
   */
  const refreshUser = useCallback(async () => {
    setLoading(true)
    setError(null)

    const result = await authApi.getCurrentUser()

    if (result.success && result.data) {
      setUser(result.data)
    } else {
      setUser(null)
      // Don't set error for "Not authenticated" - it's expected
      if (result.error !== 'Not authenticated') {
        setError(result.error || 'Failed to get user')
      }
    }

    setLoading(false)
  }, [])

  /**
   * Login user
   */
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    const result = await authApi.login(email, password)

    if (result.success && result.data) {
      setUser(result.data)
      setLoading(false)
      return true
    } else {
      setError(result.error || 'Login failed')
      setLoading(false)
      return false
    }
  }, [])

  /**
   * Register new user
   */
  const register = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    const result = await authApi.register(email, password)

    if (result.success && result.data) {
      setUser(result.data)
      setLoading(false)
      return true
    } else {
      setError(result.error || 'Registration failed')
      setLoading(false)
      return false
    }
  }, [])

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    setLoading(true)
    setError(null)

    const result = await authApi.logout()

    if (result.success) {
      setUser(null)
    } else {
      setError(result.error || 'Logout failed')
    }

    setLoading(false)
  }, [])

  /**
   * Check authentication status on mount
   */
  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to access auth context
 */
export function useAuthContext() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }

  return context
}

