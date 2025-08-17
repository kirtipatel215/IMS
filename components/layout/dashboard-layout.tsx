// components/layout/dashboard-layout.tsx - Fixed Dashboard Layout
"use client"

import type React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { getCurrentUser } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { AuthGuard } from "../auth-guard"
import { Loader2, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface DashboardLayoutProps {
  children: React.ReactNode
  allowedRoles?: string[]
  pageTitle?: string
}

export function DashboardLayout({ 
  children, 
  allowedRoles = [],
  pageTitle = "Dashboard"
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Memoize allowed roles to prevent recreation
  const memoizedAllowedRoles = useMemo(() => allowedRoles, [allowedRoles])

  // Memoize callback functions
  const handleSidebarOpen = useCallback(() => {
    setSidebarOpen(true)
  }, [])

  const handleSidebarClose = useCallback(() => {
    setSidebarOpen(false)
  }, [])

  const redirectToAuth = useCallback(() => {
    router.push("/auth")
  }, [router])

  const redirectToHome = useCallback(() => {
    router.push("/")
  }, [router])

  const redirectToUserDashboard = useCallback((userRole: string) => {
    router.push(`/dashboard/${userRole}`)
  }, [router])

  useEffect(() => {
    let isMounted = true

    const initializeUser = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const currentUser = getCurrentUser()
        
        if (!isMounted) return

        if (!currentUser) {
          setError("No user session found")
          setTimeout(() => redirectToAuth(), 2000)
          return
        }

        // Check if user role is allowed
        if (memoizedAllowedRoles.length > 0 && !memoizedAllowedRoles.includes(currentUser.role)) {
          setError(`Access denied. Required roles: ${memoizedAllowedRoles.join(", ")}`)
          setTimeout(() => redirectToUserDashboard(currentUser.role), 2000)
          return
        }

        setUser(currentUser)
      } catch (err) {
        console.error("Dashboard initialization error:", err)
        if (isMounted) {
          setError("Failed to initialize dashboard")
          setTimeout(() => redirectToAuth(), 2000)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    initializeUser()

    return () => {
      isMounted = false
    }
  }, [memoizedAllowedRoles, redirectToAuth, redirectToUserDashboard])

  // Memoize loading component
  const loadingComponent = useMemo(() => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Loading Dashboard...</h2>
          <p className="text-sm text-gray-600">Please wait while we set up your workspace</p>
        </div>
      </div>
    </div>
  ), [])

  // Memoize error component
  const errorComponent = useMemo(() => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-xl text-red-700">Dashboard Error</CardTitle>
          <CardDescription className="text-red-600">
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            You will be redirected automatically, or click below to continue.
          </p>
          <div className="flex flex-col gap-2">
            <Button 
              onClick={redirectToAuth}
              className="w-full"
            >
              Sign In Again
            </Button>
            <Button 
              variant="outline"
              onClick={redirectToHome}
              className="w-full"
            >
              Go to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  ), [error, redirectToAuth, redirectToHome])

  // Memoize no user component
  const noUserComponent = useMemo(() => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Session Not Found</h2>
        <p className="text-gray-600 mb-4">Please sign in to access your dashboard</p>
        <Button onClick={redirectToAuth}>
          Sign In
        </Button>
      </div>
    </div>
  ), [redirectToAuth])

  // Loading state
  if (isLoading) {
    return loadingComponent
  }

  // Error state
  if (error) {
    return errorComponent
  }

  // No user state
  if (!user) {
    return noUserComponent
  }

  // Main dashboard layout
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" 
          onClick={handleSidebarClose} 
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        user={user} 
        isOpen={sidebarOpen} 
        onClose={handleSidebarClose} 
      />

      {/* Main content */}
      <div className="lg:pl-64">
        <Header 
          onMenuClick={handleSidebarOpen} 
          user={user}
          pageTitle={pageTitle}
        />
        <main className="min-h-screen bg-gray-50">
          <AuthGuard allowedRoles={memoizedAllowedRoles}>
            {children}
          </AuthGuard>
        </main>
      </div>
    </div>
  )
}

// Specialized layout components for different roles
export function StudentDashboardLayout({ 
  children, 
  pageTitle 
}: { 
  children: React.ReactNode
  pageTitle?: string 
}) {
  const allowedRoles = useMemo(() => ["student"], [])
  
  return (
    <DashboardLayout 
      allowedRoles={allowedRoles} 
      pageTitle={pageTitle}
    >
      {children}
    </DashboardLayout>
  )
}

export function TeacherDashboardLayout({ 
  children, 
  pageTitle 
}: { 
  children: React.ReactNode
  pageTitle?: string 
}) {
  const allowedRoles = useMemo(() => ["teacher"], [])
  
  return (
    <DashboardLayout 
      allowedRoles={allowedRoles} 
      pageTitle={pageTitle}
    >
      {children}
    </DashboardLayout>
  )
}

export function TPOfficerDashboardLayout({ 
  children, 
  pageTitle 
}: { 
  children: React.ReactNode
  pageTitle?: string 
}) {
  const allowedRoles = useMemo(() => ["tp-officer"], [])
  
  return (
    <DashboardLayout 
      allowedRoles={allowedRoles} 
      pageTitle={pageTitle}
    >
      {children}
    </DashboardLayout>
  )
}

export function AdminDashboardLayout({ 
  children, 
  pageTitle 
}: { 
  children: React.ReactNode
  pageTitle?: string 
}) {
  const allowedRoles = useMemo(() => ["admin"], [])
  
  return (
    <DashboardLayout 
      allowedRoles={allowedRoles} 
      pageTitle={pageTitle}
    >
      {children}
    </DashboardLayout>
  )
}