"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Search,
  Filter,
  FileText,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  Building,
  Star,
  AlertTriangle,
  X,
  RotateCcw,
  RefreshCw,
  Loader2,
} from "lucide-react"
import { useState, useEffect } from "react"
import { 
  getCurrentUser, 
  updateReportStatusEnhanced, 
  downloadFile, 
  getReportsByTeacher,
  getReportsStatsByTeacher 
} from "@/lib/data"
import { toast } from "sonner"

interface Report {
  id: number
  student_id: string
  student_name: string
  student_email: string
  week_number: number
  title: string
  description: string
  achievements: string[]
  challenges?: string
  next_week_plan?: string
  status: 'pending' | 'approved' | 'needs_revision' | 'rejected'
  file_name?: string
  file_url?: string
  file_size?: number
  comments?: string
  grade?: string
  feedback?: string
  submitted_date: string
  reviewed_date?: string
  reviewed_by?: string
  created_at: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
  rollNumber?: string
  employeeId?: string
}

export default function TeacherReportsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [filteredReports, setFilteredReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    needsRevision: 0,
    rejected: 0,
    thisWeek: 0,
    avgGrade: 0
  })
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [weekFilter, setWeekFilter] = useState("all")
  const [studentFilter, setStudentFilter] = useState("all")
  
  // Dialog states
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [teacherComments, setTeacherComments] = useState("")
  const [grade, setGrade] = useState("")
  const [rating, setRating] = useState(0)
  const [reviewLoading, setReviewLoading] = useState(false)

  // Fetch current user and reports
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true)
        console.log('📊 Initializing teacher reports page...')
        
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        console.log('👤 Current user loaded:', currentUser.name)
        
        await fetchReports(currentUser.id)
        
      } catch (error) {
        console.error('❌ Error initializing data:', error)
        toast.error('Failed to load data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    initializeData()
  }, [])

  // Fetch reports function - using the existing getReportsByTeacher function
  const fetchReports = async (teacherId: string) => {
    try {
      console.log('📊 Fetching reports for teacher:', teacherId)
      
      // Use the existing function from data.ts
      const reportsData = await getReportsByTeacher(teacherId)
      const statsData = await getReportsStatsByTeacher(teacherId)
      
      console.log(`✅ Loaded ${reportsData.length} reports`)
      setReports(reportsData)
      setStats(statsData)
      
    } catch (error) {
      console.error('💥 Error fetching reports:', error)
      toast.error('Failed to fetch reports')
      setReports([])
    }
  }

  // Refresh reports
  const handleRefresh = async () => {
    if (!user) return
    
    try {
      setRefreshing(true)
      await fetchReports(user.id)
      toast.success('Reports refreshed successfully')
    } catch (error) {
      console.error('❌ Error refreshing reports:', error)
      toast.error('Failed to refresh reports')
    } finally {
      setRefreshing(false)
    }
  }

  // Filter reports
  useEffect(() => {
    const filtered = reports.filter((report) => {
      const matchesSearch =
        report.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.student_email?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || report.status === statusFilter
      const matchesWeek = weekFilter === "all" || report.week_number?.toString() === weekFilter
      const matchesStudent = studentFilter === "all" || report.student_name === studentFilter

      return matchesSearch && matchesStatus && matchesWeek && matchesStudent
    })

    setFilteredReports(filtered)
  }, [reports, searchTerm, statusFilter, weekFilter, studentFilter])

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setWeekFilter("all")
    setStudentFilter("all")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200"
      case "pending":
        return "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 border-yellow-200"
      case "needs_revision":
        return "bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-red-200"
      case "rejected":
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200"
      default:
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "needs_revision":
        return <RotateCcw className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const handleViewReport = (report: Report) => {
    setSelectedReport(report)
    setTeacherComments(report.comments || "")
    setGrade(report.grade || "")
    setRating(0) // Reset rating for new review
    setShowReportDialog(true)
  }

  const handleUpdateReportStatus = async (reportId: number, newStatus: string) => {
    if (!user) return
    
    try {
      setReviewLoading(true)
      console.log('📝 Updating report status:', { reportId, newStatus })
      
      // Use the enhanced update function from data.ts
      const result = await updateReportStatusEnhanced(
        reportId,
        newStatus,
        teacherComments,
        grade,
        user.id
      )

      if (result.success) {
        // Update local state
        setReports(prevReports => 
          prevReports.map(report => 
            report.id === reportId 
              ? { 
                  ...report, 
                  status: newStatus as any,
                  comments: teacherComments,
                  grade: grade,
                  reviewed_by: user.id,
                  reviewed_date: new Date().toISOString()
                }
              : report
          )
        )
        
        setShowReportDialog(false)
        
        const actionText = newStatus === "approved" 
          ? "approved" 
          : newStatus === "needs_revision" 
          ? "marked for revision" 
          : "rejected"
        
        toast.success(`Report ${actionText} successfully!`)
        
        // Refresh the reports list to get updated stats
        await fetchReports(user.id)
        
      } else {
        toast.error(result.error || 'Failed to update report status')
      }
    } catch (error: any) {
      console.error('❌ Error updating report status:', error)
      toast.error(error.message || 'Failed to update report status')
    } finally {
      setReviewLoading(false)
    }
  }

  const handleDownloadReport = async (report: Report) => {
    if (!report.file_url || !report.file_name) {
      // Generate text report if no file exists
      const textContent = generateReportText(report)
      const blob = new Blob([textContent], { type: "text/plain" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${report.student_name.replace(/\s+/g, "_")}_Week${report.week_number}_Report.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success(`Downloaded ${report.title}`)
      return
    }

    try {
      console.log('⬇️ Downloading report:', report.file_name)
      const result = await downloadFile(report.file_url, report.file_name)
      
      if (result.success) {
        toast.success(`Downloaded ${report.file_name}`)
      } else {
        toast.error(result.error || 'Download failed')
      }
    } catch (error: any) {
      console.error('❌ Download error:', error)
      toast.error('Download failed')
    }
  }

  const generateReportText = (report: Report) => {
    return `
Weekly Report - ${report.title}
Student: ${report.student_name}
Email: ${report.student_email}
Week: ${report.week_number}
Submission Date: ${new Date(report.submitted_date).toLocaleDateString()}
Status: ${report.status}

Description:
${report.description}

Achievements:
${Array.isArray(report.achievements) ? report.achievements.join('\n') : report.achievements || 'N/A'}

${report.challenges ? `Challenges:\n${report.challenges}\n` : ''}

${report.next_week_plan ? `Next Week Plan:\n${report.next_week_plan}\n` : ''}

${report.comments ? `Teacher Comments:\n${report.comments}\n` : ''}

${report.grade ? `Grade: ${report.grade}\n` : ''}

Generated on: ${new Date().toLocaleString()}
    `.trim()
  }

  // Get unique values for filters
  const uniqueStudents = [...new Set(reports.map(r => r.student_name).filter(Boolean))]
  const uniqueWeeks = [...new Set(reports.map(r => r.week_number).filter(Boolean))].sort((a, b) => a - b)
  const activeFiltersCount = [statusFilter, weekFilter, studentFilter].filter(f => f !== "all").length

  if (loading) {
    return (
      <AuthGuard allowedRoles={["teacher"]}>
        <DashboardLayout role="teacher">
          <div className="p-4 md:p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-96 bg-gray-200 rounded"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 md:h-32 bg-gray-200 rounded-2xl"></div>
                ))}
              </div>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard allowedRoles={["teacher"]}>
      <DashboardLayout role="teacher">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <div className="p-4 md:p-6 space-y-6 md:space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      Weekly Reports
                    </h1>
                    <p className="text-gray-600 text-sm md:text-lg">Review and approve student weekly reports</p>
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleRefresh} 
                disabled={refreshing}
                variant="outline"
                className="flex items-center gap-2"
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                {
                  title: "Total Reports",
                  value: stats.total,
                  icon: FileText,
                  color: "blue",
                  subtitle: "All submissions",
                },
                {
                  title: "Pending Review",
                  value: stats.pending,
                  icon: Clock,
                  color: "yellow",
                  subtitle: "Awaiting approval",
                },
                {
                  title: "Approved",
                  value: stats.approved,
                  icon: CheckCircle,
                  color: "emerald",
                  subtitle: "Successfully reviewed",
                },
                {
                  title: "Need Revision",
                  value: stats.needsRevision,
                  icon: RotateCcw,
                  color: "red",
                  subtitle: "Require changes",
                },
              ].map((stat, index) => (
                <Card
                  key={index}
                  className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs md:text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <stat.icon className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl md:text-3xl font-bold text-blue-600 mb-1">{stat.value}</div>
                    <p className="text-xs text-gray-500">{stat.subtitle}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Filters */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <Filter className="h-5 w-5 text-orange-600" />
                    <CardTitle className="text-lg">Filters & Search</CardTitle>
                    {activeFiltersCount > 0 && (
                      <Badge className="bg-orange-100 text-orange-700">{activeFiltersCount} active</Badge>
                    )}
                  </div>
                  {activeFiltersCount > 0 && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-1" />
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search reports..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="needs_revision">Needs Revision</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={weekFilter} onValueChange={setWeekFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by week" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Weeks</SelectItem>
                      {uniqueWeeks.map((week) => (
                        <SelectItem key={week} value={week.toString()}>
                          Week {week}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={studentFilter} onValueChange={setStudentFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by student" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      {uniqueStudents.map((student) => (
                        <SelectItem key={student} value={student}>
                          {student}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Reports List */}
            <div className="space-y-4">
              {filteredReports.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-8 md:p-12 text-center">
                    <FileText className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg md:text-xl font-semibold text-gray-600 mb-2">No reports found</h3>
                    <p className="text-gray-500">
                      {reports.length === 0 ? "No reports have been submitted yet" : "Try adjusting your search criteria or filters"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredReports.map((report) => (
                  <Card
                    key={report.id}
                    className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 md:gap-4 mb-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                              <FileText className="h-5 w-5 md:h-6 md:w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                <h3 className="text-lg md:text-xl font-bold text-gray-900 truncate">{report.title}</h3>
                                <Badge className={getStatusColor(report.status)}>
                                  {getStatusIcon(report.status)}
                                  <span className="ml-1">{report.status.replace("_", " ")}</span>
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 md:gap-2 text-xs md:text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <User className="h-3 w-3 md:h-4 md:w-4" />
                                  <span className="truncate">{report.student_name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                                  <span>Week {report.week_number}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3 md:h-4 md:w-4" />
                                  <span>Submitted: {new Date(report.submitted_date).toLocaleDateString()}</span>
                                </div>
                                {report.file_name && (
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-3 w-3 md:h-4 md:w-4" />
                                    <span className="truncate">{report.file_name}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-sm md:text-base text-gray-700 leading-relaxed line-clamp-3">
                              {report.description?.length > 200
                                ? `${report.description.substring(0, 200)}...`
                                : report.description}
                            </p>
                          </div>

                          {report.grade && (
                            <div className="mb-2">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                Grade: {report.grade}
                              </Badge>
                            </div>
                          )}

                          {report.comments && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm text-blue-800">
                                <strong>Teacher Comments:</strong> {report.comments}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-row lg:flex-col gap-2 lg:ml-6">
                          <Button size="sm" onClick={() => handleViewReport(report)} className="flex-1 lg:flex-none">
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadReport(report)}
                            className="flex-1 lg:flex-none"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Report Review Dialog */}
            <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-orange-600" />
                    Review Report: {selectedReport?.title}
                  </DialogTitle>
                  <DialogDescription>
                    Review and provide feedback for {selectedReport?.student_name}'s weekly report
                  </DialogDescription>
                </DialogHeader>
                {selectedReport && (
                  <div className="space-y-6">
                    {/* Report Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Report Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Student:</span>
                            <span className="font-medium">{selectedReport.student_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium">{selectedReport.student_email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Week:</span>
                            <span className="font-medium">Week {selectedReport.week_number}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Submitted:</span>
                            <span className="font-medium">
                              {new Date(selectedReport.submitted_date).toLocaleDateString()}
                            </span>
                          </div>
                          {selectedReport.file_name && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">File:</span>
                              <span className="font-medium text-blue-600">{selectedReport.file_name}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Current Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-center">
                              <Badge className={`${getStatusColor(selectedReport.status)} text-lg px-4 py-2`}>
                                {getStatusIcon(selectedReport.status)}
                                <span className="ml-2">{selectedReport.status.replace("_", " ")}</span>
                              </Badge>
                            </div>
                            {selectedReport.reviewed_date && (
                              <div className="text-center text-sm text-gray-600">
                                Last reviewed: {new Date(selectedReport.reviewed_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Report Content */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Report Content</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                          <p className="text-gray-700 leading-relaxed">{selectedReport.description}</p>
                        </div>
                        {selectedReport.achievements && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Achievements</h4>
                            <div className="text-gray-700 leading-relaxed">
                              {Array.isArray(selectedReport.achievements) ? (
                                <ul className="list-disc list-inside space-y-1">
                                  {selectedReport.achievements.map((achievement, index) => (
                                    <li key={index}>{achievement}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p>{selectedReport.achievements}</p>
                              )}
                            </div>
                          </div>
                        )}
                        {selectedReport.challenges && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Challenges</h4>
                            <p className="text-gray-700 leading-relaxed">{selectedReport.challenges}</p>
                          </div>
                        )}
                        {selectedReport.next_week_plan && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Next Week Plan</h4>
                            <p className="text-gray-700 leading-relaxed">{selectedReport.next_week_plan}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Teacher Review Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Your Review</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="grade">Grade/Score</Label>
                            <Input
                              id="grade"
                              placeholder="e.g., A+, 95, Excellent"
                              value={grade}
                              onChange={(e) => setGrade(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="rating">Rating (1-5 stars)</Label>
                            <div className="flex items-center gap-2 mt-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} onClick={() => setRating(star)} className="focus:outline-none">
                                  <Star
                                    className={`h-6 w-6 cursor-pointer transition-colors ${
                                      star <= rating
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300 hover:text-yellow-200"
                                    }`}
                                  />
                                </button>
                              ))}
                              <span className="ml-2 text-sm text-gray-600">
                                {rating > 0 ? `${rating}/5` : "No rating"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="comments">Comments & Feedback</Label>
                          <Textarea
                            id="comments"
                            placeholder="Provide detailed feedback and comments..."
                            value={teacherComments}
                            onChange={(e) => setTeacherComments(e.target.value)}
                            rows={4}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowReportDialog(false)} 
                        className="w-full sm:w-auto"
                        disabled={reviewLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleUpdateReportStatus(selectedReport.id, "needs_revision")}
                        className="w-full sm:w-auto"
                        disabled={reviewLoading}
                      >
                        {reviewLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <RotateCcw className="h-4 w-4 mr-2" />
                        )}
                        Request Revision
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleUpdateReportStatus(selectedReport.id, "rejected")}
                        className="w-full sm:w-auto border-red-200 text-red-600 hover:bg-red-50"
                        disabled={reviewLoading}
                      >
                        {reviewLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        Reject
                      </Button>
                      <Button
                        className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                        onClick={() => handleUpdateReportStatus(selectedReport.id, "approved")}
                        disabled={reviewLoading}
                      >
                        {reviewLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Approve Report
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}