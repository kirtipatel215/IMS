"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Award,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
} from "lucide-react"
import { useEffect, useState } from "react"
import { getTeacherAnalytics, getCurrentUser } from "@/lib/data"

export default function TeacherAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)

    if (currentUser?.email) {
      const data = getTeacherAnalytics(currentUser.email)
      setAnalytics(data)
    }
  }, [])

  if (!analytics) {
    return (
      <DashboardLayout role="teacher">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="teacher">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Insights into your students' performance and progress</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold">{analytics.totalStudents}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reports Reviewed</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.reportsReviewed}</p>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Certificates Approved</p>
                  <p className="text-2xl font-bold text-purple-600">{analytics.certificatesApproved}</p>
                </div>
                <Award className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                  <p className="text-2xl font-bold text-orange-600">{analytics.avgResponseTime}h</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Student Performance Distribution
              </CardTitle>
              <CardDescription>Grade distribution across all reviewed reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.gradeDistribution.map((grade: any) => (
                  <div key={grade.grade} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={grade.grade === "A+" || grade.grade === "A" ? "default" : "secondary"}>
                        {grade.grade}
                      </Badge>
                      <span className="text-sm text-gray-600">{grade.count} students</span>
                    </div>
                    <div className="flex items-center gap-2 flex-1 max-w-32">
                      <Progress value={grade.percentage} className="flex-1" />
                      <span className="text-sm text-gray-500">{grade.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Monthly Review Activity
              </CardTitle>
              <CardDescription>Reports reviewed per month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.monthlyActivity.map((month: any) => (
                  <div key={month.month} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{month.month}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(month.reviews / Math.max(...analytics.monthlyActivity.map((m: any) => m.reviews))) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">{month.reviews}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                On Track Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">{analytics.studentStatus.onTrack}</div>
              <p className="text-sm text-gray-600">
                {Math.round((analytics.studentStatus.onTrack / analytics.totalStudents) * 100)}% of total students
              </p>
              <Progress value={(analytics.studentStatus.onTrack / analytics.totalStudents) * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <AlertTriangle className="h-5 w-5" />
                Need Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 mb-2">{analytics.studentStatus.needAttention}</div>
              <p className="text-sm text-gray-600">
                {Math.round((analytics.studentStatus.needAttention / analytics.totalStudents) * 100)}% of total students
              </p>
              <Progress
                value={(analytics.studentStatus.needAttention / analytics.totalStudents) * 100}
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Award className="h-5 w-5" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-2">{analytics.studentStatus.completed}</div>
              <p className="text-sm text-gray-600">
                {Math.round((analytics.studentStatus.completed / analytics.totalStudents) * 100)}% of total students
              </p>
              <Progress value={(analytics.studentStatus.completed / analytics.totalStudents) * 100} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity Summary
            </CardTitle>
            <CardDescription>Your recent review and approval activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-blue-900">This Week</h3>
                <p className="text-2xl font-bold text-blue-600">{analytics.thisWeek.reports}</p>
                <p className="text-sm text-blue-700">Reports reviewed</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-green-900">This Month</h3>
                <p className="text-2xl font-bold text-green-600">{analytics.thisMonth.certificates}</p>
                <p className="text-sm text-green-700">Certificates approved</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-purple-900">Efficiency</h3>
                <p className="text-2xl font-bold text-purple-600">{analytics.efficiency}%</p>
                <p className="text-sm text-purple-700">Review completion rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
