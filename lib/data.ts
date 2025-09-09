// lib/data.ts - FINAL FIXED Data Service with Teacher Dashboard Functions
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
// TEACHER DASHBOARD DATA - NEW FUNCTION
// ===================
export const getTeacherDashboardData = async (teacherId: string) => {
  try {
    console.log('🔄 Fetching teacher dashboard data for:', teacherId)

    if (!supabase) {
      console.log('Supabase not available, using mock data')
      return getMockTeacherDashboardData()
    }

    // Get students assigned to this teacher
    const { data: students, error: studentsError } = await supabase
      .from('users')
      .select('id, name, email, roll_number')
      .eq('role', 'student')
      .eq('assigned_teacher_id', teacherId) // Assuming there's an assigned_teacher_id field

    if (studentsError) {
      console.warn('Error fetching students:', studentsError)
      // Fallback: get all students if no assignment field exists
      const { data: allStudents } = await supabase
        .from('users')
        .select('id, name, email, roll_number')
        .eq('role', 'student')
      
      const studentData = allStudents || []
      return await buildTeacherDashboard(studentData.slice(0, 10)) // Limit to 10 for demo
    }

    return await buildTeacherDashboard(students || [])

  } catch (error) {
    console.error('Error in getTeacherDashboardData:', error)
    return getMockTeacherDashboardData()
  }
}

// Helper function to build teacher dashboard
const buildTeacherDashboard = async (students: any[]) => {
  try {
    if (!supabase) {
      return getMockTeacherDashboardData()
    }

    const studentIds = students.map(s => s.id)

    if (studentIds.length === 0) {
      return {
        totalStudents: 0,
        pendingReports: 0,
        pendingCertificates: 0,
        students: [],
        recentReports: [],
        recentCertificates: []
      }
    }

    // Fetch recent reports from these students
    const { data: reports, error: reportsError } = await supabase
      .from('weekly_reports')
      .select('id, title, student_id, created_at, status, student_name')
      .in('student_id', studentIds)
      .order('created_at', { ascending: false })
      .limit(20)

    // Fetch recent certificates from these students
    const { data: certificates, error: certificatesError } = await supabase
      .from('certificates')
      .select('id, title, student_id, created_at, status, student_name')
      .in('student_id', studentIds)
      .order('created_at', { ascending: false })
      .limit(20)

    const recentReports = reports || []
    const recentCertificates = certificates || []

    const dashboardData = {
      totalStudents: students.length,
      pendingReports: recentReports.filter(r => r.status === 'pending').length,
      pendingCertificates: recentCertificates.filter(c => c.status === 'pending').length,
      students: students,
      recentReports: recentReports,
      recentCertificates: recentCertificates
    }

    console.log('✅ Teacher dashboard data built successfully:', dashboardData)
    return dashboardData

  } catch (error) {
    console.error('Error building teacher dashboard:', error)
    return getMockTeacherDashboardData()
  }
}

// Mock data function for teacher dashboard
const getMockTeacherDashboardData = () => ({
  totalStudents: 5,
  pendingReports: 3,
  pendingCertificates: 2,
  students: [
    { id: '1', name: 'John Doe', email: 'john@charusat.ac.in', roll_number: '21CE001' },
    { id: '2', name: 'Jane Smith', email: 'jane@charusat.ac.in', roll_number: '21CE002' },
    { id: '3', name: 'Mike Johnson', email: 'mike@charusat.ac.in', roll_number: '21CE003' },
    { id: '4', name: 'Sarah Wilson', email: 'sarah@charusat.ac.in', roll_number: '21CE004' },
    { id: '5', name: 'Alex Brown', email: 'alex@charusat.ac.in', roll_number: '21CE005' },
  ],
  recentReports: [
    {
      id: '1',
      title: 'Week 1 Progress Report',
      student_id: '1',
      created_at: new Date().toISOString(),
      status: 'pending',
      student_name: 'John Doe'
    },
    {
      id: '2',
      title: 'Week 2 Progress Report',
      student_id: '2',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      status: 'pending',
      student_name: 'Jane Smith'
    },
    {
      id: '3',
      title: 'Week 1 Progress Report',
      student_id: '3',
      created_at: new Date(Date.now() - 172800000).toISOString(),
      status: 'approved',
      student_name: 'Mike Johnson'
    }
  ],
  recentCertificates: [
    {
      id: '1',
      title: 'Internship Completion Certificate',
      student_id: '4',
      created_at: new Date().toISOString(),
      status: 'pending',
      student_name: 'Sarah Wilson'
    },
    {
      id: '2',
      title: 'Training Certificate',
      student_id: '5',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      status: 'approved',
      student_name: 'Alex Brown'
    }
  ]
})

// ===================
// FILE UPLOAD HELPER
// ===================
export const uploadFile = async (
  file: File,
  folder: string = 'reports',
  fileName?: string
): Promise<{ success: boolean, fileUrl?: string, fileName?: string, error?: string }> => {
  try {
    // Quick validation (keep existing)
    if (!file) return { success: false, error: 'No file provided' }
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: 'File size exceeds 10MB limit' }
    }

    // Optimize filename generation (reduce processing time)
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    const baseName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 20) // Shorter processing
    const finalFileName = fileName || `${timestamp}_${baseName}.${fileExt}`
    const filePath = `${folder}/${finalFileName}`

    if (!supabase) {
      // Reduce mock delay from 200ms to 50ms
      await new Promise(resolve => setTimeout(resolve, 50))
      return {
        success: true,
        fileUrl: `https://mock-storage.charusat.edu.in/${filePath}`,
        fileName: finalFileName
      }
    }

    console.log(`⚡ Uploading: ${finalFileName} (${(file.size / 1024 / 1024).toFixed(1)}MB)`)

    // **KEY OPTIMIZATION**: Reduce timeout from 60s to 15s for 10MB files
    const uploadPromise = supabase.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600', // Increase cache time for better performance
        upsert: true,
        duplex: 'half'
      })

    // **CRITICAL**: 15-second timeout instead of 60 seconds
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Upload timeout - file too large or slow connection')), 15000)
    )

    const { data, error } = await Promise.race([uploadPromise, timeoutPromise]) as any

    if (error) {
      console.error('❌ Upload error:', error.message)
      
      // **OPTIMIZED RETRY**: Only retry for specific errors, with 8s timeout
      if (error.message?.includes('duplicate') || error.code === '23505') {
        const retryName = `${timestamp}_${Math.random().toString(36).substr(2, 4)}.${fileExt}`
        const retryPath = `${folder}/${retryName}`
        
        const retryPromise = supabase.storage
          .from('documents')
          .upload(retryPath, file, { cacheControl: '3600', upsert: false })
          
        const retryTimeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Retry timeout')), 8000)
        )

        try {
          const { data: retryData, error: retryError } = await Promise.race([
            retryPromise, retryTimeout
          ]) as any

          if (!retryError) {
            const { data: publicData } = supabase.storage
              .from('documents')
              .getPublicUrl(retryPath)
            
            return {
              success: true,
              fileUrl: publicData.publicUrl,
              fileName: retryName
            }
          }
        } catch (retryErr) {
          console.error('Retry failed:', retryErr)
        }
      }
      return { success: false, error: `Upload failed: ${error.message}` }
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    if (!publicData?.publicUrl) {
      return { success: false, error: 'Failed to generate public URL' }
    }

    console.log(`✅ Upload completed: ${finalFileName} in ${Date.now() - timestamp}ms`)
    return {
      success: true,
      fileUrl: publicData.publicUrl,
      fileName: finalFileName
    }

  } catch (error: any) {
    console.error('💥 Upload error:', error)
    return { 
      success: false, 
      error: error.message?.includes('timeout') 
        ? 'Upload too slow - try smaller file or better connection'
        : 'Upload failed - please try again' 
    }
  }
}

// ===================
// CURRENT USER - FIXED
// ===================
export const getCurrentUser = async () => {
  try {
    if (!supabase) {
      throw new Error('Database connection not available')
    }

    console.log('🔍 Getting current user...')

    // Try to get current user from auth
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('❌ Auth error:', error)
      throw new Error(`Authentication error: ${error.message}`)
    }

    if (!user) {
      console.warn('⚠️ No authenticated user found')
      throw new Error('No authenticated user found')
    }

    console.log('👤 Authenticated user found:', user.id)

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('❌ Profile fetch error:', profileError)
      // Create basic profile from auth data
      return {
        id: user.id,
        name: user.email?.split('@')[0] || "Student",
        email: user.email || "",
        role: "student",
        department: "Computer Engineering",
        rollNumber: "STUDENT001",
        loginTime: new Date().toISOString()
      }
    }

    const userProfile = {
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

    console.log('✅ User profile loaded:', userProfile.name, userProfile.email)
    return userProfile

  } catch (error: any) {
    console.error('❌ Error getting current user:', error)
    throw new Error(error.message || 'Failed to get current user')
  }
}

// ===================
// WEEKLY REPORTS - COMPLETELY FIXED
// ===================
export const getReportsByStudent = async (studentId: string): Promise<any[]> => {
  try {
    console.log('Fetching reports for student:', studentId)

    if (!supabase) {
      console.log('Supabase not available, using mock reports')
      return getMockReports(studentId)
    }

    try {
      const { data, error } = await supabase
        .from('weekly_reports')
        .select('*')
        .eq('student_id', studentId)
        .order('week_number', { ascending: true })

      if (error) {
        console.error('Database error fetching reports:', error)
        console.log('Falling back to mock data due to database error')
        return getMockReports(studentId)
      }

      // Ensure we always return an array
      const reports = Array.isArray(data) ? data : []
      console.log(`Successfully fetched ${reports.length} reports from database`)
      
      return reports

    } catch (dbError) {
      console.error('Database connection error:', dbError)
      console.log('Falling back to mock data due to connection error')
      return getMockReports(studentId)
    }

  } catch (error) {
    console.error('Error in getReportsByStudent:', error)
    console.log('Falling back to mock data due to unexpected error')
    return getMockReports(studentId)
  }
}

export const createWeeklyReport = async (reportData: any, file?: File) => {
  try {
    // === ENHANCED FIELD VALIDATION ===
    if (!reportData.studentId) {
      throw new Error("Student ID is required for weekly report")
    }
    if (!reportData.studentName) {
      throw new Error("Student name is required for weekly report")
    }
    if (!reportData.studentEmail) {
      throw new Error("Student email is required for weekly report")
    }

    console.log('Creating weekly report with data:', reportData)

    let fileUrl = null
    let fileName = null
    let fileSize = null

    // Handle file upload if file is provided
    if (file) {
      console.log('Uploading file:', file.name, 'Size:', file.size)
      
      const uploadFileName = `week${reportData.week || 1}_${reportData.studentId}_${Date.now()}.${file.name.split('.').pop()}`
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
      student_id: reportData.studentId,        // UUID type in schema
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
    return (data || []).map((job: { id: any; title: any; description: any; company_name: any; location: any; duration: any; requirements: any; stipend: any; positions: any; applicants: any; deadline: any; verified: any; job_type: any; status: any; posted_date: any }) => ({
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

// ===================
// TP OFFICER DASHBOARD DATA - DYNAMIC DATABASE INTEGRATION
// ===================
export const getTPOfficerDashboardData = async (cacheKey: string = 'tp-officer-dashboard') => {
  try {
    console.log('🔄 Fetching TP Officer dashboard data with database integration')

    // Check cache first
    const cached = dataCache.get(cacheKey)
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log('🔋 Returning cached TP Officer dashboard data')
      return cached.data
    }

    // Prevent duplicate requests
    if (pendingRequests.has(cacheKey)) {
      console.log('⏳ Waiting for pending TP Officer dashboard request')
      return await pendingRequests.get(cacheKey)
    }

    const fetchPromise = async () => {
      if (!supabase) {
        console.warn('⚠️ Supabase unavailable, using mock data')
        return getMockTPOfficerDashboardData()
      }

      try {
        // Use database aggregation functions for better performance
        const [
          nocStatsResult,
          companyStatsResult, 
          opportunityStatsResult,
          weeklyReportsResult,
          certificatesResult,
          recentActivitiesResult
        ] = await Promise.allSettled([
          // NOC Request Statistics with aggregation
          supabase.rpc('get_noc_stats_for_tp_officer'),
          
          // Company Statistics 
          supabase.rpc('get_company_stats_for_tp_officer'),
          
          // Opportunity Statistics
          supabase.rpc('get_opportunity_stats_for_tp_officer'),
          
          // Weekly Reports pending review
          supabase
            .from('weekly_reports')
            .select('id, student_name, title, status, submitted_date, week_number')
            .eq('status', 'pending')
            .order('submitted_date', { ascending: false })
            .limit(10),
            
          // Certificates pending approval
          supabase
            .from('certificates')
            .select('id, student_name, title, status, upload_date, certificate_type')
            .eq('status', 'pending')
            .order('upload_date', { ascending: false })
            .limit(10),
            
          // Recent activities across all modules
          supabase.rpc('get_recent_activities_for_tp_officer', { limit_count: 15 })
        ])

        // Process results with fallback for missing functions
        const nocStats = await processNOCStats(nocStatsResult)
        const companyStats = await processCompanyStats(companyStatsResult)
        const opportunityStats = await processOpportunityStats(opportunityStatsResult)
        
        const pendingReports = recentActivitiesResult.status === 'fulfilled' && !weeklyReportsResult.value.error 
          ? weeklyReportsResult.value.data || [] 
          : []
          
        const pendingCertificates = certificatesResult.status === 'fulfilled' && !certificatesResult.value.error 
          ? certificatesResult.value.data || [] 
          : []

        // Process recent activities
        let recentActivities = []
        if (recentActivitiesResult.status === 'fulfilled' && !recentActivitiesResult.value.error) {
          recentActivities = recentActivitiesResult.value.data || []
        } else {
          // Fallback: manually aggregate recent activities
          recentActivities = await getRecentActivitiesFallback()
        }

        const dashboardData = {
          stats: {
            ...nocStats,
            ...companyStats,
            ...opportunityStats,
            pendingReports: pendingReports.length,
            pendingCertificates: pendingCertificates.length,
            totalStudents: await getTotalStudentCount(),
            placementRate: await calculatePlacementRate()
          },
          recentActivities: recentActivities.slice(0, 10),
          pendingItems: {
            nocRequests: nocStats.pendingNOCs,
            weeklyReports: pendingReports.length,
            certificates: pendingCertificates.length,
            companyVerifications: companyStats.pendingCompanies
          },
          trends: await calculateDashboardTrends(),
          alerts: await generateTPOfficerAlerts()
        }

        // Cache the result
        dataCache.set(cacheKey, {
          data: dashboardData,
          timestamp: Date.now()
        })

        console.log('✅ TP Officer dashboard data fetched successfully', {
          nocRequests: nocStats.totalNOCs,
          companies: companyStats.totalCompanies,
          opportunities: opportunityStats.totalOpportunities,
          activitiesCount: recentActivities.length
        })

        return dashboardData

      } catch (dbError) {
        console.error('❌ Database error in TP Officer dashboard:', dbError)
        return getMockTPOfficerDashboardData()
      }
    }

    // Store and execute the promise
    pendingRequests.set(cacheKey, fetchPromise())
    const result = await pendingRequests.get(cacheKey)
    pendingRequests.delete(cacheKey)

    return result

  } catch (error) {
    console.error('💥 Critical error in getTPOfficerDashboardData:', error)
    pendingRequests.delete(cacheKey)
    return getMockTPOfficerDashboardData()
  }
}

// ===================
// HELPER FUNCTIONS FOR TP OFFICER DASHBOARD
// ===================

const processNOCStats = async (nocStatsResult: any) => {
  if (nocStatsResult.status === 'fulfilled' && !nocStatsResult.value.error) {
    return nocStatsResult.value.data || { pendingNOCs: 0, approvedNOCs: 0, rejectedNOCs: 0, totalNOCs: 0 }
  }
  
  // Fallback: manual aggregation
  try {
    const { data, error } = await supabase
      .from('noc_requests')
      .select('status')
    
    if (error) throw error
    
    const stats = (data || []).reduce((acc: any, item: any) => {
      acc.totalNOCs++
      if (item.status === 'pending') acc.pendingNOCs++
      else if (item.status === 'approved') acc.approvedNOCs++
      else if (item.status === 'rejected') acc.rejectedNOCs++
      return acc
    }, { pendingNOCs: 0, approvedNOCs: 0, rejectedNOCs: 0, totalNOCs: 0 })
    
    return stats
  } catch {
    return { pendingNOCs: 12, approvedNOCs: 45, rejectedNOCs: 3, totalNOCs: 60 }
  }
}

const processCompanyStats = async (companyStatsResult: any) => {
  if (companyStatsResult.status === 'fulfilled' && !companyStatsResult.value.error) {
    return companyStatsResult.value.data || { totalCompanies: 0, verifiedCompanies: 0, pendingCompanies: 0 }
  }
  
  // Fallback: check if companies table exists and aggregate
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('status')
    
    if (error) throw error
    
    const stats = (data || []).reduce((acc: any, item: any) => {
      acc.totalCompanies++
      if (item.status === 'verified') acc.verifiedCompanies++
      else if (item.status === 'pending') acc.pendingCompanies++
      return acc
    }, { totalCompanies: 0, verifiedCompanies: 0, pendingCompanies: 0 })
    
    return stats
  } catch {
    return { totalCompanies: 28, verifiedCompanies: 22, pendingCompanies: 6 }
  }
}

const processOpportunityStats = async (opportunityStatsResult: any) => {
  if (opportunityStatsResult.status === 'fulfilled' && !opportunityStatsResult.value.error) {
    return opportunityStatsResult.value.data || { totalOpportunities: 0, activeOpportunities: 0 }
  }
  
  // Fallback: manual aggregation
  try {
    const { data, error } = await supabase
      .from('job_opportunities')
      .select('status')
    
    if (error) throw error
    
    const stats = (data || []).reduce((acc: any, item: any) => {
      acc.totalOpportunities++
      if (item.status === 'active') acc.activeOpportunities++
      return acc
    }, { totalOpportunities: 0, activeOpportunities: 0 })
    
    return stats
  } catch {
    return { totalOpportunities: 35, activeOpportunities: 28 }
  }
}

const getRecentActivitiesFallback = async () => {
  try {
    const [nocData, reportData, certData, oppData] = await Promise.allSettled([
      supabase.from('noc_requests').select('*').order('submitted_date', { ascending: false }).limit(5),
      supabase.from('weekly_reports').select('*').order('submitted_date', { ascending: false }).limit(5),
      supabase.from('certificates').select('*').order('upload_date', { ascending: false }).limit(5),
      supabase.from('job_opportunities').select('*').order('posted_date', { ascending: false }).limit(5)
    ])

    const activities = []

    if (nocData.status === 'fulfilled' && nocData.value.data) {
      activities.push(...nocData.value.data.map((item: any) => ({
        type: 'noc',
        title: `NOC request from ${item.student_name}`,
        time: item.submitted_date,
        status: item.status,
        id: item.id
      })))
    }

    if (reportData.status === 'fulfilled' && reportData.value.data) {
      activities.push(...reportData.value.data.map((item: any) => ({
        type: 'report',
        title: `Week ${item.week_number} report by ${item.student_name}`,
        time: item.submitted_date,
        status: item.status,
        id: item.id
      })))
    }

    if (certData.status === 'fulfilled' && certData.value.data) {
      activities.push(...certData.value.data.map((item: any) => ({
        type: 'certificate',
        title: `${item.certificate_type} certificate by ${item.student_name}`,
        time: item.upload_date,
        status: item.status,
        id: item.id
      })))
    }

    if (oppData.status === 'fulfilled' && oppData.value.data) {
      activities.push(...oppData.value.data.map((item: any) => ({
        type: 'opportunity',
        title: `${item.job_type} at ${item.company_name}`,
        time: item.posted_date,
        status: item.status,
        id: item.id
      })))
    }

    return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  } catch {
    return getMockTPOfficerDashboardData().recentActivities
  }
}

const getTotalStudentCount = async () => {
  try {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student')
    
    return error ? 150 : count || 150
  } catch {
    return 150
  }
}

const calculatePlacementRate = async () => {
  try {
    const [totalStudents, placedStudents] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
      supabase.from('noc_requests').select('student_id', { count: 'exact', head: true }).eq('status', 'approved')
    ])
    
    const total = totalStudents.count || 150
    const placed = placedStudents.count || 85
    
    return Math.round((placed / total) * 100)
  } catch {
    return 85
  }
}

const calculateDashboardTrends = async () => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    
    const [nocTrend, appTrend] = await Promise.allSettled([
      supabase
        .from('noc_requests')
        .select('submitted_date')
        .gte('submitted_date', thirtyDaysAgo),
      supabase
        .from('applications')
        .select('applied_date')
        .gte('applied_date', thirtyDaysAgo)
    ])
    
    return {
      nocRequests: nocTrend.status === 'fulfilled' ? (nocTrend.value.data?.length || 0) : 12,
      applications: appTrend.status === 'fulfilled' ? (appTrend.value.data?.length || 0) : 25
    }
  } catch {
    return { nocRequests: 12, applications: 25 }
  }
}

const generateTPOfficerAlerts = async () => {
  const alerts = []
  
  try {
    // Check for overdue NOC reviews
    const overdueNOCs = await supabase
      .from('noc_requests')
      .select('id')
      .eq('status', 'pending')
      .lt('submitted_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    
    if (overdueNOCs.data && overdueNOCs.data.length > 0) {
      alerts.push({
        type: 'warning',
        message: `${overdueNOCs.data.length} NOC requests pending for over 7 days`,
        action: 'Review NOCs',
        priority: 'high'
      })
    }
    
    // Check for pending company verifications
    const pendingCompanies = await supabase
      .from('companies')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
    
    if (pendingCompanies.count && pendingCompanies.count > 5) {
      alerts.push({
        type: 'info',
        message: `${pendingCompanies.count} companies awaiting verification`,
        action: 'Verify Companies',
        priority: 'medium'
      })
    }
    
  } catch (error) {
    console.warn('Could not generate alerts:', error)
  }
  
  return alerts
}

const getMockTPOfficerDashboardData = () => ({
  stats: {
    pendingNOCs: 12,
    approvedNOCs: 45,
    rejectedNOCs: 3,
    totalNOCs: 60,
    totalCompanies: 28,
    verifiedCompanies: 22,
    pendingCompanies: 6,
    totalOpportunities: 35,
    activeOpportunities: 28,
    pendingReports: 8,
    pendingCertificates: 5,
    totalStudents: 150,
    placementRate: 85
  },
  recentActivities: [
    { type: "noc", title: "NOC request from John Doe", time: "2024-01-15T10:30:00Z", status: "pending", id: 1 },
    { type: "company", title: "Company registration: TechCorp Solutions", time: "2024-01-14T14:20:00Z", status: "verified", id: 2 },
    { type: "opportunity", title: "New internship posted by Infosys", time: "2024-01-12T09:15:00Z", status: "active", id: 3 },
  ],
  pendingItems: {
    nocRequests: 12,
    weeklyReports: 8,
    certificates: 5,
    companyVerifications: 6
  },
  trends: {
    nocRequests: 12,
    applications: 25
  },
  alerts: [
    {
      type: 'warning',
      message: '3 NOC requests pending for over 7 days',
      action: 'Review NOCs',
      priority: 'high'
    }
  ]
})


// Add to your data.ts file - Enhanced NOC Functions noc of the tp-officer

export const getAllNOCRequests = async () => {
  try {
    if (!supabase) {
      return getMockAllNOCRequests()
    }

    const { data, error } = await supabase
      .from('noc_requests')
      .select(`
        id,
        student_id,
        student_name,
        student_email,
        company_name,
        position,
        duration,
        start_date,
        end_date,
        submitted_date,
        approved_date,
        reviewed_date,
        status,
        description,
        feedback,
        documents,
        approved_by
      `)
      .order('submitted_date', { ascending: false })

    if (error) {
      console.error('Error fetching all NOC requests:', error)
      return getMockAllNOCRequests()
    }

    return data || []
  } catch (error) {
    console.error('Error in getAllNOCRequests:', error)
    return getMockAllNOCRequests()
  }
}

const getMockAllNOCRequests = () => {
  return [
    {
      id: 1,
      student_id: 'student_1',
      student_name: 'Alex Kumar',
      student_email: 'alex.kumar@charusat.edu.in',
      company_name: 'TechCorp Solutions',
      position: 'Software Development Intern',
      duration: '6 months',
      start_date: '2024-04-01',
      end_date: '2024-09-30',
      submitted_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      description: 'Full-stack web development using React and Node.js',
      documents: ['offer_letter.pdf', 'company_profile.pdf']
    },
    // Add more mock requests as needed
  ]
}


// Add these functions to your existing data.ts file

// ===================
// TEACHER STUDENT MANAGEMENT - DYNAMIC DATABASE FUNCTIONS
// ===================

export const getStudentsByTeacher = async (teacherId: string) => {
  try {
    console.log('👨‍🏫 Fetching students for teacher:', teacherId)
    
    if (!supabase) {
      console.log('⚠️ Supabase not available, using mock data')
      return getMockStudentsForTeacher()
    }

    // First, try to get students assigned through student_teacher_assignments table
    const { data: assignments, error: assignmentError } = await supabase
      .from('student_teacher_assignments')
      .select(`
        student_id,
        is_active,
        users!inner(
          id,
          name,
          email,
          roll_number,
          department,
          phone,
          created_at
        )
      `)
      .eq('teacher_id', teacherId)
      .eq('is_active', true)

    let students = []

    if (assignmentError || !assignments || assignments.length === 0) {
      console.warn('⚠️ No assignments found, fetching all students as fallback')
      // Fallback: get all students if no assignments exist
      const { data: allStudents, error: studentsError } = await supabase
        .from('users')
        .select('id, name, email, roll_number, department, phone, created_at')
        .eq('role', 'student')
        .eq('is_active', true)
        .limit(20) // Limit for demo purposes

      if (studentsError) {
        console.error('❌ Error fetching students:', studentsError)
        return getMockStudentsForTeacher()
      }

      students = allStudents || []
    } else {
      students = assignments.map(a => a.users)
    }

    if (students.length === 0) {
      console.log('ℹ️ No students found')
      return []
    }

    console.log(`📊 Found ${students.length} students, fetching additional data...`)

    // Get student IDs for additional data fetching
    const studentIds = students.map(s => s.id)

    // Fetch additional data in parallel
    const [nocResult, reportsResult, certificatesResult] = await Promise.allSettled([
      // NOC requests for internship details
      supabase
        .from('noc_requests')
        .select('student_id, company_name, position, start_date, end_date, status')
        .in('student_id', studentIds)
        .eq('status', 'approved')
        .order('submitted_date', { ascending: false }),
      
      // Weekly reports for progress tracking
      supabase
        .from('weekly_reports')
        .select('student_id, week_number, status, submitted_date')
        .in('student_id', studentIds)
        .order('submitted_date', { ascending: false }),
        
      // Certificates for completion tracking
      supabase
        .from('certificates')
        .select('student_id, status, upload_date')
        .in('student_id', studentIds)
    ])

    // Process the results
    const nocRequests = nocResult.status === 'fulfilled' && !nocResult.value.error 
      ? nocResult.value.data || [] 
      : []
    
    const reports = reportsResult.status === 'fulfilled' && !reportsResult.value.error 
      ? reportsResult.value.data || [] 
      : []
      
    const certificates = certificatesResult.status === 'fulfilled' && !certificatesResult.value.error 
      ? certificatesResult.value.data || [] 
      : []

    // Combine data for each student
    const enrichedStudents = students.map(student => {
      // Find current internship (most recent approved NOC)
      const currentInternship = nocRequests.find(noc => noc.student_id === student.id)
      
      // Calculate report statistics
      const studentReports = reports.filter(r => r.student_id === student.id)
      const submittedReports = studentReports.filter(r => r.status !== 'pending').length
      const totalReports = Math.max(studentReports.length, 10) // Assume 10 weeks minimum
      const progress = totalReports > 0 ? Math.round((submittedReports / totalReports) * 100) : 0
      
      // Find certificates
      const studentCertificates = certificates.filter(c => c.student_id === student.id)
      
      // Determine status
      let status = 'inactive'
      if (currentInternship) {
        const endDate = new Date(currentInternship.end_date)
        const now = new Date()
        status = endDate > now ? 'active' : 'completed'
      }
      
      // Get last activity
      const lastReport = studentReports[0]
      const lastActivity = lastReport ? lastReport.submitted_date : student.created_at

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        rollNumber: student.roll_number,
        department: student.department,
        phone: student.phone || '+91 9876543210', // Default if not provided
        company: currentInternship?.company_name || null,
        position: currentInternship?.position || null,
        supervisor: 'To be assigned', // This would need to be added to schema
        startDate: currentInternship?.start_date || null,
        endDate: currentInternship?.end_date || null,
        progress,
        status,
        reportsSubmitted: submittedReports,
        totalReports,
        cgpa: 8.5, // This would need to be added to user schema
        lastActivity,
        profileImage: null,
        certificates: studentCertificates.length
      }
    })

    console.log('✅ Successfully enriched student data')
    return enrichedStudents

  } catch (error) {
    console.error('💥 Error fetching students for teacher:', error)
    return getMockStudentsForTeacher()
  }
}

export const getStudentDetails = async (studentId: string) => {
  try {
    console.log('👤 Fetching detailed student information:', studentId)
    
    if (!supabase) {
      return getMockStudentDetails(studentId)
    }

    // Fetch student basic info
    const { data: student, error: studentError } = await supabase
      .from('users')
      .select('*')
      .eq('id', studentId)
      .single()

    if (studentError || !student) {
      console.error('❌ Error fetching student details:', studentError)
      return null
    }

    // Fetch additional data in parallel
    const [nocResult, reportsResult, certificatesResult, applicationsResult] = await Promise.allSettled([
      supabase
        .from('noc_requests')
        .select('*')
        .eq('student_id', studentId)
        .order('submitted_date', { ascending: false }),
      
      supabase
        .from('weekly_reports')
        .select('*')
        .eq('student_id', studentId)
        .order('week_number', { ascending: true }),
        
      supabase
        .from('certificates')
        .select('*')
        .eq('student_id', studentId)
        .order('upload_date', { ascending: false }),
        
      supabase
        .from('applications')
        .select(`
          *,
          job_opportunities(
            title,
            company_name,
            location
          )
        `)
        .eq('student_id', studentId)
        .order('applied_date', { ascending: false })
    ])

    const nocRequests = nocResult.status === 'fulfilled' ? nocResult.value.data || [] : []
    const reports = reportsResult.status === 'fulfilled' ? reportsResult.value.data || [] : []
    const certificates = certificatesResult.status === 'fulfilled' ? certificatesResult.value.data || [] : []
    const applications = applicationsResult.status === 'fulfilled' ? applicationsResult.value.data || [] : []

    // Find current internship
    const currentInternship = nocRequests.find(noc => noc.status === 'approved')
    
    return {
      ...student,
      currentInternship,
      nocRequests,
      reports,
      certificates,
      applications,
      stats: {
        totalReports: reports.length,
        pendingReports: reports.filter(r => r.status === 'pending').length,
        approvedReports: reports.filter(r => r.status === 'approved').length,
        totalCertificates: certificates.length,
        totalApplications: applications.length
      }
    }

  } catch (error) {
    console.error('💥 Error fetching student details:', error)
    return null
  }
}

export const sendMessageToStudent = async (teacherId: string, studentId: string, message: string) => {
  try {
    console.log('💌 Sending message to student:', { teacherId, studentId, message })
    
    if (!supabase) {
      console.log('Mock: Message sent successfully')
      return { success: true }
    }

    // Create notification for student
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: studentId,
        title: 'Message from Teacher',
        message: message,
        type: 'info',
        action_required: false
      })

    if (error) {
      console.error('❌ Error sending message:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Message sent successfully')
    return { success: true }

  } catch (error: any) {
    console.error('💥 Error in sendMessageToStudent:', error)
    return { success: false, error: error.message }
  }
}

export const updateStudentAssignment = async (teacherId: string, studentId: string, isActive: boolean) => {
  try {
    if (!supabase) {
      console.log('Mock: Updated student assignment')
      return { success: true }
    }

    const { error } = await supabase
      .from('student_teacher_assignments')
      .upsert({
        teacher_id: teacherId,
        student_id: studentId,
        is_active: isActive,
        academic_year: new Date().getFullYear().toString(),
        semester: 'Spring' // You might want to calculate this
      })

    if (error) {
      console.error('❌ Error updating student assignment:', error)
      return { success: false, error: error.message }
    }

    return { success: true }

  } catch (error: any) {
    console.error('💥 Error in updateStudentAssignment:', error)
    return { success: false, error: error.message }
  }
}

// Mock data functions for fallback
const getMockStudentsForTeacher = () => [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@charusat.ac.in',
    rollNumber: '21CE001',
    department: 'Computer Engineering',
    phone: '+91 9876543210',
    company: 'TCS',
    position: 'Software Developer Intern',
    supervisor: 'Mr. Rajesh Kumar',
    startDate: '2024-01-15',
    endDate: '2024-06-15',
    progress: 85,
    status: 'active',
    reportsSubmitted: 8,
    totalReports: 10,
    cgpa: 8.5,
    lastActivity: new Date().toISOString(),
    profileImage: null,
    certificates: 2
  }
]

const getMockStudentDetails = (studentId: string) => ({
  id: studentId,
  name: 'John Doe',
  email: 'john.doe@charusat.ac.in',
  roll_number: '21CE001',
  department: 'Computer Engineering',
  currentInternship: {
    company_name: 'TCS',
    position: 'Software Developer Intern',
    start_date: '2024-01-15',
    end_date: '2024-06-15'
  },
  stats: {
    totalReports: 8,
    pendingReports: 2,
    approvedReports: 6,
    totalCertificates: 1,
    totalApplications: 5
  }
})



