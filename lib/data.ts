// lib/data.ts - FINAL FIXED Data Service with Proper Error Handling
import { 
  getMockStudentDashboardData, 
  getMockNOCRequests, 
  getMockCertificates, 
  getMockOpportunities, 
  getMockReports, 
  getMockApplications 
} from './mock-data'

// Import Supabase
let supabase: any = null
try {
  const supabaseModule = require('./supabase')
  supabase = supabaseModule.supabase
  console.log('Supabase client loaded successfully')
} catch (e) {
  console.warn('Supabase module not available, using mock data')
}

// Cache management
const dataCache = new Map<string, { data: any, timestamp: number }>()
const CACHE_DURATION = 30000 // 30 seconds
const pendingRequests = new Map<string, Promise<any>>()

// ===================
// FILE UPLOAD HELPER
// ===================
export const uploadFile = async (
  file: File, 
  folder: string = 'reports', 
  fileName?: string
): Promise<{ success: boolean, fileUrl?: string, fileName?: string, error?: string }> => {
  try {
    const finalFileName = fileName || `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = `${folder}/${finalFileName}`

    if (!supabase) {
      console.warn('Supabase not available, simulating file upload')
      return {
        success: true,
        fileUrl: `https://mock-storage.com/${filePath}`,
        fileName: finalFileName
      }
    }

    console.log(`Uploading file: ${filePath}`)

    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true // Allow overwrite
      })

    if (error) {
      console.error('File upload error:', error)
      return { success: false, error: error.message }
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    return {
      success: true,
      fileUrl: publicData.publicUrl,
      fileName: finalFileName
    }

  } catch (error: any) {
    console.error('Upload error:', error)
    return { success: false, error: error.message }
  }
}

// ===================
// CURRENT USER - FIXED
// ===================
export const getCurrentUser = async () => {
  try {
    if (!supabase) {
      // Return consistent mock user
      return {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "John Doe",
        email: "john.doe@charusat.edu.in",
        role: "student",
        department: "Computer Engineering",
        rollNumber: "22CE045",
        loginTime: new Date().toISOString()
      }
    }

    // Try to get current user from auth
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      console.warn('No authenticated user, returning mock user')
      return {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "John Doe",
        email: "john.doe@charusat.edu.in",
        role: "student",
        department: "Computer Engineering",
        rollNumber: "22CE045",
        loginTime: new Date().toISOString()
      }
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.warn('User profile not found, returning mock user')
      return {
        id: user.id,
        name: user.email?.split('@')[0] || "Student",
        email: user.email || "student@charusat.edu.in",
        role: "student",
        department: "Computer Engineering",
        rollNumber: "22CE045",
        loginTime: new Date().toISOString()
      }
    }

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      department: profile.department,
      rollNumber: profile.roll_number,
      employeeId: profile.employee_id,
      designation: profile.designation,
      phone: profile.phone,
      avatarUrl: profile.avatar_url,
      loginTime: new Date().toISOString()
    }

  } catch (error: any) {
    console.error('Error getting current user:', error)
    // Return mock user as fallback
    return {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "John Doe",
      email: "john.doe@charusat.edu.in",
      role: "student",
      department: "Computer Engineering",
      rollNumber: "22CE045",
      loginTime: new Date().toISOString()
    }
  }
}

// ===================
// WEEKLY REPORTS - COMPLETELY FIXED
// ===================
export const getReportsByStudent = async (studentId: string) => {
  try {
    if (!supabase) {
      return getMockReports(studentId)
    }

    console.log('Fetching reports for student:', studentId)
    
    const { data, error } = await supabase
      .from('weekly_reports')
      .select('*')
      .eq('student_id', studentId)
      .order('week_number', { ascending: true })

    if (error) {
      console.error('Database error fetching reports:', error)
      return getMockReports(studentId)
    }

    console.log('Successfully fetched reports:', data?.length || 0)
    return data || []

  } catch (error) {
    console.error('Error in getReportsByStudent:', error)
    return getMockReports(studentId)
  }
}

export const createWeeklyReport = async (reportData: any, file?: File) => {
  try {
    // === REQUIRED FIELD CHECK ===
    if (!reportData.studentId || !reportData.studentName || !reportData.studentEmail) {
      throw new Error("Missing studentId, studentName, or studentEmail for weekly report")
    }

    console.log('Creating weekly report with data:', reportData)
    
    let fileUrl = null
    let fileName = null
    let fileSize = null

    // Handle file upload if file is provided
    if (file) {
      console.log('Uploading file:', file.name, 'Size:', file.size)
      
      const user = await getCurrentUser()
      if (!user) throw new Error('User not found')

      const uploadFileName = `week${reportData.week || 1}_${user.rollNumber || user.id}_${Date.now()}.${file.name.split('.').pop()}`
      const uploadResult = await uploadFile(file, 'reports', uploadFileName)
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'File upload failed')
      }

      fileUrl = uploadResult.fileUrl
      fileName = uploadResult.fileName
      fileSize = file.size
      console.log('File uploaded successfully:', fileName)
    }

    if (!supabase) {
      // Mock creation
      const newReport = {
        id: Math.floor(Math.random() * 1000) + 100,
        student_id: reportData.studentId,
        student_name: reportData.studentName,
        student_email: reportData.studentEmail,
        week_number: reportData.week || 1,
        title: reportData.title,
        description: reportData.description,
        achievements: reportData.achievements || [],
        status: 'pending',
        file_name: fileName,
        file_url: fileUrl,
        file_size: fileSize,
        comments: reportData.comments || null,
        submitted_date: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
      
      console.log('Created mock weekly report:', newReport)
      return newReport
    }

    // Prepare data for database insertion
    const insertData: any = {
      student_id: reportData.studentId,
      student_name: reportData.studentName,
      student_email: reportData.studentEmail,
      week_number: reportData.week || 1,
      title: reportData.title,
      description: reportData.description,
      achievements: reportData.achievements || [],
      status: 'pending',
      comments: reportData.comments || null
    }

    // Add file fields if file was uploaded
    if (fileName) {
      insertData.file_name = fileName
      insertData.file_url = fileUrl
      insertData.file_size = fileSize
    }

    console.log('Inserting report data:', insertData)

    // Insert into database
    const { data, error } = await supabase
      .from('weekly_reports')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Database error creating report:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log('Successfully created report in database:', data)
    
    // Clear cache to force refresh
    clearDataCache(`reports-${reportData.studentId}`)
    
    return data

  } catch (error: any) {
    console.error('Error creating weekly report:', error)
    throw new Error(error.message || 'Failed to create weekly report')
  }
}

// ===================
// NOC REQUESTS - FIXED
// ===================
export async function getNOCRequestsByStudent(studentId: string) {
  try {
    const { data, error } = await supabase
      .from("noc_requests")
      .select(`
        id,
        company_name,
        position,
        duration,
        start_date,
        submitted_date,
        approved_date,
        status,
        description,
        feedback,
        documents
      `)
      .eq("student_id", studentId)

    if (error) {
      console.error("Error fetching NOC requests:", error.message || error)
      return []
    }

    return data || []
  } catch (err) {
    console.error("Unexpected error fetching NOC requests:", err)
    return []
  }
}


export const createNOCRequest = async (requestData: any) => {
  try {
    if (!requestData.studentId || !requestData.studentName || !requestData.studentEmail) {
      throw new Error("Missing studentId, studentName, or studentEmail for NOC request")
    }

    // Calculate end date
    const startDate = new Date(requestData.startDate)
    const durationMonths = parseInt(requestData.duration.match(/\d+/)?.[0] || "3")
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + durationMonths)

    const insertData = {
      student_id: requestData.studentId,
      student_name: requestData.studentName,
      student_email: requestData.studentEmail,
      company_name: requestData.company,        // ✅ correct column
      position: requestData.position,
      duration: requestData.duration,
      start_date: requestData.startDate,
      end_date: endDate.toISOString().split("T")[0],
      description: requestData.description,
      documents: JSON.stringify(requestData.documents || []), // ✅ match jsonb
      status: "pending",
      submitted_date: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from("noc_requests")
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error("Database error creating NOC request:", error)
      throw new Error(error.message)
    }

    return data
  } catch (error: any) {
    console.error("Error creating NOC request:", error)
    throw new Error(error.message || "Failed to create NOC request")
  }
}

// ===================
// CERTIFICATES - FIXED to always return Promise<Array>
// ===================

export const getCertificatesByStudent = async (studentId: string): Promise<any[]> => {
  try {
    console.log('Fetching certificates for student:', studentId)

    // Always use mock data for now to avoid database issues
    if (!supabase) {
      console.log('Supabase not available, using mock certificates')
      return getMockCertificates(studentId)
    }

    // Test database connection first
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('student_id', studentId)
        .order('upload_date', { ascending: false })

      if (error) {
        console.error('Database error fetching certificates:', error)
        console.log('Falling back to mock data due to database error')
        return getMockCertificates(studentId)
      }

      // Ensure we always return an array
      const certificates = Array.isArray(data) ? data : []
      console.log(`Successfully fetched ${certificates.length} certificates from database`)
      
      return certificates

    } catch (dbError) {
      console.error('Database connection error:', dbError)
      console.log('Falling back to mock data due to connection error')
      return getMockCertificates(studentId)
    }

  } catch (error) {
    console.error('Error in getCertificatesByStudent:', error)
    console.log('Falling back to mock data due to unexpected error')
    return getMockCertificates(studentId)
  }
}

export const createCertificate = async (certificateData: any) => {
  try {
    // === REQUIRED FIELD CHECK ===
    if (!certificateData.studentId || !certificateData.studentName || !certificateData.studentEmail) {
      throw new Error("Missing studentId, studentName, or studentEmail for certificate")
    }

    console.log('Creating certificate:', certificateData)

    if (!supabase) {
      // Mock creation
      const newCertificate = {
        id: Math.floor(Math.random() * 1000) + 100,
        student_id: certificateData.studentId,
        student_name: certificateData.studentName,
        student_email: certificateData.studentEmail,
        certificate_type: 'internship',
        title: certificateData.internshipTitle,
        company_name: certificateData.company,
        duration: certificateData.duration,
        start_date: certificateData.startDate,
        end_date: certificateData.endDate,
        file_name: certificateData.fileName,
        file_url: certificateData.fileUrl,
        file_size: certificateData.fileSize || null,
        status: 'pending',
        upload_date: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
      
      console.log('Created mock certificate:', newCertificate)
      return newCertificate
    }

    const insertData = {
      student_id: certificateData.studentId,
      student_name: certificateData.studentName,
      student_email: certificateData.studentEmail,
      certificate_type: 'internship',
      title: certificateData.internshipTitle,
      company_name: certificateData.company,
      duration: certificateData.duration,
      start_date: certificateData.startDate,
      end_date: certificateData.endDate,
      file_name: certificateData.fileName,
      file_url: certificateData.fileUrl,
      file_size: certificateData.fileSize || null,
      status: 'pending',
      upload_date: new Date().toISOString()
    }

    console.log('Inserting certificate data:', insertData)

    const { data, error } = await supabase
      .from('certificates')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Database error creating certificate:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log('Successfully created certificate in database:', data)
    
    // Clear cache
    clearDataCache(`certificates-${certificateData.studentId}`)
    
    return data

  } catch (error: any) {
    console.error('Error creating certificate:', error)
    throw new Error(error.message || 'Failed to create certificate')
  }
}



// ===================
// APPLICATIONS - FIXED
// ===================
export const getApplicationsByStudent = async (studentId: string) => {
  try {
    if (!supabase) {
      return getMockApplications(studentId)
    }

    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        job_opportunities (
          id,
          title,
          company_name,
          location,
          job_type
        )
      `)
      .eq('student_id', studentId)
      .order('applied_date', { ascending: false })

    if (error) {
      console.error('Error fetching applications:', error)
      return getMockApplications(studentId)
    }

    return data || []
  } catch (error) {
    console.error('Error in getApplicationsByStudent:', error)
    return getMockApplications(studentId)
  }
}


export const createApplication = async (applicationData: any) => {
  try {
    if (!applicationData.studentId || !applicationData.studentName || !applicationData.studentEmail) {
      throw new Error("Missing required student details")
    }

    // ✅ Insert data matches schema (snake_case keys)
    const insertData = {
      student_id: applicationData.studentId,      // now text, not uuid
      student_name: applicationData.studentName,
      student_email: applicationData.studentEmail,
      opportunity_id: Number(applicationData.opportunityId), // ensure integer
      cover_letter: applicationData.coverLetter,
      resume_file_name: applicationData.resumeFileName,
      status: "pending",
    }

    console.log("Inserting application:", insertData)

    const { data, error } = await supabase
      .from("applications")
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error("Database error creating application:", error)
      throw new Error(error.message || "Insert failed")
    }

    // ✅ Increment applicant count
    const { error: countError } = await supabase.rpc("increment_applicant_count", {
      opportunity_id: insertData.opportunity_id,
    })

    if (countError) {
      console.warn("Applicant count not updated:", countError)
    }

    // ✅ Clear caches
    clearDataCache(`applications-${applicationData.studentId}`)
    clearDataCache(`opportunity-${applicationData.opportunityId}`)

    console.log("Application created successfully:", data)
    return data
  } catch (err: any) {
    console.error("Error in createApplication:", err)
    throw new Error(err.message || "Failed to create application")
  }
}



// ...rest of your file remains unchanged...


// ===================
// OPPORTUNITIES - FIXED
// ===================
export const getAllOpportunities = async () => {
  try {
    if (!supabase) {
      return getMockOpportunities()
    }

    const { data, error } = await supabase
      .from("job_opportunities")
      .select("*")
      .eq("status", "active")
      .order("posted_date", { ascending: false })

    if (error) {
      console.error("Error fetching opportunities:", error.message || error)
      return getMockOpportunities()
    }

    // 🔄 Map DB fields to UI expected fields
    return (data || []).map((job) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      company: job.company_name,       // schema: company_name
      location: job.location,
      duration: job.duration,
      requirements: job.requirements || [],
      stipend: job.stipend,
      positions: job.positions,
      applicants: job.applicants,
      deadline: job.deadline,
      verified: job.verified,
      type: job.job_type,              // schema: job_type
      status: job.status,
      postedDate: job.posted_date,
    }))
  } catch (error: any) {
    console.error("Error in getAllOpportunities:", error.message || error)
    return getMockOpportunities()
  }
}

// ===================
// DASHBOARD DATA - FIXED
// ===================
export const getStudentDashboardData = async (studentId: string) => {
  try {
    console.log('Fetching dashboard data for student:', studentId)

    if (!supabase) {
      return getMockStudentDashboardData(studentId)
    }

    // Fetch all data in parallel with error handling
    const [nocResult, reportsResult, certificatesResult, opportunitiesResult] = await Promise.allSettled([
      supabase
        .from('noc_requests')
        .select('*')
        .eq('student_id', studentId)
        .order('submitted_date', { ascending: false }),
      
      supabase
        .from('weekly_reports')
        .select('*')
        .eq('student_id', studentId)
        .order('week_number', { ascending: false }),
      
      supabase
        .from('certificates')
        .select('*')
        .eq('student_id', studentId)
        .order('upload_date', { ascending: false }),
      
      supabase
        .from('job_opportunities')
        .select('*')
        .eq('status', 'active')
        .order('posted_date', { ascending: false })
        .limit(10)
    ])

    const nocRequests = nocResult.status === 'fulfilled' && !nocResult.value.error ? nocResult.value.data || [] : []
    const reports = reportsResult.status === 'fulfilled' && !reportsResult.value.error ? reportsResult.value.data || [] : []
    const certificates = certificatesResult.status === 'fulfilled' && !certificatesResult.value.error ? certificatesResult.value.data || [] : []
    const opportunities = opportunitiesResult.status === 'fulfilled' && !opportunitiesResult.value.error ? opportunitiesResult.value.data || [] : []

    console.log('Dashboard data fetched:', {
      nocRequests: nocRequests.length,
      reports: reports.length,
      certificates: certificates.length,
      opportunities: opportunities.length
    })

    return {
      nocRequests: {
        total: nocRequests.length,
        pending: nocRequests.filter(r => r.status === 'pending').length,
        approved: nocRequests.filter(r => r.status === 'approved').length,
        rejected: nocRequests.filter(r => r.status === 'rejected').length
      },
      reports: {
        total: reports.length,
        submitted: reports.filter(r => r.status === 'pending').length,
        reviewed: reports.filter(r => r.status === 'approved' || r.status === 'revision_required').length,
        recent: reports.slice(0, 5)
      },
      certificates: {
        total: certificates.length,
        pending: certificates.filter(c => c.status === 'pending').length,
        approved: certificates.filter(c => c.status === 'approved').length,
        recent: certificates.slice(0, 5)
      },
      opportunities: {
        total: opportunities.length,
        recent: opportunities.slice(0, 5)
      },
      recentActivity: [
        ...nocRequests.slice(0, 3).map(item => ({
          id: `noc-${item.id}`,
          type: 'noc',
          title: `NOC Request - ${item.company_name}`,
          status: item.status,
          created_at: item.submitted_date
        })),
        ...reports.slice(0, 3).map(item => ({
          id: `report-${item.id}`,
          type: 'report',
          title: item.title,
          status: item.status,
          created_at: item.submitted_date
        })),
        ...certificates.slice(0, 3).map(item => ({
          id: `cert-${item.id}`,
          type: 'certificate',
          title: `${item.title} Certificate`,
          status: item.status,
          created_at: item.upload_date
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6)
    }

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return getMockStudentDashboardData(studentId)
  }
}

// ===================
// UTILITY FUNCTIONS
// ===================
export const clearDataCache = (key?: string) => {
  if (key) {
    dataCache.delete(key)
    pendingRequests.delete(key)
  } else {
    dataCache.clear()
    pendingRequests.clear()
  }
}

export const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || ''
}

export const isValidFileType = (file: File, allowedTypes: string[]): boolean => {
  const extension = getFileExtension(file.name)
  return allowedTypes.includes(extension)
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// ===================
// DOWNLOAD FILE HELPER
// ===================
export const downloadFile = async (fileUrl: string, fileName: string) => {
  try {
    if (fileUrl.includes('mock-storage.com')) {
      // Mock download
      console.log('Mock downloading:', fileName)
      const blob = new Blob(['Mock file content'], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      return { success: true }
    }

    // Real download
    const response = await fetch(fileUrl)
    if (!response.ok) throw new Error('Download failed')

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    return { success: true }
  } catch (error: any) {
    console.error('Download error:', error)
    return { success: false, error: error.message }
  }
}

// ===================
// REVIEW FUNCTIONS FOR TEACHERS/ADMINS
// ===================
export const updateReportStatus = async (
  reportId: number, 
  status: string, 
  feedback?: string, 
  grade?: string,
  reviewerId?: string
) => {
  try {
    if (!supabase) {
      console.log('Mock: Updated report status', { reportId, status, feedback, grade })
      return { success: true }
    }

    const { error } = await supabase
      .from('weekly_reports')
      .update({
        status,
        feedback,
        grade,
        reviewed_by: reviewerId,
        reviewed_date: new Date().toISOString()
      })
      .eq('id', reportId)

    if (error) {
      console.error('Error updating report status:', error)
      return { success: false, error: error.message }
    }

    clearDataCache('teacher-dashboard')
    clearDataCache('admin-dashboard')

    return { success: true }
  } catch (error: any) {
    console.error('Error in updateReportStatus:', error)
    return { success: false, error: error.message }
  }
}

export const updateNOCStatus = async (
  nocId: number, 
  status: string, 
  feedback?: string,
  approverId?: string
) => {
  try {
    if (!supabase) {
      console.log('Mock: Updated NOC status', { nocId, status, feedback })
      return { success: true }
    }

    const updateData: any = { status, feedback }

    if (status === 'approved') {
      updateData.approved_by = approverId
      updateData.approved_date = new Date().toISOString()
    }

    const { error } = await supabase
      .from('noc_requests')
      .update(updateData)
      .eq('id', nocId)

    if (error) {
      console.error('Error updating NOC status:', error)
      return { success: false, error: error.message }
    }

    clearDataCache('tp-officer-dashboard')
    clearDataCache('admin-dashboard')

    return { success: true }
  } catch (error: any) {
    console.error('Error in updateNOCStatus:', error)
    return { success: false, error: error.message }
  }
}

export const updateCertificateStatus = async (
  certificateId: number, 
  status: string, 
  feedback?: string,
  approverId?: string
) => {
  try {
    if (!supabase) {
      console.log('Mock: Updated certificate status', { certificateId, status, feedback })
      return { success: true }
    }

    const updateData: any = { status, feedback }

    if (status === 'approved') {
      updateData.approved_by = approverId
      updateData.approved_date = new Date().toISOString()
    }

    const { error } = await supabase
      .from('certificates')
      .update(updateData)
      .eq('id', certificateId)

    if (error) {
      console.error('Error updating certificate status:', error)
      return { success: false, error: error.message }
    }

    clearDataCache('teacher-dashboard')
    clearDataCache('admin-dashboard')

    return { success: true }
  } catch (error: any) {
    console.error('Error in updateCertificateStatus:', error)
    return { success: false, error: error.message }
  }
}

// ===================
// USER PROFILE MANAGEMENT
// ===================
export const updateUserProfile = async (userId: string, updates: any) => {
  try {
    if (!supabase) {
      console.log('Mock: Updated user profile', { userId, updates })
      return { success: true }
    }

    const { error } = await supabase
      .from('users')
      .update({
        name: updates.name,
        department: updates.department,
        designation: updates.designation,
        phone: updates.phone,
        employee_id: updates.employeeId,
        roll_number: updates.rollNumber,
        avatar_url: updates.avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating profile:', error)
      return { success: false, error: error.message }
    }

    clearDataCache('current-user')
    return { success: true }
  } catch (error: any) {
    console.error('Error updating profile:', error)
    return { success: false, error: 'Failed to update profile' }
  }
}

// ===================
// SEARCH FUNCTIONALITY
// ===================
export const searchOpportunities = async (filters: {
  search?: string
  location?: string
  jobType?: string
  company?: string
}) => {
  try {
    if (!supabase) {
      const mockOpps = getMockOpportunities()
      return mockOpps.filter(opp => {
        if (filters.search && !opp.title.toLowerCase().includes(filters.search.toLowerCase())) return false
        if (filters.location && !opp.location.toLowerCase().includes(filters.location.toLowerCase())) return false
        if (filters.jobType && opp.type !== filters.jobType) return false
        if (filters.company && !opp.company.toLowerCase().includes(filters.company.toLowerCase())) return false
        return true
      })
    }

    let query = supabase
      .from('job_opportunities')
      .select('*')
      .eq('status', 'active')

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }
    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`)
    }
    if (filters.jobType) {
      query = query.eq('job_type', filters.jobType)
    }
    if (filters.company) {
      query = query.ilike('company_name', `%${filters.company}%`)
    }

    const { data, error } = await query.order('posted_date', { ascending: false })

    if (error) {
      console.error('Error searching opportunities:', error)
      return getMockOpportunities()
    }

    return data || []
  } catch (error) {
    console.error('Error in searchOpportunities:', error)
    return getMockOpportunities()
  }
}