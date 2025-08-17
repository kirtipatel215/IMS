// app/auth/callback/page.tsx - Fixed OAuth callback handler
"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { handleAuthCallback } from '@/lib/auth-supabase'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertCircle, ArrowLeft, Shield, Zap, Users, BookOpen } from 'lucide-react'
import Link from 'next/link'

function AuthCallbackContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [progress, setProgress] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log('Processing auth callback...')
        setIsLoading(true)
        setError(null)

        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 90) return prev
            return prev + 10
          })
        }, 200)

        // Check for error parameters first
        const errorParam = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        
        if (errorParam) {
          clearInterval(progressInterval)
          const errorMessage = errorDescription || 'Authentication failed'
          setError(errorMessage)
          toast({
            title: "Authentication Error",
            description: errorMessage,
            variant: "destructive",
          })
          return
        }

        // Handle the OAuth callback
        const result = await handleAuthCallback()
        clearInterval(progressInterval)
        setProgress(100)

        if (result.success && result.user) {
          setSuccess(true)
          setUser(result.user)
          
          toast({
            title: "Welcome to IMS!",
            description: `Successfully signed in as ${result.user.name}`,
          })

          // Redirect to appropriate dashboard after short delay
          setTimeout(() => {
            router.push(`/dashboard/${result.user!.role}`)
          }, 2000)

        } else {
          setError(result.error || 'Authentication failed')
          toast({
            title: "Authentication Failed",
            description: result.error || 'Please try signing in again.',
            variant: "destructive",
          })
        }

      } catch (error: any) {
        console.error('Auth callback error:', error)
        setError('An unexpected error occurred during authentication')
        toast({
          title: "Authentication Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    // Process callback with a small delay to ensure URL parameters are available
    const timer = setTimeout(processCallback, 1000)
    
    return () => clearTimeout(timer)
  }, [router, toast, searchParams])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center space-y-6 pb-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <Shield className="h-10 w-10 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Verifying Your Account
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Please wait while we set up your personalized dashboard...
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-center text-sm text-gray-600">{progress}% complete</p>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              {[
                { icon: Shield, text: "Verifying Google account", completed: progress > 20 },
                { icon: Users, text: "Checking institutional email", completed: progress > 40 },
                { icon: BookOpen, text: "Setting up user profile", completed: progress > 60 },
                { icon: Zap, text: "Preparing dashboard", completed: progress > 80 }
              ].map((step, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    step.completed 
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg' 
                      : 'bg-gray-200'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="h-4 w-4 text-white" />
                    ) : (
                      <step.icon className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                  <span className={`text-sm transition-colors ${
                    step.completed ? 'text-green-700 font-medium' : 'text-gray-500'
                  }`}>
                    {step.text}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-center pt-4">
              <div className="inline-flex items-center text-xs text-gray-500">
                <Loader2 className="h-3 w-3 animate-spin mr-2" />
                Securing your session...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state
  if (success && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Welcome to IMS!
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Your account has been successfully verified
              </p>
            </div>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <Alert className="border-green-200 bg-green-50 text-left">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                <div className="space-y-2">
                  <p className="font-medium">Account verified successfully!</p>
                  <div className="text-sm space-y-1">
                    <p>• Name: {user.name}</p>
                    <p>• Email: {user.email}</p>
                    <p>• Role: {user.role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                    <p>• Department: {user.department || 'Not specified'}</p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <p className="text-gray-600">
                Redirecting you to your personalized dashboard...
              </p>
              <div className="flex justify-center">
                <div className="inline-flex items-center text-sm text-green-600">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Preparing {user.role.replace('-', ' ')} dashboard
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                onClick={() => router.push(`/dashboard/${user.role}`)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              >
                Continue to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg">
              <AlertCircle className="h-10 w-10 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
              Authentication Failed
            </CardTitle>
            <p className="text-gray-600 mt-2">
              We couldn't verify your account
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="destructive" className="border-red-200 bg-red-50 text-left">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-700">
              <div className="space-y-2">
                <p className="font-medium">Authentication Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </AlertDescription>
          </Alert>
          
          <div className="text-center space-y-4">
            <p className="text-gray-600 text-sm">
              Please try one of the options below:
            </p>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => router.push('/auth')}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                Try Again
              </Button>
              <Link href="/" className="w-full">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>

          {/* Common Issues */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-800 mb-2">Common Issues:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Make sure you're using a @charusat.edu.in or @charusat.ac.in email</li>
              <li>• Check that pop-ups are enabled in your browser</li>
              <li>• Try clearing your browser cache and cookies</li>
              <li>• Ensure you have a stable internet connection</li>
              <li>• Contact IT support if the problem persists</li>
            </ul>
          </div>

          {/* Technical Details for Debug */}
          {process.env.NODE_ENV === 'development' && (
            <div className="border-t pt-4">
              <details className="text-xs">
                <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                  Debug Information (Development Only)
                </summary>
                <div className="bg-gray-100 p-3 rounded text-gray-600 font-mono">
                  <p>Error: {error}</p>
                  <p>URL Params: {searchParams.toString()}</p>
                  <p>Timestamp: {new Date().toISOString()}</p>
                </div>
              </details>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}