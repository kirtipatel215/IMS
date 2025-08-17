// app/dashboard/teacher/page.tsx - Teacher Dashboard with Database Integration
"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  FileText,
  Award,
  CheckCircle,
  Calendar,
  BarChart3,
  Clock,
  TrendingUp,
  Star,
  Zap,
  Target,
  Activity,
  Bell,
  ArrowRight,
  AlertCircle,
  Loader2,
  RefreshCw,
  BookOpen,
  User,
} from "lucide-react"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth-supabase"
import { getTeacherDashboardData } from "@/lib/data"
import { useEffect, useState } from "react"

interface TeacherDashboardData {
  totalStudents: number
  pendingReports: number
  pendingCertificates: number
  students: Array<{
    id: string
    name: string
    email: string
    roll_number?: string
  }>
  recentReports: Array<{
    id: string
    title: string
    student_id: string
    created_at: string
    status: string
  }>
  recentCertificates: Array<{
    id: string
    title: string
    student_id: string
    created_at: string
    status: string
  }>
}

interface User {
  id: string
  name: string
  email: string
  role: string
  department?: string
  designation?: string
  employeeId?: string
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case "approved":
    case "reviewed":
      return "bg-green-100 text-green-800 border-green-200"
    case "pending":
    case "submitted":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "rejected":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getActivityGradient = (index: number): string => {
  const gradients = [
    "bg-gradient-to-br from-blue-400 to-purple-500",
    "bg-gradient-to-br from-emerald-400 to-teal-500",
    "bg-gradient-to-br from-orange-400 to-pink-500",
    "bg-gradient-to-br from-indigo-400 to-blue-500",
    "bg-gradient-to-br from-rose-400 to-red-500",
  ]
  return gradients[index % gradients.length]
}

export default function TeacherDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [dashboardData, setDashboardData] = useState<TeacherDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Function to load dashboard data
  const loadDashboardData = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) setRefreshing(true)
      else setLoading(true)
      
      setError(null)

      // Get current user
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        throw new Error("No authenticated user found")
      }

      setUser(currentUser)

      // Fetch dashboard data from database
      const data = await getTeacherDashboardData(currentUser.id)
      setDashboardData(data)

    } catch (err: any) {
      console.error("Error loading dashboard data:", err)
      setError(err.message || "Failed to load dashboard data")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Initial load
  useEffect(() => {
    loadDashboardData()
  }, [])

  // Manual refresh function
  const handleRefresh = () => {
    loadDashboardData(true)
  }

  if (loading) {
    return (
      <AuthGuard allowedRoles={["teacher"]}>
        <DashboardLayout>
          <div className="min-h-screen bg-gray-50 p-4 lg:p-8 space-y-8">
            <div className="animate-pulse space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="space-y-2">
                  <div className="h-8 w-64 bg-gray-200 rounded"></div>
                  <div className="h-4 w-96 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 h-96 bg-gray-200 rounded-lg"></div>
                <div className="h-96 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  if (error) {
    return (
      <AuthGuard allowedRoles={["teacher"]}>
        <DashboardLayout>
          <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-md mx-auto mt-20">
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-medium">
                  {error}
                </AlertDescription>
              </Alert>
              <Card>
                <CardContent className="text-center p-6">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Dashboard Error</h2>
                  <p className="text-gray-600 mb-4">
                    We encountered an error while loading your dashboard data.
                  </p>
                  <div className="space-y-2">
                    <Button onClick={handleRefresh} className="w-full" disabled={refreshing}>
                      {refreshing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Retrying...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Try Again
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.href = '/auth'} 
                      className="w-full"
                    >
                      Sign In Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  if (!dashboardData) {
    return (
      <AuthGuard allowedRoles={["teacher"]}>
        <DashboardLayout>
          <div className="min-h-screen bg-gray-50 p-6">
            <Card className="max-w-md mx-auto mt-20">
              <CardContent className="text-center p-6">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
                <p className="text-gray-600 mb-4">Your teacher dashboard data is not available yet.</p>
                <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
                  {refreshing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  const stats = [
    {
      title: "Total Students",
      value: dashboardData.totalStudents,
      icon: Users,
      color: "blue",
      trend: dashboardData.totalStudents > 0 ? "Active" : "No students yet",
      subtitle: "Under your guidance",
    },
    {
      title: "Pending Reports",
      value: dashboardData.pendingReports,
      icon: FileText,
      color: "orange",
      trend: dashboardData.pendingReports > 0 ? "Needs review" : "All caught up",
      subtitle: "Awaiting review",
    },
    {
      title: "Total Reports",
      value: dashboardData.recentReports.length,
      icon: CheckCircle,
      color: "green",
      trend: "This semester",
      subtitle: "Submitted reports",
    },
    {
      title: "Pending Certificates",
      value: dashboardData.pendingCertificates,
      icon: Award,
      color: "purple",
      trend: dashboardData.pendingCertificates > 0 ? "Needs review" : "All reviewed",
      subtitle: "Pending approval",
    },
    {
      title: "Response Rate",
      value: dashboardData.recentReports.length > 0 ? "95%" : "N/A",
      icon: Target,
      color: "indigo",
      trend: "Excellent",
      subtitle: "Review efficiency",
    },
  ]

  // Combine recent reports and certificates for activity feed
  const recentActivities = [
    ...dashboardData.recentReports.map(report => ({
      id: `report-${report.id}`,
      type: 'report',
      title: `${report.title} - Student report submitted`,
      time: report.created_at,
      status: report.status,
      student_id: report.student_id
    })),
    ...dashboardData.recentCertificates.map(cert => ({
      id: `certificate-${cert.id}`,
      type: 'certificate',
      title: `${cert.title} - Certificate uploaded`,
      time: cert.created_at,
      status: cert.status,
      student_id: cert.student_id
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10)

  return (
    <AuthGuard allowedRoles={["teacher"]}>
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="p-4 lg:p-8 space-y-8">
            {/* Welcome Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                      Welcome back, {user?.name}!
                    </h1>
                    <p className="text-gray-600">Manage your students and review their internship progress</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    <Zap className="h-3 w-3 mr-1" />
                    Active Mentor
                  </Badge>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <Target className="h-3 w-3 mr-1" />
                    {dashboardData.totalStudents} Students
                  </Badge>
                </div>
              </div>
              <div className="text-left lg:text-right space-y-1">
                <p className="text-sm text-gray-500 font-medium">{user?.designation || "Faculty Member"}</p>
                <p className="text-sm text-gray-500">{user?.department || "Computer Engineering"}</p>
                {user?.employeeId && (
                  <p className="text-sm text-gray-500">ID: {user.employeeId}</p>
                )}
                <div className="flex items-center lg:justify-end mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {refreshing ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-1" />
                    )}
                    Refresh
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                    <div className={`w-10 h-10 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                      <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl lg:text-3xl font-bold text-${stat.color}-600 mb-2`}>
                      {stat.value}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">{stat.subtitle}</p>
                      <span className="text-xs font-medium text-gray-600">{stat.trend}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Activities */}
              <Card className="lg:col-span-2">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Activity className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">Recent Activities</CardTitle>
                        <CardDescription className="text-gray-600">
                          Latest submissions and updates from your students
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700">
                      {recentActivities.length} items
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {recentActivities.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivities.map((activity, index) => (
                        <div
                          key={activity.id}
                          className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors duration-200"
                        >
                          <div className="flex-shrink-0">
                            <div className={`w-12 h-12 ${getActivityGradient(index)} rounded-full flex items-center justify-center shadow-lg`}>
                              {activity.type === "report" ? (
                                <FileText className="h-5 w-5 text-white" />
                              ) : (
                                <Award className="h-5 w-5 text-white" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(activity.time).toLocaleDateString()} • {new Date(activity.time).toLocaleTimeString()}
                            </p>
                          </div>
                          <Badge className={`${getStatusColor(activity.status)} px-3 py-1 text-xs font-medium capitalize`}>
                            {activity.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No Recent Activities</h3>
                      <p className="text-gray-500 mb-6">No student submissions or activities to review yet.</p>
                      <Link href="/dashboard/teacher/students">
                        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                          <Users className="h-4 w-4 mr-2" />
                          View My Students
                        </Button>
                      </Link>
                    </div>
                  )}
                  
                  {recentActivities.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <Link href="/dashboard/teacher/students">
                        <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                          <Users className="h-4 w-4 mr-2" />
                          View All Students
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions & Student Overview */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader className="border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Zap className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">Quick Actions</CardTitle>
                        <CardDescription className="text-gray-600">Frequently used features</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {[
                        { href: "/dashboard/teacher/students", icon: Users, label: "My Students", color: "blue", count: dashboardData.totalStudents },
                        { href: "/dashboard/teacher/reports", icon: FileText, label: "Review Reports", color: "orange", count: dashboardData.pendingReports },
                        { href: "/dashboard/teacher/certificates", icon: Award, label: "Certificates", color: "green", count: dashboardData.pendingCertificates },
                        { href: "/dashboard/teacher/analytics", icon: BarChart3, label: "Analytics", color: "purple", count: null },
                      ].map((action, index) => (
                        <Link key={index} href={action.href}>
                          <Button
                            variant="outline"
                            className="w-full justify-start h-14 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 bg-white border-2"
                          >
                            <div className={`w-10 h-10 rounded-lg bg-${action.color}-100 flex items-center justify-center mr-3`}>
                              <action.icon className={`h-5 w-5 text-${action.color}-600`} />
                            </div>
                            <div className="flex-1 text-left">
                              <span className="font-semibold text-gray-700">{action.label}</span>
                              {action.count !== null && action.count > 0 && (
                                <div className="text-xs text-gray-500">{action.count} items</div>
                              )}
                            </div>
                            {action.count !== null && action.count > 0 && (
                              <Badge className={`bg-${action.color}-100 text-${action.color}-700 mr-2`}>
                                {action.count}
                              </Badge>
                            )}
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Student Overview */}
                <Card>
                  <CardHeader className="border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <Users className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">My Students</CardTitle>
                        <CardDescription className="text-gray-600">Students under your guidance</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {dashboardData.students.length > 0 ? (
                      <div className="space-y-3">
                        {dashboardData.students.slice(0, 5).map((student, index) => (
                          <div
                            key={student.id}
                            className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors duration-200"
                          >
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                              <User className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{student.name}</p>
                              <p className="text-xs text-gray-600 truncate">
                                {student.roll_number || student.email}
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        {dashboardData.students.length > 5 && (
                          <div className="text-center pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-500 mb-3">
                              +{dashboardData.students.length - 5} more students
                            </p>
                          </div>
                        )}
                        
                        <div className="pt-3 border-t border-gray-100">
                          <Link href="/dashboard/teacher/students">
                            <Button variant="outline" className="w-full">
                              <Users className="h-4 w-4 mr-2" />
                              View All Students
                              <ArrowRight className="h-4 w-4 ml-auto" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Students Assigned</h3>
                        <p className="text-gray-500 text-sm">No students are currently assigned to you for mentoring.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Performance Overview */}
                <Card>
                  <CardHeader className="border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">This Week</CardTitle>
                        <CardDescription className="text-gray-600">Your activity summary</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-center space-x-3">
                          <Clock className="h-5 w-5 text-blue-600" />
                          <span className="font-medium text-blue-900">Reports to review</span>
                        </div>
                        <span className="text-2xl font-bold text-blue-600">{dashboardData.pendingReports}</span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                        <div className="flex items-center space-x-3">
                          <Award className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-900">Certificates pending</span>
                        </div>
                        <span className="text-2xl font-bold text-green-600">{dashboardData.pendingCertificates}</span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="flex items-center space-x-3">
                          <Users className="h-5 w-5 text-purple-600" />
                          <span className="font-medium text-purple-900">Active students</span>
                        </div>
                        <span className="text-2xl font-bold text-purple-600">{dashboardData.totalStudents}</span>
                      </div>

                      {(dashboardData.pendingReports > 0 || dashboardData.pendingCertificates > 0) && (
                        <div className="pt-4 border-t border-gray-100">
                          <Alert className="border-orange-200 bg-orange-50">
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                            <AlertDescription className="text-orange-700">
                              You have {dashboardData.pendingReports + dashboardData.pendingCertificates} items pending review.
                            </AlertDescription>
                          </Alert>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Target className="h-4 w-4 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900">Review Efficiency</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 font-medium">Reports reviewed</span>
                        <span className="font-bold text-blue-600">
                          {dashboardData.recentReports.filter(r => r.status === 'reviewed' || r.status === 'approved').length}/
                          {dashboardData.recentReports.length}
                        </span>
                      </div>
                      <Progress 
                        value={
                          dashboardData.recentReports.length > 0 
                            ? (dashboardData.recentReports.filter(r => r.status === 'reviewed' || r.status === 'approved').length / dashboardData.recentReports.length) * 100
                            : 0
                        } 
                        className="h-3" 
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 font-medium">Avg. response time</span>
                        <span className="font-bold text-green-600">24h</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Star className="h-4 w-4 text-green-600" />
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900">Student Progress</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active submissions</span>
                      <span className="font-semibold text-green-600">{dashboardData.recentReports.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Completion rate</span>
                      <span className="font-semibold text-blue-600">
                        {dashboardData.totalStudents > 0 ? Math.round((dashboardData.recentReports.length / dashboardData.totalStudents) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Certificates issued</span>
                      <span className="font-semibold text-purple-600">
                        {dashboardData.recentCertificates.filter(c => c.status === 'approved').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-purple-600" />
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900">Quick Stats</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Students mentored</span>
                      <span className="font-semibold text-blue-600">{dashboardData.totalStudents}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Reports this month</span>
                      <span className="font-semibold text-green-600">{dashboardData.recentReports.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pending reviews</span>
                      <span className="font-semibold text-orange-600">
                        {dashboardData.pendingReports + dashboardData.pendingCertificates}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}