"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  Shield,
  Activity,
  Database,
  Settings,
  BarChart3,
  Star,
  Zap,
  Target,
  Bell,
  ArrowRight,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import { getCurrentUser, getAdminDashboardData } from "@/lib/data"
import { useEffect, useState } from "react"

export default function AdminDashboard() {
  const [user, setUser] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)

    const data = getAdminDashboardData()
    setDashboardData(data)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <AuthGuard allowedRoles={["admin"]}>
        <DashboardLayout>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 space-y-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-96 bg-gray-200 rounded"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
                ))}
              </div>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  const data = dashboardData || {
    stats: {
      totalUsers: 1250,
      activeUsers: 890,
      totalStudents: 800,
      totalTeachers: 45,
      totalReports: 2400,
      totalCertificates: 650,
      totalCompanies: 120,
      totalOpportunities: 85,
    },
    systemHealth: [
      { component: "Database", status: "healthy", uptime: 99.9 },
      { component: "Authentication", status: "healthy", uptime: 100 },
      { component: "File Storage", status: "warning", uptime: 98.5 },
      { component: "Email Service", status: "healthy", uptime: 99.7 },
    ],
    recentActivities: [
      { type: "system", title: "John Doe: Login", time: "2024-01-15T10:30:00Z", status: "success" },
      { type: "system", title: "Dr. Sarah Wilson: Report Review", time: "2024-01-15T09:45:00Z", status: "success" },
      { type: "system", title: "TP Officer: Company Verification", time: "2024-01-15T08:30:00Z", status: "success" },
    ],
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "success":
        return "bg-green-100 text-green-800 border-green-200"
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "error":
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return "🟢"
      case "warning":
        return "🟡"
      case "error":
        return "🔴"
      default:
        return "⚪"
    }
  }

  const getGradientAvatar = (title: string, index: number) => {
    const gradients = [
      "bg-gradient-to-br from-blue-400 to-purple-500",
      "bg-gradient-to-br from-emerald-400 to-teal-500",
      "bg-gradient-to-br from-orange-400 to-pink-500",
      "bg-gradient-to-br from-indigo-400 to-blue-500",
      "bg-gradient-to-br from-rose-400 to-red-500",
    ]
    return gradients[index % gradients.length]
  }

  return (
    <AuthGuard allowedRoles={["admin"]}>
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">
          <div className="relative z-10 p-6 space-y-8">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      System Administration
                    </h1>
                    <p className="text-gray-600 text-lg">Monitor system health, manage users, and oversee operations</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200">
                    <Zap className="h-3 w-3 mr-1" />
                    System Admin
                  </Badge>
                  <Badge className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-emerald-200">
                    <Target className="h-3 w-3 mr-1" />
                    All Systems Operational
                  </Badge>
                </div>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm text-gray-500 font-medium">System Administrator</p>
                <p className="text-sm text-gray-500">Last login: 2024-01-15 09:30 AM</p>
                <p className="text-xs text-gray-400">ID: ADM001</p>
                <div className="flex items-center justify-end mt-2">
                  <Bell className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-xs text-blue-600 font-medium">5 system alerts</span>
                </div>
              </div>
            </div>

            {/* System Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Total Users",
                  value: data.stats.totalUsers,
                  icon: Users,
                  color: "blue",
                  trend: "+12%",
                  subtitle: `${data.stats.activeUsers} active users`,
                },
                {
                  title: "System Uptime",
                  value: "99.8%",
                  icon: Activity,
                  color: "emerald",
                  trend: "+0.2%",
                  subtitle: "All systems operational",
                },
                {
                  title: "Data Storage",
                  value: "75%",
                  icon: Database,
                  color: "orange",
                  trend: "+5%",
                  subtitle: "Storage utilization",
                },
                {
                  title: "Security Status",
                  value: "Secure",
                  icon: Shield,
                  color: "purple",
                  trend: "100%",
                  subtitle: "All systems protected",
                },
              ].map((stat, index) => (
                <Card
                  key={index}
                  className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br from-${stat.color}-100 to-${stat.color}-200 flex items-center justify-center`}
                    >
                      <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold text-${stat.color}-600 mb-2`}>{stat.value}</div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">{stat.subtitle}</p>
                      <div className="flex items-center">
                        <TrendingUp className="h-3 w-3 text-emerald-500 mr-1" />
                        <span className="text-xs text-emerald-600 font-medium">{stat.trend}</span>
                      </div>
                    </div>
                    {stat.title === "System Uptime" && <Progress value={99.8} className="mt-2 h-2" />}
                    {stat.title === "Data Storage" && <Progress value={75} className="mt-2 h-2" />}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* System Health */}
              <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                        <Activity className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">System Health</CardTitle>
                        <CardDescription className="text-gray-600">
                          Current status of all system components
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">Real-time</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {data.systemHealth.map((component, index) => (
                      <div
                        key={`component-${index}`}
                        className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-purple-50 transition-all duration-300"
                      >
                        <div className="flex-shrink-0">
                          <div
                            className={`w-12 h-12 ${getGradientAvatar(component.component, index)} rounded-full flex items-center justify-center shadow-lg`}
                          >
                            <span className="text-lg">{getStatusIcon(component.status)}</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{component.component}</p>
                          <p className="text-sm text-gray-600">Uptime: {component.uptime}%</p>
                        </div>
                        <Badge className={`${getStatusColor(component.status)} px-3 py-1 text-xs font-medium`}>
                          {component.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <Link href="/dashboard/admin/logs">
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                        <Activity className="h-4 w-4 mr-2" />
                        View System Logs
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center">
                      <Activity className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">Recent Activities</CardTitle>
                      <CardDescription className="text-gray-600">Latest system events</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {data.recentActivities.map((activity, index) => (
                      <div
                        key={`activity-${index}`}
                        className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-purple-50 border border-purple-100"
                      >
                        <div className="flex-shrink-0">
                          <Activity className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.time).toLocaleDateString()} •{" "}
                            {new Date(activity.time).toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge className={`${getStatusColor(activity.status)} px-2 py-1 text-xs`}>
                          {activity.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center">
                    <Zap className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">Administrative Actions</CardTitle>
                    <CardDescription className="text-gray-600">
                      System management and configuration tools
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { href: "/dashboard/admin/users", icon: Users, label: "Manage Users", color: "blue" },
                    { href: "/dashboard/admin/analytics", icon: BarChart3, label: "View Analytics", color: "emerald" },
                    { href: "/dashboard/admin/logs", icon: Activity, label: "System Logs", color: "orange" },
                    { href: "/dashboard/admin/settings", icon: Settings, label: "System Settings", color: "purple" },
                  ].map((action, index) => (
                    <Link key={index} href={action.href}>
                      <Button
                        variant="outline"
                        className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 bg-gradient-to-br from-white to-gray-50 border-2"
                      >
                        <div
                          className={`w-8 h-8 rounded-lg bg-gradient-to-br from-${action.color}-100 to-${action.color}-200 flex items-center justify-center`}
                        >
                          <action.icon className={`h-4 w-4 text-${action.color}-600`} />
                        </div>
                        <span className="font-semibold text-gray-700 text-center text-sm">{action.label}</span>
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
