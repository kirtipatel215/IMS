"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, MessageSquare, CheckCircle, XCircle, Clock, User, Eye, Building } from "lucide-react"
import { useState } from "react"

export default function TPOfficerNOC() {
  const [selectedNOC, setSelectedNOC] = useState<number | null>(null)
  const [feedback, setFeedback] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const nocRequests = [
    {
      id: 1,
      studentName: "Alex Kumar",
      studentEmail: "alex.kumar@charusat.edu.in",
      company: "TechCorp Solutions",
      position: "Software Development Intern",
      duration: "6 months",
      startDate: "2024-04-01",
      submittedDate: "2024-03-25",
      status: "pending",
      description: "Full-stack web development using React and Node.js",
      companyVerified: true,
      documents: ["offer_letter.pdf", "company_profile.pdf"],
    },
    {
      id: 2,
      studentName: "Priya Sharma",
      studentEmail: "priya.sharma@charusat.edu.in",
      company: "DataFlow Inc",
      position: "Data Analyst Intern",
      duration: "4 months",
      startDate: "2024-04-15",
      submittedDate: "2024-03-24",
      status: "pending",
      description: "Data analysis and visualization using Python and Tableau",
      companyVerified: false,
      documents: ["offer_letter.pdf"],
    },
    {
      id: 3,
      studentName: "Raj Patel",
      studentEmail: "raj.patel@charusat.edu.in",
      company: "Creative Studios",
      position: "UI/UX Design Intern",
      duration: "3 months",
      startDate: "2024-03-20",
      submittedDate: "2024-03-20",
      status: "approved",
      description: "User interface design and user experience research",
      companyVerified: true,
      documents: ["offer_letter.pdf", "project_details.pdf"],
      approvedDate: "2024-03-22",
      feedback: "All documents verified. Company is in our approved list.",
    },
    {
      id: 4,
      studentName: "Neha Singh",
      studentEmail: "neha.singh@charusat.edu.in",
      company: "Unknown Corp",
      position: "Marketing Intern",
      duration: "4 months",
      startDate: "2024-04-10",
      submittedDate: "2024-03-18",
      status: "rejected",
      description: "Digital marketing and social media management",
      companyVerified: false,
      documents: ["offer_letter.pdf"],
      reviewedDate: "2024-03-20",
      feedback: "Company verification failed. Unable to verify legitimacy of the organization.",
    },
  ]

  const handleNOCAction = (nocId: number, action: "approve" | "reject") => {
    console.log(`${action} NOC ${nocId}`)
  }

  const filteredRequests = filterStatus ? nocRequests.filter((req) => req.status === filterStatus) : nocRequests

  return (
    <DashboardLayout role="tp-officer">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">NOC Requests</h1>
            <p className="text-gray-600">Review and approve student No Objection Certificate requests</p>
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* NOC Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-orange-600">12</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">156</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">8</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-blue-600">34</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* NOC Requests List */}
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request.id} className={selectedNOC === request.id ? "ring-2 ring-blue-500" : ""}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{request.studentName}</h3>
                        <p className="text-sm text-gray-600">{request.studentEmail}</p>
                      </div>
                      <Badge
                        variant={
                          request.status === "approved"
                            ? "default"
                            : request.status === "rejected"
                              ? "destructive"
                              : "secondary"
                        }
                        className="flex items-center gap-1"
                      >
                        {request.status === "approved" && <CheckCircle className="h-3 w-3" />}
                        {request.status === "rejected" && <XCircle className="h-3 w-3" />}
                        {request.status === "pending" && <Clock className="h-3 w-3" />}
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                      {request.companyVerified ? (
                        <Badge variant="default" className="bg-green-600">
                          <Building className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <Building className="h-3 w-3 mr-1" />
                          Unverified
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{request.position}</h4>
                        <p className="text-sm text-gray-600">{request.company}</p>
                        <p className="text-sm text-gray-600">Duration: {request.duration}</p>
                        <p className="text-sm text-gray-600">
                          Start Date: {new Date(request.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Submitted: {new Date(request.submittedDate).toLocaleDateString()}
                        </p>
                        {request.approvedDate && (
                          <p className="text-sm text-gray-600">
                            Approved: {new Date(request.approvedDate).toLocaleDateString()}
                          </p>
                        )}
                        {request.reviewedDate && (
                          <p className="text-sm text-gray-600">
                            Reviewed: {new Date(request.reviewedDate).toLocaleDateString()}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {request.documents.map((doc, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {doc}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-3">{request.description}</p>

                    {request.feedback && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium">Review Feedback:</span>
                        </div>
                        <p className="text-sm text-gray-700">{request.feedback}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Documents
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    {request.status === "pending" && (
                      <Button size="sm" onClick={() => setSelectedNOC(selectedNOC === request.id ? null : request.id)}>
                        Review
                      </Button>
                    )}
                  </div>
                </div>

                {/* Review Form */}
                {selectedNOC === request.id && request.status === "pending" && (
                  <div className="border-t pt-4 mt-4">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Review Comments</label>
                        <Textarea
                          placeholder="Provide detailed feedback on the NOC request..."
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleNOCAction(request.id, "approve")}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve NOC
                        </Button>
                        <Button variant="destructive" onClick={() => handleNOCAction(request.id, "reject")}>
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject NOC
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
