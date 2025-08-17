// app/auth/page.tsx - COMPLETELY FIXED
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
  
  // Use auth context to check current state
  const { user, isLoading: authLoading, isInitialized } = useAuth()
  
  // Prevent multiple redirects
  const redirectRef = useRef(false)

  // Handle redirect when user is already authenticated
  useEffect(() => {
    // Only proceed if auth is initialized and not loading
    if (!isInitialized || authLoading) {
      console.log('🔄 Auth not ready yet, waiting...', { isInitialized, authLoading })
      return
    }
    
    // If user exists and we haven't redirected yet
    if (user && !redirectRef.current) {
      console.log('✅ User already authenticated, redirecting to:', user.role)
      redirectRef.current = true
      router.replace(`/dashboard/${user.role}`)
      return
    }

    // If no user and auth is ready, user can proceed with login
    if (!user) {
      console.log('ℹ️ No authenticated user, showing login form')
    }
    
  }, [user, isInitialized, authLoading, router])

  const handleGoogleLogin = async () => {
    // Prevent multiple clicks or if already redirecting
    if (isLoading || redirectRef.current) {
      console.log('⏭️ Login already in progress or redirecting')
      return
    }
    
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      console.log('🔗 Starting Google OAuth flow...')
      
      const result = await signInWithGoogle()

      if (result.success) {
        setSuccess("Redirecting to Google for authentication...")
        toast({
          title: "Redirecting...",
          description: "Taking you to Google for secure authentication.",
        })
        console.log('🔄 OAuth redirect initiated')
      } else {
        throw new Error(result.error || "Failed to initiate Google sign-in")
      }

    } catch (error: any) {
      console.error('❌ Login error:', error)
      const errorMessage = error.message || "Login failed. Please try again."
      setError(errorMessage)
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      })
      setIsLoading(false)
    }
    // Note: Don't set isLoading(false) on success since we're redirecting
  }

  // Show loading while auth is initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="shadow-xl">
          <CardContent className="p-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-gray-600">Initializing authentication...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show loading while checking session or redirecting
  if (authLoading || redirectRef.current) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="shadow-xl">
          <CardContent className="p-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-gray-600">
                {redirectRef.current ? 'Redirecting to your dashboard...' : 'Checking your session...'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main auth form (only shown when no user and auth is ready)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-4">
            <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Home
            </Link>
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Sign In to IMS</CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Use your institutional Google account to access your dashboard
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}

            {/* Information Alert */}
            {!isLoading && !error && !success && (
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  Click below to sign in with your institutional Google account
                </AlertDescription>
              </Alert>
            )}

            {/* Google Sign In Button */}
            <Button 
              className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg" 
              size="lg" 
              onClick={handleGoogleLogin} 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Signing in with Google...
                </div>
              ) : (
                <div className="flex items-center">
                  <Chrome className="h-5 w-5 mr-2" />
                  Sign in with Google
                </div>
              )}
            </Button>

            {/* Supported Domains Info */}
            <div className="bg-gray-50 rounded-lg p-4 text-center space-y-2">
              <p className="text-sm font-medium text-gray-700">Supported institutional domains:</p>
              <div className="flex flex-col space-y-1">
                <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded">@charusat.edu.in (Students)</span>
                <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded">@charusat.ac.in (Faculty/Staff)</span>
              </div>
            </div>

            {/* Help Section */}
            <div className="border-t border-gray-200 pt-4">
              <details className="group">
                <summary className="cursor-pointer font-medium text-gray-800 mb-2 flex items-center justify-between">
                  Having trouble signing in?
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <ul className="text-xs text-gray-600 space-y-2 mt-2 pl-4">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Make sure you're using your institutional email
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Enable pop-ups for this site
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Clear your browser cache and try again
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Contact IT support if problems persist
                  </li>
                </ul>
              </details>
            </div>

            {/* Privacy Notice */}
            <div className="text-center border-t border-gray-200 pt-4">
              <p className="text-xs text-gray-500">
                By signing in, you agree to our{' '}
                <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}