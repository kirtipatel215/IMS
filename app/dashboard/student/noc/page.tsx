"use client"

import type React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

// Data helpers (these exist)
import { getNOCRequestsByStudent, createNOCRequest, getCurrentUser } from "@/lib/data"

// Optional helpers (safe to keep; wrapped in try/catch)
import { uploadNocDocument, getDocumentPublicUrl, updateNOCRequest } from "@/lib/data"

// Icons
import {
  Plus,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Download,
  Pencil,
  Trash2,
  Upload,
  Paperclip,
} from "lucide-react"

type NOCRequest = {
  id: number
  company: string
  position: string
  duration: string
  startDate: string
  submittedDate: string
  approvedDate?: string
  status: "approved" | "pending" | "rejected" | string
  description: string
  feedback?: string
  documents?: string[] // paths or URLs
  [key: string]: any
}

const STATUS_META: Record<
  string,
  { label: string; icon: React.ElementType; badgeClass: string; chipClass: string }
> = {
  approved: {
    label: "Approved",
    icon: CheckCircle,
    badgeClass: "bg-emerald-600 text-white",
    chipClass: "text-emerald-700 bg-emerald-50 ring-1 ring-emerald-100",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    badgeClass: "bg-amber-500 text-white",
    chipClass: "text-amber-700 bg-amber-50 ring-1 ring-amber-100",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    badgeClass: "bg-rose-600 text-white",
    chipClass: "text-rose-700 bg-rose-50 ring-1 ring-rose-100",
  },
  unknown: {
    label: "Unknown",
    icon: FileText,
    badgeClass: "bg-gray-500 text-white",
    chipClass: "text-gray-700 bg-gray-50 ring-1 ring-gray-200",
  },
}

function prettyStatus(s?: string) {
  const k = (s || "unknown").toLowerCase()
  return STATUS_META[k] ?? STATUS_META.unknown
}

// ————————————————————————————————————————————————————————————————————————
// Upload UI (drag & drop + preview)
// ————————————————————————————————————————————————————————————————————————
function UploadZone({
  onFiles,
  busy,
}: {
  onFiles: (files: File[]) => void
  busy?: boolean
}) {
  const [dragOver, setDragOver] = useState(false)

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files || []).filter((f) => f.type === "application/pdf")
    if (files.length) onFiles(files)
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={cn(
        "w-full rounded-2xl border-2 border-dashed p-6 transition-all",
        dragOver ? "border-primary/60 bg-primary/5" : "border-gray-300"
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl p-3 bg-gray-100">
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium">Upload Offer Letter (PDF)</p>
            <p className="text-sm text-gray-500">Drag & drop or choose a file (PDF only)</p>
          </div>
        </div>
        <label className={cn("inline-flex items-center gap-2 cursor-pointer")}>
          <Input
            type="file"
            accept="application/pdf"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const files = Array.from(e.target.files || []).filter((f) => f.type === "application/pdf")
              if (files.length) onFiles(files)
            }}
          />
          <Button variant="outline" disabled={busy}>
            <Paperclip className="h-4 w-4 mr-2" />
            Choose PDF
          </Button>
        </label>
      </div>
    </div>
  )
}

// ————————————————————————————————————————————————————————————————————————
// Dialog primitives from shadcn
// ————————————————————————————————————————————————————————————————————————
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// ————————————————————————————————————————————————————————————————————————
// Main Page
// ————————————————————————————————————————————————————————————————————————
export default function NOCRequests() {
  const [showForm, setShowForm] = useState(false)
  const [nocRequests, setNocRequests] = useState<NOCRequest[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [viewing, setViewing] = useState<NOCRequest | null>(null)
  const [editing, setEditing] = useState<NOCRequest | null>(null)
  const { toast } = useToast()

  // Load data
  useEffect(() => {
    const load = async () => {
      const user = await getCurrentUser()
      if (!user) return setNocRequests([])
      try {
        const rows = await getNOCRequestsByStudent(user.id)
        // Normalize schema → what UI expects
        const normalized: NOCRequest[] = (rows || []).map((r: any) => ({
          id: r.id,
          company: r.company ?? r.company_name ?? "",
          position: r.position,
          duration: r.duration,
          startDate: r.start_date ?? r.startDate,
          submittedDate: r.submitted_date ?? r.submittedDate ?? new Date().toISOString(),
          approvedDate: r.approved_date ?? r.approvedDate,
          status: r.status ?? "pending",
          description: r.description ?? "",
          feedback: r.feedback ?? "",
          documents: Array.isArray(r.documents)
            ? r.documents
            : typeof r.documents === "string"
              ? (() => {
                  try {
                    const j = JSON.parse(r.documents)
                    return Array.isArray(j) ? j : []
                  } catch {
                    return []
                  }
                })()
              : [],
          raw: r,
        }))
        setNocRequests(normalized)
      } catch (err) {
        console.error("Error fetching NOC requests:", err)
        setNocRequests([])
      }
    }
    load()
  }, [])

  // Helpers
  const resetForm = useCallback((form: HTMLFormElement) => {
    form.reset()
    setPendingFiles([])
  }, [])

  // Submit new request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const form = e.target as HTMLFormElement
    const fd = new FormData(form)

    try {
      const user = await getCurrentUser()
      if (!user) {
        toast({
          title: "Not signed in",
          description: "Please log in again and resubmit.",
          variant: "destructive",
        })
        return
      }

      // Upload doc if helper exists, else fall back to filename only
      let storedDocs: string[] = []
      const file = (fd.get("offer-letter") as File) || pendingFiles[0]
      if (file) {
        try {
          if (typeof uploadNocDocument === "function") {
            const uploaded = await uploadNocDocument(user.id, file)
            storedDocs = [uploaded.filePath || uploaded.publicUrl].filter(Boolean)
          } else {
            storedDocs = [file.name] // fallback
          }
        } catch (upErr: any) {
          console.error("Upload failed, saving without file path.", upErr)
          storedDocs = [file.name]
        }
      }

      const newRow = await createNOCRequest({
        studentId: user.id,
        studentName: user.name,
        studentEmail: user.email,
        company: (fd.get("company") as string) || "",
        position: (fd.get("position") as string) || "",
        duration: (fd.get("duration") as string) || "",
        startDate: (fd.get("startDate") as string) || "",
        description: (fd.get("description") as string) || "",
        documents: storedDocs,
      })

      // Normalize created row
      const created: NOCRequest = {
        id: newRow.id,
        company: newRow.company ?? newRow.company_name ?? fd.get("company")?.toString() ?? "",
        position: newRow.position,
        duration: newRow.duration,
        startDate: newRow.start_date ?? newRow.startDate,
        submittedDate: newRow.submitted_date ?? newRow.submittedDate ?? new Date().toISOString(),
        approvedDate: newRow.approved_date ?? newRow.approvedDate,
        status: newRow.status ?? "pending",
        description: newRow.description ?? "",
        feedback: newRow.feedback ?? "",
        documents:
          Array.isArray(newRow.documents) ? newRow.documents : storedDocs,
      }

      setNocRequests((prev) => [created, ...prev])
      setShowForm(false)
      resetForm(form)
      toast({ title: "NOC Request Submitted", description: "Your request is now pending review." })
    } catch (error: any) {
      console.error("Failed to submit NOC:", error)
      toast({
        title: "Submission failed",
        description: error?.message || "Please review your input and try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Edit request (modal save)
  const handleSaveEdit = async (patch: Partial<NOCRequest>) => {
    if (!editing) return
    const id = editing.id

    // optimistic update
    setNocRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
    )

    try {
      if (typeof updateNOCRequest === "function") {
        await updateNOCRequest(id, patch)
      }
      toast({ title: "Updated", description: "Your request has been updated." })
      setEditing(null)
    } catch (err: any) {
      console.error("Update failed:", err)
      toast({
        title: "Update failed",
        description: err?.message || "Could not save changes.",
        variant: "destructive",
      })
    }
  }

  const openDoc = async (p: string) => {
    try {
      if (typeof getDocumentPublicUrl === "function") {
        const url = await getDocumentPublicUrl(p)
        if (url) window.open(url, "_blank", "noopener,noreferrer")
        else window.open(p, "_blank", "noopener,noreferrer")
      } else {
        // If it's already a URL, open; else show a toast with path
        if (/^https?:\/\//i.test(p)) window.open(p, "_blank", "noopener,noreferrer")
        else
          toast({
            title: "Document path",
            description: p,
          })
      }
    } catch (e) {
      window.open(p, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">NOC Requests</h1>
              <p className="text-gray-600">Manage your No Objection Certificate requests</p>
            </div>
            <Button onClick={() => setShowForm((s) => !s)} className="rounded-2xl">
              <Plus className="mr-2 h-4 w-4" />
              New NOC Request
            </Button>
          </div>

          {/* Create Form */}
          {showForm && (
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-xl">Submit New NOC Request</CardTitle>
                <CardDescription>Request NOC for an externally secured internship</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
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
                        <SelectTrigger className="rounded-xl">
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

                  <div className="space-y-3">
                    <Label>Offer Letter (PDF) *</Label>
                    <UploadZone onFiles={(f) => setPendingFiles(f)} busy={isSubmitting} />
                    {pendingFiles.length > 0 && (
                      <div className="flex items-center justify-between rounded-xl border p-3 bg-gray-50">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5" />
                          <div className="text-sm">
                            <p className="font-medium">{pendingFiles[0].name}</p>
                            <p className="text-gray-500">
                              {(pendingFiles[0].size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setPendingFiles([])}
                          className="text-rose-600 hover:text-rose-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    )}
                    {/* Hidden input to keep FormData compatible if needed */}
                    <Input id="offer-letter" type="file" accept="application/pdf" name="offer-letter" className="hidden" />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={isSubmitting} className="rounded-2xl">
                      {isSubmitting ? "Submitting..." : "Submit Request"}
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => {
                        setShowForm(false)
                        setPendingFiles([])
                      }}
                      className="rounded-2xl"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* List */}
          <div className="space-y-4">
            {nocRequests.map((request) => {
              const meta = prettyStatus(request.status)
              const StatusIcon = meta.icon
              return (
                <Card key={request.id} className="border-0 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      {/* Left */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{request.company}</h3>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full",
                              meta.chipClass
                            )}
                          >
                            <StatusIcon className="h-3.5 w-3.5" />
                            {meta.label}
                          </span>
                        </div>

                        <p className="text-gray-700 font-medium">{request.position}</p>
                        <p className="text-sm text-gray-600 mb-3">{request.description}</p>

                        <div className="flex flex-wrap gap-3 text-sm">
                          <span className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
                            Duration: {request.duration}
                          </span>
                          <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                            Start: {new Date(request.startDate).toLocaleDateString()}
                          </span>
                          <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 ring-1 ring-gray-200">
                            Submitted: {new Date(request.submittedDate).toLocaleDateString()}
                          </span>
                          {request.approvedDate && (
                            <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                              Approved: {new Date(request.approvedDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {request.feedback && (
                          <div className="mt-3 p-3 rounded-xl bg-amber-50 ring-1 ring-amber-100">
                            <p className="text-sm font-medium mb-1">Review Feedback</p>
                            <p className="text-sm text-amber-800">{request.feedback}</p>
                          </div>
                        )}

                        {request.documents && request.documents.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-medium mb-2">Uploaded Documents</p>
                            <div className="flex flex-wrap gap-2">
                              {request.documents.map((doc, idx) => (
                                <Button
                                  key={idx}
                                  type="button"
                                  variant="outline"
                                  className="rounded-xl"
                                  onClick={() => openDoc(doc)}
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  {doc.split("/").pop() || doc}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="default"
                          size="sm"
                          className="rounded-xl bg-blue-600 hover:bg-blue-700"
                          onClick={() => setViewing(request)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl border-amber-300 text-amber-700 hover:bg-amber-50"
                          onClick={() => setEditing(request)}
                          disabled={request.status === "approved"}
                          title={request.status === "approved" ? "Approved requests are locked" : "Edit request"}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>

                        {request.status === "approved" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                            onClick={() => {
                              // hook into your actual download flow if available
                              toast({
                                title: "Download NOC",
                                description: `Downloading NOC certificate for request ${request.id}`,
                              })
                            }}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            NOC PDF
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Empty state */}
          {nocRequests.length === 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-10 text-center">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                  <FileText className="h-7 w-7 text-gray-500" />
                </div>
                <p className="text-gray-700 font-medium">No NOC requests found</p>
                <p className="text-sm text-gray-500 mt-1">Click “New NOC Request” to submit your first request</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>

      {/* View Details Dialog */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>NOC Request Details</DialogTitle>
            <DialogDescription>Full details of your request</DialogDescription>
          </DialogHeader>

          {viewing && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">{viewing.company}</p>
                  <p className="text-gray-600">{viewing.position}</p>
                </div>
                {(() => {
                  const meta = prettyStatus(viewing.status)
                  const Icon = meta.icon
                  return (
                    <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full", meta.chipClass)}>
                      <Icon className="h-3.5 w-3.5" />
                      {meta.label}
                    </span>
                  )
                })()}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-indigo-50 ring-1 ring-indigo-100 px-3 py-2">
                  <p className="text-indigo-700 font-medium">Duration</p>
                  <p className="text-indigo-900">{viewing.duration}</p>
                </div>
                <div className="rounded-xl bg-blue-50 ring-1 ring-blue-100 px-3 py-2">
                  <p className="text-blue-700 font-medium">Start Date</p>
                  <p className="text-blue-900">{new Date(viewing.startDate).toLocaleDateString()}</p>
                </div>
                <div className="rounded-xl bg-gray-50 ring-1 ring-gray-200 px-3 py-2">
                  <p className="text-gray-700 font-medium">Submitted</p>
                  <p className="text-gray-900">{new Date(viewing.submittedDate).toLocaleDateString()}</p>
                </div>
                {viewing.approvedDate && (
                  <div className="rounded-xl bg-emerald-50 ring-1 ring-emerald-100 px-3 py-2">
                    <p className="text-emerald-700 font-medium">Approved</p>
                    <p className="text-emerald-900">{new Date(viewing.approvedDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Job Description</p>
                <p className="text-sm text-gray-700">{viewing.description}</p>
              </div>

              {viewing.feedback && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Feedback</p>
                  <p className="text-sm text-gray-700">{viewing.feedback}</p>
                </div>
              )}

              {viewing.documents && viewing.documents.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Documents</p>
                  <div className="flex flex-wrap gap-2">
                    {viewing.documents.map((d, i) => (
                      <Button key={i} variant="outline" onClick={() => openDoc(d)} className="rounded-xl">
                        <FileText className="h-4 w-4 mr-2" />
                        {d.split("/").pop() || d}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)} className="rounded-2xl">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit NOC Request</DialogTitle>
            <DialogDescription>Update details for this request</DialogDescription>
          </DialogHeader>

          {editing && (
            <EditForm
              request={editing}
              onCancel={() => setEditing(null)}
              onSave={handleSaveEdit}
            />
          )}
        </DialogContent>
      </Dialog>
    </AuthGuard>
  )
}

// ————————————————————————————————————————————————————————————————————————
// Edit form component
// ————————————————————————————————————————————————————————————————————————
function EditForm({
  request,
  onCancel,
  onSave,
}: {
  request: NOCRequest
  onCancel: () => void
  onSave: (patch: Partial<NOCRequest>) => void
}) {
  const [company, setCompany] = useState(request.company)
  const [position, setPosition] = useState(request.position)
  const [duration, setDuration] = useState(request.duration)
  const [startDate, setStartDate] = useState(() =>
    (request.startDate || "").slice(0, 10)
  )
  const [description, setDescription] = useState(request.description)
  const [busy, setBusy] = useState(false)

  const disabled = request.status === "approved"

  const save = async () => {
    setBusy(true)
    await onSave({
      company,
      position,
      duration,
      startDate,
      description,
    })
    setBusy(false)
  }

  return (
    <div className="space-y-4">
      {disabled && (
        <div className="rounded-xl bg-emerald-50 ring-1 ring-emerald-100 p-3 text-sm text-emerald-900">
          This request is approved and locked for editing.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Company</Label>
          <Input value={company} onChange={(e) => setCompany(e.target.value)} disabled={disabled} />
        </div>
        <div className="space-y-2">
          <Label>Position</Label>
          <Input value={position} onChange={(e) => setPosition(e.target.value)} disabled={disabled} />
        </div>
        <div className="space-y-2">
          <Label>Duration</Label>
          <Select
            value={duration}
            onValueChange={setDuration}
            disabled={disabled}
          >
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
          <Label>Start Date</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Job Description</Label>
        <Textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} className="rounded-2xl">
          Cancel
        </Button>
        <Button onClick={save} disabled={busy || disabled} className="rounded-2xl">
          {busy ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  )
}
