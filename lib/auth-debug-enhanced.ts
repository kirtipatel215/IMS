// lib/auth-debug-enhanced.ts - Enhanced Debug Utility
import { supabase } from './supabase'
import { getCurrentUser, isSessionValid } from './auth-supabase'

export interface DetailedDebugInfo {
  timestamp: string
  environment: {
    hasSupabaseUrl: boolean
    hasAnonKey: boolean
    nodeEnv: string
    isClient: boolean
  }
  session: {
    hasSession: boolean
    sessionValid: boolean
    expiresAt: string | null
    timeRemaining: number | null
    userId: string | null
    userEmail: string | null
    sessionError: string | null
  }
  database: {
    canConnectToSupabase: boolean
    usersTableExists: boolean
    userInDatabase: boolean
    userActive: boolean | null
    userRole: string | null
    userDepartment: string | null
    databaseError: string | null
  }
  auth: {
    currentUserResult: any
    getCurrentUserError: string | null
  }
  recommendations: string[]
}

export async function runDetailedAuthDebug(): Promise<DetailedDebugInfo> {
  const debug: DetailedDebugInfo = {
    timestamp: new Date().toISOString(),
    environment: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV || 'unknown',
      isClient: typeof window !== 'undefined'
    },
    session: {
      hasSession: false,
      sessionValid: false,
      expiresAt: null,
      timeRemaining: null,
      userId: null,
      userEmail: null,
      sessionError: null
    },
    database: {
      canConnectToSupabase: false,
      usersTableExists: false,
      userInDatabase: false,
      userActive: null,
      userRole: null,
      userDepartment: null,
      databaseError: null
    },
    auth: {
      currentUserResult: null,
      getCurrentUserError: null
    },
    recommendations: []
  }

  console.log('🔍 Starting detailed auth debug...')

  try {
    // 1. Check Environment
    console.log('📋 Checking environment variables...')
    
    // 2. Check Session
    console.log('🔐 Checking session...')
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      debug.session.sessionError = sessionError?.message || null
      debug.session.hasSession = !!session
      debug.session.userId = session?.user?.id || null
      debug.session.userEmail = session?.user?.email || null
      
      if (session) {
        debug.session.sessionValid = await isSessionValid()
        debug.session.expiresAt = session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null
        debug.session.timeRemaining = session.expires_at ? Math.max(0, session.expires_at - Date.now() / 1000) : null
      }
    } catch (error: any) {
      debug.session.sessionError = error.message
    }

    // 3. Check Database Connection
    console.log('🗄️ Checking database connection...')
    try {
      // Simple connection test
      const { error: connectionError } = await supabase
        .from('users')
        .select('count', { count: 'exact', head: true })
        .limit(1)

      debug.database.canConnectToSupabase = !connectionError
      debug.database.usersTableExists = !connectionError
      
      if (connectionError) {
        debug.database.databaseError = connectionError.message
      }
    } catch (error: any) {
      debug.database.databaseError = error.message
    }

    // 4. Check User in Database
    if (debug.session.userId && debug.database.usersTableExists) {
      console.log('👤 Checking user in database...')
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, email, name, role, department, is_active')
          .eq('id', debug.session.userId)
          .single()

        if (!userError && userData) {
          debug.database.userInDatabase = true
          debug.database.userActive = userData.is_active
          debug.database.userRole = userData.role
          debug.database.userDepartment = userData.department
        } else {
          debug.database.userInDatabase = false
          if (userError) {
            debug.database.databaseError = userError.message
          }
        }
      } catch (error: any) {
        debug.database.databaseError = error.message
      }
    }

    // 5. Test getCurrentUser
    console.log('🔄 Testing getCurrentUser function...')
    try {
      const currentUser = await getCurrentUser()
      debug.auth.currentUserResult = currentUser ? {
        id: currentUser.id,
        email: currentUser.email,
        role: currentUser.role,
        name: currentUser.name,
        isActive: currentUser.isActive
      } : null
    } catch (error: any) {
      debug.auth.getCurrentUserError = error.message
    }

    // 6. Generate Recommendations
    debug.recommendations = generateRecommendations(debug)

  } catch (error: any) {
    console.error('❌ Debug error:', error)
    debug.recommendations.push(`Debug process failed: ${error.message}`)
  }

  return debug
}

function generateRecommendations(debug: DetailedDebugInfo): string[] {
  const recommendations: string[] = []

  // Environment issues
  if (!debug.environment.hasSupabaseUrl || !debug.environment.hasAnonKey) {
    recommendations.push('🚨 CRITICAL: Missing Supabase environment variables in .env.local')
  }

  // Session issues
  if (!debug.session.hasSession) {
    recommendations.push('🔐 No active session - user needs to sign in')
  } else if (!debug.session.sessionValid) {
    recommendations.push('⏰ Session expired - user needs to re-authenticate')
  } else if (debug.session.timeRemaining && debug.session.timeRemaining < 300) {
    recommendations.push('⏰ Session expires soon - consider refreshing')
  }

  // Database issues
  if (!debug.database.canConnectToSupabase) {
    recommendations.push('🗄️ CRITICAL: Cannot connect to Supabase database')
  } else if (!debug.database.usersTableExists) {
    recommendations.push('📋 CRITICAL: Users table does not exist - run database migrations')
  } else if (debug.session.hasSession && !debug.database.userInDatabase) {
    recommendations.push('👤 CRITICAL: User not found in database - profile creation failed')
  } else if (debug.database.userActive === false) {
    recommendations.push('🚫 User account is inactive - contact administrator')
  }

  // Auth function issues
  if (debug.session.hasSession && debug.database.userInDatabase && !debug.auth.currentUserResult) {
    recommendations.push('🔄 getCurrentUser() failing despite valid session and database user')
  }

  // Email validation issues
  if (debug.session.userEmail && !isValidInstitutionalEmail(debug.session.userEmail)) {
    recommendations.push('📧 Invalid institutional email - must use @charusat.edu.in or @charusat.ac.in')
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ No issues detected - authentication should be working properly')
  }

  return recommendations
}

function isValidInstitutionalEmail(email: string): boolean {
  return email.toLowerCase().endsWith("@charusat.edu.in") || 
         email.toLowerCase().endsWith("@charusat.ac.in")
}

export function logDetailedDebugInfo(debug: DetailedDebugInfo) {
  console.group('🔍 DETAILED AUTHENTICATION DEBUG REPORT')
  console.log('================================')
  console.log('⏰ Timestamp:', debug.timestamp)
  
  console.group('🌍 Environment:')
  console.log(`  Supabase URL: ${debug.environment.hasSupabaseUrl ? '✅' : '❌'}`)
  console.log(`  Anon Key: ${debug.environment.hasAnonKey ? '✅' : '❌'}`)
  console.log(`  Node Env: ${debug.environment.nodeEnv}`)
  console.log(`  Client Side: ${debug.environment.isClient ? '✅' : '❌'}`)
  console.groupEnd()

  console.group('🔐 Session:')
  console.log(`  Has Session: ${debug.session.hasSession ? '✅' : '❌'}`)
  console.log(`  Session Valid: ${debug.session.sessionValid ? '✅' : '❌'}`)
  console.log(`  User ID: ${debug.session.userId || 'None'}`)
  console.log(`  User Email: ${debug.session.userEmail || 'None'}`)
  console.log(`  Expires At: ${debug.session.expiresAt || 'N/A'}`)
  console.log(`  Time Remaining: ${debug.session.timeRemaining ? Math.round(debug.session.timeRemaining / 60) + ' minutes' : 'N/A'}`)
  if (debug.session.sessionError) {
    console.log(`  ❌ Session Error: ${debug.session.sessionError}`)
  }
  console.groupEnd()

  console.group('🗄️ Database:')
  console.log(`  Can Connect: ${debug.database.canConnectToSupabase ? '✅' : '❌'}`)
  console.log(`  Users Table Exists: ${debug.database.usersTableExists ? '✅' : '❌'}`)
  console.log(`  User In Database: ${debug.database.userInDatabase ? '✅' : '❌'}`)
  console.log(`  User Role: ${debug.database.userRole || 'None'}`)
  console.log(`  User Department: ${debug.database.userDepartment || 'None'}`)
  console.log(`  User Active: ${debug.database.userActive !== null ? (debug.database.userActive ? '✅' : '❌') : 'Unknown'}`)
  if (debug.database.databaseError) {
    console.log(`  ❌ Database Error: ${debug.database.databaseError}`)
  }
  console.groupEnd()

  console.group('🔄 Auth Functions:')
  console.log(`  getCurrentUser Result: ${debug.auth.currentUserResult ? '✅ ' + debug.auth.currentUserResult.email : '❌ null'}`)
  if (debug.auth.getCurrentUserError) {
    console.log(`  ❌ getCurrentUser Error: ${debug.auth.getCurrentUserError}`)
  }
  console.groupEnd()

  console.group('💡 Recommendations:')
  debug.recommendations.forEach((rec, index) => {
    console.log(`  ${index + 1}. ${rec}`)
  })
  console.groupEnd()

  console.log('================================')
  console.groupEnd()

  return debug
}

// Quick debug function for immediate use
export async function quickAuthDebug() {
  if (typeof window === 'undefined') {
    console.log('⚠️ quickAuthDebug can only run on client side')
    return
  }

  const debug = await runDetailedAuthDebug()
  logDetailedDebugInfo(debug)
  return debug
}

// Add this to any page for debugging
export function addDebugToWindow() {
  if (typeof window !== 'undefined') {
    (window as any).authDebug = quickAuthDebug
    console.log('🔧 Auth debug added to window. Run: window.authDebug()')
  }
}