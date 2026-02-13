'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

/**
 * ProtectedRoute Component
 *
 * Wraps pages that require authentication.
 * Redirects to login page if user is not authenticated.
 */

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      // Store the current path to redirect back after login
      const currentPath = window.location.pathname
      const returnUrl = currentPath !== redirectTo ? `?returnUrl=${encodeURIComponent(currentPath)}` : ''
      router.push(`${redirectTo}${returnUrl}`)
    }
  }, [user, loading, router, redirectTo])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render children if not authenticated (will redirect)
  if (!user) {
    return null
  }

  // User is authenticated, render children
  return <>{children}</>
}

