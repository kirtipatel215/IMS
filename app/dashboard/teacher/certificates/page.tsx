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
  Award,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  Building,
  AlertTriangle,
  X,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"
import { useState, useEffect } from "react"
import { getCurrentUser } from "@/lib/auth"
import { toast } from "sonner"

// Mock data for certificates
const mockCertificates = [
  {
    id: 1,
    studentId: 1,
    studentName: "John Doe",
    rollNumber: "21CE001",
    company: "TCS",
    position: "Software Developer Intern",
    submissionDate: "2024-01-20T10:30:00Z",
    status: "pending",
    certificateUrl: "/certificates/john_doe_certificate.pdf",
    internshipStartDate: "2024-01-15",
    internshipEndDate: "2024-06-15",
    duration: "6 months",
    grade: "A",
    supervisorName: "Mr. Rajesh Kumar",
    supervisorEmail: "rajesh.kumar@tcs.com",
    description:
      "Successfully completed 6-month internship program in software development. Worked on multiple projects including web applications and API development.",
    skills: "React.js, Node.js, MongoDB, REST APIs, Git, Agile Development",
    projects: "E-commerce Web Application, Customer Management System, API Gateway Implementation",
    teacherComments: "",
    approvalDate: null,
  },
  {
    id: 2,
    studentId: 2,
    studentName: "Jane Smith",
    rollNumber: "21CE002",
    company: "Infosys",
    position: "Full Stack Developer Intern",
    submissionDate: "2024-01-21T14:20:00Z",
    status: "approved",
    certificateUrl: "/certificates/jane_smith_certificate.pdf",
    internshipStartDate: "2024-01-10",
    internshipEndDate: "2024-06-10",
    duration: "5 months",
    grade: "A+",
    supervisorName: "Ms. Priya Sharma",
    supervisorEmail: "priya.sharma@infosys.com",
    description:
      "Outstanding performance during the full-stack development internship. Demonstrated excellent technical skills and leadership qualities.",
    skills: "Angular, Spring Boot, MySQL, Docker, Kubernetes, CI/CD",
    projects: "Banking Portal, Microservices Architecture, DevOps Pipeline",
    teacherComments:
      "Exceptional work throughout the internship. Jane has shown remarkable growth and technical expertise.",
    approvalDate: "2024-01-22T09:00:00Z",
  },
  {
    id: 3,
    studentId: 3,
    studentName: "Mike Johnson",
    rollNumber: "21CE003",
    company: "Wipro",
    position: "Data Analyst Intern",
    submissionDate: "2024-01-19T09:15:00Z",
    status: "rejected",
    certificateUrl: "/certificates/mike_johnson_certificate.pdf",
    internshipStartDate: "2024-01-05",
    internshipEndDate: "2024-06-05",
    duration: "5 months",
    grade: "B+",
    supervisorName: "Dr. Amit Patel",
    supervisorEmail: "amit.patel@wipro.com",
    description: "Completed data analysis internship with focus on business intelligence and data visualization.",
    skills: "Python, Pandas, Matplotlib, SQL, Tableau, Power BI",
    projects: "Sales Analytics Dashboard, Customer Segmentation Analysis",
    teacherComments:
      "Certificate needs to include more detailed project descriptions and supervisor contact verification required.",
    approvalDate: null,
  },
  {
    id: 4,
    studentId: 4,
    studentName: "Sarah Wilson",
    rollNumber: "21CE004",
    company: "Microsoft",
    position: "Software Engineer Intern",
    submissionDate: "2024-01-18T16:45:00Z",
    status: "approved",
    certificateUrl: "/certificates/sarah_wilson_certificate.pdf",
    internshipStartDate: "2023-12-01",
    internshipEndDate: "2024-05-01",
    duration: "5 months",
    grade: "A+",
    supervisorName: "Mr. Vikram Singh",
    supervisorEmail: "vikram.singh@microsoft.com",
    description:
      "Exceptional performance in software engineering internship. Led multiple high-impact projects and mentored junior interns.",
    skills: "C#, .NET Core, Azure, SQL Server, DevOps, Agile",
    projects: "Cloud Migration Project, Enterprise Web Application, Automated Testing Framework",
    teacherComments:
      "Outstanding achievement! Sarah has exceeded all expectations and demonstrated exceptional technical and leadership skills.",
    approvalDate: "2024-01-19T10:30:00Z",
  },
  {
    id: 5,
    studentId: 5,
    studentName: "Alex Brown",
    rollNumber: "21CE005",
    company: "Google",
    position: "ML Engineer Intern",
    submissionDate: "2024-01-22T11:30:00Z",
    status: "pending",
    certificateUrl: "/certificates/alex_brown_certificate.pdf",
    internshipStartDate: "2024-02-01",
    internshipEndDate: "2024-07-01",
    duration: "5 months",
    grade: "A",
    supervisorName: "Ms. Neha Gupta",
    supervisorEmail: "neha.gupta@google.com",
    description:
      "Completed machine learning engineering internship with focus on deep learning and computer vision applications.",
    skills: "Python, TensorFlow, PyTorch, Computer Vision, NLP, MLOps",
    projects: "Image Classification System, Natural Language Processing Pipeline, ML Model Deployment",
    teacherComments: "",
    approvalDate: null,
  },
]

export default function TeacherCertificatesPage() {
  const [user, setUser] = useState(null)
  const [certificates, setCertificates] = useState(mockCertificates)
  const [filteredCertificates, setFilteredCertificates] = useState(mockCertificates)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [companyFilter, setCompanyFilter] = useState("all")
  const [gradeFilter, setGradeFilter] = useState("all")
  const [selectedCertificate, setSelectedCertificate] = useState(null)
  const [showCertificateDialog, setShowCertificateDialog] = useState(false)
  const [teacherComments, setTeacherComments] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  useEffect(() => {
    const filtered = certificates.filter((certificate) => {
      const matchesSearch =
        certificate.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        certificate.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (certificate.company && certificate.company.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = statusFilter === "all" || certificate.status === statusFilter
      const matchesCompany = companyFilter === "all" || certificate.company === companyFilter
      const matchesGrade = gradeFilter === "all" || certificate.grade === gradeFilter

      return matchesSearch && matchesStatus && matchesCompany && matchesGrade
    })

    setFilteredCertificates(filtered)
  }, [certificates, searchTerm, statusFilter, companyFilter, gradeFilter])

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setCompanyFilter("all")
    setGradeFilter("all")
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200"
      case "pending":
        return "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 border-yellow-200"
      case "rejected":
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
      case "rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getGradeColor = (grade) => {
    switch (grade) {
      case "A+":
        return "text-emerald-600 bg-emerald-100"
      case "A":
        return "text-blue-600 bg-blue-100"
      case "B+":
        return "text-orange-600 bg-orange-100"
      case "B":
        return "text-yellow-600 bg-yellow-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const handleViewCertificate = (certificate) => {
    setSelectedCertificate(certificate)
    setTeacherComments(certificate.teacherComments || "")
    setShowCertificateDialog(true)
  }

  const handleApproveCertificate = (certificateId, action) => {
    const updatedCertificates = certificates.map((certificate) => {
      if (certificate.id === certificateId) {
        return {
          ...certificate,
          status: action,
          teacherComments: teacherComments,
          approvalDate: action === "approved" ? new Date().toISOString() : null,
        }
      }
      return certificate
    })

    setCertificates(updatedCertificates)
    setShowCertificateDialog(false)

    const actionText = action === "approved" ? "approved" : "rejected"
    toast.success(`Certificate ${actionText} successfully!`)
  }

  const handleDownloadCertificate = (certificate) => {
    // Create a mock certificate content
    const certificateContent = `
INTERNSHIP COMPLETION CERTIFICATE

This is to certify that

${certificate.studentName}
Roll Number: ${certificate.rollNumber}

has successfully completed the internship program at

${certificate.company}
Position: ${certificate.position}
Duration: ${certificate.duration}
Period: ${new Date(certificate.internshipStartDate).toLocaleDateString()} to ${new Date(certificate.internshipEndDate).toLocaleDateString()}

Grade Achieved: ${certificate.grade}

Supervisor: ${certificate.supervisorName}
Email: ${certificate.supervisorEmail}

Description:
${certificate.description}

Skills Acquired:
${certificate.skills}

Projects Completed:
${certificate.projects}

${certificate.teacherComments ? `Teacher Comments: ${certificate.teacherComments}` : ""}

Submission Date: ${new Date(certificate.submissionDate).toLocaleDateString()}
${certificate.approvalDate ? `Approval Date: ${new Date(certificate.approvalDate).toLocaleDateString()}` : ""}

Status: ${certificate.status.toUpperCase()}
    `

    const blob = new Blob([certificateContent], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${certificate.studentName.replace(/\s+/g, "_")}_${certificate.company.replace(/\s+/g, "_")}_Certificate.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast.success(`Downloaded ${certificate.studentName}'s certificate`)
  }

  const uniqueCompanies = [...new Set(certificates.map((c) => c.company).filter(Boolean))]
  const uniqueGrades = [...new Set(certificates.map((c) => c.grade))].sort()
  const activeFiltersCount = [statusFilter, companyFilter, gradeFilter].filter((f) => f !== "all").length

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
          <div className="p-4 md:p-6 space-y-6 md:space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      Internship Certificates
                    </h1>
                    <p className="text-gray-600 text-sm md:text-lg">
                      Review and approve student internship completion certificates
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                {
                  title: "Total Certificates",
                  value: certificates.length,
                  icon: Award,
                  color: "purple",
                  subtitle: "All submissions",
                },
                {
                  title: "Pending Review",
                  value: certificates.filter((c) => c.status === "pending").length,
                  icon: Clock,
                  color: "yellow",
                  subtitle: "Awaiting approval",
                },
                {
                  title: "Approved",
                  value: certificates.filter((c) => c.status === "approved").length,
                  icon: CheckCircle,
                  color: "emerald",
                  subtitle: "Successfully approved",
                },
                {
                  title: "Rejected",
                  value: certificates.filter((c) => c.status === "rejected").length,
                  icon: XCircle,
                  color: "red",
                  subtitle: "Need corrections",
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
                    <Filter className="h-5 w-5 text-purple-600" />
                    <CardTitle className="text-lg">Filters & Search</CardTitle>
                    {activeFiltersCount > 0 && (
                      <Badge className="bg-purple-100 text-purple-700">{activeFiltersCount} active</Badge>
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
                      placeholder="Search certificates..."
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
                      <SelectItem value="rejected">Rejected</SelectItem>
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
                  <Select value={gradeFilter} onValueChange={setGradeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Grades</SelectItem>
                      {uniqueGrades.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          Grade {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Certificates List */}
            <div className="space-y-4">
              {filteredCertificates.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-8 md:p-12 text-center">
                    <Award className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg md:text-xl font-semibold text-gray-600 mb-2">No certificates found</h3>
                    <p className="text-gray-500">Try adjusting your search criteria or filters</p>
                  </CardContent>
                </Card>
              ) : (
                filteredCertificates.map((certificate) => (
                  <Card
                    key={certificate.id}
                    className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 md:gap-4 mb-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                              <Award className="h-5 w-5 md:h-6 md:w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                <h3 className="text-lg md:text-xl font-bold text-gray-900 truncate">
                                  {certificate.studentName} - Internship Certificate
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  <Badge className={getStatusColor(certificate.status)}>
                                    {getStatusIcon(certificate.status)}
                                    <span className="ml-1">{certificate.status}</span>
                                  </Badge>
                                  <Badge className={`${getGradeColor(certificate.grade)} px-2 py-1`}>
                                    Grade {certificate.grade}
                                  </Badge>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 md:gap-2 text-xs md:text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <User className="h-3 w-3 md:h-4 md:w-4" />
                                  <span>{certificate.rollNumber}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Building className="h-3 w-3 md:h-4 md:w-4" />
                                  <span className="truncate">
                                    {certificate.company} - {certificate.position}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                                  <span>Duration: {certificate.duration}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3 md:h-4 md:w-4" />
                                  <span>Submitted: {new Date(certificate.submissionDate).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-sm md:text-base text-gray-700 leading-relaxed line-clamp-3">
                              {certificate.description.length > 200
                                ? `${certificate.description.substring(0, 200)}...`
                                : certificate.description}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-1 text-sm">Skills Acquired</h4>
                              <p className="text-xs md:text-sm text-gray-600 line-clamp-2">{certificate.skills}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-1 text-sm">Supervisor</h4>
                              <p className="text-xs md:text-sm text-gray-600">
                                {certificate.supervisorName} ({certificate.supervisorEmail})
                              </p>
                            </div>
                          </div>

                          {certificate.teacherComments && (
                            <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                              <p className="text-sm text-purple-800">
                                <strong>Teacher Comments:</strong> {certificate.teacherComments}
                              </p>
                            </div>
                          )}

                          {certificate.approvalDate && (
                            <div className="mt-2 text-sm text-emerald-600">
                              <strong>Approved on:</strong> {new Date(certificate.approvalDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 ml-6">
                          <Button size="sm" onClick={() => handleViewCertificate(certificate)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDownloadCertificate(certificate)}>
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

            {/* Certificate Review Dialog */}
            <Dialog open={showCertificateDialog} onOpenChange={setShowCertificateDialog}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <Award className="h-6 w-6 text-purple-600" />
                    Review Certificate: {selectedCertificate?.studentName}
                  </DialogTitle>
                  <DialogDescription>
                    Review and approve {selectedCertificate?.studentName}'s internship completion certificate
                  </DialogDescription>
                </DialogHeader>
                {selectedCertificate && (
                  <div className="space-y-6">
                    {/* Certificate Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Student Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Name:</span>
                            <span className="font-medium">{selectedCertificate.studentName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Roll Number:</span>
                            <span className="font-medium">{selectedCertificate.rollNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Company:</span>
                            <span className="font-medium">{selectedCertificate.company}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Position:</span>
                            <span className="font-medium">{selectedCertificate.position}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Duration:</span>
                            <span className="font-medium">{selectedCertificate.duration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Grade:</span>
                            <Badge className={getGradeColor(selectedCertificate.grade)}>
                              {selectedCertificate.grade}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Internship Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Start Date:</span>
                            <span className="font-medium">
                              {new Date(selectedCertificate.internshipStartDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">End Date:</span>
                            <span className="font-medium">
                              {new Date(selectedCertificate.internshipEndDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Supervisor:</span>
                            <span className="font-medium">{selectedCertificate.supervisorName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Supervisor Email:</span>
                            <span className="font-medium text-sm">{selectedCertificate.supervisorEmail}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Submitted:</span>
                            <span className="font-medium">
                              {new Date(selectedCertificate.submissionDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <Badge className={getStatusColor(selectedCertificate.status)}>
                              {selectedCertificate.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Certificate Content */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Certificate Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                          <p className="text-gray-700 leading-relaxed">{selectedCertificate.description}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Skills Acquired</h4>
                          <p className="text-gray-700 leading-relaxed">{selectedCertificate.skills}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Projects Completed</h4>
                          <p className="text-gray-700 leading-relaxed">{selectedCertificate.projects}</p>
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
                          <Label htmlFor="comments">Comments & Feedback</Label>
                          <Textarea
                            id="comments"
                            placeholder="Provide comments for approval or rejection..."
                            value={teacherComments}
                            onChange={(e) => setTeacherComments(e.target.value)}
                            rows={4}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                      <Button variant="outline" onClick={() => setShowCertificateDialog(false)}>
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleApproveCertificate(selectedCertificate.id, "rejected")}
                      >
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        Reject Certificate
                      </Button>
                      <Button
                        className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                        onClick={() => handleApproveCertificate(selectedCertificate.id, "approved")}
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Approve Certificate
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
