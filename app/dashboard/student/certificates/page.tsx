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
import { Plus, Upload, CheckCircle, Clock, XCircle, Download, Eye, Award, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { getCertificatesByStudent, createCertificate, getCurrentUser, uploadFile } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"

interface Certificate {
  id: number
  student_id: string
  student_name: string
  student_email: string
  certificate_type: string
  title: string
  company_name: string
  duration: string
  start_date: string
  end_date: string
  file_name?: string
  file_url?: string
  file_size?: number
  status: 'pending' | 'approved' | 'rejected'
  upload_date: string
  approved_date?: string
  approved_by?: string
  feedback?: string
  created_at: string
}

export default function StudentCertificates() {
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadUserAndCertificates = async () => {
      try {
        setIsLoading(true)
        
        // Get current user
        const user = await getCurrentUser()
        if (!user) {
          toast({
            title: "Error",
            description: "User not found. Please log in again.",
            variant: "destructive",
          })
          return
        }
        
        setCurrentUser(user)
        
        // Get certificates for this user
        const userCertificates = await getCertificatesByStudent(user.id)
        console.log('Loaded certificates:', userCertificates)
        
        // Ensure we always have an array
        if (Array.isArray(userCertificates)) {
          setCertificates(userCertificates)
        } else {
          console.warn('Certificates is not an array:', userCertificates)
          setCertificates([])
        }
      } catch (error) {
        console.error('Error loading certificates:', error)
        toast({
          title: "Error",
          description: "Failed to load certificates. Please try again.",
          variant: "destructive",
        })
        setCertificates([])
      } finally {
        setIsLoading(false)
      }
    }

    loadUserAndCertificates()
  }, [toast])

  const handleUploadCertificate = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!currentUser) {
      toast({
        title: "Error",
        description: "User not found. Please log in again.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData(event.target as HTMLFormElement)
      const certificateFile = formData.get("certificate-file") as File

      // Validate required fields
      const internshipTitle = formData.get("internship-title") as string
      const companyName = formData.get("company-name") as string
      const startDate = formData.get("start-date") as string
      const endDate = formData.get("end-date") as string

      if (!internshipTitle || !companyName || !startDate || !endDate) {
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        })
        return
      }

      if (!certificateFile || certificateFile.size === 0) {
        toast({
          title: "Error",
          description: "Please select a certificate file.",
          variant: "destructive",
        })
        return
      }

      // Validate file type
      if (!certificateFile.name.toLowerCase().endsWith('.pdf')) {
        toast({
          title: "Error",
          description: "Please upload a PDF file.",
          variant: "destructive",
        })
        return
      }

      // Calculate duration
      const start = new Date(startDate)
      const end = new Date(endDate)
      const durationMonths = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30))
      const duration = `${durationMonths} month${durationMonths !== 1 ? 's' : ''}`

      // Upload file first
      const uploadFileName = `certificate_${currentUser.rollNumber || currentUser.id}_${Date.now()}.pdf`
      const uploadResult = await uploadFile(certificateFile, 'certificates', uploadFileName)

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'File upload failed')
      }

      // Create certificate record
      const certificateData = {
        studentId: currentUser.id,
        studentName: currentUser.name,
        studentEmail: currentUser.email,
        internshipTitle,
        company: companyName,
        duration,
        startDate,
        endDate,
        fileName: uploadResult.fileName,
        fileUrl: uploadResult.fileUrl,
        additionalNotes: formData.get("additional-notes") as string || undefined
      }

      console.log('Creating certificate with data:', certificateData)

      const newCertificate = await createCertificate(certificateData)
      
      // Add to local state
      setCertificates((prev) => [newCertificate, ...prev])
      setShowUploadForm(false)

      toast({
        title: "Certificate Uploaded",
        description: "Your certificate has been uploaded successfully and is pending approval.",
      })

      // Reset form
      ;(event.target as HTMLFormElement).reset()

    } catch (error: any) {
      console.error('Error uploading certificate:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to upload certificate. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewCertificate = (certificate: Certificate) => {
    if (certificate.file_url) {
      window.open(certificate.file_url, '_blank')
    } else {
      toast({
        title: "View Certificate",
        description: `Opening certificate: ${certificate.title}`,
      })
    }
  }

  const handleDownloadCertificate = async (certificate: Certificate) => {
    if (certificate.file_url && certificate.file_name) {
      try {
        const response = await fetch(certificate.file_url)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = certificate.file_name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        toast({
          title: "Download Started",
          description: `Downloading ${certificate.file_name}`,
        })
      } catch (error) {
        toast({
          title: "Download Failed",
          description: "Could not download the certificate file.",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "Download Certificate",
        description: `Mock download: ${certificate.title}`,
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'rejected':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-3 w-3" />
      case 'pending':
        return <Clock className="h-3 w-3" />
      case 'rejected':
        return <XCircle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  if (isLoading) {
    return (
      <AuthGuard allowedRoles={["student"]}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading certificates...</p>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
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
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
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
            {Array.isArray(certificates) && certificates.length > 0 ? (
              certificates.map((certificate) => (
                <Card key={certificate.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{certificate.title}</h3>
                          <Badge
                            variant={getStatusColor(certificate.status)}
                            className="flex items-center gap-1"
                          >
                            {getStatusIcon(certificate.status)}
                            {certificate.status.charAt(0).toUpperCase() + certificate.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{certificate.company_name}</p>
                        <div className="flex gap-4 text-sm text-gray-500 mb-3">
                          <span>Duration: {certificate.duration}</span>
                          <span>
                            Period: {new Date(certificate.start_date).toLocaleDateString()} -{" "}
                            {new Date(certificate.end_date).toLocaleDateString()}
                          </span>
                          <span>Uploaded: {new Date(certificate.upload_date || certificate.created_at).toLocaleDateString()}</span>
                          {certificate.approved_date && (
                            <span>Approved: {new Date(certificate.approved_date).toLocaleDateString()}</span>
                          )}
                        </div>
                        {certificate.approved_by && (
                          <p className="text-sm text-gray-600 mb-3">Approved by: {certificate.approved_by}</p>
                        )}
                        {certificate.feedback && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm font-medium mb-1">Faculty Feedback:</p>
                            <p className="text-sm text-gray-700">{certificate.feedback}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => handleViewCertificate(certificate)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDownloadCertificate(certificate)}>
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
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
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}