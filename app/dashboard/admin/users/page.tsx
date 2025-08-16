"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Users, UserPlus, Edit, Trash2, Shield, Mail, Phone, Calendar } from "lucide-react"
import { useState } from "react"

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const users = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@charusat.edu.in",
      phone: "+91 9876543210",
      role: "student",
      status: "active",
      lastLogin: "2024-03-25T10:30:00Z",
      joinedDate: "2023-08-15",
      internshipStatus: "active",
      company: "TechCorp Solutions",
    },
    {
      id: 2,
      name: "Dr. Smith",
      email: "smith@charusat.ac.in",
      phone: "+91 9876543211",
      role: "teacher",
      status: "active",
      lastLogin: "2024-03-24T14:15:00Z",
      joinedDate: "2020-01-10",
      studentsAssigned: 24,
      department: "Computer Science",
    },
    {
      id: 3,
      name: "Sarah Wilson",
      email: "sarah.wilson@charusat.edu.in",
      phone: "+91 9876543212",
      role: "student",
      status: "inactive",
      lastLogin: "2024-03-20T09:45:00Z",
      joinedDate: "2023-08-15",
      internshipStatus: "completed",
      company: "DataTech Analytics",
    },
    {
      id: 4,
      name: "T&P Officer",
      email: "tp@charusat.ac.in",
      phone: "+91 9876543213",
      role: "tp-officer",
      status: "active",
      lastLogin: "2024-03-25T16:20:00Z",
      joinedDate: "2019-06-01",
      nocProcessed: 156,
      companiesVerified: 45,
    },
    {
      id: 5,
      name: "System Admin",
      email: "admin@charusat.ac.in",
      phone: "+91 9876543214",
      role: "admin",
      status: "active",
      lastLogin: "2024-03-25T18:00:00Z",
      joinedDate: "2018-01-01",
      permissions: "full",
    },
  ]

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "student":
        return "bg-blue-600"
      case "teacher":
        return "bg-green-600"
      case "tp-officer":
        return "bg-purple-600"
      case "admin":
        return "bg-red-600"
      default:
        return "bg-gray-600"
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "all" ? true : user.role === filterRole
    const matchesStatus = filterStatus === "all" ? true : user.status === filterStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  return (
    <DashboardLayout role="admin">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage all system users and their permissions</p>
          </div>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add New User
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="teacher">Teachers</SelectItem>
                  <SelectItem value="tp-officer">T&P Officers</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">1,247</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Students</p>
                  <p className="text-2xl font-bold text-blue-600">1,089</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Faculty</p>
                  <p className="text-2xl font-bold text-green-600">142</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Today</p>
                  <p className="text-2xl font-bold text-purple-600">234</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <Users className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{user.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getRoleBadgeColor(user.role)} text-white`}>
                            {user.role.replace("-", " ").toUpperCase()}
                          </Badge>
                          <Badge variant={user.status === "active" ? "default" : "secondary"}>
                            {user.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{user.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Joined: {new Date(user.joinedDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="text-gray-600">Last Login:</span>
                          <span className="ml-2 font-medium">
                            {new Date(user.lastLogin).toLocaleDateString()} at{" "}
                            {new Date(user.lastLogin).toLocaleTimeString()}
                          </span>
                        </div>

                        {/* Role-specific information */}
                        {user.role === "student" && (
                          <div className="text-sm">
                            <span className="text-gray-600">Internship:</span>
                            <span className="ml-2 font-medium">
                              {user.internshipStatus === "active"
                                ? `Active at ${user.company}`
                                : user.internshipStatus === "completed"
                                  ? `Completed at ${user.company}`
                                  : "Not started"}
                            </span>
                          </div>
                        )}

                        {user.role === "teacher" && (
                          <div className="text-sm">
                            <span className="text-gray-600">Students Assigned:</span>
                            <span className="ml-2 font-medium">{user.studentsAssigned}</span>
                          </div>
                        )}

                        {user.role === "tp-officer" && (
                          <div className="text-sm">
                            <span className="text-gray-600">NOCs Processed:</span>
                            <span className="ml-2 font-medium">{user.nocProcessed}</span>
                          </div>
                        )}

                        {user.role === "admin" && (
                          <div className="text-sm">
                            <span className="text-gray-600">Permissions:</span>
                            <span className="ml-2 font-medium flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              {user.permissions}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Deactivate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
