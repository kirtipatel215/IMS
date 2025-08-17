// lib/auth-debug.ts - Debug utility for authentication issues
import { supabase } from './supabase'

export interface DebugInfo {
  hasSession: boolean
  sessionValid: boolean
  userId: string | null
  userEmail: string | null
  userInDatabase: boolean
  databaseError: string | null
  tableExists: boolean
  userRole: string | null
  userActive: boolean | null
  environmentVars: {
    hasSupabaseUrl: boolean
    hasAnonKey: boolean
  }
}

export async function debugAuthentication(): Promise<DebugInfo> {
  const debug: DebugInfo = {
    hasSession: false,
    sessionValid: false,
    userId: null,
    userEmail: null,
    userInDatabase: false,
    databaseError: null,
    tableExists: false,
    userRole: null,
    userActive: null,
    environmentVars: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
  }

  try {
    // Check environment variables
    console.log('🔍 Checking environment variables...')
    console.log('Supabase URL exists:', debug.environmentVars.hasSupabaseUrl)
    console.log('Anon Key exists:', debug.environmentVars.hasAnonKey)

    // Check session
    console.log('🔍 Checking session...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      return debug
    }

    debug.hasSession = !!session
    debug.sessionValid = session && session.expires_at ? session.expires_at > Date.now() / 1000 : false
    debug.userId = session?.user?.id || null
    debug.userEmail = session?.user?.email || null

    console.log('Has session:', debug.hasSession)
    console.log('Session valid:', debug.sessionValid)
    console.log('User ID:', debug.userId)
    console.log('User email:', debug.userEmail)

    if (!session?.user) {
      return debug
    }

    // Check if users table exists
    console.log('🔍 Checking if users table exists...')
    const { error: tableCheckError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true })

    debug.tableExists = !tableCheckError
    console.log('Users table exists:', debug.tableExists)

    if (tableCheckError) {
      debug.databaseError = `Table check error: ${tableCheckError.message}`
      console.error('Table check error:', tableCheckError)
      return debug
    }

    // Check if user exists in database
    console.log('🔍 Checking if user exists in database...')
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, name, role, is_active')
      .eq('id', session.user.id)
      .single()

    debug.userInDatabase = !!userData && !userError
    debug.userRole = userData?.role || null
    debug.userActive = userData?.is_active || null

    console.log('User in database:', debug.userInDatabase)
    console.log('User role:', debug.userRole)
    console.log('User active:', debug.userActive)

    if (userError) {
      debug.databaseError = `User fetch error: ${userError.message}`
      console.error('User fetch error:', userError)
    }

  } catch (error: any) {
    console.error('Debug error:', error)
    debug.databaseError = `Debug error: ${error.message}`
  }

  return debug
}

export function logDebugInfo(debug: DebugInfo) {
  console.log('🐛 AUTHENTICATION DEBUG INFO:')
  console.log('================================')
  console.log('Environment:')
  console.log(`  - Supabase URL: ${debug.environmentVars.hasSupabaseUrl ? '✅' : '❌'}`)
  console.log(`  - Anon Key: ${debug.environmentVars.hasAnonKey ? '✅' : '❌'}`)
  console.log('Session:')
  console.log(`  - Has Session: ${debug.hasSession ? '✅' : '❌'}`)
  console.log(`  - Session Valid: ${debug.sessionValid ? '✅' : '❌'}`)
  console.log(`  - User ID: ${debug.userId || 'None'}`)
  console.log(`  - User Email: ${debug.userEmail || 'None'}`)
  console.log('Database:')
  console.log(`  - Table Exists: ${debug.tableExists ? '✅' : '❌'}`)
  console.log(`  - User In DB: ${debug.userInDatabase ? '✅' : '❌'}`)
  console.log(`  - User Role: ${debug.userRole || 'None'}`)
  console.log(`  - User Active: ${debug.userActive !== null ? (debug.userActive ? '✅' : '❌') : 'Unknown'}`)
  
  if (debug.databaseError) {
    console.log(`  - DB Error: ${debug.databaseError}`)
  }
  
  console.log('================================')
  
  // Provide recommendations
  if (!debug.environmentVars.hasSupabaseUrl || !debug.environmentVars.hasAnonKey) {
    console.log('🚨 ISSUE: Missing environment variables')
    console.log('   Fix: Check your .env.local file')
  }
  
  if (debug.hasSession && !debug.tableExists) {
    console.log('🚨 ISSUE: Users table does not exist')
    console.log('   Fix: Run the database schema SQL')
  }
  
  if (debug.hasSession && debug.tableExists && !debug.userInDatabase) {
    console.log('🚨 ISSUE: User not found in database')
    console.log('   Fix: User profile creation failed - check RLS policies')
  }
  
  if (debug.userInDatabase && debug.userActive === false) {
    console.log('🚨 ISSUE: User account is inactive')
    console.log('   Fix: Activate user account in database')
  }
}

// Add this to your auth callback or any component for debugging
export async function runAuthDebug() {
  if (process.env.NODE_ENV === 'development') {
    const debug = await debugAuthentication()
    logDebugInfo(debug)
    return debug
  }
  return null
}