import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Users, Building, Activity } from "lucide-react"

export default function AdminAnalytics() {
  return (
    <DashboardLayout role="admin">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">System Analytics</h1>
          <p className="text-gray-600">Comprehensive platform insights and performance metrics</p>
        </div>

        {/* Platform Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Internships</CardTitle>
              <Building className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">Across 45 companies</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">99.8%</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <Progress value={87} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Activity */}
          <Card>
            <CardHeader>
              <CardTitle>User Activity Breakdown</CardTitle>
              <CardDescription>Active users by role over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
                    <span className="text-sm">Students</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">1,089 (87%)</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "87%" }}></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 bg-green-600 rounded-full"></div>
                    <span className="text-sm">Faculty</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">142 (11%)</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "11%" }}></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 bg-purple-600 rounded-full"></div>
                    <span className="text-sm">T&P Officers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">12 (1%)</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: "1%" }}></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 bg-red-600 rounded-full"></div>
                    <span className="text-sm">Admins</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">4 (0.3%)</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: "0.3%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Performance</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-green-900">NOC Processing</p>
                    <p className="text-xs text-green-700">Average processing time</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">2.3 days</p>
                    <p className="text-xs text-green-600">-0.5 days improvement</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-blue-900">User Satisfaction</p>
                    <p className="text-xs text-blue-700">Based on feedback surveys</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">4.7/5</p>
                    <p className="text-xs text-blue-600">+0.2 from last quarter</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-purple-900">System Response Time</p>
                    <p className="text-xs text-purple-700">Average API response</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-purple-600">245ms</p>
                    <p className="text-xs text-purple-600">-15ms improvement</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Activity Trends</CardTitle>
              <CardDescription>Platform usage over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">New User Registrations</span>
                  <span className="text-sm font-medium">+156 this month</span>
                </div>
                <Progress value={78} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">NOC Requests Processed</span>
                  <span className="text-sm font-medium">234 completed</span>
                </div>
                <Progress value={92} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Report Submissions</span>
                  <span className="text-sm font-medium">1,456 submitted</span>
                </div>
                <Progress value={85} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Certificate Approvals</span>
                  <span className="text-sm font-medium">89 approved</span>
                </div>
                <Progress value={95} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle>System Health Metrics</CardTitle>
              <CardDescription>Real-time system status and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database Performance</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "95%" }}></div>
                    </div>
                    <span className="text-sm font-medium">95%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Server Load</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: "65%" }}></div>
                    </div>
                    <span className="text-sm font-medium">65%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Memory Usage</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "72%" }}></div>
                    </div>
                    <span className="text-sm font-medium">72%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Storage Usage</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{ width: "78%" }}></div>
                    </div>
                    <span className="text-sm font-medium">78%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Platform Usage Analytics
            </CardTitle>
            <CardDescription>Detailed breakdown of platform activities over the past year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, index) => {
                const values = [234, 289, 156, 345, 267, 398]
                const height = (values[index] / 398) * 100
                return (
                  <div key={month} className="text-center">
                    <div className="h-32 flex items-end justify-center mb-2">
                      <div
                        className="w-8 bg-gradient-to-t from-blue-600 to-purple-600 rounded-t"
                        style={{ height: `${height}%` }}
                      ></div>
                    </div>
                    <p className="text-sm font-medium">{month}</p>
                    <p className="text-xs text-gray-600">{values[index]} activities</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
