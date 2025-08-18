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

// ===================
// CACHING SYSTEM
// ===================
let currentUserCache: AppUser | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 60000 // 1 minute
let getCurrentUserPromise: Promise<AppUser | null> | null = null

export const clearUserCache = () => {
  currentUserCache = null
  cacheTimestamp = 0
  getCurrentUserPromise = null
}

// ===================
// USER PROFILE MANAGEMENT
// ===================
const createUserProfile = async (user: User): Promise<AppUser | null> => {
  try {
    if (!user.id || !user.email) {
      console.error('❌ Missing user ID or email')
      return null
    }

    const role = getUserRole(user.email)
    if (!role) {
      console.error('❌ Invalid email domain:', user.email)
      return null
    }

    const name = user.user_metadata?.full_name || getNameFromEmail(user.email)
    const additionalData = extractUserData(user.email, role)

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (existingUser) {
      return mapDatabaseUserToAppUser(existingUser)
    }

    // Check for duplicate email (should not happen, but for safety)
    const { data: emailUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', user.email)
      .single()

    if (emailUser) {
      console.error('❌ Email already exists in users table:', user.email)
      return null
    }

    // Create new user profile
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        name,
        role,
        avatar_url: user.user_metadata?.avatar_url || null,
        department: additionalData.department || null,
        designation: additionalData.designation || null,
        employee_id: additionalData.employeeId || null,
        roll_number: additionalData.rollNumber || null,
        phone: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Error creating user profile:', JSON.stringify(insertError, null, 2))
      return null
    }

    if (!newUser) {
      console.error('❌ No user data returned after insert')
      return null
    }

    return mapDatabaseUserToAppUser(newUser)

  } catch (error) {
    console.error('❌ Error in createUserProfile:', error)
    return null
  }
}

const mapDatabaseUserToAppUser = (dbUser: any): AppUser => {
  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
    loginTime: new Date().toISOString(),
    department: dbUser.department || '',
    designation: dbUser.designation || '',
    employeeId: dbUser.employee_id || '',
    phone: dbUser.phone || '',
    rollNumber: dbUser.roll_number || '',
    avatarUrl: dbUser.avatar_url || '',
    isActive: dbUser.is_active
  }
}

// ===================
// GET CURRENT USER - SINGLE SOURCE OF TRUTH
// ===================
export const getCurrentUser = async (): Promise<AppUser | null> => {
  if (currentUserCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return currentUserCache
  }
  if (getCurrentUserPromise) {
    return getCurrentUserPromise
  }

  getCurrentUserPromise = (async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        currentUserCache = null
        return null
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (userError || !userData) {
        // Create user profile if doesn't exist
        const newProfile = await createUserProfile(user)
        if (newProfile) {
          currentUserCache = newProfile
          cacheTimestamp = Date.now()
          return newProfile
        }
        currentUserCache = null
        return null
      }

      if (!userData.is_active) {
        currentUserCache = null
        return null
      }

      const appUser = mapDatabaseUserToAppUser(userData)
      currentUserCache = appUser
      cacheTimestamp = Date.now()
      return appUser

    } catch (error) {
      currentUserCache = null
      return null
    } finally {
      getCurrentUserPromise = null
    }
  })()

  return getCurrentUserPromise
}

// ===================
// AUTHENTICATION METHODS
// ===================
export const signInWithGoogle = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { 
          access_type: 'offline', 
          prompt: 'consent' 
        },
        scopes: 'openid email profile'
      }
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const handleAuthCallback = async () => {
  try {
    clearUserCache()
    await new Promise(resolve => setTimeout(resolve, 1000))

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      return { success: false, error: "Session error: " + sessionError.message }
    }

    if (!session?.user) {
      return { success: false, error: "No session found" }
    }

    const user = session.user

    if (!isValidInstitutionalEmail(user.email!)) {
      await supabase.auth.signOut()
      return { success: false, error: "Please use your institutional email (@charusat.edu.in or @charusat.ac.in)" }
    }

    const appUser = await getCurrentUser()
    if (!appUser) {
      await supabase.auth.signOut()
      return { success: false, error: "Failed to create user profile. Please contact support." }
    }

    return { success: true, user: appUser }

  } catch (error: any) {
    return { success: false, error: error.message || "Authentication failed" }
  }
}

export const logout = async () => {
  try {
    clearUserCache()
    const { error } = await supabase.auth.signOut()
    if (error) {
      return { success: false, error: error.message }
    }
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
      window.location.href = "/auth"
    }
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ===================
// AUTH STATE LISTENER - SIMPLIFIED
// ===================
export const onAuthStateChange = (callback: (user: AppUser | null) => void) => {
  let isProcessing = false
  let lastUserId: string | null = null

  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (isProcessing) return
    try {
      isProcessing = true
      const currentUserId = session?.user?.id || null

      if (event === "SIGNED_OUT") {
        clearUserCache()
        lastUserId = null
        callback(null)
        return
      }

      if (session?.user && (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED")) {
        if (lastUserId === currentUserId && event !== "SIGNED_IN") {
          return
        }
        lastUserId = currentUserId
        if (event === "SIGNED_IN") {
          clearUserCache()
          await new Promise(resolve => setTimeout(resolve, 500))
        }
        const appUser = await getCurrentUser()
        callback(appUser)
        return
      }

      callback(null)
    } catch {
      clearUserCache()
      callback(null)
    } finally {
      isProcessing = false
    }
  })
}

// ===================
// SESSION VALIDITY
// ===================
export const isSessionValid = async (): Promise<boolean> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) return false
    if (!session) return false
    if (session.expires_at && session.expires_at < Date.now() / 1000) return false
    return true
  } catch {
    return false
  }
}

// ===================
// UTILITY FUNCTIONS
// ===================
export const getUserRole = (email: string): string | null => {
  const e = email.toLowerCase()
  if (e.endsWith("@charusat.edu.in")) return "student"
  if (e.endsWith("@charusat.ac.in")) {
    if (e.includes("admin")) return "admin"
    if (e.includes("tp")) return "tp-officer"
    return "teacher"
  }
  return null
}

export const isValidInstitutionalEmail = (email: string): boolean =>
  email.toLowerCase().endsWith("@charusat.edu.in") ||
  email.toLowerCase().endsWith("@charusat.ac.in")

export const requireAuth = async (allowedRoles?: string[]) => {
  const user = await getCurrentUser()
  if (!user) {
    if (typeof window !== "undefined") window.location.href = "/auth"
    return null
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (typeof window !== "undefined") window.location.href = "/dashboard/" + user.role
    return null
  }
  return user
}

export const hasPermission = (user: AppUser, requiredRole: string): boolean => {
  const roleHierarchy = ["student", "teacher", "tp-officer", "admin"]
  return roleHierarchy.indexOf(user.role) >= roleHierarchy.indexOf(requiredRole)
}

// ===================
// HELPER FUNCTIONS
// ===================
function getNameFromEmail(email: string): string {
  return email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, l => l.toUpperCase())
}

function extractUserData(email: string, role: string) {
  if (role === "student") {
    const rollMatch = email.match(/^([a-zA-Z0-9]+)@charusat\.edu\.in$/)
    return {
      department: getDepartmentFromEmail(email),
      rollNumber: rollMatch ? rollMatch[1].toUpperCase() : "",
      employeeId: "",
      designation: ""
    }
  }
  if (role === "teacher" || role === "tp-officer" || role === "admin") {
    const empMatch = email.match(/^([a-zA-Z0-9]+)@charusat\.ac\.in$/)
    return {
      department: role === "tp-officer" ? "Training & Placement" : role === "admin" ? "Administration" : "Computer Engineering",
      rollNumber: "",
      employeeId: empMatch ? empMatch[1].toUpperCase() : "",
      designation: role === "tp-officer" ? "T&P Officer" : role === "admin" ? "System Administrator" : "Faculty"
    }
  }
  return {
    department: "",
    rollNumber: "",
    employeeId: "",
    designation: ""
  }
}

function getDepartmentFromEmail(email: string): string {
  const rollPattern = email.match(/(\d{2})([A-Z]{2})/i)
  if (rollPattern) {
    const deptCode = rollPattern[2].toUpperCase()
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
    }
    return departmentMap[deptCode] || 'Computer Engineering'
  }
  return 'Computer Engineering'
}