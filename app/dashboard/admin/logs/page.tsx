import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Download,
  Filter,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  User,
  Calendar,
  Activity,
} from "lucide-react"

export default function AdminLogs() {
  const auditLogs = [
    {
      id: 1,
      timestamp: "2024-03-25T18:30:00Z",
      user: "admin@charusat.ac.in",
      action: "User Created",
      resource: "User Management",
      details: "Created new student account for john.doe@charusat.edu.in",
      severity: "info",
      ipAddress: "192.168.1.100",
    },
    {
      id: 2,
      timestamp: "2024-03-25T17:45:00Z",
      user: "tp@charusat.ac.in",
      action: "NOC Approved",
      resource: "NOC Management",
      details: "Approved NOC request #156 for Alex Kumar - TechCorp Solutions",
      severity: "success",
      ipAddress: "192.168.1.101",
    },
    {
      id: 3,
      timestamp: "2024-03-25T16:20:00Z",
      user: "smith@charusat.ac.in",
      action: "Report Reviewed",
      resource: "Report Management",
      details: "Reviewed and approved Week 8 report for John Doe",
      severity: "success",
      ipAddress: "192.168.1.102",
    },
    {
      id: 4,
      timestamp: "2024-03-25T15:10:00Z",
      user: "unknown@external.com",
      action: "Login Failed",
      resource: "Authentication",
      details: "Failed login attempt with invalid credentials",
      severity: "warning",
      ipAddress: "203.0.113.45",
    },
    {
      id: 5,
      timestamp: "2024-03-25T14:30:00Z",
      user: "admin@charusat.ac.in",
      action: "System Settings Updated",
      resource: "System Configuration",
      details: "Updated email notification settings for NOC approvals",
      severity: "info",
      ipAddress: "192.168.1.100",
    },
    {
      id: 6,
      timestamp: "2024-03-25T13:15:00Z",
      user: "system",
      action: "Database Backup",
      resource: "System Maintenance",
      details: "Automated daily database backup completed successfully",
      severity: "success",
      ipAddress: "localhost",
    },
    {
      id: 7,
      timestamp: "2024-03-25T12:00:00Z",
      user: "tp@charusat.ac.in",
      action: "Company Verification Failed",
      resource: "Company Management",
      details: "Rejected company verification for Unknown Corp - insufficient documentation",
      severity: "error",
      ipAddress: "192.168.1.101",
    },
  ]

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-600">
            Success
          </Badge>
        )
      case "warning":
        return (
          <Badge variant="secondary" className="bg-orange-600 text-white">
            Warning
          </Badge>
        )
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="outline">Info</Badge>
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-gray-600">Monitor system activities and user actions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filter
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Logs
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="Search logs..." className="pl-10" />
              </div>
              <Select>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by resource" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  <SelectItem value="user">User Management</SelectItem>
                  <SelectItem value="noc">NOC Management</SelectItem>
                  <SelectItem value="report">Report Management</SelectItem>
                  <SelectItem value="auth">Authentication</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Log Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold">2,847</p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Events</p>
                  <p className="text-2xl font-bold text-green-600">2,456</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Warnings</p>
                  <p className="text-2xl font-bold text-orange-600">234</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Errors</p>
                  <p className="text-2xl font-bold text-red-600">157</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audit Logs List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system events and user actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-shrink-0 mt-1">{getSeverityIcon(log.severity)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-semibold text-gray-900">{log.action}</h4>
                        {getSeverityBadge(log.severity)}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{log.details}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{log.user}</span>
                      </div>
                      <span>•</span>
                      <span>{log.resource}</span>
                      <span>•</span>
                      <span>IP: {log.ipAddress}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
