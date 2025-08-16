"use client"

import type React from "react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Video, MapPin, User, Plus, Edit, Trash2, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { getTeacherMeetings, scheduleMeeting, updateMeeting, deleteMeeting, getCurrentUser } from "@/lib/data"

export default function TeacherMeetings() {
  const [meetings, setMeetings] = useState<any[]>([])
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState<any>(null)
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    studentId: "",
    title: "",
    description: "",
    date: "",
    time: "",
    duration: "30",
    type: "online",
    location: "",
  })

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)

    if (currentUser?.email) {
      const meetingsData = getTeacherMeetings(currentUser.email)
      setMeetings(meetingsData)
    }
  }, [])

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingMeeting) {
        await updateMeeting(editingMeeting.id, formData)
        setMeetings(meetings.map((m) => (m.id === editingMeeting.id ? { ...m, ...formData } : m)))
        setEditingMeeting(null)
      } else {
        const newMeeting = await scheduleMeeting({
          ...formData,
          teacherEmail: user?.email,
        })
        setMeetings([...meetings, newMeeting])
      }

      setShowScheduleForm(false)
      setFormData({
        studentId: "",
        title: "",
        description: "",
        date: "",
        time: "",
        duration: "30",
        type: "online",
        location: "",
      })
    } catch (error) {
      console.error("Failed to schedule meeting:", error)
    }
  }

  const handleEditMeeting = (meeting: any) => {
    setEditingMeeting(meeting)
    setFormData({
      studentId: meeting.studentId,
      title: meeting.title,
      description: meeting.description,
      date: meeting.date,
      time: meeting.time,
      duration: meeting.duration,
      type: meeting.type,
      location: meeting.location || "",
    })
    setShowScheduleForm(true)
  }

  const handleDeleteMeeting = async (meetingId: number) => {
    if (confirm("Are you sure you want to delete this meeting?")) {
      await deleteMeeting(meetingId)
      setMeetings(meetings.filter((m) => m.id !== meetingId))
    }
  }

  const upcomingMeetings = meetings.filter((m) => new Date(m.date + "T" + m.time) > new Date())
  const pastMeetings = meetings.filter((m) => new Date(m.date + "T" + m.time) <= new Date())

  return (
    <DashboardLayout role="teacher">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Meetings</h1>
            <p className="text-gray-600">Schedule and manage meetings with your students</p>
          </div>
          <Button onClick={() => setShowScheduleForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Meeting
          </Button>
        </div>

        {/* Meeting Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Meetings</p>
                  <p className="text-2xl font-bold">{meetings.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold text-orange-600">{upcomingMeetings.length}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{pastMeetings.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {
                      meetings.filter((m) => {
                        const meetingDate = new Date(m.date)
                        const now = new Date()
                        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
                        const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
                        return meetingDate >= weekStart && meetingDate < weekEnd
                      }).length
                    }
                  </p>
                </div>
                <Video className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Schedule Meeting Form */}
        {showScheduleForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingMeeting ? "Edit Meeting" : "Schedule New Meeting"}</CardTitle>
              <CardDescription>Fill in the details to schedule a meeting with a student</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleScheduleMeeting} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Student</label>
                    <Select
                      value={formData.studentId}
                      onValueChange={(value) => setFormData({ ...formData, studentId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">John Doe</SelectItem>
                        <SelectItem value="2">Jane Smith</SelectItem>
                        <SelectItem value="3">Mike Johnson</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Meeting Type</label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="offline">In-Person</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Meeting Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Mid-term Progress Review"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Meeting agenda and objectives..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Date</label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Time</label>
                    <Input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Duration (minutes)</label>
                    <Select
                      value={formData.duration}
                      onValueChange={(value) => setFormData({ ...formData, duration: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.type === "offline" && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Faculty Room 201"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="submit">{editingMeeting ? "Update Meeting" : "Schedule Meeting"}</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowScheduleForm(false)
                      setEditingMeeting(null)
                      setFormData({
                        studentId: "",
                        title: "",
                        description: "",
                        date: "",
                        time: "",
                        duration: "30",
                        type: "online",
                        location: "",
                      })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Meetings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Meetings
            </CardTitle>
            <CardDescription>Your scheduled meetings with students</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingMeetings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No upcoming meetings scheduled</p>
            ) : (
              <div className="space-y-4">
                {upcomingMeetings.map((meeting) => (
                  <div key={meeting.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{meeting.title}</h3>
                            <p className="text-sm text-gray-600">{meeting.studentName}</p>
                          </div>
                          <Badge variant={meeting.type === "online" ? "default" : "secondary"}>
                            {meeting.type === "online" ? (
                              <>
                                <Video className="h-3 w-3 mr-1" />
                                Online
                              </>
                            ) : (
                              <>
                                <MapPin className="h-3 w-3 mr-1" />
                                In-Person
                              </>
                            )}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-700 mb-2">{meeting.description}</p>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(meeting.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {meeting.time} ({meeting.duration} min)
                            </span>
                          </div>
                          {meeting.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{meeting.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="outline" onClick={() => handleEditMeeting(meeting)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteMeeting(meeting.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Past Meetings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Past Meetings
            </CardTitle>
            <CardDescription>Previously completed meetings</CardDescription>
          </CardHeader>
          <CardContent>
            {pastMeetings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No past meetings</p>
            ) : (
              <div className="space-y-4">
                {pastMeetings.slice(0, 5).map((meeting) => (
                  <div key={meeting.id} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{meeting.title}</h3>
                        <p className="text-sm text-gray-600">{meeting.studentName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{new Date(meeting.date).toLocaleDateString()}</span>
                      <span>{meeting.time}</span>
                      <Badge variant="outline" className="text-xs">
                        Completed
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
