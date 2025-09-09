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
  const [currentStep, setCurrentStep] = useState('initializing')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout

    const processCallback = async () => {
      if (!mounted) return

      try {
        console.log('🔄 Starting auth callback processing...')
        setIsLoading(true)
        setError(null)
        setCurrentStep('checking-params')
        setProgress(10)

        // Check for error parameters first
        const errorParam = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        
        if (errorParam) {
          const errorMessage = errorDescription || 'Authentication failed'
          console.error('❌ OAuth error:', errorParam, errorDescription)
          setError(errorMessage)
          setIsLoading(false)
          return
        }

        // Step 1: Verify we have auth code/session
        setCurrentStep('verifying-session')
        setProgress(25)
        await new Promise(resolve => setTimeout(resolve, 500))

        if (!mounted) return

        // Step 2: Process the callback
        setCurrentStep('processing-auth')
        setProgress(50)
        
        console.log('🔐 Processing auth callback...')
        
        const result = await handleAuthCallback()

        if (!mounted) return

        if (result.success && result.user) {
          console.log('✅ Auth callback successful:', result.user.email)
          
          // Step 3: Setting up profile
          setCurrentStep('setting-profile')
          setProgress(75)
          await new Promise(resolve => setTimeout(resolve, 800))

          if (!mounted) return

          // Step 4: Finalizing
          setCurrentStep('finalizing')
          setProgress(100)
          
          setSuccess(true)
          setUser(result.user)
          
          toast({
            title: "Welcome to IMS!",
            description: `Successfully signed in as ${result.user.name}`,
          })

          // Wait before redirect to show success message
          console.log('🔄 Redirecting to dashboard in 2 seconds...')
          timeoutId = setTimeout(() => {
            if (mounted) {
              router.replace(`/dashboard/${result.user!.role}`)
            }
          }, 2000)

        } else {
          console.error('❌ Auth callback failed:', result.error)
          setError(result.error || 'Authentication failed')
          toast({
            title: "Authentication Failed",
            description: result.error || 'Please try signing in again.',
            variant: "destructive",
          })
        }

      } catch (error: any) {
        console.error('❌ Auth callback error:', error)
        
        if (mounted) {
          const errorMessage = error.message?.includes('Invalid institutional email') 
            ? 'Please use your institutional email (@charusat.edu.in or @charusat.ac.in)'
            : error.message?.includes('Failed to create user profile')
            ? 'Account setup failed. Please contact support.'
            : 'An unexpected error occurred during authentication'
            
          setError(errorMessage)
          toast({
            title: "Authentication Error",
            description: errorMessage,
            variant: "destructive",
          })
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    // Wait a bit for URL params to be ready, then process
    const initTimer = setTimeout(() => {
      if (mounted) {
        processCallback()
      }
    }, 1000) // Increased delay to ensure everything is ready

    return () => {
      mounted = false
      clearTimeout(initTimer)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [router, toast, searchParams])

  const getStepStatus = (step: string) => {
    const steps = ['initializing', 'checking-params', 'verifying-session', 'processing-auth', 'setting-profile', 'finalizing']
    const currentIndex = steps.indexOf(currentStep)
    const stepIndex = steps.indexOf(step)
    
    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'current'
    return 'pending'
  }

  const getStepText = (step: string) => {
    const stepTexts = {
      'initializing': 'Initializing authentication...',
      'checking-params': 'Checking OAuth response...',
      'verifying-session': 'Verifying Google account...',
      'processing-auth': 'Processing authentication...',
      'setting-profile': 'Setting up user profile...',
      'finalizing': 'Preparing dashboard...'
    }
    return stepTexts[step as keyof typeof stepTexts] || step
  }

  // Loading state
  if (isLoading) {
    const steps = [
      { key: 'verifying-session', icon: Shield, text: "Verifying Google account" },
      { key: 'processing-auth', icon: Users, text: "Checking institutional email" },
      { key: 'setting-profile', icon: BookOpen, text: "Setting up user profile" },
      { key: 'finalizing', icon: Zap, text: "Preparing dashboard" }
    ]

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
                {getStepText(currentStep)}
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-center text-sm text-gray-600">{progress}% complete</p>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              {steps.map((step, index) => {
                const status = getStepStatus(step.key)
                return (
                  <div key={step.key} className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                      status === 'completed' 
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg scale-110' 
                        : status === 'current'
                        ? 'bg-gradient-to-br from-blue-400 to-blue-500 shadow-lg animate-pulse'
                        : 'bg-gray-200'
                    }`}>
                      {status === 'completed' ? (
                        <CheckCircle className="h-4 w-4 text-white" />
                      ) : status === 'current' ? (
                        <Loader2 className="h-4 w-4 text-white animate-spin" />
                      ) : (
                        <step.icon className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                    <span className={`text-sm transition-colors ${
                      status === 'completed' ? 'text-green-700 font-medium' 
                      : status === 'current' ? 'text-blue-700 font-medium'
                      : 'text-gray-500'
                    }`}>
                      {step.text}
                    </span>
                  </div>
                )
              })}
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
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
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
                    <p>• Role: {user.role.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
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
                onClick={() => router.replace(`/dashboard/${user.role}`)}
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
                onClick={() => {
                  // Clear any stored state and redirect to auth
                  sessionStorage.clear()
                  localStorage.removeItem('supabase.auth.token')
                  router.replace('/auth')
                }}
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

          {/* Troubleshooting */}
          <div className="border-t pt-4">
            <details className="group">
              <summary className="cursor-pointer font-medium text-gray-800 mb-2 flex items-center justify-between">
                Troubleshooting Tips
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <ul className="text-xs text-gray-600 space-y-1 mt-2">
                <li>• Use your institutional email (@charusat.edu.in or @charusat.ac.in)</li>
                <li>• Make sure pop-ups are enabled for this site</li>
                <li>• Try using an incognito/private browsing window</li>
                <li>• Clear your browser cache and cookies</li>
                <li>• Ensure you have a stable internet connection</li>
                <li>• Contact IT support if the problem persists</li>
              </ul>
            </details>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading authentication...</p>
          </div>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}