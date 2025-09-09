"use client"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, MapPin, Calendar, Building, ExternalLink, Send, Briefcase } from "lucide-react"
import { useState, useEffect } from "react"
import { getAllOpportunities, createApplication, getCurrentUser, getApplicationsByStudent } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function StudentOpportunities() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterLocation, setFilterLocation] = useState("all")
  const [filterDuration, setFilterDuration] = useState("all")
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [selectedOpportunity, setSelectedOpportunity] = useState<any | null>(null)
  const [coverLetter, setCoverLetter] = useState("")
  const [isApplying, setIsApplying] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      const opportunitiesData = await getAllOpportunities()
      setOpportunities(Array.isArray(opportunitiesData) ? opportunitiesData : [])

      const user = await getCurrentUser()
      if (user) {
        const userApplications = await getApplicationsByStudent(user.id)
        setApplications(Array.isArray(userApplications) ? userApplications : [])
      }
    }

    loadData()

    // ✅ Subscribe to realtime updates from applications table
    const channel = supabase
      .channel("realtime-opportunities")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "applications" },
        (payload) => {
          // Update applicants count live
          setOpportunities((prev) =>
            prev.map((opp) =>
              opp.id === payload.new.opportunity_id
                ? { ...opp, applicants: opp.applicants + 1 }
                : opp
            )
          )

          // If current user applied, update applications list
          getCurrentUser().then((user) => {
            if (user && user.id === payload.new.student_id) {
              setApplications((prev) => [...prev, payload.new])
            }
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleApply = async () => {
    if (!selectedOpportunity || !coverLetter.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsApplying(true)

    try {
      const user = await getCurrentUser()
      if (!user) throw new Error("User not found")

      const application = await createApplication({
        opportunityId: selectedOpportunity.id,
        studentId: user.id,
        studentName: user.name,
        studentEmail: user.email,
        coverLetter,
        resumeFileName: "resume.pdf",
      })

      // Update local state immediately for button disable
      setApplications((prev) => [...prev, application])

      toast({
        title: "Application Submitted",
        description: `Your application for ${selectedOpportunity.title} has been submitted successfully.`,
      })

      // ✅ Reset dialog state
      setCoverLetter("")
      setSelectedOpportunity(null)
      setDialogOpen(false)

      // Redirect to dashboard (optional)
      router.push("/dashboard/student")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsApplying(false)
    }
  }

  const hasApplied = (opportunityId: number) => {
    return applications.some((app) => app.opportunity_id === opportunityId || app.opportunityId === opportunityId)
  }

  const filteredOpportunities = opportunities.filter((opportunity) => {
    const searchMatch =
      opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.company.toLowerCase().includes(searchTerm.toLowerCase())

    const locationMatch =
      filterLocation === "all" || opportunity.location.toLowerCase().includes(filterLocation.toLowerCase())

    const durationMatch = filterDuration === "all" || opportunity.duration.includes(filterDuration)

    return searchMatch && locationMatch && durationMatch && opportunity.status === "active"
  })

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Internship Opportunities</h1>
            <p className="text-gray-600">Discover and apply for verified internship positions</p>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search opportunities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterLocation} onValueChange={setFilterLocation}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="bangalore">Bangalore</SelectItem>
                    <SelectItem value="mumbai">Mumbai</SelectItem>
                    <SelectItem value="pune">Pune</SelectItem>
                    <SelectItem value="ahmedabad">Ahmedabad</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterDuration} onValueChange={setFilterDuration}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Durations</SelectItem>
                    <SelectItem value="3">3 months</SelectItem>
                    <SelectItem value="4">4 months</SelectItem>
                    <SelectItem value="6">6 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Opportunities List */}
          <div className="space-y-4">
            {filteredOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3 className="text-lg sm:text-xl font-semibold">{opportunity.title}</h3>
                        {opportunity.verified && (
                          <Badge variant="default" className="bg-green-600">
                            Verified
                          </Badge>
                        )}
                        <Badge variant="outline">{opportunity.type}</Badge>
                        {hasApplied(opportunity.id) && <Badge variant="secondary">Applied</Badge>}
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
                        {opportunity.requirements.map((req: string, index: number) => (
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
                          <span className="font-medium">Applications:</span> {opportunity.applicants}
                        </div>
                        <div>
                          <span className="font-medium">Deadline:</span>{" "}
                          {new Date(opportunity.deadline).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 lg:ml-4">
                      {!hasApplied(opportunity.id) ? (
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                          <Button
                            onClick={() => {
                              setSelectedOpportunity(opportunity)
                              setDialogOpen(true)
                            }}
                            className="w-full lg:w-auto"
                          >
                            Apply Now
                            <Send className="ml-2 h-4 w-4" />
                          </Button>
                          <DialogContent className="sm:max-w-[500px] mx-4">
                            <DialogHeader>
                              <DialogTitle>Apply for {opportunity.title}</DialogTitle>
                              <DialogDescription>
                                Submit your application for this internship position at {opportunity.company}.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="cover-letter">Cover Letter *</Label>
                                <Textarea
                                  id="cover-letter"
                                  placeholder="Write a compelling cover letter..."
                                  value={coverLetter}
                                  onChange={(e) => setCoverLetter(e.target.value)}
                                  rows={6}
                                />
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2">
                                <Button onClick={handleApply} disabled={isApplying} className="flex-1">
                                  {isApplying ? "Submitting..." : "Submit Application"}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setDialogOpen(false)
                                    setSelectedOpportunity(null)
                                    setCoverLetter("")
                                  }}
                                  className="flex-1"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <Button disabled className="w-full lg:w-auto">
                          Applied
                        </Button>
                      )}
                      <Button variant="outline" className="w-full lg:w-auto bg-transparent">
                        View Details
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredOpportunities.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-2">No opportunities found</p>
                <p className="text-sm text-gray-400">
                  Try adjusting your search criteria or check back later for new opportunities.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
