"use client"

import type React from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Plus, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  MessageSquare, 
  Download, 
  FileText, 
  Calendar,
  Star,
  Eye,
  TrendingUp,
  Award,
  User,
  Building,
  Mail,
  Hash,
  Target,
  BookOpen,
  Filter,
  Search
} from "lucide-react"
import { useState, useEffect } from "react"
import { getReportsByStudent, createWeeklyReport, getCurrentUser } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"

// Define proper interfaces
interface WeeklyReport {
  id: number
  student_id?: string
  studentId?: string
  student_name?: string
  studentName?: string
  student_email?: string
  studentEmail?: string
  week_number?: number
  week?: number
  title: string
  description: string
  achievements: string[]
  status: 'pending' | 'approved' | 'revision_required'
  file_name?: string
  fileName?: string
  file_url?: string
  fileUrl?: string
  file_size?: number
  fileSize?: number
  feedback?: string
  grade?: string
  submitted_date?: string
  submittedDate?: string
  created_at?: string
  createdAt?: string
  comments?: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  department?: string
  rollNumber?: string
  loginTime?: string
}

export default function WeeklyReports() {
  const [showForm, setShowForm] = useState<boolean>(false)
  const [reports, setReports] = useState<WeeklyReport[]>([])
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const { toast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await getCurrentUser()
        if (user) {
          setCurrentUser(user)
          const userReports = await getReportsByStudent(user.id)
          setReports(Array.isArray(userReports) ? userReports : [])
        } else {
          setReports([])
        }
      } catch (error) {
        console.error('Error loading user data:', error)
        toast({
          title: "Error",
          description: "Failed to load user data. Please refresh the page.",
          variant: "destructive",
        })
      }
    }

    loadData()
  }, [toast])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['pdf', 'docx', 'doc']
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      
      if (!fileExtension || !allowedTypes.includes(fileExtension)) {
        toast({
          title: "❌ Invalid File Type",
          description: "Please upload a PDF or Word document.",
          variant: "destructive",
        })
        e.target.value = ''
        return
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "📁 File Too Large",
          description: "Please upload a file smaller than 10MB.",
          variant: "destructive",
        })
        e.target.value = ''
        return
      }

      setUploadedFile(file)
    }
  }

  const handleSubmitReport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.target as HTMLFormElement)

    if (!currentUser) {
      toast({
        title: "⚠️ Authentication Error",
        description: "User not found. Please refresh the page and try again.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      const achievementsText = formData.get("achievements") as string
      const achievements = achievementsText
        .split("\n")
        .map(achievement => achievement.trim())
        .filter(achievement => achievement.length > 0)

      const reportData = {
        studentId: currentUser.id,
        studentName: currentUser.name,
        studentEmail: currentUser.email,
        week: reports.length + 1,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        achievements,
        comments: (formData.get("comments") as string) || null,
      }

      console.log('Submitting report with data:', reportData)

      const newReport = await createWeeklyReport(reportData, uploadedFile || undefined)

      const normalizedNewReport: WeeklyReport = {
        ...newReport,
        week: newReport.week_number || newReport.week || reportData.week,
        studentId: newReport.student_id || newReport.studentId || reportData.studentId,
        studentName: newReport.student_name || newReport.studentName || reportData.studentName,
        studentEmail: newReport.student_email || newReport.studentEmail || reportData.studentEmail,
        fileName: newReport.file_name || newReport.fileName,
        fileUrl: newReport.file_url || newReport.fileUrl,
        fileSize: newReport.file_size || newReport.fileSize,
        submittedDate: newReport.submitted_date || newReport.submittedDate || newReport.created_at || newReport.createdAt || new Date().toISOString()
      }

      setReports((prev) => [...prev, normalizedNewReport])
      setShowForm(false)
      setUploadedFile(null)

      toast({
        title: "🎉 Report Submitted Successfully!",
        description: "Your weekly report has been submitted and is pending review.",
      })

      ;(e.target as HTMLFormElement).reset()
    } catch (error: any) {
      console.error('Report submission error:', error)
      toast({
        title: "❌ Submission Failed",
        description: error.message || "Failed to submit report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownload = (report: WeeklyReport) => {
    if (report.fileUrl || report.file_url) {
      const link = document.createElement('a')
      link.href = report.fileUrl || report.file_url || ''
      link.download = report.fileName || report.file_name || `week_${report.week || 1}_report.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: "📥 Download Started",
        description: "Your file is being downloaded.",
      })
    } else {
      toast({
        title: "❌ Download Error",
        description: "File not available for download.",
        variant: "destructive",
      })
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || report.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const progressValue = reports.length > 0 
    ? Math.min((reports.filter((report) => report.status === "approved").length / 12) * 100, 100) 
    : 0
    
  const approvedCount = reports.filter((report) => report.status === "approved").length
  const revisionRequiredCount = reports.filter((report) => report.status === "revision_required").length
  const pendingCount = reports.filter((report) => report.status === "pending").length

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Unknown date'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return 'Invalid date'
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "approved":
        return {
          variant: "default" as const,
          icon: <CheckCircle className="h-3 w-3" />,
          text: "Approved",
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200"
        }
      case "revision_required":
        return {
          variant: "destructive" as const,
          icon: <AlertCircle className="h-3 w-3" />,
          text: "Needs Revision",
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200"
        }
      default:
        return {
          variant: "secondary" as const,
          icon: <Clock className="h-3 w-3" />,
          text: "Under Review",
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200"
        }
    }
  }

  const getGradeColor = (grade: string) => {
    if (grade === 'A' || grade === 'A+') return 'text-green-600 bg-green-100'
    if (grade === 'B' || grade === 'B+') return 'text-blue-600 bg-blue-100'
    if (grade === 'C') return 'text-yellow-600 bg-yellow-100'
    return 'text-gray-600 bg-gray-100'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB'
    return Math.round(bytes / (1024 * 1024)) + ' MB'
  }

  // Show loading state while user data is being fetched
  if (!currentUser) {
    return (
      <AuthGuard allowedRoles={["student"]}>
        <DashboardLayout>
          <div className="space-y-6">
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 font-medium">Loading your reports...</p>
                <p className="text-sm text-gray-400">Please wait a moment</p>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="h-8 w-8" />
                  <h1 className="text-3xl font-bold">Weekly Reports</h1>
                </div>
                <p className="text-blue-100 mb-4">Track your internship progress and submissions</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{currentUser.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Hash className="h-4 w-4" />
                    <span>{currentUser.rollNumber}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    <span>{currentUser.department}</span>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => setShowForm(!showForm)} 
                disabled={isSubmitting}
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg"
                size="lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                New Report
              </Button>
            </div>
          </div>

          {/* Statistics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Reports</p>
                    <p className="text-3xl font-bold text-gray-900">{reports.length}</p>
                    <p className="text-xs text-gray-500 mt-1">out of 12 weeks</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
                    <p className="text-xs text-gray-500 mt-1">completed successfully</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Needs Revision</p>
                    <p className="text-3xl font-bold text-orange-600">{revisionRequiredCount}</p>
                    <p className="text-xs text-gray-500 mt-1">requires updates</p>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Under Review</p>
                    <p className="text-3xl font-bold text-purple-600">{pendingCount}</p>
                    <p className="text-xs text-gray-500 mt-1">awaiting feedback</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Overview */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                  <div>
                    <CardTitle>Progress Overview</CardTitle>
                    <CardDescription>Your internship completion status</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-lg font-bold px-3 py-1">
                  {Math.round(progressValue)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={progressValue} className="h-3 rounded-full" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Week 1</span>
                  <span className="text-gray-600">Week 12</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit New Report Form */}
          {showForm && (
            <Card className="shadow-lg border-2 border-blue-100">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="flex items-center gap-3">
                  <Upload className="h-6 w-6 text-blue-600" />
                  Submit Weekly Report - Week {reports.length + 1}
                </CardTitle>
                <CardDescription>Upload your weekly progress report with detailed information</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmitReport} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Report Title *
                      </Label>
                      <Input 
                        id="title" 
                        name="title" 
                        placeholder="e.g., Mobile App Development Progress" 
                        required 
                        disabled={isSubmitting}
                        className="transition-colors focus:border-blue-400"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="report-file" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Report File (PDF/DOCX)
                      </Label>
                      <Input 
                        id="report-file" 
                        type="file" 
                        accept=".pdf,.docx,.doc"
                        onChange={handleFileChange}
                        disabled={isSubmitting}
                        className="transition-colors"
                      />
                      {uploadedFile && (
                        <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-700">
                            {uploadedFile.name} ({formatFileSize(uploadedFile.size)})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description" className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Work Description *
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe the tasks completed, challenges faced, and learning outcomes during this week..."
                      rows={4}
                      required
                      disabled={isSubmitting}
                      className="transition-colors focus:border-blue-400"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="achievements" className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Key Achievements *
                    </Label>
                    <Textarea
                      id="achievements"
                      name="achievements"
                      placeholder="• Completed user authentication module&#10;• Fixed 5 critical bugs&#10;• Learned Redux state management"
                      rows={3}
                      required
                      disabled={isSubmitting}
                      className="transition-colors focus:border-blue-400"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="comments" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Additional Comments (Optional)
                    </Label>
                    <Textarea
                      id="comments"
                      name="comments"
                      placeholder="Any additional notes, questions for your mentor, or feedback about the internship experience..."
                      rows={2}
                      disabled={isSubmitting}
                      className="transition-colors focus:border-blue-400"
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={isSubmitting} className="flex-1 md:flex-none" size="lg">
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Submit Report
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      type="button" 
                      onClick={() => {
                        setShowForm(false)
                        setUploadedFile(null)
                      }}
                      disabled={isSubmitting}
                      size="lg"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="revision_required">Needs Revision</option>
                </select>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm">
              {filteredReports.length} {filteredReports.length === 1 ? 'report' : 'reports'} found
            </Badge>
          </div>

          {/* Reports List */}
          <div className="space-y-4">
            {filteredReports.map((report) => {
              const statusConfig = getStatusConfig(report.status)
              return (
                <Card key={report.id} className={`shadow-sm hover:shadow-md transition-all duration-200 border ${statusConfig.borderColor} ${statusConfig.bgColor}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-blue-600">{report.week || report.week_number || 1}</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                          </div>
                          <Badge variant={statusConfig.variant} className="flex items-center gap-1">
                            {statusConfig.icon}
                            {statusConfig.text}
                          </Badge>
                          {report.grade && (
                            <Badge variant="outline" className={`${getGradeColor(report.grade)} font-bold`}>
                              <Star className="h-3 w-3 mr-1" />
                              {report.grade}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Submitted: {formatDate(report.submittedDate || report.submitted_date)}</span>
                          </div>
                          {(report.fileUrl || report.file_url) && (
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              <span>File attached</span>
                            </div>
                          )}
                          {report.achievements && report.achievements.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Award className="h-4 w-4" />
                              <span>{report.achievements.length} achievements</span>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-gray-700 line-clamp-2 mb-4">{report.description}</p>

                        {report.feedback && (
                          <div className="bg-white/80 border border-gray-200 p-3 rounded-lg mb-3">
                            <div className="flex items-center gap-2 mb-1">
                              <MessageSquare className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-600">Mentor Feedback:</span>
                            </div>
                            <p className="text-sm text-gray-700">{report.feedback}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-6">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full">
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-lg font-bold text-blue-600">{report.week || report.week_number || 1}</span>
                                </div>
                                Week {report.week || report.week_number || 1}: {report.title}
                              </DialogTitle>
                              <DialogDescription>
                                Detailed view of your weekly report submission
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-6 mt-6">
                              {/* Status and Grade */}
                              <div className="flex items-center gap-4">
                                <Badge variant={statusConfig.variant} className="flex items-center gap-1">
                                  {statusConfig.icon}
                                  {statusConfig.text}
                                </Badge>
                                {report.grade && (
                                  <Badge variant="outline" className={`${getGradeColor(report.grade)} font-bold text-lg px-3 py-1`}>
                                    <Star className="h-4 w-4 mr-1" />
                                    Grade: {report.grade}
                                  </Badge>
                                )}
                              </div>

                              {/* Student Info */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm text-gray-600">Student:</span>
                                  <span className="font-medium">{report.studentName || report.student_name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm text-gray-600">Email:</span>
                                  <span className="font-medium">{report.studentEmail || report.student_email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm text-gray-600">Submitted:</span>
                                  <span className="font-medium">{formatDate(report.submittedDate || report.submitted_date)}</span>
                                </div>
                                {(report.fileUrl || report.file_url) && (
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">File:</span>
                                    <span className="font-medium">{report.fileName || report.file_name || 'Report file'}</span>
                                  </div>
                                )}
                              </div>

                              {/* Work Description */}
                              <div className="space-y-3">
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                  <BookOpen className="h-5 w-5 text-blue-600" />
                                  Work Description
                                </h4>
                                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                                  <p className="text-gray-700 whitespace-pre-wrap">{report.description}</p>
                                </div>
                              </div>

                              {/* Key Achievements */}
                              {report.achievements && report.achievements.length > 0 && (
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Award className="h-5 w-5 text-yellow-600" />
                                    Key Achievements ({report.achievements.length})
                                  </h4>
                                  <div className="p-4 bg-white border border-gray-200 rounded-lg">
                                    <ul className="space-y-2">
                                      {report.achievements.map((achievement, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                          <span className="text-gray-700">{achievement}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              )}

                              {/* Additional Comments */}
                              {report.comments && (
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-purple-600" />
                                    Additional Comments
                                  </h4>
                                  <div className="p-4 bg-white border border-gray-200 rounded-lg">
                                    <p className="text-gray-700 whitespace-pre-wrap">{report.comments}</p>
                                  </div>
                                </div>
                              )}

                              {/* Mentor Feedback */}
                              {report.feedback && (
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-blue-600" />
                                    Mentor Feedback
                                  </h4>
                                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-blue-800 whitespace-pre-wrap">{report.feedback}</p>
                                  </div>
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="flex gap-3 pt-4 border-t">
                                {(report.fileUrl || report.file_url) && (
                                  <Button 
                                    variant="outline" 
                                    onClick={() => handleDownload(report)}
                                    className="flex-1"
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download File
                                  </Button>
                                )}
                                {report.status === "revision_required" && (
                                  <Button 
                                    onClick={() => {
                                      toast({
                                        title: "🔄 Resubmission Feature",
                                        description: "Feature coming soon for report resubmission.",
                                      })
                                    }}
                                    className="flex-1"
                                  >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Resubmit Report
                                  </Button>
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {(report.fileUrl || report.file_url) && (
                          <Button variant="outline" size="sm" onClick={() => handleDownload(report)}>
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        )}
                        
                        {report.status === "revision_required" && (
                          <Button size="sm" onClick={() => {
                            toast({
                              title: "🔄 Resubmission Feature",
                              description: "Feature coming soon for report resubmission.",
                            })
                          }}>
                            <Upload className="h-4 w-4 mr-1" />
                            Resubmit
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Empty State */}
          {filteredReports.length === 0 && reports.length === 0 && (
            <Card className="shadow-sm">
              <CardContent className="p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <FileText className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports Yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Start your internship journey by submitting your first weekly report. 
                  Document your progress and achievements to track your growth.
                </p>
                <Button 
                  onClick={() => setShowForm(true)}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Submit Your First Report
                </Button>
              </CardContent>
            </Card>
          )}

          {/* No Search Results */}
          {filteredReports.length === 0 && reports.length > 0 && (
            <Card className="shadow-sm">
              <CardContent className="p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reports Found</h3>
                <p className="text-gray-600 mb-4">
                  No reports match your current search criteria. Try adjusting your filters or search term.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("all")
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats Footer */}
          {reports.length > 0 && (
            <Card className="bg-gradient-to-r from-gray-50 to-blue-50 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{Math.round(progressValue)}%</p>
                      <p className="text-sm text-gray-600">Completion Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{reports.length}</p>
                      <p className="text-sm text-gray-600">Total Submissions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
                      <p className="text-sm text-gray-600">Approved Reports</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Keep up the great work!</p>
                    <p className="text-xs text-gray-500">
                      Next report due: Week {reports.length + 1}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}