"use client"
import type React from "react"
import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast, useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

// Data helpers
import { getNOCRequestsByStudent, createNOCRequest, getCurrentUser, uploadFile } from "@/lib/data"

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
  Building,
  Calendar,
  User,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Search,
  Filter,
  DollarSign,
  CalendarDays
} from "lucide-react"

// Dialog components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type NOCRequest = {
  id: number
  company: string
  position: string
  startDate: string
  endDate: string
  stipend?: string
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
    icon: CheckCircle2,
    badgeClass: "bg-emerald-600 text-white",
    chipClass: "text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200",
  },
  pending: {
    label: "Under Review",
    icon: Clock,
    badgeClass: "bg-amber-500 text-white",
    chipClass: "text-amber-700 bg-amber-50 ring-1 ring-amber-200",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    badgeClass: "bg-rose-600 text-white",
    chipClass: "text-rose-700 bg-rose-50 ring-1 ring-rose-200",
  },
  unknown: {
    label: "Unknown",
    icon: AlertCircle,
    badgeClass: "bg-gray-500 text-white",
    chipClass: "text-gray-700 bg-gray-50 ring-1 ring-gray-200",
  },
}

function prettyStatus(s?: string) {
  const k = (s || "unknown").toLowerCase()
  return STATUS_META[k] ?? STATUS_META.unknown
}

// Calculate duration from start and end dates
function calculateDuration(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30))
  
  if (diffMonths === 1) return "1 month"
  if (diffMonths < 12) return `${diffMonths} months`
  
  const years = Math.floor(diffMonths / 12)
  const remainingMonths = diffMonths % 12
  
  if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''}`
  return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`
}

// Enhanced Upload Zone Component with optimizations
function UploadZone({
  onFiles,
  busy,
  selectedFiles
}: {
  onFiles: (files: File[]) => void
  busy?: boolean
  selectedFiles: File[]
}) {
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (file.type !== "application/pdf") {
      return "Only PDF files are allowed"
    }
    if (file.size > 10 * 1024 * 1024) {
      return "File size must be less than 10MB"
    }
    if (file.size < 1024) {
      return "File seems too small to be a valid PDF"
    }
    return null
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files || [])
    const validFiles: File[] = []
    const errors: string[] = []

    droppedFiles.forEach(file => {
      const error = validateFile(file)
      if (error) {
        errors.push(`${file.name}: ${error}`)
      } else {
        validFiles.push(file)
      }
    })

    if (errors.length > 0) {
      toast({
        title: "Invalid Files",
        description: errors.join(', '),
        variant: "destructive"
      })
    }

    if (validFiles.length > 0) {
      onFiles([validFiles[0]])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    const error = validateFile(selectedFile)
    if (error) {
      toast({
        title: "Invalid File",
        description: error,
        variant: "destructive"
      })
      return
    }

    onFiles([selectedFile])
  }

  const triggerFileSelect = () => {
    if (busy) return
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          if (!busy) setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer",
          dragOver && !busy
            ? "border-blue-400 bg-blue-50" 
            : "border-gray-300 hover:border-gray-400",
          busy && "opacity-50 cursor-not-allowed"
        )}
        onClick={triggerFileSelect}
      >
        <div className="text-center">
          <div className={cn(
            "mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-4 transition-colors",
            dragOver && !busy ? "bg-blue-100" : "bg-gray-100"
          )}>
            {busy ? (
              <Clock className="h-6 w-6 text-gray-500 animate-spin" />
            ) : (
              <Upload className="h-6 w-6 text-gray-500" />
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {busy ? "Processing..." : "Upload Documents (Optional)"}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {busy 
              ? "Please wait while we process your file..." 
              : "Upload offer letter or other supporting documents"
            }
          </p>
          <p className="text-xs text-gray-400 mb-4">PDF files only, max 10MB • Optional</p>
          
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={(e) => {
              e.stopPropagation()
              triggerFileSelect()
            }}
            className="rounded-lg"
          >
            <Paperclip className="h-4 w-4 mr-2" />
            {busy ? "Processing..." : "Choose PDF File"}
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            className="hidden"
            disabled={busy}
          />
        </div>
      </div>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Selected Files</Label>
          {selectedFiles.map((file, index) => {
            const isValid = !validateFile(file)
            return (
              <div key={index} className={cn(
                "flex items-center justify-between p-3 border rounded-lg transition-colors",
                isValid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-8 w-8 rounded flex items-center justify-center",
                    isValid ? "bg-green-100" : "bg-red-100"
                  )}>
                    {isValid ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                      {isValid && <span className="text-green-600 ml-2">✓ Valid PDF</span>}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onFiles(selectedFiles.filter((_, i) => i !== index))
                  }}
                  disabled={busy}
                  className="text-gray-500 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Enhanced NOC Card Component
function NOCCard({ request, onView, onEdit }: { 
  request: NOCRequest
  onView: () => void
  onEdit: () => void
}) {
  const meta = prettyStatus(request.status)
  const StatusIcon = meta.icon
  const duration = calculateDuration(request.startDate, request.endDate)

  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm cursor-pointer"
      onClick={onView}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {request.company}
              </h3>
              <p className="text-sm text-gray-600">{request.position}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={cn(
              "inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full",
              meta.chipClass
            )}>
              <StatusIcon className="h-3.5 w-3.5" />
              {meta.label}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-700 line-clamp-2">{request.description}</p>
          
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md">
              <CalendarDays className="h-3 w-3" />
              {duration}
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md">
              <Calendar className="h-3 w-3" />
              {new Date(request.startDate).toLocaleDateString()}
            </div>
            {request.stipend && (
              <div className="inline-flex items-center gap-1.5 text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-md">
                <DollarSign className="h-3 w-3" />
                {request.stipend}
              </div>
            )}
            {request.documents && request.documents.length > 0 && (
              <div className="inline-flex items-center gap-1.5 text-xs bg-gray-50 text-gray-700 px-2.5 py-1 rounded-md">
                <FileText className="h-3 w-3" />
                {request.documents.length} Document{request.documents.length > 1 ? 's' : ''}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs text-gray-500">
              Submitted {new Date(request.submittedDate).toLocaleDateString()}
            </span>
            
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <Button
                size="sm"
                variant="outline"
                onClick={onEdit}
                disabled={request.status === "approved"}
                className="h-8 px-3 text-xs"
              >
                <Pencil className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                onClick={onView}
                className="h-8 px-3 text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
            </div>
          </div>
        </div>
        
        {request.feedback && (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-xs font-medium text-amber-800 mb-1">Feedback</p>
            <p className="text-xs text-amber-700">{request.feedback}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Enhanced Edit Form Component
function EditForm({
  request,
  onCancel,
  onSave,
}: {
  request: NOCRequest
  onCancel: () => void
  onSave: (updates: Partial<NOCRequest>) => void
}) {
  const [company, setCompany] = useState(request.company)
  const [position, setPosition] = useState(request.position)
  const [startDate, setStartDate] = useState(() => 
    (request.startDate || "").slice(0, 10)
  )
  const [endDate, setEndDate] = useState(() => 
    (request.endDate || "").slice(0, 10)
  )
  const [stipend, setStipend] = useState(request.stipend || "")
  const [description, setDescription] = useState(request.description)
  const [isSaving, setIsSaving] = useState(false)

  const isDisabled = request.status === "approved"

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      const updates = {
        company,
        position,
        startDate,
        endDate,
        stipend,
        description,
      }
      
      await onSave(updates)
    } catch (error) {
      console.error('Error saving updates:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {isDisabled && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <p className="text-sm font-medium text-emerald-900">
              This request has been approved and cannot be edited.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-company" className="text-sm font-medium text-gray-700">
            Company Name
          </Label>
          <Input
            id="edit-company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            disabled={isDisabled}
            className="rounded-lg border-gray-300"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="edit-position" className="text-sm font-medium text-gray-700">
            Position
          </Label>
          <Input
            id="edit-position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            disabled={isDisabled}
            className="rounded-lg border-gray-300"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="edit-startDate" className="text-sm font-medium text-gray-700">
            Start Date
          </Label>
          <Input
            id="edit-startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={isDisabled}
            className="rounded-lg border-gray-300"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="edit-endDate" className="text-sm font-medium text-gray-700">
            End Date
          </Label>
          <Input
            id="edit-endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={isDisabled}
            className="rounded-lg border-gray-300"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="edit-stipend" className="text-sm font-medium text-gray-700">
            Stipend (Optional)
          </Label>
          <Input
            id="edit-stipend"
            value={stipend}
            onChange={(e) => setStipend(e.target.value)}
            placeholder="e.g., ₹15,000/month or Unpaid"
            disabled={isDisabled}
            className="rounded-lg border-gray-300"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-description" className="text-sm font-medium text-gray-700">
          Job Description
        </Label>
        <Textarea
          id="edit-description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isDisabled}
          className="rounded-lg border-gray-300"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button 
          variant="outline" 
          onClick={onCancel} 
          className="rounded-lg px-6"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={isSaving || isDisabled} 
          className="rounded-lg px-6 bg-blue-600 hover:bg-blue-700"
        >
          {isSaving ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default function NOCRequests() {
  const [showForm, setShowForm] = useState(false)
  const [nocRequests, setNocRequests] = useState<NOCRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<NOCRequest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitProgress, setSubmitProgress] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [viewing, setViewing] = useState<NOCRequest | null>(null)
  const [editing, setEditing] = useState<NOCRequest | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const { toast } = useToast()

  // Load current user and data
  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await getCurrentUser()
        setCurrentUser(user)
        
        if (!user) return setNocRequests([])
        
        const rows = await getNOCRequestsByStudent(user.id)
        const normalized: NOCRequest[] = (rows || []).map((r: any) => ({
          id: r.id,
          company: r.company ?? r.company_name ?? "",
          position: r.position,
          startDate: r.start_date ?? r.startDate,
          endDate: r.end_date ?? r.endDate,
          stipend: r.stipend,
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
        console.error("Error loading data:", err)
        setNocRequests([])
      }
    }
    loadData()
  }, [])

  // Filter requests based on search and status
  useEffect(() => {
    let filtered = nocRequests

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(request => 
        request.company.toLowerCase().includes(term) ||
        request.position.toLowerCase().includes(term)
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(request => request.status === statusFilter)
    }

    setFilteredRequests(filtered)
  }, [nocRequests, searchTerm, statusFilter])

  // Handle file selection
  const handleFileSelection = useCallback((files: File[]) => {
    setSelectedFiles(files)
  }, [])

  // Reset form
  const resetForm = useCallback(() => {
    setSelectedFiles([])
    setShowForm(false)
  }, [])

  // Submit new request with better error handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Immediate validations
    if (!currentUser) {
      toast({
        title: "Authentication Error",
        description: "Please log in and try again.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    const startTime = Date.now()
    
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    try {
      // Validate form data
      const requestData = {
        studentId: currentUser.id,
        studentName: currentUser.name,
        studentEmail: currentUser.email,
        company: (formData.get("company") as string)?.trim(),
        position: (formData.get("position") as string)?.trim(),
        startDate: formData.get("startDate") as string,
        endDate: formData.get("endDate") as string,
        stipend: (formData.get("stipend") as string)?.trim() || "",
        description: (formData.get("description") as string)?.trim(),
        documents: [],
      }

      if (!requestData.company || !requestData.position || !requestData.description || !requestData.startDate || !requestData.endDate) {
        throw new Error("Please fill in all required fields")
      }

      // Validate dates
      const startDate = new Date(requestData.startDate)
      const endDate = new Date(requestData.endDate)
      if (endDate <= startDate) {
        throw new Error("End date must be after start date")
      }

      // Handle optional file upload
      let fileUrl = null
      if (selectedFiles.length > 0) {
        const file = selectedFiles[0]
        
        // Pre-flight checks for file
        if (file.size > 10 * 1024 * 1024) {
          throw new Error("File must be under 10MB. Please compress your PDF.")
        }

        if (file.type !== 'application/pdf') {
          throw new Error("Only PDF files are allowed.")
        }

        setSubmitProgress(`⚡ Uploading ${file.name}...`)
        console.log(`🚀 Starting upload: ${file.name} (${(file.size/1024/1024).toFixed(1)}MB)`)
        
        const uploadResult = await uploadFile(file, 'documents')
        
        if (!uploadResult.success || !uploadResult.fileUrl) {
          throw new Error(uploadResult.error || 'File upload failed')
        }

        fileUrl = uploadResult.fileUrl
        requestData.documents = [fileUrl]
      }

      // Create NOC request
      setSubmitProgress("📝 Creating request...")
      
      const newRequest = await createNOCRequest(requestData)

      if (!newRequest?.id) {
        throw new Error('Request creation failed')
      }

      const totalTime = Date.now() - startTime
      console.log(`✅ Total time: ${totalTime}ms`)

      // Optimistic UI update
      const normalized: NOCRequest = {
        id: newRequest.id,
        company: newRequest.company_name || requestData.company,
        position: newRequest.position,
        startDate: newRequest.start_date || newRequest.startDate || requestData.startDate,
        endDate: newRequest.end_date || newRequest.endDate || requestData.endDate,
        stipend: newRequest.stipend || requestData.stipend,
        submittedDate: newRequest.submitted_date || new Date().toISOString(),
        approvedDate: newRequest.approved_date,
        status: newRequest.status || "pending",
        description: newRequest.description || "",
        feedback: newRequest.feedback || "",
        documents: fileUrl ? [fileUrl] : [],
      }

      setNocRequests(prev => [normalized, ...prev])
      resetForm()
      form.reset()
      
      toast({ 
        title: "✅ Success!", 
        description: `Request submitted in ${(totalTime/1000).toFixed(1)}s. Now under review.`,
      })

    } catch (error: any) {
      const totalTime = Date.now() - startTime
      console.error(`❌ Failed after ${totalTime}ms:`, error)
      
      let errorMessage = "Submission failed. Please try again."
      const errorMsg = (error.message || "").toLowerCase()
      
      if (errorMsg.includes('timeout')) {
        errorMessage = "⏱️ Upload timeout. Try with a smaller file or better internet connection."
      } else if (errorMsg.includes('network')) {
        errorMessage = "🌐 Network error. Please check your connection and try again."
      } else if (errorMsg.includes('size') || errorMsg.includes('large')) {
        errorMessage = "📄 File too large. Please compress your PDF and try again."
      } else if (errorMsg.includes('date')) {
        errorMessage = "📅 Please check your start and end dates."
      }
      
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      })
      
    } finally {
      setIsSubmitting(false)
      setSubmitProgress("")
    }
  }

  // Open document viewer
  const openDocument = async (documentUrl: string) => {
    try {
      window.open(documentUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      toast({
        title: "Cannot open document",
        description: "Unable to open the document. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">NOC Requests</h1>
              <p className="text-gray-600 mt-1">
                Manage your No Objection Certificate requests for external internships
              </p>
            </div>
            <Button 
              onClick={() => setShowForm(!showForm)} 
              className="rounded-xl px-6 py-2.5 bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Plus className="mr-2 h-4 w-4" />
              New NOC Request
            </Button>
          </div>

          {/* Search and Filter Section */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by company name or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-lg border-gray-300"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] rounded-lg border-gray-300">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-blue-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Requests</p>
                    <p className="text-2xl font-bold text-blue-900">{nocRequests.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-gradient-to-r from-amber-50 to-amber-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-700">Pending</p>
                    <p className="text-2xl font-bold text-amber-900">
                      {nocRequests.filter(r => r.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-gradient-to-r from-emerald-50 to-emerald-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-700">Approved</p>
                    <p className="text-2xl font-bold text-emerald-900">
                      {nocRequests.filter(r => r.status === 'approved').length}
                    </p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-gradient-to-r from-rose-50 to-rose-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-rose-700">Rejected</p>
                    <p className="text-2xl font-bold text-rose-900">
                      {nocRequests.filter(r => r.status === 'rejected').length}
                    </p>
                  </div>
                  <XCircle className="h-8 w-8 text-rose-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Create Form */}
          {showForm && (
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl text-gray-900">Submit New NOC Request</CardTitle>
                <CardDescription className="text-gray-600">
                  Request NOC for an externally secured internship opportunity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-sm font-medium text-gray-700">
                        Company Name *
                      </Label>
                      <Input 
                        id="company" 
                        name="company" 
                        placeholder="e.g., Google, Microsoft, Amazon" 
                        required 
                        className="rounded-lg border-gray-300 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="position" className="text-sm font-medium text-gray-700">
                        Position *
                      </Label>
                      <Input 
                        id="position" 
                        name="position" 
                        placeholder="e.g., Software Engineering Intern" 
                        required 
                        className="rounded-lg border-gray-300 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                        Start Date *
                      </Label>
                      <Input 
                        id="startDate" 
                        type="date" 
                        name="startDate" 
                        required 
                        className="rounded-lg border-gray-300 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                        End Date *
                      </Label>
                      <Input 
                        id="endDate" 
                        type="date" 
                        name="endDate" 
                        required 
                        className="rounded-lg border-gray-300 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stipend" className="text-sm font-medium text-gray-700">
                      Stipend (Optional)
                    </Label>
                    <Input 
                      id="stipend" 
                      name="stipend" 
                      placeholder="e.g., ₹15,000/month, $500/month, or Unpaid" 
                      className="rounded-lg border-gray-300 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500">Leave blank if unpaid or stipend amount is not disclosed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                      Job Description *
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe the internship role, responsibilities, and key learning outcomes..."
                      rows={4}
                      required
                      className="rounded-lg border-gray-300 focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">
                      Supporting Documents (Optional)
                    </Label>
                    <UploadZone 
                      onFiles={handleFileSelection} 
                      busy={isSubmitting}
                      selectedFiles={selectedFiles}
                    />
                    <p className="text-xs text-gray-500">
                      Upload offer letter or other supporting documents. This is optional but recommended for faster processing.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting} 
                      className="rounded-lg px-6 py-2.5 bg-blue-600 hover:bg-blue-700 transition-colors min-w-[160px]"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm">{submitProgress || "Submitting..."}</span>
                        </div>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Submit Request
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={resetForm}
                      disabled={isSubmitting}
                      className="rounded-lg px-6 py-2.5 border-gray-300"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* NOC Requests List */}
          <div className="space-y-6">
            {filteredRequests.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {searchTerm || statusFilter !== "all" 
                      ? `Filtered NOC Requests (${filteredRequests.length})` 
                      : "Your NOC Requests"
                    }
                  </h2>
                  {(searchTerm || statusFilter !== "all") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchTerm("")
                        setStatusFilter("all")
                      }}
                      className="rounded-lg"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear Filters
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredRequests.map((request) => (
                    <NOCCard
                      key={request.id}
                      request={request}
                      onView={() => setViewing(request)}
                      onEdit={() => setEditing(request)}
                    />
                  ))}
                </div>
              </>
            ) : nocRequests.length > 0 ? (
              // Show "No results" when filtered but has requests
              <Card className="border-0 shadow-sm bg-gray-50">
                <CardContent className="p-12 text-center">
                  <div className="mx-auto h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center mb-6">
                    <Search className="h-8 w-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No matching requests</h3>
                  <p className="text-gray-600 mb-6">
                    No NOC requests match your current search criteria. Try adjusting your filters.
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("")
                      setStatusFilter("all")
                    }}
                    className="rounded-lg px-6 py-2.5"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              // Show "No requests" when no requests at all
              <Card className="border-0 shadow-sm bg-gray-50">
                <CardContent className="p-12 text-center">
                  <div className="mx-auto h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center mb-6">
                    <FileText className="h-8 w-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No NOC requests yet</h3>
                  <p className="text-gray-600 mb-6">
                    When you secure an external internship, submit a NOC request for university approval.
                  </p>
                  <Button 
                    onClick={() => setShowForm(true)}
                    className="rounded-lg px-6 py-2.5"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Request
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* View Details Dialog */}
        <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">NOC Request Details</DialogTitle>
              <DialogDescription>
                Complete information about your NOC request
              </DialogDescription>
            </DialogHeader>

            {viewing && (
              <div className="space-y-6">
                {/* Status and Basic Info */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{viewing.company}</h3>
                    <p className="text-gray-600">{viewing.position}</p>
                  </div>
                  {(() => {
                    const meta = prettyStatus(viewing.status)
                    const Icon = meta.icon
                    return (
                      <span className={cn(
                        "inline-flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-full",
                        meta.chipClass
                      )}>
                        <Icon className="h-4 w-4" />
                        {meta.label}
                      </span>
                    )
                  })()}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <p className="text-sm font-medium text-gray-900">Submitted</p>
                    </div>
                    <p className="text-gray-800">{new Date(viewing.submittedDate).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarDays className="h-4 w-4 text-indigo-600" />
                      <p className="text-sm font-medium text-indigo-900">Duration</p>
                    </div>
                    <p className="text-indigo-800">{calculateDuration(viewing.startDate, viewing.endDate)}</p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <p className="text-sm font-medium text-blue-900">Start Date</p>
                    </div>
                    <p className="text-blue-800">{new Date(viewing.startDate).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <p className="text-sm font-medium text-green-900">End Date</p>
                    </div>
                    <p className="text-green-800">{new Date(viewing.endDate).toLocaleDateString()}</p>
                  </div>

                  {viewing.stipend && (
                    <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                        <p className="text-sm font-medium text-emerald-900">Stipend</p>
                      </div>
                      <p className="text-emerald-800">{viewing.stipend}</p>
                    </div>
                  )}
                  
                  {viewing.approvedDate && (
                    <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <p className="text-sm font-medium text-emerald-900">Approved</p>
                      </div>
                      <p className="text-emerald-800">{new Date(viewing.approvedDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                {/* Job Description */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-900">Job Description</Label>
                  <div className="p-4 rounded-lg bg-gray-50 border">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{viewing.description}</p>
                  </div>
                </div>

                {/* Feedback */}
                {viewing.feedback && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-900">Review Feedback</Label>
                    <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                      <p className="text-sm text-amber-800 whitespace-pre-wrap">{viewing.feedback}</p>
                    </div>
                  </div>
                )}

                {/* Documents */}
                {viewing.documents && viewing.documents.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-900">Uploaded Documents</Label>
                    <div className="space-y-2">
                      {viewing.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-red-100 flex items-center justify-center">
                              <FileText className="h-4 w-4 text-red-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {doc.split('/').pop() || `Document ${index + 1}`}
                              </p>
                              <p className="text-xs text-gray-500">PDF Document</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDocument(doc)}
                            className="rounded-lg"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Open
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Download NOC Certificate */}
                {viewing.status === 'approved' && (
                  <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-emerald-900 mb-1">NOC Certificate Ready</h4>
                        <p className="text-xs text-emerald-700">Your NOC has been approved and is ready for download</p>
                      </div>
                      <Button
                        variant="outline"
                        className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                        onClick={() => {
                          toast({
                            title: "Downloading NOC Certificate",
                            description: "Your NOC certificate is being prepared for download.",
                          })
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download NOC
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setViewing(null)} className="rounded-lg">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">Edit NOC Request</DialogTitle>
              <DialogDescription>
                Update the details of your NOC request
              </DialogDescription>
            </DialogHeader>

            {editing && (
              <EditForm
                request={editing}
                onCancel={() => setEditing(null)}
                onSave={(updates) => {
                  setNocRequests(prev => 
                    prev.map(req => req.id === editing.id ? { ...req, ...updates } : req)
                  )
                  setEditing(null)
                  toast({
                    title: "Request Updated",
                    description: "Your NOC request has been updated successfully.",
                  })
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </AuthGuard>
  )
}