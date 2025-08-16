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
} from "lucide-react"
import { useState, useEffect } from "react"
import { getCurrentUser } from "@/lib/auth"
import { toast } from "sonner"

// Mock data for reports
const mockReports = [
  {
    id: 1,
    studentId: 1,
    studentName: "John Doe",
    rollNumber: "21CE001",
    company: "TCS",
    position: "Software Developer Intern",
    weekNumber: 8,
    title: "Week 8 - Backend Development Progress",
    submissionDate: "2024-01-20T10:30:00Z",
    status: "pending",
    fileUrl: "/reports/john_doe_week8.pdf",
    description:
      "This week I worked on implementing REST APIs for the user management system. I learned about authentication middleware and database optimization techniques.",
    achievements: "Completed user authentication module, Implemented JWT tokens, Optimized database queries",
    challenges: "Had difficulty with JWT token expiration handling, Needed help with database indexing",
    nextWeekPlan: "Work on frontend integration, Implement user dashboard, Add unit tests",
    supervisorFeedback: "",
    teacherComments: "",
    rating: 0,
  },
  {
    id: 2,
    studentId: 2,
    studentName: "Jane Smith",
    rollNumber: "21CE002",
    company: "Infosys",
    position: "Full Stack Developer Intern",
    weekNumber: 9,
    title: "Week 9 - React Component Development",
    submissionDate: "2024-01-21T14:20:00Z",
    status: "approved",
    fileUrl: "/reports/jane_smith_week9.pdf",
    description:
      "Focused on developing reusable React components for the company's internal dashboard. Learned about component lifecycle and state management.",
    achievements: "Created 5 reusable components, Implemented Redux for state management, Added responsive design",
    challenges: "Complex state management scenarios, Performance optimization for large datasets",
    nextWeekPlan: "Integrate components with backend APIs, Add error handling, Implement loading states",
    supervisorFeedback: "Excellent progress on component development. Shows good understanding of React principles.",
    teacherComments: "Great work on the React components. Your understanding of state management is impressive.",
    rating: 5,
  },
  {
    id: 3,
    studentId: 3,
    studentName: "Mike Johnson",
    rollNumber: "21CE003",
    company: "Wipro",
    position: "Data Analyst Intern",
    weekNumber: 7,
    title: "Week 7 - Data Visualization Dashboard",
    submissionDate: "2024-01-19T09:15:00Z",
    status: "needs_revision",
    fileUrl: "/reports/mike_johnson_week7.pdf",
    description:
      "Worked on creating interactive dashboards using Python and Plotly. Analyzed customer data to identify trends.",
    achievements: "Created 3 interactive charts, Analyzed 10K+ customer records, Identified key trends",
    challenges: "Data cleaning took longer than expected, Some visualization libraries were new to me",
    nextWeekPlan: "Refine dashboard design, Add more interactive features, Present findings to team",
    supervisorFeedback: "Good analytical work, but dashboard needs better user experience design.",
    teacherComments:
      "Please improve the dashboard's user interface and add more detailed analysis in your next submission.",
    rating: 3,
  },
  {
    id: 4,
    studentId: 4,
    studentName: "Sarah Wilson",
    rollNumber: "21CE004",
    company: "Microsoft",
    position: "Software Engineer Intern",
    weekNumber: 10,
    title: "Week 10 - Final Project Completion",
    submissionDate: "2024-01-18T16:45:00Z",
    status: "approved",
    fileUrl: "/reports/sarah_wilson_week10.pdf",
    description:
      "Completed the final project - a microservices architecture for the company's new product. Implemented CI/CD pipeline.",
    achievements:
      "Deployed microservices to Azure, Set up CI/CD pipeline, Achieved 99.9% uptime, Completed all project requirements",
    challenges: "Initial deployment issues, Load balancing configuration",
    nextWeekPlan: "Project completed successfully, Preparing final presentation",
    supervisorFeedback: "Outstanding work throughout the internship. Exceeded all expectations.",
    teacherComments: "Exceptional performance! Your technical skills and dedication are commendable.",
    rating: 5,
  },
  {
    id: 5,
    studentId: 5,
    studentName: "Alex Brown",
    rollNumber: "21CE005",
    company: "Google",
    position: "ML Engineer Intern",
    weekNumber: 4,
    title: "Week 4 - Machine Learning Model Training",
    submissionDate: "2024-01-22T11:30:00Z",
    status: "pending",
    fileUrl: "/reports/alex_brown_week4.pdf",
    description:
      "Worked on training machine learning models for image classification. Experimented with different architectures.",
    achievements: "Trained CNN model with 85% accuracy, Implemented data augmentation, Optimized model performance",
    challenges: "Overfitting issues, Limited computational resources, Model interpretability",
    nextWeekPlan: "Implement regularization techniques, Try ensemble methods, Improve model documentation",
    supervisorFeedback: "",
    teacherComments: "",
    rating: 0,
  },
]

export default function TeacherReportsPage() {
  const [user, setUser] = useState(null)
  const [reports, setReports] = useState(mockReports)
  const [filteredReports, setFilteredReports] = useState(mockReports)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [weekFilter, setWeekFilter] = useState("all")
  const [companyFilter, setCompanyFilter] = useState("all")
  const [selectedReport, setSelectedReport] = useState(null)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [teacherComments, setTeacherComments] = useState("")
  const [rating, setRating] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  useEffect(() => {
    const filtered = reports.filter((report) => {
      const matchesSearch =
        report.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.company && report.company.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = statusFilter === "all" || report.status === statusFilter
      const matchesWeek = weekFilter === "all" || report.weekNumber.toString() === weekFilter
      const matchesCompany = companyFilter === "all" || report.company === companyFilter

      return matchesSearch && matchesStatus && matchesWeek && matchesCompany
    })

    setFilteredReports(filtered)
  }, [reports, searchTerm, statusFilter, weekFilter, companyFilter])

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setWeekFilter("all")
    setCompanyFilter("all")
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200"
      case "pending":
        return "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 border-yellow-200"
      case "needs_revision":
        return "bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-red-200"
      default:
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "needs_revision":
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const handleViewReport = (report) => {
    setSelectedReport(report)
    setTeacherComments(report.teacherComments || "")
    setRating(report.rating || 0)
    setShowReportDialog(true)
  }

  const handleApproveReport = (reportId, action) => {
    const updatedReports = reports.map((report) => {
      if (report.id === reportId) {
        return {
          ...report,
          status: action,
          teacherComments: teacherComments,
          rating: rating,
        }
      }
      return report
    })

    setReports(updatedReports)
    setShowReportDialog(false)

    const actionText =
      action === "approved" ? "approved" : action === "needs_revision" ? "marked for revision" : "rejected"
    toast.success(`Report ${actionText} successfully!`)
  }

  const handleDownloadReport = (report) => {
    // Create a mock PDF content
    const pdfContent = `
Weekly Report - ${report.title}
Student: ${report.studentName} (${report.rollNumber})
Company: ${report.company}
Position: ${report.position}
Week: ${report.weekNumber}
Submission Date: ${new Date(report.submissionDate).toLocaleDateString()}

Description:
${report.description}

Achievements:
${report.achievements}

Challenges:
${report.challenges}

Next Week Plan:
${report.nextWeekPlan}

${report.supervisorFeedback ? `Supervisor Feedback: ${report.supervisorFeedback}` : ""}
${report.teacherComments ? `Teacher Comments: ${report.teacherComments}` : ""}
${report.rating ? `Rating: ${report.rating}/5` : ""}
    `

    const blob = new Blob([pdfContent], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${report.studentName.replace(/\s+/g, "_")}_Week${report.weekNumber}_Report.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast.success(`Downloaded ${report.title}`)
  }

  const uniqueCompanies = [...new Set(reports.map((r) => r.company).filter(Boolean))]
  const uniqueWeeks = [...new Set(reports.map((r) => r.weekNumber))].sort((a, b) => a - b)
  const activeFiltersCount = [statusFilter, weekFilter, companyFilter].filter((f) => f !== "all").length

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
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                {
                  title: "Total Reports",
                  value: reports.length,
                  icon: FileText,
                  color: "blue",
                  subtitle: "All submissions",
                },
                {
                  title: "Pending Review",
                  value: reports.filter((r) => r.status === "pending").length,
                  icon: Clock,
                  color: "yellow",
                  subtitle: "Awaiting approval",
                },
                {
                  title: "Approved",
                  value: reports.filter((r) => r.status === "approved").length,
                  icon: CheckCircle,
                  color: "emerald",
                  subtitle: "Successfully reviewed",
                },
                {
                  title: "Need Revision",
                  value: reports.filter((r) => r.status === "needs_revision").length,
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
                    <div
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-${stat.color}-100 to-${stat.color}-200 flex items-center justify-center`}
                    >
                      <stat.icon className={`h-4 w-4 md:h-5 md:w-5 text-${stat.color}-600`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-xl md:text-3xl font-bold text-${stat.color}-600 mb-1`}>{stat.value}</div>
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
                  <Select value={companyFilter} onValueChange={setCompanyFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Companies</SelectItem>
                      {uniqueCompanies.map((company) => (
                        <SelectItem key={company} value={company}>
                          {company}
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
                    <p className="text-gray-500">Try adjusting your search criteria or filters</p>
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
                                  <span className="truncate">
                                    {report.studentName} ({report.rollNumber})
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Building className="h-3 w-3 md:h-4 md:w-4" />
                                  <span className="truncate">
                                    {report.company} - {report.position}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                                  <span>Week {report.weekNumber}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3 md:h-4 md:w-4" />
                                  <span>Submitted: {new Date(report.submissionDate).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-sm md:text-base text-gray-700 leading-relaxed line-clamp-3">
                              {report.description.length > 200
                                ? `${report.description.substring(0, 200)}...`
                                : report.description}
                            </p>
                          </div>

                          {report.rating > 0 && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm text-gray-600">Rating:</span>
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= report.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {report.teacherComments && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm text-blue-800">
                                <strong>Teacher Comments:</strong> {report.teacherComments}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-row lg:flex-col gap-2 lg:ml-6">
                          <Button size="sm" onClick={() => handleViewReport(report)} className="flex-1 lg:flex-none">
                            <Eye className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Review</span>
                            <span className="sm:hidden">Review</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadReport(report)}
                            className="flex-1 lg:flex-none"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Download</span>
                            <span className="sm:hidden">Download</span>
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
                    Review and provide feedback for {selectedReport?.studentName}'s weekly report
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
                            <span className="font-medium">{selectedReport.studentName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Roll Number:</span>
                            <span className="font-medium">{selectedReport.rollNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Company:</span>
                            <span className="font-medium">{selectedReport.company}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Position:</span>
                            <span className="font-medium">{selectedReport.position}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Week:</span>
                            <span className="font-medium">Week {selectedReport.weekNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Submitted:</span>
                            <span className="font-medium">
                              {new Date(selectedReport.submissionDate).toLocaleDateString()}
                            </span>
                          </div>
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
                            {selectedReport.supervisorFeedback && (
                              <div className="p-3 bg-green-50 rounded-lg">
                                <p className="text-sm text-green-800">
                                  <strong>Supervisor Feedback:</strong> {selectedReport.supervisorFeedback}
                                </p>
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
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Achievements</h4>
                          <p className="text-gray-700 leading-relaxed">{selectedReport.achievements}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Challenges</h4>
                          <p className="text-gray-700 leading-relaxed">{selectedReport.challenges}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Next Week Plan</h4>
                          <p className="text-gray-700 leading-relaxed">{selectedReport.nextWeekPlan}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Teacher Review Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Your Review</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
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
                      <Button variant="outline" onClick={() => setShowReportDialog(false)} className="w-full sm:w-auto">
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleApproveReport(selectedReport.id, "needs_revision")}
                        className="w-full sm:w-auto"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Request Revision
                      </Button>
                      <Button
                        className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                        onClick={() => handleApproveReport(selectedReport.id, "approved")}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
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
