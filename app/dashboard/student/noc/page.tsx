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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, FileText, CheckCircle, Clock, XCircle, Eye, Download } from "lucide-react"
import { useState, useEffect } from "react"
import { getNOCRequestsByStudent, createNOCRequest, getCurrentUser } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"

export default function NOCRequests() {
  const [showForm, setShowForm] = useState(false)
  const [nocRequests, setNocRequests] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const loadNOCRequests = () => {
      const user = getCurrentUser()
      if (user) {
        const requests = getNOCRequestsByStudent(user.id)
        setNocRequests(requests)
      }
    }

    loadNOCRequests()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.target as HTMLFormElement)
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
      const newNOC = createNOCRequest({
        studentId: user.id,
        studentName: user.name,
        studentEmail: user.email,
        company: formData.get("company") as string,
        position: formData.get("position") as string,
        duration: formData.get("duration") as string,
        startDate: formData.get("startDate") as string,
        description: formData.get("description") as string,
        documents: ["offer_letter.pdf"],
      })

      setNocRequests((prev) => [...prev, newNOC])
      setShowForm(false)

      toast({
        title: "NOC Request Submitted",
        description: "Your NOC request has been submitted successfully and is pending review.",
      })

      // Reset form
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit NOC request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewDetails = (id: number) => {
    toast({
      title: "View Details",
      description: `Viewing details for NOC request ${id}`,
    })
  }

  const handleDownloadNOC = (id: number) => {
    toast({
      title: "Download NOC",
      description: `Downloading NOC certificate for request ${id}`,
    })
  }

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">NOC Requests</h1>
              <p className="text-gray-600">Manage your No Objection Certificate requests</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="mr-2 h-4 w-4" />
              New NOC Request
            </Button>
          </div>

          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>Submit New NOC Request</CardTitle>
                <CardDescription>Request NOC for externally secured internship</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name *</Label>
                      <Input id="company" name="company" placeholder="Enter company name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Position *</Label>
                      <Input id="position" name="position" placeholder="Internship position" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration *</Label>
                      <Select name="duration" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2 months">2 months</SelectItem>
                          <SelectItem value="3 months">3 months</SelectItem>
                          <SelectItem value="4 months">4 months</SelectItem>
                          <SelectItem value="6 months">6 months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input id="startDate" type="date" name="startDate" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Job Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe the internship role and responsibilities"
                      rows={4}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="offer-letter">Offer Letter (PDF) *</Label>
                    <Input id="offer-letter" type="file" accept=".pdf" name="offer-letter" required />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit Request"}
                    </Button>
                    <Button variant="outline" type="button" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {nocRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{request.company}</h3>
                        <Badge
                          variant={
                            request.status === "approved"
                              ? "default"
                              : request.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                          className="flex items-center gap-1"
                        >
                          {request.status === "approved" && <CheckCircle className="h-3 w-3" />}
                          {request.status === "pending" && <Clock className="h-3 w-3" />}
                          {request.status === "rejected" && <XCircle className="h-3 w-3" />}
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{request.position}</p>
                      <p className="text-sm text-gray-700 mb-3">{request.description}</p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>Duration: {request.duration}</span>
                        <span>Start Date: {new Date(request.startDate).toLocaleDateString()}</span>
                        <span>Submitted: {new Date(request.submittedDate).toLocaleDateString()}</span>
                        {request.approvedDate && (
                          <span>Approved: {new Date(request.approvedDate).toLocaleDateString()}</span>
                        )}
                      </div>
                      {request.feedback && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium mb-1">Review Feedback:</p>
                          <p className="text-sm text-gray-700">{request.feedback}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(request.id)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      {request.status === "approved" && (
                        <Button variant="outline" size="sm" onClick={() => handleDownloadNOC(request.id)}>
                          <Download className="h-4 w-4 mr-1" />
                          Download NOC
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {nocRequests.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-2">No NOC requests found</p>
                <p className="text-sm text-gray-400">Click "New NOC Request" to submit your first request</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
