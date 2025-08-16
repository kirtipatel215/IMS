"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Users, Building, FileText, Award, BarChart3, Shield } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getCurrentUser } from "@/lib/data"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    }
  }, [])

  const handleGetStarted = () => {
    if (user) {
      router.push(`/dashboard/${user.role}`)
    } else {
      router.push("/auth")
    }
  }

  const features = [
    {
      icon: Users,
      title: "Student Management",
      description: "Comprehensive student portal for internship applications, NOC requests, and progress tracking.",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: Building,
      title: "Company Verification",
      description: "Streamlined company verification process ensuring quality internship opportunities.",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      icon: FileText,
      title: "Document Management",
      description: "Centralized document handling for NOCs, reports, certificates, and applications.",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      icon: Award,
      title: "Certificate Approval",
      description: "Faculty-driven certificate approval workflow with feedback and grading system.",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Comprehensive analytics dashboard for placement statistics and performance metrics.",
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      icon: Shield,
      title: "Role-based Access",
      description: "Secure role-based access control for students, faculty, T&P officers, and administrators.",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
  ]

  const stats = [
    { label: "Active Students", value: "500+", color: "text-blue-600" },
    { label: "Partner Companies", value: "150+", color: "text-green-600" },
    { label: "Successful Placements", value: "85%", color: "text-purple-600" },
    { label: "Faculty Members", value: "50+", color: "text-orange-600" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">IMS</span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="capitalize">
                    {user.role.replace("-", " ")}
                  </Badge>
                  <Button onClick={handleGetStarted}>
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Link href="/auth">
                  <Button>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Internship Management
              <span className="block text-blue-600">Made Simple</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Streamline your internship workflow with our comprehensive management system. From applications to
              certificates, manage everything in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 py-3">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 bg-transparent">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-3xl sm:text-4xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                <div className="text-gray-600 text-sm sm:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage internships efficiently and effectively
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students and faculty already using our platform to manage internships effectively.
          </p>
          <Button size="lg" variant="secondary" onClick={handleGetStarted} className="text-lg px-8 py-3">
            Start Your Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold">Internship Management System</span>
              </div>
              <p className="text-gray-400 mb-4">
                Streamlining internship management for educational institutions with comprehensive workflow automation.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/auth" className="hover:text-white transition-colors">
                    Student Portal
                  </Link>
                </li>
                <li>
                  <Link href="/auth" className="hover:text-white transition-colors">
                    Faculty Portal
                  </Link>
                </li>
                <li>
                  <Link href="/auth" className="hover:text-white transition-colors">
                    T&P Portal
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>Contact Support</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Internship Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
