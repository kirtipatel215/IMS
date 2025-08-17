// lib/auth-supabase.ts - OPTIMIZED Authentication System
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

export interface AppUser {
  id: string
  email: string
  role: "student" | "teacher" | "tp-officer" | "admin"
  name: string
  loginTime: string
  department?: string
  designation?: string
  employeeId?: string
  phone?: string
  rollNumber?: string
  avatarUrl?: string
  isActive?: boolean
}

// Enhanced cache management
let currentUserCache: AppUser | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 60000 // 1 minute

// Prevent multiple simultaneous getCurrentUser calls
let getCurrentUserPromise: Promise<AppUser | null> | null = null

// Rate limiting for auth state changes
let lastAuthStateChange: number = 0
const AUTH_STATE_COOLDOWN = 500 // 500ms cooldown between auth state changes

// Get current authenticated user from Supabase with database profile
export const getCurrentUser = async (): Promise<AppUser | null> => {
  // Return existing promise if already fetching
  if (getCurrentUserPromise) {
    return getCurrentUserPromise
  }

  // Return cached user if available and not expired
  if (currentUserCache && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
    return currentUserCache
  }

  getCurrentUserPromise = (async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('Auth error:', authError)
        currentUserCache = null
        return null
      }

      if (!user) {
        currentUserCache = null
        return null
      }

      // Get additional user data from our users table with timeout
      const userDataPromise = supabase
        .from('users')
        .select(`
          id,
          email,
          name,
          role,
          department,
          designation,
          employee_id,
          phone,
          roll_number,
          avatar_url,
          is_active
        `)
        .eq('id', user.id)
        .single()

      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('User data fetch timeout')), 10000)
      )

      const { data: userData, error: userError } = await Promise.race([
        userDataPromise,
        timeoutPromise
      ]) as any

      if (userError) {
        console.error('Error fetching user profile:', userError)
        // If no profile exists, create one
        if (userError.code === 'PGRST116') {
          const newProfile = await createUserProfile(user)
          currentUserCache = newProfile
          cacheTimestamp = Date.now()
          return newProfile
        }
        currentUserCache = null
        return null
      }

      if (!userData.is_active) {
        console.log('User account is inactive')
        currentUserCache = null
        return null
      }

      const appUser: AppUser = {
        id: user.id,
        email: user.email!,
        name: userData.name,
        role: userData.role,
        loginTime: new Date().toISOString(),
        department: userData.department,
        designation: userData.designation,
        employeeId: userData.employee_id,
        phone: userData.phone,
        rollNumber: userData.roll_number,
        avatarUrl: userData.avatar_url || user.user_metadata?.avatar_url,
        isActive: userData.is_active
      }

      // Cache the user
      currentUserCache = appUser
      cacheTimestamp = Date.now()
      
      return appUser
    } catch (error) {
      console.error('Error getting current user:', error)
      currentUserCache = null
      return null
    } finally {
      getCurrentUserPromise = null
    }
  })()

  return getCurrentUserPromise
}

// Clear user cache
export const clearUserCache = () => {
  currentUserCache = null
  cacheTimestamp = 0
  getCurrentUserPromise = null
}

// Create user profile in database
const createUserProfile = async (user: User): Promise<AppUser | null> => {
  try {
    const role = getUserRole(user.email!)
    if (!role) {
      throw new Error('Invalid email domain')
    }

    const name = user.user_metadata?.full_name || getNameFromEmail(user.email!)
    
    // Extract additional info based on role
    const additionalData = extractUserData(user.email!, role)

    const { data, error } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email!,
        name,
        role,
        avatar_url: user.user_metadata?.avatar_url,
        department: additionalData.department,
        roll_number: additionalData.rollNumber,
        employee_id: additionalData.employeeId,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user profile:', error)
      return null
    }

    return {
      id: user.id,
      email: user.email!,
      name,
      role: role as any,
      loginTime: new Date().toISOString(),
      department: additionalData.department,
      rollNumber: additionalData.rollNumber,
      employeeId: additionalData.employeeId,
      avatarUrl: user.user_metadata?.avatar_url,
      isActive: true
    }
  } catch (error) {
    console.error('Error creating user profile:', error)
    return null
  }
}

// Sign in with Google OAuth
export const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        scopes: 'openid email profile'
      }
    })

    if (error) {
      console.error('Google sign in error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Google sign in error:', error)
    return { success: false, error: 'An unexpected error occurred during sign in' }
  }
}

// Handle auth callback after OAuth
export const handleAuthCallback = async (): Promise<{ success: boolean; user?: AppUser; error?: string }> => {
  try {
    // Clear any existing cache
    clearUserCache()
    
    // Wait a bit for the session to be established
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Get the current session
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Session error:', error)
      return { success: false, error: error.message }
    }

    if (!session?.user) {
      return { success: false, error: 'No session found' }
    }

    const user = session.user

    // Validate email domain
    if (!isValidInstitutionalEmail(user.email!)) {
      await supabase.auth.signOut()
      return { 
        success: false, 
        error: 'Invalid email domain. Please use your institutional email (@charusat.edu.in or @charusat.ac.in)' 
      }
    }

    // Get or create user profile
    const appUser = await getCurrentUser()
    
    if (!appUser) {
      await supabase.auth.signOut()
      return { success: false, error: 'Failed to create or retrieve user profile' }
    }

    return { success: true, user: appUser }
  } catch (error: any) {
    console.error('Auth callback error:', error)
    return { success: false, error: 'Failed to handle authentication callback' }
  }
}

// Sign out with proper cleanup
export const logout = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    // Clear cache first
    clearUserCache()
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Logout error:', error)
      return { success: false, error: error.message }
    }

    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
      
      // Redirect to login page
      window.location.href = '/auth'
    }

    return { success: true }
  } catch (error: any) {
    console.error('Logout error:', error)
    return { success: false, error: 'Failed to sign out' }
  }
}

// Auth state listener with rate limiting and deduplication
export const onAuthStateChange = (callback: (user: AppUser | null) => void) => {
  let isProcessing = false
  let lastProcessedUserId: string | null = null
  
  return supabase.auth.onAuthStateChange(async (event, session) => {
    const now = Date.now()
    
    // Rate limiting - prevent rapid fire auth state changes
    if (now - lastAuthStateChange < AUTH_STATE_COOLDOWN) {
      console.log('Auth state change rate limited')
      return
    }
    lastAuthStateChange = now
    
    console.log('Auth state changed:', event, session?.user?.email)
    
    // Prevent multiple simultaneous processing
    if (isProcessing) {
      console.log('Auth state change already processing, skipping')
      return
    }
    
    // Skip duplicate events for the same user
    const currentUserId = session?.user?.id || null
    if (event !== 'SIGNED_OUT' && lastProcessedUserId === currentUserId) {
      console.log('Skipping duplicate auth event for same user')
      return
    }
    
    try {
      isProcessing = true
      lastProcessedUserId = currentUserId
      
      if (event === 'SIGNED_OUT') {
        clearUserCache()
        callback(null)
      } else if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        // Clear cache for fresh data
        clearUserCache()
        
        // Small delay to ensure database sync
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const appUser = await getCurrentUser()
        callback(appUser)
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // For token refresh, use cached data if available and same user
        if (currentUserCache && currentUserId === currentUserCache.id) {
          callback(currentUserCache)
        } else {
          const appUser = await getCurrentUser()
          callback(appUser)
        }
      }
    } catch (error) {
      console.error('Error in auth state change handler:', error)
      clearUserCache()
      callback(null)
    } finally {
      isProcessing = false
    }
  })
}

// Check if user session is valid
export const isSessionValid = async (): Promise<boolean> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      return false
    }

    // Check if session is expired
    if (session.expires_at && session.expires_at < Math.floor(Date.now() / 1000)) {
      return false
    }

    return true
  } catch (error) {
    console.error('Error checking session validity:', error)
    return false
  }
}

// Utility functions remain the same...
export const getUserRole = (email: string): string | null => {
  if (!email || typeof email !== 'string') return null
  
  const normalizedEmail = email.toLowerCase().trim()
  
  if (normalizedEmail.endsWith("@charusat.edu.in")) {
    return "student"
  } else if (normalizedEmail.endsWith("@charusat.ac.in")) {
    if (normalizedEmail.includes("admin") || normalizedEmail === "admin@charusat.ac.in") {
      return "admin"
    } else if (normalizedEmail.includes("tp") || normalizedEmail === "tp@charusat.ac.in") {
      return "tp-officer"
    } else {
      return "teacher"
    }
  }
  return null
}

export const getNameFromEmail = (email: string): string => {
  if (!email) return "Unknown User"
  
  const name = email.split("@")[0]
  return name
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

// Extract user data based on email and role
const extractUserData = (email: string, role: string) => {
  let department = ''
  let rollNumber = ''
  let employeeId = ''

  if (role === 'student') {
    department = getDepartmentFromEmail(email)
    rollNumber = getRollNumberFromEmail(email) || ''
  } else if (role === 'teacher') {
    department = 'Computer Engineering'
  } else if (role === 'tp-officer') {
    department = 'Training & Placement'
    employeeId = 'TPO' + Math.random().toString(36).substr(2, 6).toUpperCase()
  } else if (role === 'admin') {
    department = 'Administration'
    employeeId = 'ADM' + Math.random().toString(36).substr(2, 6).toUpperCase()
  }

  return { department, rollNumber, employeeId }
}

// Helper to extract department from student email
const getDepartmentFromEmail = (email: string): string => {
  const rollPattern = email.match(/(\d{2})([A-Z]{2})/);
  if (rollPattern) {
    const deptCode = rollPattern[2];
    const departmentMap: { [key: string]: string } = {
      'CE': 'Computer Engineering',
      'IT': 'Information Technology',
      'EC': 'Electronics & Communication',
      'ME': 'Mechanical Engineering',
      'CL': 'Civil Engineering',
      'CH': 'Chemical Engineering',
      'EE': 'Electrical Engineering',
      'IC': 'Instrumentation & Control',
      'CS': 'Computer Science'
    };
    return departmentMap[deptCode] || 'Computer Engineering';
  }
  return 'Computer Engineering';
}

// Helper to extract roll number from student email
const getRollNumberFromEmail = (email: string): string | undefined => {
  const rollPattern = email.match(/(\d{2}[A-Z]{2}\d{3})/);
  return rollPattern ? rollPattern[1] : undefined;
}

// Email validation functions
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidInstitutionalEmail = (email: string): boolean => {
  if (!isValidEmail(email)) return false
  
  const normalizedEmail = email.toLowerCase().trim()
  return normalizedEmail.endsWith("@charusat.edu.in") || normalizedEmail.endsWith("@charusat.ac.in")
}

// Require authentication middleware
export const requireAuth = async (allowedRoles?: string[]): Promise<AppUser | null> => {
  const user = await getCurrentUser()

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/auth"
    }
    return null
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard/" + user.role
    }
    return null
  }

  return user
}

// Check if user has permission
export const hasPermission = (user: AppUser, requiredRole: string): boolean => {
  const roleHierarchy = ['student', 'teacher', 'tp-officer', 'admin'];
  const userRoleIndex = roleHierarchy.indexOf(user.role);
  const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
  
  return userRoleIndex >= requiredRoleIndex;
}