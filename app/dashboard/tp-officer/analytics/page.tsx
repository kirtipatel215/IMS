"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  BarChart3,
  TrendingUp,
  Users,
  Building,
  Briefcase,
  Award,
  Calendar,
  Target,
  PieChart,
  Activity,
} from "lucide-react"
import { useState, useEffect } from "react"
import { getAllOpportunities, getAllCompanies, getAllNOCRequests, getSystemStats } from "@/lib/data"

export default function TPOfficerAnalytics() {
  const [stats, setStats] = useState(null)
  const [opportunities, setOpportunities] = useState([])
  const [companies, setCompanies] = useState([])
  const [nocRequests, setNocRequests] = useState([])

  useEffect(() => {
    const loadData = () => {
      const systemStats = getSystemStats()
      const opportunitiesData = getAllOpportunities()
      const companiesData = getAllCompanies()
      const nocData = getAllNOCRequests()

      setStats(systemStats)
      setOpportunities(opportunitiesData)
      setCompanies(companiesData)
      setNocRequests(nocData)
    }
    loadData()
  }, [])

  if (!stats) return null

  const placementRate = Math.round((stats.totalApplications / stats.totalStudents) * 100)
  const verifiedCompanies = companies.filter((company) => company.verified).length
  const approvedNOCs = nocRequests.filter((noc) => noc.status === "approved").length
  const activeOpportunities = opportunities.filter((opp) => opp.status === "active").length

  const monthlyData = [
    { month: "Jan", applications: 45, placements: 38 },
    { month: "Feb", applications: 52, placements: 44 },
    { month: "Mar", applications: 48, placements: 41 },
    { month: "Apr", applications: 61, placements: 52 },
    { month: "May", applications: 55, placements: 47 },
    { month: "Jun", applications: 58, placements: 49 },
  ]

  const industryData = [
    { industry: "Information Technology", count: 45, percentage: 35 },
    { industry: "Finance", count: 28, percentage: 22 },
    { industry: "Healthcare", count: 22, percentage: 17 },
    { industry: "Manufacturing", count: 18, percentage: 14 },
    { industry: "Consulting", count: 15, percentage: 12 },
  ]

  const topCompanies = companies
    .filter((company) => company.verified)
    .slice(0, 5)
    .map((company, index) => ({
      ...company,
      rank: index + 1,
      placements: Math.floor(Math.random() * 20) + 5,
    }))

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into placement and internship statistics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Placement Rate</p>
                  <p className="text-2xl font-bold text-green-600">{placementRate}%</p>
                  <Progress value={placementRate} className="mt-2 h-2" />
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Students</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalStudents}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Partner Companies</p>
                  <p className="text-2xl font-bold text-purple-600">{verifiedCompanies}</p>
                </div>
                <Building className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Opportunities</p>
                  <p className="text-2xl font-bold text-orange-600">{activeOpportunities}</p>
                </div>
                <Briefcase className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Monthly Placement Trends
              </CardTitle>
              <CardDescription>Applications vs Successful Placements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyData.map((data) => (
                  <div key={data.month} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{data.month}</span>
                      <span className="text-gray-600">
                        {data.placements}/{data.applications}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Progress value={(data.applications / 70) * 100} className="h-2 bg-blue-100">
                        <div className="h-full bg-blue-500 rounded-full" />
                      </Progress>
                      <Progress value={(data.placements / 70) * 100} className="h-2 bg-green-100">
                        <div className="h-full bg-green-500 rounded-full" />
                      </Progress>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span>Applications</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span>Placements</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Industry Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Industry Distribution
              </CardTitle>
              <CardDescription>Placement distribution across industries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {industryData.map((industry) => (
                  <div key={industry.industry} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{industry.industry}</span>
                      <span className="text-gray-600">
                        {industry.count} ({industry.percentage}%)
                      </span>
                    </div>
                    <Progress value={industry.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performing Companies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Top Performing Companies
              </CardTitle>
              <CardDescription>Companies with highest placement rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCompanies.map((company) => (
                  <div key={company.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">#{company.rank}</span>
                      </div>
                      <div>
                        <p className="font-medium">{company.name}</p>
                        <p className="text-sm text-gray-600">{company.industry}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{company.placements}</p>
                      <p className="text-xs text-gray-500">placements</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest placement activities and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">New company verified</p>
                    <p className="text-xs text-gray-600">TechCorp Solutions added to partner list</p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Internship opportunity posted</p>
                    <p className="text-xs text-gray-600">Software Development Intern at DataTech</p>
                    <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">NOC request approved</p>
                    <p className="text-xs text-gray-600">John Doe's internship at Creative Studios</p>
                    <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Placement milestone reached</p>
                    <p className="text-xs text-gray-600">85% placement rate achieved this semester</p>
                    <p className="text-xs text-gray-500 mt-1">2 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <p className="text-2xl font-bold">{approvedNOCs}</p>
              <p className="text-sm text-gray-600">NOCs Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <p className="text-2xl font-bold">+12%</p>
              <p className="text-sm text-gray-600">Growth Rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <p className="text-2xl font-bold">{stats.totalApplications}</p>
              <p className="text-sm text-gray-600">Total Applications</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Award className="h-8 w-8 mx-auto text-orange-600 mb-2" />
              <p className="text-2xl font-bold">{stats.totalCertificates}</p>
              <p className="text-sm text-gray-600">Certificates Issued</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
