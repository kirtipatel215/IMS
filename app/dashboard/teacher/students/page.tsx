"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Search,
  Filter,
  Download,
  Eye,
  MessageSquare,
  Phone,
  Mail,
  Building,
  Calendar,
  TrendingUp,
  Users,
  FileText,
  Award,
  X,
  Send,
  Star,
  GraduationCap,
  AlertCircle,
  Loader2
} from "lucide-react"
import { useState, useEffect } from "react"
import { getCurrentUser, getStudentsByTeacher, getStudentDetails, sendMessageToStudent } from "@/lib/data"
import { toast } from "sonner"

interface Student {
  id: string
  name: string
  email: string
  rollNumber: string
  department: string
  phone: string
  company?: string
  position?: string
  supervisor?: string
  startDate?: string
  endDate?: string
  progress: number
  status: 'active' | 'completed' | 'inactive'
  reportsSubmitted: number
  totalReports: number
  cgpa: number
  lastActivity: string
  profileImage?: string
  certificates: number
}

export default function TeacherStudentsPage() {
  const [user, setUser] = useState<any>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [companyFilter, setCompanyFilter] = useState("all")
  const [progressFilter, setProgressFilter] = useState("all")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showStudentDialog, setShowStudentDialog] = useState(false)
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [messageText, setMessageText] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [studentDetails, setStudentDetails] = useState<any>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterStudents()
  }, [students, searchTerm, statusFilter, companyFilter, progressFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Loading teacher data and students...')
      
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      
      if (currentUser?.id) {
        const studentsData = await getStudentsByTeacher(currentUser.id)
        setStudents(studentsData)
        console.log('📊 Loaded students:', studentsData.length)
      }
    } catch (error: any) {
      console.error('💥 Error loading data:', error)
      setError('Failed to load students data. Please try again.')
      toast.error('Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  const filterStudents = () => {
    const filtered = students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.company && student.company.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = statusFilter === "all" || student.status === statusFilter

      const matchesCompany = companyFilter === "all" || student.company === companyFilter

      const matchesProgress =
        progressFilter === "all" ||
        (progressFilter === "high" && student.progress >= 80) ||
        (progressFilter === "medium" && student.progress >= 50 && student.progress < 80) ||
        (progressFilter === "low" && student.progress < 50)

      return matchesSearch && matchesStatus && matchesCompany && matchesProgress
    })
    setFilteredStudents(filtered)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setCompanyFilter("all")
    setProgressFilter("all")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200"
      case "completed":
        return "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200"
      case "inactive":
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200"
      default:
        return "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 border-yellow-200"
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-emerald-600"
    if (progress >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getGradientAvatar = (name: string, index: number) => {
    const gradients = [
      "bg-gradient-to-br from-blue-400 to-purple-500",
      "bg-gradient-to-br from-emerald-400 to-teal-500",
      "bg-gradient-to-br from-orange-400 to-pink-500",
      "bg-gradient-to-br from-indigo-400 to-blue-500",
      "bg-gradient-to-br from-rose-400 to-red-500",
      "bg-gradient-to-br from-purple-400 to-indigo-500",
      "bg-gradient-to-br from-teal-400 to-cyan-500",
      "bg-gradient-to-br from-yellow-400 to-orange-500",
    ]
    return gradients[index % gradients.length]
  }

  const uniqueCompanies = [...new Set(students.map((s) => s.company).filter(Boolean))]
  const activeFiltersCount = [statusFilter, companyFilter, progressFilter].filter((f) => f !== "all").length

  const handleDownloadCSV = () => {
    const csvContent = `Name,Email,Roll Number,Department,Company,Position,Progress,Status,Reports Submitted,CGPA,Last Activity
${filteredStudents
  .map(
    (student) =>
      `${student.name},${student.email},${student.rollNumber},${student.department},${student.company || "N/A"},${
        student.position || "N/A"
      },${student.progress}%,${student.status},${student.reportsSubmitted}/${student.totalReports},${student.cgpa},${
        student.lastActivity
      }`
  )
  .join("\n")}`

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `students_report_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success("CSV report downloaded successfully!")
  }

  const handleViewStudent = async (student: Student) => {
    setSelectedStudent(student)
    setShowStudentDialog(true)
    setLoadingDetails(true)
    
    try {
      const details = await getStudentDetails(student.id)
      setStudentDetails(details)
    } catch (error) {
      console.error('Error loading student details:', error)
      toast.error('Failed to load student details')
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleSendMessage = (student: Student) => {
    setSelectedStudent(student)
    setMessageText("")
    setShowMessageDialog(true)
  }

  const handleSendMessageSubmit = async () => {
    if (!messageText.trim()) {
      toast.error("Please enter a message")
      return
    }

    if (!selectedStudent || !user?.id) {
      toast.error("Missing required information")
      return
    }

    try {
      setSendingMessage(true)
      
      const result = await sendMessageToStudent(user.id, selectedStudent.id, messageText)
      
      if (result.success) {
        toast.success(`Message sent to ${selectedStudent.name}`)
        setShowMessageDialog(false)
        setMessageText("")
        setSelectedStudent(null)
      } else {
        toast.error(result.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  if (loading) {
    return (
      <AuthGuard allowedRoles={["teacher"]}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-sm text-gray-600">Loading students data...</p>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard allowedRoles={["teacher"]}>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
              <p className="text-gray-600">Monitor and guide your assigned students' internship progress</p>
              {user && (
                <p className="text-sm text-blue-600 mt-1">
                  Logged in as: {user.name} ({user.email})
                </p>
              )}
            </div>
            <Button onClick={handleDownloadCSV} disabled={filteredStudents.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadData}
                  className="ml-2"
                >
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Total Students",
                value: students.length,
                icon: Users,
                color: "blue",
                subtitle: "Under your guidance",
              },
              {
                title: "Active Internships",
                value: students.filter((s) => s.status === "active").length,
                icon: TrendingUp,
                color: "emerald",
                subtitle: "Currently ongoing",
              },
              {
                title: "Completed",
                value: students.filter((s) => s.status === "completed").length,
                icon: Award,
                color: "purple",
                subtitle: "Successfully finished",
              },
              {
                title: "Avg Progress",
                value: students.length > 0 
                  ? `${Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length)}%`
                  : "0%",
                icon: FileText,
                color: "orange",
                subtitle: "Overall completion",
              },
            ].map((stat, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className={`h-4 w-4 text-${stat.color}-500`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters & Search
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFiltersCount} active
                    </Badge>
                  )}
                </CardTitle>
                {activeFiltersCount > 0 && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search Students</Label>
                  <Input
                    id="search"
                    placeholder="Search by name, roll number, or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Select value={companyFilter} onValueChange={setCompanyFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Companies" />
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
                
                <div className="space-y-2">
                  <Label>Progress</Label>
                  <Select value={progressFilter} onValueChange={setProgressFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Progress" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Progress</SelectItem>
                      <SelectItem value="high">High (80%+)</SelectItem>
                      <SelectItem value="medium">Medium (50-79%)</SelectItem>
                      <SelectItem value="low">Low (&lt;50%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Students List */}
          <div className="space-y-4">
            {filteredStudents.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No students found</p>
                    <p className="text-sm text-gray-400">
                      Try adjusting your search criteria or filters
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredStudents.map((student, index) => (
                <Card key={student.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      {/* Student Avatar & Basic Info */}
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${getGradientAvatar(student.name, index)}`}>
                          {student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{student.name}</h3>
                            <Badge className={getStatusColor(student.status)}>
                              {student.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{student.rollNumber} • {student.department}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {student.email}
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {student.phone}
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            CGPA: {student.cgpa}
                          </p>
                        </div>
                      </div>

                      {/* Internship Info */}
                      <div className="flex-1">
                        {student.company ? (
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-900">Current Internship</h4>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Building className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">{student.company}</span>
                              </div>
                              <p className="text-sm text-gray-600">{student.position}</p>
                              <p className="text-sm text-gray-500">Supervisor: {student.supervisor}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  Start: {student.startDate ? new Date(student.startDate).toLocaleDateString() : 'N/A'}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  End: {student.endDate ? new Date(student.endDate).toLocaleDateString() : 'N/A'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-500 text-sm">
                            No active internship
                          </div>
                        )}
                      </div>

                      {/* Progress & Stats */}
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Progress</span>
                            <span className={`text-sm font-semibold ${getProgressColor(student.progress)}`}>
                              {student.progress}%
                            </span>
                          </div>
                          <Progress value={student.progress} className="w-32" />
                          <p className="text-xs text-gray-500 mt-1">
                            Reports: {student.reportsSubmitted}/{student.totalReports}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          Last activity: {new Date(student.lastActivity).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewStudent(student)}
                          className="flex-1 lg:flex-none"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendMessage(student)}
                          className="flex-1 lg:flex-none"
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Send Message
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Student Details Dialog */}
          <Dialog open={showStudentDialog} onOpenChange={setShowStudentDialog}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  {selectedStudent && (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${getGradientAvatar(selectedStudent.name, 0)}`}>
                      {selectedStudent.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                  )}
                  <div>
                    <DialogTitle>{selectedStudent?.name} - Detailed View</DialogTitle>
                    <DialogDescription>
                      Complete information about the student's internship progress
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {loadingDetails ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading student details...</span>
                </div>
              ) : (
                selectedStudent && (
                  <div className="space-y-6">
                    {/* Personal Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">Name:</span>
                            <span>{selectedStudent.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Roll Number:</span>
                            <span>{selectedStudent.rollNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Department:</span>
                            <span>{selectedStudent.department}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">Email:</span>
                            <span>{selectedStudent.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Phone:</span>
                            <span>{selectedStudent.phone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">CGPA:</span>
                            <span>{selectedStudent.cgpa}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Internship Details */}
                    {selectedStudent.company && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Internship Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="font-medium">Company:</span>
                              <span>{selectedStudent.company}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Position:</span>
                              <span>{selectedStudent.position}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Supervisor:</span>
                              <span>{selectedStudent.supervisor}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="font-medium">Start Date:</span>
                              <span>{selectedStudent.startDate ? new Date(selectedStudent.startDate).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">End Date:</span>
                              <span>{selectedStudent.endDate ? new Date(selectedStudent.endDate).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Status:</span>
                              <Badge className={getStatusColor(selectedStudent.status)}>
                                {selectedStudent.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Progress Overview */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Progress Overview</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{selectedStudent.progress}%</div>
                            <p className="text-sm text-gray-600">Overall Progress</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{selectedStudent.reportsSubmitted}</div>
                            <p className="text-sm text-gray-600">Reports Submitted</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600">{selectedStudent.totalReports}</div>
                            <p className="text-sm text-gray-600">Total Reports Required</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-orange-600">{selectedStudent.certificates}</div>
                            <p className="text-sm text-gray-600">Certificates</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Additional Statistics from studentDetails */}
                    {studentDetails?.stats && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Detailed Statistics</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="font-semibold text-blue-700">{studentDetails.stats.totalApplications}</div>
                            <div className="text-blue-600">Applications</div>
                          </div>
                          <div className="bg-yellow-50 p-3 rounded-lg">
                            <div className="font-semibold text-yellow-700">{studentDetails.stats.pendingReports}</div>
                            <div className="text-yellow-600">Pending Reviews</div>
                          </div>
                          <div className="bg-green-50 p-3 rounded-lg">
                            <div className="font-semibold text-green-700">{studentDetails.stats.approvedReports}</div>
                            <div className="text-green-600">Approved Reports</div>
                          </div>
                          <div className="bg-purple-50 p-3 rounded-lg">
                            <div className="font-semibold text-purple-700">{studentDetails.stats.totalCertificates}</div>
                            <div className="text-purple-600">Total Certificates</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              )}
            </DialogContent>
          </Dialog>

          {/* Send Message Dialog */}
          <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Send Message to {selectedStudent?.name}</DialogTitle>
                <DialogDescription>
                  Send a message or feedback to the student
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Type your message here..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    rows={5}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowMessageDialog(false)} 
                    className="w-full sm:w-auto"
                    disabled={sendingMessage}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSendMessageSubmit} 
                    className="w-full sm:w-auto"
                    disabled={sendingMessage || !messageText.trim()}
                  >
                    {sendingMessage ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
