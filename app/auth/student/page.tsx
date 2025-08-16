import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chrome, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function StudentAuth() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
          <CardTitle className="text-2xl">Student Login</CardTitle>
          <CardDescription>Sign in with your @charusat.edu.in email address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/dashboard/student">
            <Button className="w-full" size="lg">
              <Chrome className="h-5 w-5 mr-2" />
              Continue with Google
            </Button>
          </Link>
          <p className="text-xs text-center text-gray-500">Only @charusat.edu.in email addresses are allowed</p>
        </CardContent>
      </Card>
    </div>
  )
}
