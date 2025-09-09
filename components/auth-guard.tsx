
"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { Loader2, AlertTriangle, Shield, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/AuthContext"

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
  const { user, isLoading, isInitialized, error: authError } = useAuth()
  const router = useRouter()

  // Loading state (before session hydration or during fetch)
  if (!isInitialized || isLoading) {
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
            <CardTitle className="text-xl text-red-700">Authentication Error</CardTitle>
            <CardDescription className="text-red-600">
              {authError}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <Button 
              onClick={() => router.push("/auth")}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Sign In Again
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push("/")}
              className="w-full"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No user and authentication required
  if (requireAuth && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Please Sign In</CardTitle>
            <CardDescription>
              You need to be signed in to access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Button onClick={() => router.push("/auth")} className="w-full">
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Role restriction check
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-100 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-xl text-orange-700">Access Denied</CardTitle>
            <CardDescription className="text-orange-600">
              Required roles: {allowedRoles.join(", ")}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Your current role ({user?.role}) doesn’t have access.
            </p>
            <Button 
              onClick={() => router.push(`/dashboard/${user?.role}`)}
              className="w-full"
            >
              Go to My Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Authorized state
  return <>{children}</>
}

// Higher Order Component
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
