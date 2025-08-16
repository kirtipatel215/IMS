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

export default function WeeklyReports() {
  const [showForm, setShowForm] = useState(false)
  const [reports, setReports] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const loadReports = () => {
      const user = getCurrentUser()
      if (user) {
        const userReports = getReportsByStudent(user.id)
        setReports(userReports)
      }
    }

    loadReports()
  }, [])

  const handleSubmitReport = async (e: React.FormEvent) => {
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
      const achievements = (formData.get("achievements") as string)
        .split("\n")
        .filter((achievement) => achievement.trim())

      const newReport = createWeeklyReport({
        studentId: user.id,
        studentName: user.name,
        studentEmail: user.email,
        week: reports.length + 1,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        achievements,
        fileName: `week${reports.length + 1}_report_${user.name.toLowerCase().replace(" ", "_")}.pdf`,
      })

      setReports((prev) => [...prev, newReport])
      setShowForm(false)

      toast({
        title: "Report Submitted",
        description: "Your weekly report has been submitted successfully and is pending review.",
      })

      // Reset form
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownload = (reportId: number) => {
    toast({
      title: "Download Report",
      description: `Downloading report ${reportId}`,
    })
  }

  const handleResubmit = (reportId: number) => {
    toast({
      title: "Resubmit Report",
      description: `Resubmitting report ${reportId}`,
    })
  }

  const progressValue =
    reports.length > 0 ? (reports.filter((report) => report.status === "approved").length / 12) * 100 : 0
  const approvedCount = reports.filter((report) => report.status === "approved").length
  const revisionRequiredCount = reports.filter((report) => report.status === "revision_required").length
  const pendingCount = reports.filter((report) => report.status === "pending").length

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Weekly Reports</h1>
              <p className="text-gray-600">Submit and track your weekly internship progress</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
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
                    <div
                      className={`text-2xl font-bold ${revisionRequiredCount > 0 ? "text-orange-600" : "text-gray-400"}`}
                    >
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
                    <Input id="title" name="title" placeholder="Brief title describing this week's work" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Work Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe the tasks completed, challenges faced, and learning outcomes"
                      rows={4}
                      required
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="report-file">Report File (PDF/DOCX)</Label>
                    <Input id="report-file" type="file" accept=".pdf,.docx" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comments">Additional Comments (Optional)</Label>
                    <Textarea
                      id="comments"
                      name="comments"
                      placeholder="Any additional notes or questions for your mentor"
                      rows={2}
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
                    <Button variant="outline" type="button" onClick={() => setShowForm(false)}>
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
                          Week {report.week}: {report.title}
                        </h3>
                        <Badge
                          variant={
                            report.status === "approved"
                              ? "default"
                              : report.status === "revision_required"
                                ? "destructive"
                                : "secondary"
                          }
                          className="flex items-center gap-1"
                        >
                          {report.status === "approved" && <CheckCircle className="h-3 w-3" />}
                          {report.status === "revision_required" && <AlertCircle className="h-3 w-3" />}
                          {report.status === "pending" && <Clock className="h-3 w-3" />}
                          {report.status === "approved"
                            ? "Approved"
                            : report.status === "revision_required"
                              ? "Needs Revision"
                              : "Under Review"}
                        </Badge>
                        {report.grade && <Badge variant="outline">{report.grade}</Badge>}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Submitted: {new Date(report.submittedDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-700 mb-3">{report.description}</p>

                      {report.achievements.length > 0 && (
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
                      <Button variant="outline" size="sm" onClick={() => handleDownload(report.id)}>
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
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
