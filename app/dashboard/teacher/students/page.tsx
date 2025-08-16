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
} from "lucide-react"
import { useState, useEffect } from "react"
import { getCurrentUser } from "@/lib/auth"
import { toast } from "sonner"

// Mock data - replace with actual API calls
const mockStudents = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@charusat.ac.in",
    rollNumber: "21CE001",
    department: "Computer Engineering",
    phone: "+91 9876543210",
    company: "TCS",
    position: "Software Developer Intern",
    supervisor: "Mr. Rajesh Kumar",
    startDate: "2024-01-15",
    endDate: "2024-06-15",
    progress: 85,
    status: "active",
    reportsSubmitted: 8,
    totalReports: 10,
    cgpa: 8.5,
    lastActivity: "2024-01-20T10:30:00Z",
    profileImage: null,
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@charusat.ac.in",
    rollNumber: "21CE002",
    department: "Computer Engineering",
    phone: "+91 9876543211",
    company: "Infosys",
    position: "Full Stack Developer Intern",
    supervisor: "Ms. Priya Sharma",
    startDate: "2024-01-10",
    endDate: "2024-06-10",
    progress: 92,
    status: "active",
    reportsSubmitted: 9,
    totalReports: 10,
    cgpa: 9.1,
    lastActivity: "2024-01-21T14:20:00Z",
    profileImage: null,
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.johnson@charusat.ac.in",
    rollNumber: "21CE003",
    department: "Computer Engineering",
    phone: "+91 9876543212",
    company: "Wipro",
    position: "Data Analyst Intern",
    supervisor: "Dr. Amit Patel",
    startDate: "2024-01-05",
    endDate: "2024-06-05",
    progress: 78,
    status: "active",
    reportsSubmitted: 7,
    totalReports: 10,
    cgpa: 8.2,
    lastActivity: "2024-01-19T09:15:00Z",
    profileImage: null,
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah.wilson@charusat.ac.in",
    rollNumber: "21CE004",
    department: "Computer Engineering",
    phone: "+91 9876543213",
    company: "Microsoft",
    position: "Software Engineer Intern",
    supervisor: "Mr. Vikram Singh",
    startDate: "2023-12-01",
    endDate: "2024-05-01",
    progress: 100,
    status: "completed",
    reportsSubmitted: 10,
    totalReports: 10,
    cgpa: 9.3,
    lastActivity: "2024-01-18T16:45:00Z",
    profileImage: null,
  },
  {
    id: 5,
    name: "Alex Brown",
    email: "alex.brown@charusat.ac.in",
    rollNumber: "21CE005",
    department: "Computer Engineering",
    phone: "+91 9876543214",
    company: "Google",
    position: "ML Engineer Intern",
    supervisor: "Ms. Neha Gupta",
    startDate: "2024-02-01",
    endDate: "2024-07-01",
    progress: 45,
    status: "active",
    reportsSubmitted: 4,
    totalReports: 10,
    cgpa: 8.8,
    lastActivity: "2024-01-22T11:30:00Z",
    profileImage: null,
  },
]

export default function TeacherStudentsPage() {
  const [user, setUser] = useState(null)
  const [students, setStudents] = useState(mockStudents)
  const [filteredStudents, setFilteredStudents] = useState(mockStudents)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [companyFilter, setCompanyFilter] = useState("all")
  const [progressFilter, setProgressFilter] = useState("all")
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showStudentDialog, setShowStudentDialog] = useState(false)
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [messageText, setMessageText] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  useEffect(() => {
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
  }, [students, searchTerm, statusFilter, companyFilter, progressFilter])

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setCompanyFilter("all")
    setProgressFilter("all")
  }

  const getStatusColor = (status) => {
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

  const getProgressColor = (progress) => {
    if (progress >= 80) return "text-emerald-600"
    if (progress >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getGradientAvatar = (name, index) => {
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
      }`,
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

  const handleViewStudent = (student) => {
    setSelectedStudent(student)
    setShowStudentDialog(true)
  }

  const handleSendMessage = (student) => {
    setSelectedStudent(student)
    setMessageText("")
    setShowMessageDialog(true)
  }

  const handleSendMessageSubmit = () => {
    if (!messageText.trim()) {
      toast.error("Please enter a message")
      return
    }

    // Here you would typically send the message via API
    toast.success(`Message sent to ${selectedStudent.name}`)
    setShowMessageDialog(false)
    setMessageText("")
    setSelectedStudent(null)
  }

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
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      My Students
                    </h1>
                    <p className="text-gray-600 text-sm md:text-lg">
                      Monitor and guide your assigned students' internship progress
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleDownloadCSV}
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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
                  value: `${Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length)}%`,
                  icon: FileText,
                  color: "orange",
                  subtitle: "Overall completion",
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
                    <Filter className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">Filters & Search</CardTitle>
                    {activeFiltersCount > 0 && (
                      <Badge className="bg-blue-100 text-blue-700">{activeFiltersCount} active</Badge>
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
                      placeholder="Search students..."
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
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
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
                  <Select value={progressFilter} onValueChange={setProgressFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by progress" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Progress</SelectItem>
                      <SelectItem value="high">High (80%+)</SelectItem>
                      <SelectItem value="medium">Medium (50-79%)</SelectItem>
                      <SelectItem value="low">Low (&lt;50%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Students List */}
            <div className="space-y-4">
              {filteredStudents.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-8 md:p-12 text-center">
                    <Users className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg md:text-xl font-semibold text-gray-600 mb-2">No students found</h3>
                    <p className="text-gray-500">Try adjusting your search criteria or filters</p>
                  </CardContent>
                </Card>
              ) : (
                filteredStudents.map((student, index) => (
                  <Card
                    key={student.id}
                    className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 md:gap-4 mb-4">
                            <div
                              className={`w-12 h-12 md:w-16 md:h-16 ${getGradientAvatar(
                                student.name,
                                index,
                              )} rounded-2xl flex items-center justify-center shadow-lg`}
                            >
                              <span className="text-white font-bold text-sm md:text-lg">
                                {student.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                <h3 className="text-lg md:text-xl font-bold text-gray-900 truncate">{student.name}</h3>
                                <Badge className={getStatusColor(student.status)}>{student.status}</Badge>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 md:gap-2 text-xs md:text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <GraduationCap className="h-3 w-3 md:h-4 md:w-4" />
                                  <span className="truncate">
                                    {student.rollNumber} • {student.department}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Mail className="h-3 w-3 md:h-4 md:w-4" />
                                  <span className="truncate">{student.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3 w-3 md:h-4 md:w-4" />
                                  <span>{student.phone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Star className="h-3 w-3 md:h-4 md:w-4" />
                                  <span>CGPA: {student.cgpa}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4">
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm font-semibold text-gray-700 mb-1">Current Internship</p>
                                <div className="flex items-center gap-2 mb-1">
                                  <Building className="h-4 w-4 text-blue-600" />
                                  <span className="font-medium text-gray-900">{student.company}</span>
                                </div>
                                <p className="text-sm text-gray-600">{student.position}</p>
                                <p className="text-xs text-gray-500">Supervisor: {student.supervisor}</p>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>Start: {new Date(student.startDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>End: {new Date(student.endDate).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-sm font-semibold text-gray-700">Progress</p>
                                  <span className={`text-lg font-bold ${getProgressColor(student.progress)}`}>
                                    {student.progress}%
                                  </span>
                                </div>
                                <Progress value={student.progress} className="h-3 mb-2" />
                                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs text-gray-500">
                                  <span>
                                    Reports: {student.reportsSubmitted}/{student.totalReports}
                                  </span>
                                  <span>Last activity: {new Date(student.lastActivity).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row lg:flex-col gap-2 lg:ml-6">
                          <Button size="sm" onClick={() => handleViewStudent(student)} className="flex-1 lg:flex-none">
                            <Eye className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">View Details</span>
                            <span className="sm:hidden">View</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendMessage(student)}
                            className="flex-1 lg:flex-none"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Send Message</span>
                            <span className="sm:hidden">Message</span>
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
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 ${getGradientAvatar(
                        selectedStudent?.name || "",
                        0,
                      )} rounded-xl flex items-center justify-center`}
                    >
                      <span className="text-white font-bold">
                        {selectedStudent?.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    {selectedStudent?.name} - Detailed View
                  </DialogTitle>
                  <DialogDescription>Complete information about the student's internship progress</DialogDescription>
                </DialogHeader>
                {selectedStudent && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Name:</span>
                            <span className="font-medium">{selectedStudent.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Roll Number:</span>
                            <span className="font-medium">{selectedStudent.rollNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Department:</span>
                            <span className="font-medium">{selectedStudent.department}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium text-sm">{selectedStudent.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-medium">{selectedStudent.phone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">CGPA:</span>
                            <span className="font-medium">{selectedStudent.cgpa}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Internship Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Company:</span>
                            <span className="font-medium">{selectedStudent.company}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Position:</span>
                            <span className="font-medium">{selectedStudent.position}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Supervisor:</span>
                            <span className="font-medium">{selectedStudent.supervisor}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Start Date:</span>
                            <span className="font-medium">
                              {new Date(selectedStudent.startDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">End Date:</span>
                            <span className="font-medium">
                              {new Date(selectedStudent.endDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <Badge className={getStatusColor(selectedStudent.status)}>{selectedStudent.status}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Progress Overview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">Overall Progress</span>
                              <span className={`text-xl font-bold ${getProgressColor(selectedStudent.progress)}`}>
                                {selectedStudent.progress}%
                              </span>
                            </div>
                            <Progress value={selectedStudent.progress} className="h-4" />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                              <div className="text-2xl font-bold text-blue-600">{selectedStudent.reportsSubmitted}</div>
                              <div className="text-sm text-gray-600">Reports Submitted</div>
                            </div>
                            <div className="text-center p-4 bg-emerald-50 rounded-lg">
                              <div className="text-2xl font-bold text-emerald-600">{selectedStudent.totalReports}</div>
                              <div className="text-sm text-gray-600">Total Reports Required</div>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                              <div className="text-2xl font-bold text-purple-600">
                                {Math.round((selectedStudent.reportsSubmitted / selectedStudent.totalReports) * 100)}%
                              </div>
                              <div className="text-sm text-gray-600">Completion Rate</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Send Message Dialog */}
            <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Send Message to {selectedStudent?.name}</DialogTitle>
                  <DialogDescription>Send a message or feedback to the student</DialogDescription>
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
                  <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button variant="outline" onClick={() => setShowMessageDialog(false)} className="w-full sm:w-auto">
                      Cancel
                    </Button>
                    <Button onClick={handleSendMessageSubmit} className="w-full sm:w-auto">
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
