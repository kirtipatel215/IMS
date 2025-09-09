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
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { getStudentDashboardData } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

// Interfaces
interface DashboardStats {
  nocRequests?: { total: number; pending: number; approved: number; rejected: number }
  reports?: { total: number; submitted: number; reviewed: number; recent: any[] }
  certificates?: { total: number; pending: number; approved: number; recent: any[] }
  opportunities?: { total: number; recent: any[] }
  recentActivity?: any[]
}

export default function StudentDashboard() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { user, isLoading: authLoading, isInitialized } = useAuth()
  const hasFetchedData = useRef(false)
  const currentUserId = useRef<string | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!isInitialized || authLoading) return
      if (!user) return setIsLoading(false)
      if (hasFetchedData.current && currentUserId.current === user.id) return

      try {
        setIsLoading(true)
        setError(null)
        hasFetchedData.current = true
        currentUserId.current = user.id

        const stats = await getStudentDashboardData(user.id)
        setDashboardStats(
          stats || {
            nocRequests: { total: 0, pending: 0, approved: 0, rejected: 0 },
            reports: { total: 0, submitted: 0, reviewed: 0, recent: [] },
            certificates: { total: 0, pending: 0, approved: 0, recent: [] },
            opportunities: { total: 0, recent: [] },
            recentActivity: [],
          }
        )
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data")
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Showing sample data.",
          variant: "destructive",
        })
        setDashboardStats({
          nocRequests: { total: 2, pending: 1, approved: 1, rejected: 0 },
          reports: { total: 3, submitted: 1, reviewed: 2, recent: [] },
          certificates: { total: 2, pending: 1, approved: 1, recent: [] },
          opportunities: { total: 5, recent: [] },
          recentActivity: [],
        })
      } finally {
        setIsLoading(false)
      }
    }
    loadDashboardData()
  }, [user, isInitialized, authLoading, toast])

  const nocRequests = dashboardStats.nocRequests || { total: 0, pending: 0, approved: 0, rejected: 0 }
  const reports = dashboardStats.reports || { total: 0, submitted: 0, reviewed: 0, recent: [] }
  const certificates = dashboardStats.certificates || { total: 0, pending: 0, approved: 0, recent: [] }
  const opportunities = dashboardStats.opportunities || { total: 0, recent: [] }
  const recentActivity = dashboardStats.recentActivity || []

  const totalReports = reports.total || 0
  const approvedReports = reports.reviewed || 0
  const progressValue = totalReports > 0 ? (approvedReports / totalReports) * 100 : 0

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Welcome */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 rounded-2xl shadow-md">
            <h1 className="text-3xl font-extrabold">Welcome back, {user?.name || "Student"} 👋</h1>
            <p className="text-sm opacity-90 mt-1">
              {user?.department && `${user.department} • `}
              {user?.rollNumber || "Student"}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="NOC Requests"
              value={nocRequests.total}
              subtitle={`${nocRequests.pending} pending`}
              icon={<FileText className="h-8 w-8 text-blue-500" />}
              color="from-blue-100 to-blue-50"
            />

            <StatCard
              title="Reports"
              value={totalReports}
              subtitle={`${reports.submitted} submitted`}
              icon={<Calendar className="h-8 w-8 text-green-500" />}
              color="from-green-100 to-green-50"
            />

            <StatCard
              title="Certificates"
              value={certificates.total}
              subtitle={`${certificates.approved} approved`}
              icon={<Award className="h-8 w-8 text-purple-500" />}
              color="from-purple-100 to-purple-50"
            />

            <StatCard
              title="Opportunities"
              value={opportunities.total}
              subtitle="Available now"
              icon={<Building className="h-8 w-8 text-orange-500" />}
              color="from-orange-100 to-orange-50"
            />
          </div>

          {/* Progress */}
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700">
                <TrendingUp className="h-5 w-5" /> Progress Overview
              </CardTitle>
              <CardDescription>Your internship journey progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Report Completion</span>
                  <span className="text-sm text-gray-500">{Math.round(progressValue)}%</span>
                </div>
                <Progress value={progressValue} className="h-3 rounded-full bg-gray-200" />
                <div className="grid grid-cols-3 gap-4 text-center">
                  <ProgressItem label="Total Reports" value={totalReports} color="text-blue-600" />
                  <ProgressItem label="Reviewed" value={approvedReports} color="text-green-600" />
                  <ProgressItem label="Submitted" value={reports.submitted} color="text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="text-indigo-700">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ActionButton href="/dashboard/student/noc-requests" icon={<FileText className="h-4 w-4" />} label="Submit NOC Request" />
              <ActionButton href="/dashboard/student/reports" icon={<Calendar className="h-4 w-4" />} label="Submit Weekly Report" />
              <ActionButton href="/dashboard/student/certificates" icon={<Award className="h-4 w-4" />} label="Upload Certificate" />
              <ActionButton href="/dashboard/student/opportunities" icon={<Building className="h-4 w-4" />} label="Browse Opportunities" />
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="text-indigo-700">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.slice(0, 5).map((activity, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        {activity.type === "noc" && <FileText className="h-5 w-5 text-blue-500" />}
                        {activity.type === "report" && <Calendar className="h-5 w-5 text-green-500" />}
                        {activity.type === "certificate" && <Award className="h-5 w-5 text-purple-500" />}
                        <div>
                          <p className="font-medium text-sm">{activity.title}</p>
                          <p className="text-xs text-gray-500">{new Date(activity.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Badge
                        variant={activity.status === "approved" ? "default" : activity.status === "pending" ? "secondary" : "destructive"}
                      >
                        {activity.status === "approved" && <CheckCircle className="h-3 w-3 mr-1" />}
                        {activity.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                        {activity.status === "rejected" && <AlertCircle className="h-3 w-3 mr-1" />}
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <BookOpen className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}

// Helper Components
function StatCard({ title, value, subtitle, icon, color }: any) {
  return (
    <Card className={`bg-gradient-to-br ${color} shadow-md border-0 rounded-xl`}>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        <div className="bg-white p-2 rounded-lg shadow-sm">{icon}</div>
      </CardContent>
    </Card>
  )
}

function ProgressItem({ label, value, color }: any) {
  return (
    <div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}

function ActionButton({ href, icon, label }: any) {
  return (
    <Link href={href}>
      <Button variant="outline" className="w-full justify-start hover:bg-indigo-50 hover:text-indigo-600">
        {icon}
        <span className="ml-2">{label}</span>
      </Button>
    </Link>
  )
}
