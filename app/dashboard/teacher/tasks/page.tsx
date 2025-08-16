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
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Search,
  Filter,
  Plus,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  CalendarIcon,
  User,
  Users,
  Target,
  X,
  Send,
  FileText,
} from "lucide-react"
import { useState, useEffect } from "react"
import { getCurrentUser } from "@/lib/auth"
import { toast } from "sonner"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// Mock data for tasks
const mockTasks = [
  {
    id: 1,
    title: "Weekly Report Submission",
    description: "Submit your weekly internship progress report with detailed achievements and challenges faced.",
    type: "report",
    priority: "high",
    dueDate: "2024-01-25T23:59:59Z",
    createdDate: "2024-01-15T10:00:00Z",
    status: "active",
    assignedTo: "all", // "all", "individual", or "group"
    assignedStudents: [], // empty for all students
    completedBy: [2, 4], // student IDs who completed
    totalAssigned: 5,
    instructions:
      "Please include: 1. Weekly achievements, 2. Challenges faced, 3. Next week's plan, 4. Supervisor feedback",
    attachments: [],
    createdBy: "Dr. Smith",
  },
  {
    id: 2,
    title: "Mid-term Presentation",
    description: "Prepare and deliver a 15-minute presentation about your internship project progress.",
    type: "presentation",
    priority: "medium",
    dueDate: "2024-01-30T17:00:00Z",
    createdDate: "2024-01-10T14:30:00Z",
    status: "active",
    assignedTo: "individual",
    assignedStudents: [1, 3, 5],
    completedBy: [3],
    totalAssigned: 3,
    instructions:
      "Presentation should cover: Project overview, Technical implementation, Challenges and solutions, Future work",
    attachments: ["presentation_template.pptx"],
    createdBy: "Dr. Smith",
  },
  {
    id: 3,
    title: "Code Review Assignment",
    description: "Review and provide feedback on peer's project code following best practices.",
    type: "assignment",
    priority: "low",
    dueDate: "2024-02-05T23:59:59Z",
    createdDate: "2024-01-20T09:15:00Z",
    status: "active",
    assignedTo: "group",
    assignedStudents: [1, 2],
    completedBy: [],
    totalAssigned: 2,
    instructions: "Review criteria: Code quality, Documentation, Testing, Performance considerations",
    attachments: ["code_review_checklist.pdf"],
    createdBy: "Dr. Smith",
  },
  {
    id: 4,
    title: "Final Project Documentation",
    description: "Complete comprehensive documentation for your internship project.",
    type: "documentation",
    priority: "high",
    dueDate: "2024-02-15T23:59:59Z",
    createdDate: "2024-01-05T11:00:00Z",
    status: "completed",
    assignedTo: "all",
    assignedStudents: [],
    completedBy: [1, 2, 3, 4, 5],
    totalAssigned: 5,
    instructions:
      "Documentation should include: Technical specifications, User manual, Installation guide, API documentation",
    attachments: ["documentation_template.docx"],
    createdBy: "Dr. Smith",
  },
]

// Mock students data
const mockStudents = [
  { id: 1, name: "John Doe", rollNumber: "21CE001" },
  { id: 2, name: "Jane Smith", rollNumber: "21CE002" },
  { id: 3, name: "Mike Johnson", rollNumber: "21CE003" },
  { id: 4, name: "Sarah Wilson", rollNumber: "21CE004" },
  { id: 5, name: "Alex Brown", rollNumber: "21CE005" },
]

export default function TeacherTasksPage() {
  const [user, setUser] = useState(null)
  const [tasks, setTasks] = useState(mockTasks)
  const [filteredTasks, setFilteredTasks] = useState(mockTasks)
  const [students] = useState(mockStudents)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedTask, setSelectedTask] = useState(null)
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [loading, setLoading] = useState(true)

  // Create task form state
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    type: "assignment",
    priority: "medium",
    dueDate: null,
    assignedTo: "all",
    assignedStudents: [],
    instructions: "",
  })

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  useEffect(() => {
    const filtered = tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.type.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || task.status === statusFilter
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
      const matchesType = typeFilter === "all" || task.type === typeFilter

      return matchesSearch && matchesStatus && matchesPriority && matchesType
    })

    setFilteredTasks(filtered)
  }, [tasks, searchTerm, statusFilter, priorityFilter, typeFilter])

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setPriorityFilter("all")
    setTypeFilter("all")
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200"
      case "completed":
        return "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200"
      case "overdue":
        return "bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-red-200"
      default:
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-red-200"
      case "medium":
        return "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 border-yellow-200"
      case "low":
        return "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200"
      default:
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200"
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "report":
        return "bg-blue-100 text-blue-800"
      case "presentation":
        return "bg-purple-100 text-purple-800"
      case "assignment":
        return "bg-orange-100 text-orange-800"
      case "documentation":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <Clock className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "overdue":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const handleViewTask = (task) => {
    setSelectedTask(task)
    setShowTaskDialog(true)
  }

  const handleCreateTask = () => {
    if (!newTask.title.trim() || !newTask.description.trim() || !newTask.dueDate) {
      toast.error("Please fill in all required fields")
      return
    }

    const task = {
      id: tasks.length + 1,
      ...newTask,
      createdDate: new Date().toISOString(),
      status: "active",
      completedBy: [],
      totalAssigned: newTask.assignedTo === "all" ? students.length : newTask.assignedStudents.length,
      attachments: [],
      createdBy: user?.name || "Teacher",
    }

    setTasks([...tasks, task])
    setShowCreateDialog(false)
    setNewTask({
      title: "",
      description: "",
      type: "assignment",
      priority: "medium",
      dueDate: null,
      assignedTo: "all",
      assignedStudents: [],
      instructions: "",
    })
    toast.success("Task created successfully!")
  }

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
    toast.success("Task deleted successfully!")
  }

  const handleStudentSelection = (studentId, checked) => {
    if (checked) {
      setNewTask({
        ...newTask,
        assignedStudents: [...newTask.assignedStudents, studentId],
      })
    } else {
      setNewTask({
        ...newTask,
        assignedStudents: newTask.assignedStudents.filter((id) => id !== studentId),
      })
    }
  }

  const getCompletionRate = (task) => {
    return Math.round((task.completedBy.length / task.totalAssigned) * 100)
  }

  const activeFiltersCount = [statusFilter, priorityFilter, typeFilter].filter((f) => f !== "all").length

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100">
          <div className="p-4 md:p-6 space-y-6 md:space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Task Management
                    </h1>
                    <p className="text-gray-600 text-sm md:text-lg">Create and manage assignments for your students</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                {
                  title: "Total Tasks",
                  value: tasks.length,
                  icon: Target,
                  color: "indigo",
                  subtitle: "All assignments",
                },
                {
                  title: "Active Tasks",
                  value: tasks.filter((t) => t.status === "active").length,
                  icon: Clock,
                  color: "emerald",
                  subtitle: "Currently ongoing",
                },
                {
                  title: "Completed",
                  value: tasks.filter((t) => t.status === "completed").length,
                  icon: CheckCircle,
                  color: "blue",
                  subtitle: "Successfully finished",
                },
                {
                  title: "High Priority",
                  value: tasks.filter((t) => t.priority === "high").length,
                  icon: AlertTriangle,
                  color: "red",
                  subtitle: "Urgent tasks",
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
                    <Filter className="h-5 w-5 text-indigo-600" />
                    <CardTitle className="text-lg">Filters & Search</CardTitle>
                    {activeFiltersCount > 0 && (
                      <Badge className="bg-indigo-100 text-indigo-700">{activeFiltersCount} active</Badge>
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
                      placeholder="Search tasks..."
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
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="report">Report</SelectItem>
                      <SelectItem value="presentation">Presentation</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="documentation">Documentation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Tasks List */}
            <div className="space-y-4">
              {filteredTasks.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-8 md:p-12 text-center">
                    <Target className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg md:text-xl font-semibold text-gray-600 mb-2">No tasks found</h3>
                    <p className="text-gray-500">Try adjusting your search criteria or create a new task</p>
                  </CardContent>
                </Card>
              ) : (
                filteredTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 md:gap-4 mb-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                              <Target className="h-5 w-5 md:h-6 md:w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                <h3 className="text-lg md:text-xl font-bold text-gray-900 truncate">{task.title}</h3>
                                <div className="flex flex-wrap gap-2">
                                  <Badge className={getStatusColor(task.status)}>
                                    {getStatusIcon(task.status)}
                                    <span className="ml-1">{task.status}</span>
                                  </Badge>
                                  <Badge className={getPriorityColor(task.priority)}>{task.priority} priority</Badge>
                                  <Badge className={getTypeColor(task.type)}>{task.type}</Badge>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 md:gap-2 text-xs md:text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <CalendarIcon className="h-3 w-3 md:h-4 md:w-4" />
                                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {task.assignedTo === "all" ? (
                                    <Users className="h-3 w-3 md:h-4 md:w-4" />
                                  ) : (
                                    <User className="h-3 w-3 md:h-4 md:w-4" />
                                  )}
                                  <span>
                                    Assigned to:{" "}
                                    {task.assignedTo === "all" ? "All students" : `${task.totalAssigned} students`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-sm md:text-base text-gray-700 leading-relaxed line-clamp-2">
                              {task.description.length > 150
                                ? `${task.description.substring(0, 150)}...`
                                : task.description}
                            </p>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-4">
                              <div className="text-sm">
                                <span className="text-gray-600">Completion: </span>
                                <span className="font-semibold text-indigo-600">
                                  {task.completedBy.length}/{task.totalAssigned} ({getCompletionRate(task)}%)
                                </span>
                              </div>
                              <div className="text-sm text-gray-500">
                                Created: {new Date(task.createdDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row lg:flex-col gap-2 lg:ml-6">
                          <Button size="sm" onClick={() => handleViewTask(task)} className="flex-1 lg:flex-none">
                            <Eye className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">View Details</span>
                            <span className="sm:hidden">View</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTask(task.id)}
                            className="flex-1 lg:flex-none"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Delete</span>
                            <span className="sm:hidden">Delete</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Task Details Dialog */}
            <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <Target className="h-6 w-6 text-indigo-600" />
                    Task Details: {selectedTask?.title}
                  </DialogTitle>
                  <DialogDescription>Complete information about the task and student progress</DialogDescription>
                </DialogHeader>
                {selectedTask && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Task Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Title:</span>
                            <span className="font-medium">{selectedTask.title}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Type:</span>
                            <Badge className={getTypeColor(selectedTask.type)}>{selectedTask.type}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Priority:</span>
                            <Badge className={getPriorityColor(selectedTask.priority)}>{selectedTask.priority}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <Badge className={getStatusColor(selectedTask.status)}>{selectedTask.status}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Due Date:</span>
                            <span className="font-medium">{new Date(selectedTask.dueDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Created:</span>
                            <span className="font-medium">
                              {new Date(selectedTask.createdDate).toLocaleDateString()}
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Assignment Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Assigned To:</span>
                            <span className="font-medium">
                              {selectedTask.assignedTo === "all"
                                ? "All Students"
                                : `${selectedTask.totalAssigned} Students`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Assigned:</span>
                            <span className="font-medium">{selectedTask.totalAssigned}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Completed:</span>
                            <span className="font-medium text-emerald-600">{selectedTask.completedBy.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Pending:</span>
                            <span className="font-medium text-orange-600">
                              {selectedTask.totalAssigned - selectedTask.completedBy.length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Completion Rate:</span>
                            <span className="font-medium text-indigo-600">{getCompletionRate(selectedTask)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Created By:</span>
                            <span className="font-medium">{selectedTask.createdBy}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Description & Instructions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                          <p className="text-gray-700 leading-relaxed">{selectedTask.description}</p>
                        </div>
                        {selectedTask.instructions && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Instructions</h4>
                            <p className="text-gray-700 leading-relaxed">{selectedTask.instructions}</p>
                          </div>
                        )}
                        {selectedTask.attachments.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Attachments</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedTask.attachments.map((attachment, index) => (
                                <Badge key={index} variant="outline" className="cursor-pointer hover:bg-gray-100">
                                  <FileText className="h-3 w-3 mr-1" />
                                  {attachment}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Student Progress</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {students.map((student) => {
                            const isAssigned =
                              selectedTask.assignedTo === "all" || selectedTask.assignedStudents.includes(student.id)
                            const isCompleted = selectedTask.completedBy.includes(student.id)

                            if (!isAssigned) return null

                            return (
                              <div
                                key={student.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">
                                      {student.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{student.name}</p>
                                    <p className="text-sm text-gray-600">{student.rollNumber}</p>
                                  </div>
                                </div>
                                <Badge className={isCompleted ? getStatusColor("completed") : getStatusColor("active")}>
                                  {isCompleted ? (
                                    <>
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Completed
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="h-3 w-3 mr-1" />
                                      Pending
                                    </>
                                  )}
                                </Badge>
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Create Task Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <Plus className="h-6 w-6 text-indigo-600" />
                    Create New Task
                  </DialogTitle>
                  <DialogDescription>Create a new assignment or task for your students</DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Task Title *</Label>
                      <Input
                        id="title"
                        placeholder="Enter task title..."
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Task Type</Label>
                      <Select value={newTask.type} onValueChange={(value) => setNewTask({ ...newTask, type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="assignment">Assignment</SelectItem>
                          <SelectItem value="report">Report</SelectItem>
                          <SelectItem value="presentation">Presentation</SelectItem>
                          <SelectItem value="documentation">Documentation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the task in detail..."
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="instructions">Instructions</Label>
                    <Textarea
                      id="instructions"
                      placeholder="Provide detailed instructions for students..."
                      value={newTask.instructions}
                      onChange={(e) => setNewTask({ ...newTask, instructions: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={newTask.priority}
                        onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Due Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !newTask.dueDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newTask.dueDate ? format(newTask.dueDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newTask.dueDate}
                            onSelect={(date) => setNewTask({ ...newTask, dueDate: date })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div>
                    <Label>Assignment Type</Label>
                    <Select
                      value={newTask.assignedTo}
                      onValueChange={(value) =>
                        setNewTask({ ...newTask, assignedTo: value, assignedStudents: value === "all" ? [] : [] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Students</SelectItem>
                        <SelectItem value="individual">Individual Students</SelectItem>
                        <SelectItem value="group">Group of Students</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(newTask.assignedTo === "individual" || newTask.assignedTo === "group") && (
                    <div>
                      <Label>Select Students</Label>
                      <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                        {students.map((student) => (
                          <div key={student.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`student-${student.id}`}
                              checked={newTask.assignedStudents.includes(student.id)}
                              onCheckedChange={(checked) => handleStudentSelection(student.id, checked)}
                            />
                            <Label htmlFor={`student-${student.id}`} className="text-sm">
                              {student.name} ({student.rollNumber})
                            </Label>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Selected: {newTask.assignedStudents.length} student(s)
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="w-full sm:w-auto">
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTask} className="w-full sm:w-auto">
                      <Send className="h-4 w-4 mr-2" />
                      Create Task
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
