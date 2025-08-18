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
import { Plus, Upload, CheckCircle, Clock, AlertCircle, MessageSquare, Download, FileText } from "lucide-react"
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
  const { toast } = useToast()

    useEffect(() => {
    const loadReports = async () => {
      const user = await getCurrentUser()
      if (user) {
        const userReports = await getReportsByStudent(user.id)
        setReports(Array.isArray(userReports) ? userReports : [])
      } else {
        setReports([])
      }
    }

    loadReports()
  }, [])
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['pdf', 'docx', 'doc']
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      
      if (!fileExtension || !allowedTypes.includes(fileExtension)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or Word document.",
          variant: "destructive",
        })
        e.target.value = ''
        return
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
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
    const user = getCurrentUser()

    if (!user) {
      toast({
        title: "Error",
        description: "User not found. Please log in again.",
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
        studentId: user.id,
        studentName: user.name,
        studentEmail: user.email,
        week: reports.length + 1,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        achievements,
        comments: (formData.get("comments") as string) || null,
      }

      const newReport = await createWeeklyReport(reportData, uploadedFile || undefined)

      // Normalize the new report data
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
        title: "Report Submitted",
        description: "Your weekly report has been submitted successfully and is pending review.",
      })

      // Reset form
      ;(e.target as HTMLFormElement).reset()
    } catch (error: any) {
      console.error('Report submission error:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownload = (report: WeeklyReport) => {
    if (report.fileUrl) {
      // Create a temporary link to download the file
      const link = document.createElement('a')
      link.href = report.fileUrl
      link.download = report.fileName || `week_${report.week || 1}_report.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      toast({
        title: "Download Error",
        description: "File not available for download.",
        variant: "destructive",
      })
    }
  }

  const handleResubmit = (reportId: number) => {
    toast({
      title: "Resubmit Report",
      description: `Feature coming soon for report ${reportId}`,
    })
  }

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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default" as const
      case "revision_required":
        return "destructive" as const
      default:
        return "secondary" as const
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-3 w-3" />
      case "revision_required":
        return <AlertCircle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Approved"
      case "revision_required":
        return "Needs Revision"
      default:
        return "Under Review"
    }
  }

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Weekly Reports</h1>
              <p className="text-gray-600">Submit and track your weekly internship progress</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)} disabled={isSubmitting}>
              <Plus className="mr-2 h-4 w-4" />
              Submit New Report
            </Button>
          </div>

          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Progress Overview</CardTitle>
              <CardDescription>Your internship completion status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Reports Submitted</span>
                  <span className="text-sm text-gray-600">{reports.length} of 12 weeks</span>
                </div>
                <Progress value={progressValue} className="h-2" />
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className={`text-2xl font-bold ${approvedCount > 0 ? "text-green-600" : "text-gray-400"}`}>
                      {approvedCount}
                    </div>
                    <div className="text-xs text-gray-600">Approved</div>
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${revisionRequiredCount > 0 ? "text-orange-600" : "text-gray-400"}`}>
                      {revisionRequiredCount}
                    </div>
                    <div className="text-xs text-gray-600">Needs Revision</div>
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${pendingCount > 0 ? "text-blue-600" : "text-gray-400"}`}>
                      {pendingCount}
                    </div>
                    <div className="text-xs text-gray-600">Under Review</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>Submit Weekly Report - Week {reports.length + 1}</CardTitle>
                <CardDescription>Upload your weekly progress report and add comments</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitReport} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Report Title *</Label>
                    <Input 
                      id="title" 
                      name="title" 
                      placeholder="Brief title describing this week's work" 
                      required 
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Work Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe the tasks completed, challenges faced, and learning outcomes"
                      rows={4}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="achievements">Key Achievements *</Label>
                    <Textarea
                      id="achievements"
                      name="achievements"
                      placeholder="List your major accomplishments this week (one per line)"
                      rows={3}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="report-file">Report File (PDF/DOCX)</Label>
                    <Input 
                      id="report-file" 
                      type="file" 
                      accept=".pdf,.docx,.doc"
                      onChange={handleFileChange}
                      disabled={isSubmitting}
                    />
                    {uploadedFile && (
                      <p className="text-sm text-green-600">
                        File selected: {uploadedFile.name} ({Math.round(uploadedFile.size / 1024)}KB)
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="comments">Additional Comments (Optional)</Label>
                    <Textarea
                      id="comments"
                      name="comments"
                      placeholder="Any additional notes or questions for your mentor"
                      rows={2}
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        "Submitting..."
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
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          Week {report.week || report.week_number || 1}: {report.title}
                        </h3>
                        <Badge
                          variant={getStatusBadgeVariant(report.status)}
                          className="flex items-center gap-1"
                        >
                          {getStatusIcon(report.status)}
                          {getStatusText(report.status)}
                        </Badge>
                        {report.grade && <Badge variant="outline">{report.grade}</Badge>}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        Submitted: {formatDate(report.submittedDate || report.submitted_date)}
                      </p>
                      
                      <p className="text-sm text-gray-700 mb-3">{report.description}</p>

                      {report.achievements && report.achievements.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Key Achievements:</p>
                          <ul className="text-sm text-gray-600 list-disc list-inside">
                            {report.achievements.map((achievement, index) => (
                              <li key={index}>{achievement}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {report.feedback && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="h-4 w-4 text-gray-600" />
                            <span className="text-sm font-medium">Mentor Feedback:</span>
                          </div>
                          <p className="text-sm text-gray-700">{report.feedback}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      {(report.fileUrl || report.file_url) && (
                        <Button variant="outline" size="sm" onClick={() => handleDownload(report)}>
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      )}
                      {report.status === "revision_required" && (
                        <Button size="sm" onClick={() => handleResubmit(report.id)}>
                          <Upload className="h-4 w-4 mr-1" />
                          Resubmit
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {reports.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-2">No reports submitted yet</p>
                <p className="text-sm text-gray-400">Click "Submit New Report" to submit your first weekly report</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}