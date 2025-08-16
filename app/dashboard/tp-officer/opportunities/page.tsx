"use client"

import type React from "react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Briefcase, Plus, Eye, Edit, Trash2, MapPin, Calendar, Building, Users } from "lucide-react"
import { useState, useEffect } from "react"
import { getAllOpportunities, createOpportunity, getAllCompanies } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"

export default function TPOfficerOpportunities() {
  const [opportunities, setOpportunities] = useState([])
  const [companies, setCompanies] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const loadData = () => {
      const opportunitiesData = getAllOpportunities()
      const companiesData = getAllCompanies()
      setOpportunities(opportunitiesData)
      setCompanies(companiesData.filter((company) => company.verified))
    }
    loadData()
  }, [])

  const handleAddOpportunity = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.target as HTMLFormElement)

    try {
      const requirements = (formData.get("requirements") as string)
        .split(",")
        .map((req) => req.trim())
        .filter((req) => req)

      const newOpportunity = createOpportunity({
        title: formData.get("title") as string,
        company: formData.get("company") as string,
        location: formData.get("location") as string,
        duration: formData.get("duration") as string,
        type: formData.get("type") as string,
        description: formData.get("description") as string,
        requirements,
        stipend: formData.get("stipend") as string,
        positions: Number.parseInt(formData.get("positions") as string),
        deadline: formData.get("deadline") as string,
        verified: true,
        postedBy: 3, // T&P Officer ID
      })

      setOpportunities((prev) => [...prev, newOpportunity])
      setShowAddForm(false)

      toast({
        title: "Opportunity Posted",
        description: "Internship opportunity has been posted successfully.",
      })

      // Reset form
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post opportunity. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const activeOpportunities = opportunities.filter((opp) => opp.status === "active").length
  const totalApplications = opportunities.reduce((sum, opp) => sum + (opp.applicants || 0), 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Internship Opportunities</h1>
            <p className="text-gray-600">Manage and post internship opportunities for students</p>
          </div>
          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Post Opportunity
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto mx-4">
              <DialogHeader>
                <DialogTitle>Post New Internship Opportunity</DialogTitle>
                <DialogDescription>Create a new internship opportunity for students to apply.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddOpportunity} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Position Title *</Label>
                    <Input id="title" name="title" placeholder="Software Development Intern" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company *</Label>
                    <Select name="company" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.name}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input id="location" name="location" placeholder="Bangalore, Karnataka" required />
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
                        <SelectItem value="12 months">12 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select name="type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Remote">Remote</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stipend">Stipend *</Label>
                    <Input id="stipend" name="stipend" placeholder="₹25,000/month" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="positions">Number of Positions *</Label>
                    <Input id="positions" name="positions" type="number" placeholder="5" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Application Deadline *</Label>
                    <Input id="deadline" name="deadline" type="date" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Detailed description of the internship role, responsibilities, and expectations..."
                    rows={4}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements *</Label>
                  <Textarea
                    id="requirements"
                    name="requirements"
                    placeholder="React, Node.js, JavaScript, Git (comma-separated)"
                    rows={2}
                    required
                  />
                  <p className="text-xs text-gray-500">Enter skills/requirements separated by commas</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? "Posting..." : "Post Opportunity"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Opportunity Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Opportunities</p>
                  <p className="text-2xl font-bold">{opportunities.length}</p>
                </div>
                <Briefcase className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{activeOpportunities}</p>
                </div>
                <Briefcase className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-purple-600">{totalApplications}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-orange-600">{opportunities.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Opportunities List */}
        <div className="space-y-4">
          {opportunities.map((opportunity) => (
            <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h3 className="text-lg sm:text-xl font-semibold">{opportunity.title}</h3>
                      <Badge variant="default" className="bg-green-600">
                        {opportunity.status}
                      </Badge>
                      <Badge variant="outline">{opportunity.type}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        <span>{opportunity.company}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{opportunity.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{opportunity.duration}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3 text-sm sm:text-base">{opportunity.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {opportunity.requirements.map((req, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Stipend:</span> {opportunity.stipend}
                      </div>
                      <div>
                        <span className="font-medium">Positions:</span> {opportunity.positions}
                      </div>
                      <div>
                        <span className="font-medium">Applications:</span> {opportunity.applicants || 0}
                      </div>
                      <div>
                        <span className="font-medium">Deadline:</span>{" "}
                        {new Date(opportunity.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 lg:ml-4">
                    <Button variant="outline" size="sm" className="w-full lg:w-auto bg-transparent">
                      <Eye className="h-4 w-4 mr-1" />
                      View Applications
                    </Button>
                    <Button variant="outline" size="sm" className="w-full lg:w-auto bg-transparent">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full lg:w-auto text-red-600 hover:text-red-700 bg-transparent"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {opportunities.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-2">No opportunities posted yet</p>
              <p className="text-sm text-gray-400">Click "Post Opportunity" to create your first internship listing.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
