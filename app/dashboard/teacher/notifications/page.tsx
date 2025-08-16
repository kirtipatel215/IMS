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
  Bell,
  Search,
  Filter,
  Eye,
  Trash2,
  BookMarkedIcon as MarkAsRead,
  Send,
  User,
  FileText,
  Award,
  Calendar,
  AlertTriangle,
  CheckCircle,
  X,
  Plus,
} from "lucide-react"
import { useState, useEffect } from "react"
import { getCurrentUser } from "@/lib/auth"
import { toast } from "sonner"

// Mock notifications data
const mockNotifications = [
  {
    id: 1,
    type: "report_submitted",
    title: "New Weekly Report Submitted",
    message: "John Doe has submitted Week 9 report for review",
    studentName: "John Doe",
    studentId: 1,
    timestamp: "2024-01-22T10:30:00Z",
    isRead: false,
    priority: "medium",
    actionRequired: true,
    relatedId: 15,
  },
  {
    id: 2,
    type: "certificate_uploaded",
    title: "Certificate Uploaded",
    message: "Jane Smith has uploaded internship completion certificate",
    studentName: "Jane Smith",
    studentId: 2,
    timestamp: "2024-01-22T09:15:00Z",
    isRead: false,
    priority: "high",
    actionRequired: true,
    relatedId: 8,
  },
  {
    id: 3,
    type: "task_completed",
    title: "Task Completed",
    message: "Mike Johnson has completed the Mid-term Presentation task",
    studentName: "Mike Johnson",
    studentId: 3,
    timestamp: "2024-01-21T16:45:00Z",
    isRead: true,
    priority: "low",
    actionRequired: false,
    relatedId: 5,
  },
  {
    id: 4,
    type: "deadline_reminder",
    title: "Report Review Deadline",
    message: "3 reports are pending review and due for approval by tomorrow",
    timestamp: "2024-01-21T14:20:00Z",
    isRead: false,
    priority: "high",
    actionRequired: true,
    relatedId: null,
  },
  {
    id: 5,
    type: "student_message",
    title: "Message from Student",
    message: "Sarah Wilson has sent you a message regarding her internship progress",
    studentName: "Sarah Wilson",
    studentId: 4,
    timestamp: "2024-01-21T11:30:00Z",
    isRead: true,
    priority: "medium",
    actionRequired: false,
    relatedId: 12,
  },
]

export default function TeacherNotificationsPage() {
  const [user, setUser] = useState(null)
  const [notifications, setNotifications] = useState(mockNotifications)
  const [filteredNotifications, setFilteredNotifications] = useState(mockNotifications)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [showNotificationDialog, setShowNotificationDialog] = useState(false)
  const [showComposeDialog, setShowComposeDialog] = useState(false)
  const [composeMessage, setComposeMessage] = useState("")
  const [composeSubject, setComposeSubject] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  useEffect(() => {
    const filtered = notifications.filter((notification) => {
      const matchesSearch =
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (notification.studentName && notification.studentName.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesType = typeFilter === "all" || notification.type === typeFilter
      const matchesPriority = priorityFilter === "all" || notification.priority === priorityFilter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "read" && notification.isRead) ||
        (statusFilter === "unread" && !notification.isRead)

      return matchesSearch && matchesType && matchesPriority && matchesStatus
    })

    setFilteredNotifications(filtered)
  }, [notifications, searchTerm, typeFilter, priorityFilter, statusFilter])

  const clearFilters = () => {
    setSearchTerm("")
    setTypeFilter("all")
    setPriorityFilter("all")
    setStatusFilter("all")
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "report_submitted":
        return <FileText className="h-5 w-5" />
      case "certificate_uploaded":
        return <Award className="h-5 w-5" />
      case "task_completed":
        return <CheckCircle className="h-5 w-5" />
      case "deadline_reminder":
        return <AlertTriangle className="h-5 w-5" />
      case "student_message":
        return <User className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "report_submitted":
        return "bg-blue-100 text-blue-800"
      case "certificate_uploaded":
        return "bg-purple-100 text-purple-800"
      case "task_completed":
        return "bg-green-100 text-green-800"
      case "deadline_reminder":
        return "bg-red-100 text-red-800"
      case "student_message":
        return "bg-indigo-100 text-indigo-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleViewNotification = (notification) => {
    setSelectedNotification(notification)
    setShowNotificationDialog(true)

    if (!notification.isRead) {
      markAsRead(notification.id)
    }
  }

  const markAsRead = (notificationId) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === notificationId ? { ...notif, isRead: true } : notif)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })))
    toast.success("All notifications marked as read")
  }

  const deleteNotification = (notificationId) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId))
    toast.success("Notification deleted")
  }

  const handleSendMessage = () => {
    if (!composeSubject.trim() || !composeMessage.trim()) {
      toast.error("Please fill in all fields")
      return
    }

    toast.success("Message sent successfully")
    setShowComposeDialog(false)
    setComposeSubject("")
    setComposeMessage("")
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const activeFiltersCount = [typeFilter, priorityFilter, statusFilter].filter((f) => f !== "all").length

  if (loading) {
    return (
      <AuthGuard allowedRoles={["teacher"]}>
        <DashboardLayout role="teacher">
          <div className="p-4 lg:p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-64 bg-gray-200 rounded"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
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
        <div className="min-h-screen bg-gray-50">
          <div className="p-4 lg:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Bell className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-600">Stay updated with student activities and system alerts</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={markAllAsRead} variant="outline" disabled={unreadCount === 0}>
                  <MarkAsRead className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
                <Button
                  onClick={() => setShowComposeDialog(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Compose
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Total",
                  value: notifications.length,
                  icon: Bell,
                  color: "blue",
                  subtitle: "All notifications",
                },
                {
                  title: "Unread",
                  value: unreadCount,
                  icon: AlertTriangle,
                  color: "red",
                  subtitle: "Need attention",
                },
                {
                  title: "Action Required",
                  value: notifications.filter((n) => n.actionRequired).length,
                  icon: CheckCircle,
                  color: "orange",
                  subtitle: "Pending actions",
                },
                {
                  title: "High Priority",
                  value: notifications.filter((n) => n.priority === "high").length,
                  icon: AlertTriangle,
                  color: "purple",
                  subtitle: "Urgent items",
                },
              ].map((stat, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                    <div className={`w-10 h-10 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                      <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl lg:text-3xl font-bold text-${stat.color}-600 mb-1`}>{stat.value}</div>
                    <p className="text-xs text-gray-500">{stat.subtitle}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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
                      placeholder="Search notifications..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="report_submitted">Report Submitted</SelectItem>
                      <SelectItem value="certificate_uploaded">Certificate Uploaded</SelectItem>
                      <SelectItem value="task_completed">Task Completed</SelectItem>
                      <SelectItem value="deadline_reminder">Deadline Reminder</SelectItem>
                      <SelectItem value="student_message">Student Message</SelectItem>
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
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="unread">Unread</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Notifications List */}
            <div className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No notifications found</h3>
                    <p className="text-gray-500">Try adjusting your search criteria or filters</p>
                  </CardContent>
                </Card>
              ) : (
                filteredNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`hover:shadow-lg transition-shadow duration-200 ${
                      !notification.isRead ? "ring-2 ring-blue-200" : ""
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-4 mb-3">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                                notification.priority === "high"
                                  ? "bg-gradient-to-br from-red-400 to-pink-500"
                                  : notification.priority === "medium"
                                    ? "bg-gradient-to-br from-yellow-400 to-orange-500"
                                    : "bg-gradient-to-br from-green-400 to-teal-500"
                              }`}
                            >
                              <div className="text-white">{getNotificationIcon(notification.type)}</div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3 mb-2">
                                <h3 className="text-lg font-bold text-gray-900">{notification.title}</h3>
                                <div className="flex flex-wrap gap-2">
                                  <Badge className={getTypeColor(notification.type)}>
                                    {notification.type.replace("_", " ")}
                                  </Badge>
                                  <Badge className={getPriorityColor(notification.priority)}>
                                    {notification.priority}
                                  </Badge>
                                  {!notification.isRead && <Badge className="bg-blue-100 text-blue-800">New</Badge>}
                                  {notification.actionRequired && (
                                    <Badge className="bg-orange-100 text-orange-800">Action Required</Badge>
                                  )}
                                </div>
                              </div>
                              <p className="text-gray-700 mb-2">{notification.message}</p>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{new Date(notification.timestamp).toLocaleString()}</span>
                                </div>
                                {notification.studentName && (
                                  <div className="flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    <span>{notification.studentName}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button size="sm" onClick={() => handleViewNotification(notification)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => deleteNotification(notification.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Notification Details Dialog */}
            <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    {selectedNotification && getNotificationIcon(selectedNotification.type)}
                    {selectedNotification?.title}
                  </DialogTitle>
                  <DialogDescription>Notification details and actions</DialogDescription>
                </DialogHeader>
                {selectedNotification && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getTypeColor(selectedNotification.type)}>
                          {selectedNotification.type.replace("_", " ")}
                        </Badge>
                        <Badge className={getPriorityColor(selectedNotification.priority)}>
                          {selectedNotification.priority} priority
                        </Badge>
                        {selectedNotification.actionRequired && (
                          <Badge className="bg-orange-100 text-orange-800">Action Required</Badge>
                        )}
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Message</h4>
                        <p className="text-gray-700 leading-relaxed">{selectedNotification.message}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Timestamp</h4>
                          <p className="text-gray-600">{new Date(selectedNotification.timestamp).toLocaleString()}</p>
                        </div>
                        {selectedNotification.studentName && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Student</h4>
                            <p className="text-gray-600">{selectedNotification.studentName}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedNotification.actionRequired && (
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <h4 className="font-semibold text-orange-900 mb-2">Action Required</h4>
                        <p className="text-orange-800 text-sm mb-3">
                          This notification requires your attention. Please take appropriate action.
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                            Take Action
                          </Button>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Compose Message Dialog */}
            <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Compose Message</DialogTitle>
                  <DialogDescription>Send a message or announcement</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Enter message subject..."
                      value={composeSubject}
                      onChange={(e) => setComposeSubject(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Type your message here..."
                      value={composeMessage}
                      onChange={(e) => setComposeMessage(e.target.value)}
                      rows={5}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowComposeDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSendMessage}>
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
