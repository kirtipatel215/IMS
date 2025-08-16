"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chrome, ArrowLeft, Loader2, Shield } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const getUserRole = (email: string): string | null => {
    if (email.endsWith("@charusat.edu.in")) {
      return "student"
    } else if (email.endsWith("@charusat.ac.in")) {
      if (email.includes("admin") || email === "admin@charusat.ac.in") {
        return "admin"
      } else if (email.includes("tp") || email === "tp@charusat.ac.in") {
        return "tp-officer"
      } else {
        return "teacher"
      }
    }
    return null
  }

  const getNameFromEmail = (email: string): string => {
    const name = email.split("@")[0]
    return name
      .split(".")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)

    try {
      // In a real implementation, this would integrate with Google OAuth
      // For demo purposes, we'll simulate the Google authentication flow
      
      // Simulate Google OAuth response with different email scenarios
      const demoEmails = [
        "john.doe@charusat.edu.in",
        "sarah.wilson@charusat.ac.in", 
        "tp@charusat.ac.in",
        "admin@charusat.ac.in"
      ]
      
      // In production, you would get this from Google OAuth response
      // const googleResponse = await signInWithGoogle()
      // const userEmail = googleResponse.user.email
      
      // For demo, we'll use a random demo email
      const simulatedEmail = demoEmails[Math.floor(Math.random() * demoEmails.length)]
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const role = getUserRole(simulatedEmail)
      
      if (!role) {
        toast({
          title: "Access Denied",
          description: "Your Google account is not associated with a valid institutional email. Please contact IT support.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const userData = {
        id: Math.floor(Math.random() * 1000) + 1,
        email: simulatedEmail,
        role,
        name: getNameFromEmail(simulatedEmail),
        loginTime: new Date().toISOString(),
        // In production, you'd also store:
        // picture: googleResponse.user.picture,
        // googleId: googleResponse.user.id,
      }

      // Note: In production, you should use secure session management instead of localStorage
      localStorage.setItem("user", JSON.stringify(userData))

      toast({
        title: "Login Successful",
        description: `Welcome ${userData.name}! Redirecting to ${role.replace("-", " ")} dashboard...`,
      })

      setTimeout(() => {
        router.push(`/dashboard/${role}`)
      }, 1000)

    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login Failed",
        description: "Unable to complete Google authentication. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
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
            <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
            <CardDescription className="text-gray-600">
              Use your institutional Google account to access the appropriate portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Role Information */}
            <div className="p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-sm font-medium text-gray-800 mb-2">Access Levels:</h3>
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex items-center justify-between">
                  <span>@charusat.edu.in</span>
                  <span className="text-blue-600 font-medium">Student Portal</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>@charusat.ac.in</span>
                  <span className="text-green-600 font-medium">Faculty Portal</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>tp@charusat.ac.in</span>
                  <span className="text-purple-600 font-medium">T&P Portal</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>admin@charusat.ac.in</span>
                  <span className="text-orange-600 font-medium">Admin Portal</span>
                </div>
              </div>
            </div>

            {/* Google Sign In Button */}
            <Button 
              className="w-full h-12 text-base font-medium" 
              size="lg" 
              onClick={handleGoogleLogin} 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Authenticating with Google...
                </>
              ) : (
                <>
                  <Chrome className="h-5 w-5 mr-2" />
                  Sign in with Google
                </>
              )}
            </Button>

            {/* Security Note */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                🔒 Secure authentication through your institutional Google account
              </p>
            </div>

            {/* Demo Note */}
            <div className="border-t pt-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700 font-medium mb-1">Demo Mode Active</p>
                <p className="text-xs text-blue-600">
                  In production, this will authenticate with your actual Google account and automatically determine your role based on your email domain.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}