"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  Building,
  TrendingUp,
  AlertCircle,
  Briefcase,
  Star,
  Zap,
  Target,
  Activity,
  Bell,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { getCurrentUser, getTPOfficerDashboardData } from "@/lib/data"
import { useEffect, useState } from "react"

export default function TPOfficerDashboard() {
  const [user, setUser] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

 useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Handle getCurrentUser - it might be async or sync
        const currentUser = await getCurrentUser()
        setUser(currentUser)

        // Properly await the async function
        const data = await getTPOfficerDashboardData()
        setDashboardData(data)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        // Set fallback data on error
        setDashboardData({
          stats: {
            pendingNOCs: 12,
            approvedNOCs: 45,
            totalCompanies: 28,
            verifiedCompanies: 22,
            pendingCompanies: 6,
            totalOpportunities: 35,
            activeOpportunities: 28,
          },
          recentActivities: [
            { type: "noc", title: "NOC request from John Doe", time: "2024-01-15T10:30:00Z", status: "pending" },
            {
              type: "company",
              title: "Company registration: TechCorp Solutions",
              time: "2024-01-14T14:20:00Z",
              status: "verified",
            },
            {
              type: "opportunity",
              title: "New internship posted by Infosys",
              time: "2024-01-12T09:15:00Z",
              status: "active",
            },
          ],
        })
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <AuthGuard allowedRoles={["tp-officer"]}>
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
      pendingNOCs: 12,
      approvedNOCs: 45,
      totalCompanies: 28,
      verifiedCompanies: 22,
      pendingCompanies: 6,
      totalOpportunities: 35,
      activeOpportunities: 28,
    },
    recentActivities: [
      { type: "noc", title: "NOC request from John Doe", time: "2024-01-15T10:30:00Z", status: "pending" },
      {
        type: "company",
        title: "Company registration: TechCorp Solutions",
        time: "2024-01-14T14:20:00Z",
        status: "verified",
      },
      {
        type: "opportunity",
        title: "New internship posted by Infosys",
        time: "2024-01-12T09:15:00Z",
        status: "active",
      },
    ],
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "verified":
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
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

  const urgentTasks = [
    { id: 1, task: "Review NOC applications", count: data.stats.pendingNOCs, deadline: "Today" },
    { id: 2, task: "Verify new companies", count: data.stats.pendingCompanies, deadline: "Tomorrow" },
    { id: 3, task: "Update placement statistics", count: 1, deadline: "This week" },
  ]

  const getDeadlineColor = (deadline: string) => {
    switch (deadline) {
      case "Today":
        return "text-red-600"
      case "Tomorrow":
        return "text-yellow-600"
      default:
        return "text-gray-600"
    }
  }

  const placementRate =
    data.stats.approvedNOCs > 0
      ? Math.round((data.stats.approvedNOCs / (data.stats.approvedNOCs + data.stats.pendingNOCs)) * 100)
      : 85

  return (
    <AuthGuard allowedRoles={["tp-officer"]}>
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
                      Welcome, {user?.name || "Sarah Wilson"}!
                    </h1>
                    <p className="text-gray-600 text-lg">
                      Manage NOC applications, companies, and placement opportunities
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200">
                    <Zap className="h-3 w-3 mr-1" />
                    TP Officer
                  </Badge>
                  <Badge className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-emerald-200">
                    <Target className="h-3 w-3 mr-1" />
                    High Performance
                  </Badge>
                </div>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm text-gray-500 font-medium">Training & Placement Officer</p>
                <p className="text-sm text-gray-500">T&P Cell</p>
                <p className="text-xs text-gray-400">ID: TPO001</p>
                <div className="flex items-center justify-end mt-2">
                  <Bell className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-xs text-blue-600 font-medium">4 pending reviews</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Pending NOCs",
                  value: data.stats.pendingNOCs,
                  icon: FileText,
                  color: "orange",
                  trend: "-5%",
                  subtitle: "Awaiting approval",
                },
                {
                  title: "Verified Companies",
                  value: data.stats.verifiedCompanies,
                  icon: Building,
                  color: "emerald",
                  trend: "+12%",
                  subtitle: "Active partners",
                },
                {
                  title: "Active Opportunities",
                  value: data.stats.activeOpportunities,
                  icon: Briefcase,
                  color: "blue",
                  trend: "+8%",
                  subtitle: "Currently available",
                },
                {
                  title: "Placement Rate",
                  value: `${placementRate}%`,
                  icon: TrendingUp,
                  color: "purple",
                  trend: "+3%",
                  subtitle: "This semester",
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
                    {stat.title === "Placement Rate" && <Progress value={placementRate} className="mt-2 h-2" />}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Activities */}
              <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                        <Activity className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">Recent Activities</CardTitle>
                        <CardDescription className="text-gray-600">Latest updates and submissions</CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">Live Updates</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {data.recentActivities.map((activity, index) => (
                      <div
                        key={`activity-${index}`}
                        className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-purple-50 transition-all duration-300"
                      >
                        <div className="flex-shrink-0">
                          <div
                            className={`w-12 h-12 ${getGradientAvatar(activity.title, index)} rounded-full flex items-center justify-center shadow-lg`}
                          >
                            {activity.type === "noc" && <FileText className="h-5 w-5 text-white" />}
                            {activity.type === "company" && <Building className="h-5 w-5 text-white" />}
                            {activity.type === "opportunity" && <Briefcase className="h-5 w-5 text-white" />}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(activity.time).toLocaleDateString()} •{" "}
                            {new Date(activity.time).toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge className={`${getStatusColor(activity.status)} px-3 py-1 text-xs font-medium`}>
                          {activity.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <Link href="/dashboard/tp-officer/noc">
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                        <FileText className="h-4 w-4 mr-2" />
                        Review NOC Applications
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Urgent Tasks */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">Urgent Tasks</CardTitle>
                      <CardDescription className="text-gray-600">Items requiring immediate attention</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {urgentTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100"
                      >
                        <AlertCircle className={`h-5 w-5 ${getDeadlineColor(task.deadline)}`} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">{task.task}</p>
                          <p className="text-xs text-gray-500">
                            {task.count} items • Due: {task.deadline}
                          </p>
                        </div>
                        <Badge
                          className={`${task.deadline === "Today" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"} px-2 py-1 text-xs`}
                        >
                          {task.deadline}
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
                    <CardTitle className="text-xl font-bold text-gray-900">Quick Actions</CardTitle>
                    <CardDescription className="text-gray-600">Frequently used features</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { href: "/dashboard/tp-officer/noc", icon: FileText, label: "Review NOCs", color: "blue" },
                    {
                      href: "/dashboard/tp-officer/companies",
                      icon: Building,
                      label: "Manage Companies",
                      color: "emerald",
                    },
                    {
                      href: "/dashboard/tp-officer/opportunities",
                      icon: Briefcase,
                      label: "Post Opportunities",
                      color: "orange",
                    },
                    {
                      href: "/dashboard/tp-officer/analytics",
                      icon: TrendingUp,
                      label: "View Analytics",
                      color: "purple",
                    },
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
