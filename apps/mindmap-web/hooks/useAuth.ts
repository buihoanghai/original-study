import { useAuthContext } from '@/contexts/AuthContext'

/**
 * useAuth Hook
 *
 * Convenience hook to access authentication state and functions.
 * Re-exports the auth context for easier imports.
 */
export function useAuth() {
  return useAuthContext()
}

