// components/auth-guard.tsx - Enhanced Auth Guard for Supabase
"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getCurrentUser, type AppUser } from "@/lib/auth-supabase"
import { Loader2, AlertTriangle, Shield, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: string[]
  requireAuth?: boolean
}

export function AuthGuard({ 
  children, 
  allowedRoles = [], 
  requireAuth = true 
}: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [user, setUser] = useState<AppUser | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true)
        setAuthError(null)

        // Skip auth check for public routes
        if (!requireAuth) {
          setIsAuthorized(true)
          setIsLoading(false)
          return
        }

        const currentUser = await getCurrentUser()

        // No user found
        if (!currentUser) {
          setAuthError("Please sign in to access this page")
          // Delay redirect to show error message briefly
          setTimeout(() => {
            router.push("/auth")
          }, 2000)
          return
        }

        // Check if user account is active
        if (currentUser.isActive === false) {
          setAuthError("Your account has been deactivated. Please contact administration.")
          setTimeout(() => {
            router.push("/auth")
          }, 3000)
          return
        }

        setUser(currentUser)

        // Check role authorization
        if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
          setAuthError(`Access denied. This page is restricted to ${allowedRoles.join(", ")} users.`)
          // Redirect to user's dashboard
          setTimeout(() => {
            router.push(`/dashboard/${currentUser.role}`)
          }, 2000)
          return
        }

        // All checks passed
        setIsAuthorized(true)
      } catch (error) {
        console.error("Auth check error:", error)
        setAuthError("Authentication error occurred. Please try signing in again.")
        setTimeout(() => {
          router.push("/auth")
        }, 2000)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [allowedRoles, router, requireAuth, pathname])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Verifying Access</h2>
            <p className="text-sm text-gray-600">Please wait while we check your credentials</p>
          </div>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-100 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-xl text-red-700">Access Denied</CardTitle>
            <CardDescription className="text-red-600">
              {authError}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <Lock className="h-4 w-4" />
              <AlertDescription className="text-red-700">
                You don't have permission to access this resource.
              </AlertDescription>
            </Alert>
            
            <p className="text-sm text-gray-600">
              You will be redirected automatically, or click below to continue.
            </p>
            
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => router.push("/auth")}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Sign In Again
              </Button>
              {user && (
                <Button 
                  variant="outline"
                  onClick={() => router.push(`/dashboard/${user.role}`)}
                  className="w-full"
                >
                  Go to My Dashboard
                </Button>
              )}
              <Button 
                variant="ghost"
                onClick={() => router.push("/")}
                className="w-full"
              >
                Back to Home
              </Button>
            </div>

            {/* Help Section */}
            <div className="border-t pt-4 text-left">
              <h4 className="font-medium text-gray-800 mb-2">Need Help?</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Make sure you're signed in with the correct account</li>
                <li>• Check that your account has the required permissions</li>
                <li>• Contact your system administrator if the issue persists</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Authorized state
  if (isAuthorized) {
    return <>{children}</>
  }

  // Fallback - should not reach here
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Checking access permissions...</p>
      </div>
    </div>
  )
}

// Higher Order Component for page-level protection
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles?: string[]
) {
  const AuthenticatedComponent = (props: P) => {
    return (
      <AuthGuard allowedRoles={allowedRoles}>
        <WrappedComponent {...props} />
      </AuthGuard>
    )
  }

  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`
  
  return AuthenticatedComponent
}

// Hook for checking auth in components with Supabase
export function useAuthGuard() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true)
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        setError(null)
      } catch (err: any) {
        console.error('Auth check error:', err)
        setError(err.message || "Failed to get user information")
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const hasRole = (requiredRole: string): boolean => {
    return user ? user.role === requiredRole : false
  }

  const hasAnyRole = (requiredRoles: string[]): boolean => {
    return user ? requiredRoles.includes(user.role) : false
  }

  const hasPermission = (requiredRole: string): boolean => {
    if (!user) return false
    
    const roleHierarchy = ['student', 'teacher', 'tp-officer', 'admin']
    const userRoleIndex = roleHierarchy.indexOf(user.role)
    const requiredRoleIndex = roleHierarchy.indexOf(requiredRole)
    
    return userRoleIndex >= requiredRoleIndex
  }

  return { 
    user, 
    isLoading, 
    error, 
    isAuthenticated: !!user,
    hasRole,
    hasAnyRole,
    hasPermission
  }
}

// Role-specific guard components
export function StudentGuard({ children }: { children: React.ReactNode }) {
  return <AuthGuard allowedRoles={['student']}>{children}</AuthGuard>
}

export function TeacherGuard({ children }: { children: React.ReactNode }) {
  return <AuthGuard allowedRoles={['teacher']}>{children}</AuthGuard>
}

export function TPOfficerGuard({ children }: { children: React.ReactNode }) {
  return <AuthGuard allowedRoles={['tp-officer']}>{children}</AuthGuard>
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  return <AuthGuard allowedRoles={['admin']}>{children}</AuthGuard>
}

export function StaffGuard({ children }: { children: React.ReactNode }) {
  return <AuthGuard allowedRoles={['teacher', 'tp-officer', 'admin']}>{children}</AuthGuard>
}