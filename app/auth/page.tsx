// app/auth/page.tsx - FIXED Authentication Page
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Chrome, ArrowLeft, Loader2, Shield, AlertCircle, CheckCircle, Info } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { signInWithGoogle } from "@/lib/auth-supabase"

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()
  const { toast } = useToast()
  
  // Use auth context
  const { user, isLoading: authLoading, isInitialized } = useAuth()
  
  // Prevent multiple redirects
  const hasRedirected = useRef(false)

  // Check if user is already logged in
  useEffect(() => {
    // Wait for auth to initialize
    if (!isInitialized) {
      console.log('Auth not initialized yet, waiting...')
      return
    }
    
    if (authLoading) {
      console.log('Auth still loading, waiting...')
      return
    }
    
    // Redirect if user is already logged in
    if (user && !hasRedirected.current) {
      console.log('User already logged in, redirecting to dashboard:', user.role)
      hasRedirected.current = true
      router.replace(`/dashboard/${user.role}`)
      return
    }

    // If no user and auth is initialized, we can show the login form
    if (!user && isInitialized && !authLoading) {
      console.log('No user found, showing login form')
    }
  }, [user, isInitialized, authLoading, router])

  const handleGoogleLogin = async () => {
    if (isLoading || hasRedirected.current) return
    
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      console.log('Starting Google OAuth flow...')
      
      const result = await signInWithGoogle()

      if (result.success) {
        setSuccess("Redirecting to Google for authentication...")
        toast({
          title: "Redirecting...",
          description: "Taking you to Google for secure authentication.",
        })
      } else {
        throw new Error(result.error || "Failed to initiate Google sign-in")
      }

    } catch (error: any) {
      console.error("Login error:", error)
      const errorMessage = error.message || "Login failed. Please try again."
      setError(errorMessage)
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      if (!hasRedirected.current) {
        setIsLoading(false)
      }
    }
  }

  // Show loading while auth is initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="shadow-xl">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Initializing authentication...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show loading while checking session or redirecting
  if (authLoading || hasRedirected.current) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="shadow-xl">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">
              {hasRedirected.current ? 'Redirecting to dashboard...' : 'Checking your session...'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-4">
            <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Home
            </Link>
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Sign In to IMS</CardTitle>
            <CardDescription className="text-gray-600">
              Use your institutional Google account to access your dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Information Alert */}
            {!isLoading && !error && !success && (
              <Alert className="border-blue-200 bg-blue-50 text-blue-800">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Click below to sign in with your institutional Google account
                </AlertDescription>
              </Alert>
            )}

            {/* Google Sign In Button */}
            <Button 
              className="w-full h-12 text-base" 
              size="lg" 
              onClick={handleGoogleLogin} 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Signing in with Google...
                </>
              ) : (
                <>
                  <Chrome className="h-5 w-5 mr-2" />
                  Sign in with Google
                </>
              )}
            </Button>

            {/* Supported Domains Info */}
            <div className="text-center space-y-2">
              <p className="text-xs text-gray-500">Supported institutional domains:</p>
              <div className="flex flex-col space-y-1">
                <p className="text-xs text-gray-500">@charusat.edu.in (Students)</p>
                <p className="text-xs text-gray-500">@charusat.ac.in (Faculty/Staff)</p>
              </div>
            </div>

            {/* Help Section */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-800 mb-2">Having trouble signing in?</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Make sure you're using your institutional email</li>
                <li>• Enable pop-ups for this site</li>
                <li>• Clear your browser cache and try again</li>
                <li>• Contact IT support if problems persist</li>
              </ul>
            </div>

            {/* Privacy Notice */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}