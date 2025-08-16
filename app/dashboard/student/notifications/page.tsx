"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, CheckCircle, AlertCircle, Info, Trash2 } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface Notification {
  id: number
  title: string
  message: string
  type: "success" | "warning" | "info" | "error"
  timestamp: string
  read: boolean
  actionRequired?: boolean
}

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "NOC Request Approved",
      message: "Your NOC request for TechCorp Solutions has been approved. You can now download your NOC certificate.",
      type: "success",
      timestamp: "2024-01-15T10:30:00Z",
      read: false,
      actionRequired: true,
    },
    {
      id: 2,
      title: "Weekly Report Due",
      message: "Your Week 3 report is due in 2 days. Please submit your progress report on time.",
      type: "warning",
      timestamp: "2024-01-14T09:00:00Z",
      read: false,
      actionRequired: true,
    },
    {
      id: 3,
      title: "New Internship Opportunity",
      message:
        "A new internship opportunity at DataTech Analytics has been posted. Check it out in the opportunities section.",
      type: "info",
      timestamp: "2024-01-13T14:20:00Z",
      read: true,
    },
    {
      id: 4,
      title: "Report Feedback Available",
      message: "Your Week 2 report has been reviewed. Check the feedback from your mentor.",
      type: "info",
      timestamp: "2024-01-12T16:45:00Z",
      read: true,
    },
    {
      id: 5,
      title: "Certificate Upload Reminder",
      message: "Don't forget to upload your internship completion certificate once your internship is finished.",
      type: "info",
      timestamp: "2024-01-10T11:15:00Z",
      read: true,
    },
  ])

  const { toast } = useToast()

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
    toast({
      title: "Notification Deleted",
      description: "The notification has been removed.",
    })
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
    toast({
      title: "All Notifications Read",
      description: "All notifications have been marked as read.",
    })
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-orange-600" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800"
      case "warning":
        return "bg-orange-100 text-orange-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600">Stay updated with important announcements and reminders</p>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" onClick={markAllAsRead}>
                  Mark All as Read ({unreadCount})
                </Button>
              )}
            </div>
          </div>

          {/* Notification Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                    <p className="text-2xl font-bold">{notifications.length}</p>
                  </div>
                  <Bell className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Unread</p>
                    <p className="text-2xl font-bold text-orange-600">{unreadCount}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Action Required</p>
                    <p className="text-2xl font-bold text-red-600">
                      {notifications.filter((n) => n.actionRequired && !n.read).length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`${!notification.read ? "border-l-4 border-l-blue-500 bg-blue-50/30" : ""} hover:shadow-md transition-shadow`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3
                            className={`text-lg font-semibold ${!notification.read ? "text-gray-900" : "text-gray-700"}`}
                          >
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              New
                            </Badge>
                          )}
                          {notification.actionRequired && <Badge variant="destructive">Action Required</Badge>}
                          <Badge className={getNotificationBadge(notification.type)}>{notification.type}</Badge>
                        </div>
                        <p className={`text-sm mb-3 ${!notification.read ? "text-gray-900" : "text-gray-600"}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500">{new Date(notification.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {!notification.read && (
                        <Button variant="outline" size="sm" onClick={() => markAsRead(notification.id)}>
                          Mark as Read
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => deleteNotification(notification.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {notifications.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-2">No notifications</p>
                <p className="text-sm text-gray-400">You're all caught up! New notifications will appear here.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
