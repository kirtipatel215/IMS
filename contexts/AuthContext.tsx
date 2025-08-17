// contexts/AuthContext.tsx - FIXED VERSION (Proper No Session Handling)
"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { 
  getCurrentUser, 
  onAuthStateChange, 
  logout as supabaseLogout,
  clearUserCache,
  isSessionValid,
  type AppUser 
} from '@/lib/auth-supabase'

interface AuthContextType {
  user: AppUser | null
  isLoading: boolean
  isInitialized: boolean
  error: string | null
  login: () => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Use refs to prevent stale closures and infinite loops
  const initializationRef = useRef(false)
  const authListenerRef = useRef<any>(null)
  const lastProcessedEmailRef = useRef<string | null>(null)
  const processingRef = useRef(false)

  // Refresh user data
  const refreshUser = useCallback(async () => {
    if (processingRef.current) return
    
    try {
      processingRef.current = true
      setError(null)
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      return currentUser
    } catch (err: any) {
      console.error('Error refreshing user:', err)
      setError(err.message || 'Failed to refresh user data')
      setUser(null)
      return null
    } finally {
      processingRef.current = false
    }
  }, [])

  // Initialize auth state - ONLY ONCE with no dependencies
  useEffect(() => {
    // Prevent multiple initializations
    if (initializationRef.current) return

    console.log('Initializing auth state...')
    initializationRef.current = true

    let mounted = true
    let processingAuthChange = false

    const initializeAuth = async () => {
      try {
        // First, check if there's a valid session
        const sessionValid = await isSessionValid()
        console.log('Session valid:', sessionValid)

        if (!sessionValid) {
          console.log('No valid session found, marking as initialized')
          if (mounted) {
            setUser(null)
            setError(null)
            setIsInitialized(true)
            setIsLoading(false)
          }
          return
        }

        // If session exists, try to get current user
        const currentUser = await getCurrentUser()
        console.log('Current user from session:', currentUser?.email || 'none')

        if (mounted) {
          setUser(currentUser)
          setError(null)
          setIsInitialized(true)
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error during auth initialization:', error)
        if (mounted) {
          setUser(null)
          setError('Failed to initialize authentication')
          setIsInitialized(true)
          setIsLoading(false)
        }
      }
    }

    const handleAuthChange = async (newUser: AppUser | null) => {
      // Prevent processing if unmounted, already processing, or duplicate
      if (!mounted || processingAuthChange || processingRef.current) return

      const currentEmail = newUser?.email || null
      
      // Skip if we just processed this same user
      if (lastProcessedEmailRef.current === currentEmail) {
        console.log('Skipping duplicate auth event for:', currentEmail || 'signed out')
        return
      }

      processingAuthChange = true
      processingRef.current = true
      lastProcessedEmailRef.current = currentEmail

      console.log('Auth state change processed:', newUser?.email || 'signed out')
      
      try {
        setUser(newUser)
        setError(null)
        
        // Mark as initialized after first auth state change
        if (!isInitialized) {
          setIsInitialized(true)
        }
        setIsLoading(false)
      } catch (err) {
        console.error('Error in auth state change handler:', err)
        setError('Auth state change failed')
        setIsLoading(false)
      } finally {
        processingAuthChange = false
        processingRef.current = false
      }
    }

    // Start initialization
    initializeAuth()

    // Set up auth listener
    const { data: authListener } = onAuthStateChange(handleAuthChange)
    authListenerRef.current = authListener

    // Cleanup function
    return () => {
      mounted = false
      processingAuthChange = false
      processingRef.current = false
      
      if (authListenerRef.current?.subscription) {
        console.log('Cleaning up auth listener')
        authListenerRef.current.subscription.unsubscribe()
        authListenerRef.current = null
      }
    }
  }, []) // NO DEPENDENCIES - run only once

  // Login function
  const login = useCallback(async () => {
    throw new Error('Login should be handled through the auth page')
  }, [])

  // Logout function with proper cleanup
  const logout = useCallback(async () => {
    if (processingRef.current) return
    
    try {
      processingRef.current = true
      setIsLoading(true)
      setError(null)
      
      // Clear cache and sign out
      clearUserCache()
      lastProcessedEmailRef.current = null
      await supabaseLogout()
      
      // State will be updated through the auth listener
    } catch (err: any) {
      console.error('Logout error:', err)
      setError(err.message || 'Failed to logout')
    } finally {
      processingRef.current = false
      setIsLoading(false)
    }
  }, [])

  const value: AuthContextType = {
    user,
    isLoading,
    isInitialized,
    error,
    login,
    logout,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}