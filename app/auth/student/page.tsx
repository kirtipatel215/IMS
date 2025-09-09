"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Chrome, ArrowLeft, Loader2, GraduationCap, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { setCurrentUser, getNameFromEmail } from "@/lib/auth"

export default function StudentAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleGoogleLogin = async () => {
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Simulate student Google OAuth response
      const studentEmail = "john.doe@charusat.edu.in"
      
      const userData = {
        id: Math.floor(Math.random() * 1000) + 1,
        email: studentEmail,
        role: "student" as const,
        name: getNameFromEmail(studentEmail),
        loginTime: new Date().toISOString(),
        department: "Computer Engineering"
      }

      setCurrentUser(userData)

      setSuccess("Login successful! Redirecting to student dashboard...")
      toast({
        title: "Login Successful",
        description: "Welcome to the student portal!",
      })

      setTimeout(() => {
        router.push("/dashboard/student")
      }, 1000)

    } catch (error) {
      setError("Login failed. Please try again.")
      toast({
        title: "Login Failed",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Student Login</CardTitle>
          <CardDescription>Sign in with your @charusat.edu.in Google account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Button 
            className="w-full h-12" 
            size="lg" 
            onClick={handleGoogleLogin} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Chrome className="h-5 w-5 mr-2" />
                Sign in with Google
              </>
            )}
          </Button>
          
          <p className="text-xs text-center text-gray-500">
            Only @charusat.edu.in Google accounts are allowed
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// app/auth/teacher/page.tsx - Teacher Google Auth
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Chrome, ArrowLeft, Loader2, BookOpen, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { setCurrentUser, getNameFromEmail } from "@/lib/auth"

export default function TeacherAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleGoogleLogin = async () => {
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      const teacherEmail = "sarah.wilson@charusat.ac.in"
      
      const userData = {
        id: Math.floor(Math.random() * 1000) + 1,
        email: teacherEmail,
        role: "teacher" as const,
        name: "Dr. " + getNameFromEmail(teacherEmail),
        loginTime: new Date().toISOString(),
        department: "Computer Engineering",
        designation: "Associate Professor",
        employeeId: "EMP001"
      }

      setCurrentUser(userData)

      setSuccess("Login successful! Redirecting to faculty dashboard...")
      toast({
        title: "Login Successful",
        description: "Welcome to the faculty portal!",
      })

      setTimeout(() => {
        router.push("/dashboard/teacher")
      }, 1000)

    } catch (error) {
      setError("Login failed. Please try again.")
      toast({
        title: "Login Failed",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Faculty Login</CardTitle>
          <CardDescription>Sign in with your @charusat.ac.in Google account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Button 
            className="w-full h-12 bg-green-600 hover:bg-green-700" 
            size="lg" 
            onClick={handleGoogleLogin} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Chrome className="h-5 w-5 mr-2" />
                Sign in with Google
              </>
            )}
          </Button>
          
          <p className="text-xs text-center text-gray-500">
            Only @charusat.ac.in Google accounts are allowed
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// app/auth/tp-officer/page.tsx - T&P Officer Google Auth
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Chrome, ArrowLeft, Loader2, Briefcase, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { setCurrentUser } from "@/lib/auth"

export default function TPOfficerAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleGoogleLogin = async () => {
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      const userData = {
        id: 3,
        email: "tp@charusat.ac.in",
        role: "tp-officer" as const,
        name: "TP Officer",
        loginTime: new Date().toISOString(),
        department: "Training & Placement",
        designation: "T&P Officer",
        employeeId: "TPO001"
      }

      setCurrentUser(userData)

      setSuccess("Login successful! Redirecting to T&P dashboard...")
      toast({
        title: "Login Successful",
        description: "Welcome to the T&P portal!",
      })

      setTimeout(() => {
        router.push("/dashboard/tp-officer")
      }, 1000)

    } catch (error) {
      setError("Login failed. Please try again.")
      toast({
        title: "Login Failed",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">T&P Officer Login</CardTitle>
          <CardDescription>Sign in with your authorized Google account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Button 
            className="w-full h-12 bg-purple-600 hover:bg-purple-700" 
            size="lg" 
            onClick={handleGoogleLogin} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Chrome className="h-5 w-5 mr-2" />
                Sign in with Google
              </>
            )}
          </Button>
          
          <p className="text-xs text-center text-gray-500">
            Admin privileges required
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// app/auth/admin/page.tsx - Admin Google Auth
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Chrome, ArrowLeft, Loader2, Shield, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { setCurrentUser } from "@/lib/auth"

export default function AdminAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleGoogleLogin = async () => {
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      const userData = {
        id: 4,
        email: "admin@charusat.ac.in",
        role: "admin" as const,
        name: "Admin User",
        loginTime: new Date().toISOString(),
        department: "Administration",
        designation: "System Administrator",
        employeeId: "ADM001"
      }

      setCurrentUser(userData)

      setSuccess("Login successful! Redirecting to admin dashboard...")
      toast({
        title: "Login Successful",
        description: "Welcome to the admin portal!",
      })

      setTimeout(() => {
        router.push("/dashboard/admin")
      }, 1000)

    } catch (error) {
      setError("Login failed. Please try again.")
      toast({
        title: "Login Failed",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Super Admin Login</CardTitle>
          <CardDescription>System administrator access</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Button 
            className="w-full h-12 bg-red-600 hover:bg-red-700" 
            size="lg" 
            onClick={handleGoogleLogin} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Chrome className="h-5 w-5 mr-2" />
                Sign in with Google
              </>
            )}
          </Button>
          
          <p className="text-xs text-center text-gray-500">
            Super admin privileges required
          </p>
        </CardContent>
      </Card>
    </div>
  )
}