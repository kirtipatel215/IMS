"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  Calendar,
  Award,
  Building,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  BookOpen,
  Users,
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { getStudentDashboardData } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

// Define proper interfaces for type safety
interface DashboardStats {
  nocRequests?: {
    total: number
    pending: number
    approved: number
    rejected: number
  }
  reports?: {
    total: number
    submitted: number
    reviewed: number
    recent: any[]
  }
  certificates?: {
    total: number
    pending: number
    approved: number
    recent: any[]
  }
  opportunities?: {
    total: number
    recent: any[]
  }
  recentActivity?: any[]
}

export default function StudentDashboard() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  
  // Use auth context instead of direct calls
  const { user, isLoading: authLoading, isInitialized } = useAuth()
  
  // Prevent multiple data fetches
  const hasFetchedData = useRef(false)
  const currentUserId = useRef<string | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      // Wait for auth to be ready
      if (!isInitialized || authLoading || !user) {
        setIsLoading(true)
        return
      }

      // Prevent duplicate fetches for same user
      if (hasFetchedData.current && currentUserId.current === user.id) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        hasFetchedData.current = true
        currentUserId.current = user.id

        console.log(`Loading dashboard data for user: ${user.id}`)

        // Get dashboard data with user from context
        const stats = await getStudentDashboardData(user.id)
        
        setDashboardStats(stats || {
          nocRequests: { total: 0, pending: 0, approved: 0, rejected: 0 },
          reports: { total: 0, submitted: 0, reviewed: 0, recent: [] },
          certificates: { total: 0, pending: 0, approved: 0, recent: [] },
          opportunities: { total: 0, recent: [] },
          recentActivity: []
        })

      } catch (error: any) {
        console.error("Error loading dashboard data:", error)
        setError(error.message || "Failed to load dashboard data")
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please refresh the page.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [user, isInitialized, authLoading, toast])

  // Reset fetch flag when user changes
  useEffect(() => {
    if (user && currentUserId.current !== user.id) {
      hasFetchedData.current = false
    }
  }, [user])

  // Safe accessors with defaults
  const nocRequests = dashboardStats.nocRequests || { total: 0, pending: 0, approved: 0, rejected: 0 }
  const reports = dashboardStats.reports || { total: 0, submitted: 0, reviewed: 0, recent: [] }
  const certificates = dashboardStats.certificates || { total: 0, pending: 0, approved: 0, recent: [] }
  const opportunities = dashboardStats.opportunities || { total: 0, recent: [] }
  const recentActivity = dashboardStats.recentActivity || []

  // Calculate progress safely
  const totalReports = reports.total || 0
  const approvedReports = reports.reviewed || 0
  const progressValue = totalReports > 0 ? (approvedReports / totalReports) * 100 : 0

  if (isLoading || authLoading || !isInitialized) {
    return (
      <AuthGuard allowedRoles={["student"]}>
        <DashboardLayout>
          <div className="space-y-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  if (error) {
    return (
      <AuthGuard allowedRoles={["student"]}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="max-w-md">
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => {
                  hasFetchedData.current = false
                  window.location.reload()
                }}>
                  Retry
                </Button>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name || "Student"}!
            </h1>
            <p className="text-gray-600">
              {user?.department && `${user.department} • `}
              {user?.rollNumber || "Student"}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* NOC Requests */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">NOC Requests</p>
                    <p className="text-2xl font-bold">{nocRequests.total}</p>
                    <p className="text-xs text-gray-500">
                      {nocRequests.pending} pending
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            {/* Reports */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Reports</p>
                    <p className="text-2xl font-bold">{totalReports}</p>
                    <p className="text-xs text-gray-500">
                      {reports.submitted} submitted
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            {/* Certificates */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Certificates</p>
                    <p className="text-2xl font-bold">{certificates.total}</p>
                    <p className="text-xs text-gray-500">
                      {certificates.approved} approved
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            {/* Opportunities */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Opportunities</p>
                    <p className="text-2xl font-bold">{opportunities.total}</p>
                    <p className="text-xs text-gray-500">Available now</p>
                  </div>
                  <Building className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Progress Overview
              </CardTitle>
              <CardDescription>Your internship journey progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Report Completion</span>
                  <span className="text-sm text-gray-500">{Math.round(progressValue)}%</span>
                </div>
                <Progress value={progressValue} className="w-full" />
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{totalReports}</div>
                    <div className="text-xs text-gray-500">Total Reports</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{approvedReports}</div>
                    <div className="text-xs text-gray-500">Reviewed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{reports.submitted}</div>
                    <div className="text-xs text-gray-500">Pending</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/student/noc-requests">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Submit NOC Request
                  </Button>
                </Link>
                <Link href="/dashboard/student/reports">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Submit Weekly Report
                  </Button>
                </Link>
                <Link href="/dashboard/student/certificates">
                  <Button variant="outline" className="w-full justify-start">
                    <Award className="mr-2 h-4 w-4" />
                    Upload Certificate
                  </Button>
                </Link>
                <Link href="/dashboard/student/opportunities">
                  <Button variant="outline" className="w-full justify-start">
                    <Building className="mr-2 h-4 w-4" />
                    Browse Opportunities
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.slice(0, 6).map((activity: any, index: number) => (
                      <div key={activity.id || index} className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {activity.type === 'noc' && <FileText className="h-4 w-4 text-blue-600" />}
                          {activity.type === 'report' && <Calendar className="h-4 w-4 text-green-600" />}
                          {activity.type === 'certificate' && <Award className="h-4 w-4 text-purple-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.title || 'Recent Activity'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {activity.created_at ? new Date(activity.created_at).toLocaleDateString() : 'Recently'}
                          </p>
                        </div>
                        <Badge
                          variant={
                            activity.status === "approved"
                              ? "default"
                              : activity.status === "pending"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {activity.status === "approved" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {activity.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                          {activity.status === "rejected" && <AlertCircle className="h-3 w-3 mr-1" />}
                          {activity.status || 'Unknown'}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No recent activity</p>
                      <p className="text-sm text-gray-400">
                        Start by submitting your first NOC request or report
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Opportunities */}
          {opportunities.recent && opportunities.recent.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Latest Opportunities</CardTitle>
                <CardDescription>New internship opportunities you might be interested in</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {opportunities.recent.slice(0, 3).map((opportunity: any, index: number) => (
                    <div key={opportunity.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{opportunity.title || 'Internship Opportunity'}</h4>
                        <p className="text-sm text-gray-600">
                          {opportunity.company_name || 'Company'} • {opportunity.job_type || 'Internship'}
                        </p>
                      </div>
                      <Link href="/dashboard/student/opportunities">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}