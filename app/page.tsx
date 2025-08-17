// app/auth/page.tsx - FIXED Authentication Page (No Redirect Loops)
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Chrome, ArrowLeft, Loader2, Shield, AlertCircle, CheckCircle, Info } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { 
  signInWithGoogle, 
  getCurrentUser,
  isSessionValid
} from "@/lib/auth-supabase"

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [checkingSession, setCheckingSession] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  
  // Prevent multiple session checks and redirects
  const hasCheckedSession = useRef(false)
  const hasRedirected = useRef(false)

  // Check if user is already logged in - ONLY ONCE
  useEffect(() => {
    // Prevent multiple session checks
    if (hasCheckedSession.current || hasRedirected.current) return
    
    const checkExistingSession = async () => {
      try {
        hasCheckedSession.current = true
        setCheckingSession(true)
        
        // Check if session is valid
        const isValid = await isSessionValid()
        if (!isValid) {
          console.log('No valid session found')
          setCheckingSession(false)
          return
        }

        // Get current user if session is valid
        const currentUser = await getCurrentUser()
        if (currentUser && !hasRedirected.current) {
          console.log('User already logged in, redirecting to dashboard')
          hasRedirected.current = true
          router.replace(`/dashboard/${currentUser.role}`)
          return
        }
      } catch (error) {
        console.error('Error checking existing session:', error)
      } finally {
        if (!hasRedirected.current) {
          setCheckingSession(false)
        }
      }
    }

    checkExistingSession()
  }, [router]) // Only depend on router, not on state

  const handleGoogleLogin = async () => {
    if (isLoading || hasRedirected.current) return // Prevent multiple clicks
    
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
        
        // The OAuth flow will handle the redirect
        // No need to manually redirect here
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

  // Show loading while checking existing session
  if (checkingSession || hasRedirected.current) {
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
              disabled={isLoading || hasRedirected.current}
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