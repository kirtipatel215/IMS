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
import { Plus, Upload, CheckCircle, Clock, XCircle, Download, Eye, Award } from "lucide-react"
import { useState, useEffect } from "react"
import { getCertificatesByStudent, createCertificate, getCurrentUser } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"

export default function StudentCertificates() {
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [certificates, setCertificates] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const loadCertificates = () => {
      const user = getCurrentUser()
      if (user) {
        const userCertificates = getCertificatesByStudent(user.id)
        setCertificates(userCertificates)
      }
    }

    loadCertificates()
  }, [])

  const handleUploadCertificate = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(event.target as HTMLFormElement)
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
      const newCertificate = createCertificate({
        studentId: user.id,
        studentName: user.name,
        studentEmail: user.email,
        internshipTitle: formData.get("internship-title") as string,
        company: formData.get("company-name") as string,
        duration: "6 months", // Calculate from dates
        startDate: formData.get("start-date") as string,
        endDate: formData.get("end-date") as string,
        fileName: `certificate_${user.name.toLowerCase().replace(" ", "_")}_${Date.now()}.pdf`,
      })

      setCertificates((prev) => [...prev, newCertificate])
      setShowUploadForm(false)

      toast({
        title: "Certificate Uploaded",
        description: "Your certificate has been uploaded successfully and is pending approval.",
      })

      // Reset form
      ;(event.target as HTMLFormElement).reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload certificate. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewCertificate = (certificateId: number) => {
    toast({
      title: "View Certificate",
      description: `Opening certificate ${certificateId}`,
    })
  }

  const handleDownloadCertificate = (certificateId: number) => {
    toast({
      title: "Download Certificate",
      description: `Downloading certificate ${certificateId}`,
    })
  }

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Internship Certificates</h1>
              <p className="text-gray-600">Upload and manage your internship completion certificates</p>
            </div>
            <Button onClick={() => setShowUploadForm(!showUploadForm)}>
              <Plus className="mr-2 h-4 w-4" />
              Upload Certificate
            </Button>
          </div>

          {showUploadForm && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Internship Certificate</CardTitle>
                <CardDescription>Submit your internship completion certificate for approval</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUploadCertificate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="internship-title">Internship Title *</Label>
                    <Input
                      id="internship-title"
                      name="internship-title"
                      placeholder="Enter internship position title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name *</Label>
                    <Input id="company-name" name="company-name" placeholder="Enter company name" required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date *</Label>
                      <Input id="start-date" type="date" name="start-date" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date">End Date *</Label>
                      <Input id="end-date" type="date" name="end-date" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="certificate-file">Certificate File (PDF) *</Label>
                    <Input id="certificate-file" type="file" accept=".pdf" name="certificate-file" required />
                    <p className="text-xs text-gray-500">Upload your official internship completion certificate</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="additional-notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="additional-notes"
                      name="additional-notes"
                      placeholder="Any additional information about your internship"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        "Uploading..."
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Certificate
                        </>
                      )}
                    </Button>
                    <Button variant="outline" type="button" onClick={() => setShowUploadForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {certificates.map((certificate) => (
              <Card key={certificate.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{certificate.internshipTitle}</h3>
                        <Badge
                          variant={
                            certificate.status === "approved"
                              ? "default"
                              : certificate.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                          className="flex items-center gap-1"
                        >
                          {certificate.status === "approved" && <CheckCircle className="h-3 w-3" />}
                          {certificate.status === "pending" && <Clock className="h-3 w-3" />}
                          {certificate.status === "rejected" && <XCircle className="h-3 w-3" />}
                          {certificate.status.charAt(0).toUpperCase() + certificate.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{certificate.company}</p>
                      <div className="flex gap-4 text-sm text-gray-500 mb-3">
                        <span>Duration: {certificate.duration}</span>
                        <span>
                          Period: {new Date(certificate.startDate).toLocaleDateString()} -{" "}
                          {new Date(certificate.endDate).toLocaleDateString()}
                        </span>
                        <span>Uploaded: {new Date(certificate.uploadDate).toLocaleDateString()}</span>
                        {certificate.approvedDate && (
                          <span>Approved: {new Date(certificate.approvedDate).toLocaleDateString()}</span>
                        )}
                      </div>
                      {certificate.approvedBy && (
                        <p className="text-sm text-gray-600 mb-3">Approved by: {certificate.approvedBy}</p>
                      )}
                      {certificate.feedback && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm font-medium mb-1">Faculty Feedback:</p>
                          <p className="text-sm text-gray-700">{certificate.feedback}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => handleViewCertificate(certificate.id)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDownloadCertificate(certificate.id)}>
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {certificates.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-2">No certificates uploaded yet</p>
                <p className="text-sm text-gray-400">
                  Upload your internship completion certificate for faculty approval
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
