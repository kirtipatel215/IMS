// lib/data.ts - FIXED Data Service (No Repeated Fetches)
import { getMockStudentDashboardData, getMockNOCRequests, getMockCertificates, getMockOpportunities } from './mock-data'

// Import the Supabase functions but handle if they don't exist
let supabaseAuth: any = null
let supabaseData: any = null

try {
  const supabaseModule = require('./auth-supabase')
  supabaseAuth = supabaseModule
} catch (e) {
  console.warn('Supabase auth module not available, using fallbacks')
}

// Cache to prevent repeated API calls
const dataCache = new Map<string, { data: any, timestamp: number }>()
const CACHE_DURATION = 30000 // 30 seconds

// Pending promises to prevent duplicate requests
const pendingRequests = new Map<string, Promise<any>>()

// Helper function to get cached data or fetch fresh data
async function getCachedData<T>(
  key: string,
  fetchFunction: () => Promise<T>,
  fallbackData: T,
  cacheDuration: number = CACHE_DURATION
): Promise<T> {
  // Check cache first
  const cached = dataCache.get(key)
  if (cached && (Date.now() - cached.timestamp) < cacheDuration) {
    console.log(`Using cached data for ${key}`)
    return cached.data
  }

  // Check if request is already pending
  if (pendingRequests.has(key)) {
    console.log(`Waiting for pending request: ${key}`)
    return pendingRequests.get(key)!
  }

  // Create new request
  const requestPromise = (async () => {
    try {
      console.log(`Fetching fresh data for ${key}`)
      const data = await fetchFunction()
      
      // Cache the result
      dataCache.set(key, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      console.warn(`Failed to fetch ${key}, using fallback:`, error)
      return fallbackData
    } finally {
      // Remove from pending requests
      pendingRequests.delete(key)
    }
  })()

  // Store the pending promise
  pendingRequests.set(key, requestPromise)
  
  return requestPromise
}

// Enhanced getStudentDashboardData with proper caching
export const getStudentDashboardData = async (studentId: string) => {
  const cacheKey = `student-dashboard-${studentId}`
  
  return getCachedData(
    cacheKey,
    async () => {
      // Try Supabase first if available
      if (supabaseAuth && supabaseAuth.getCurrentUser) {
        console.log('Attempting to fetch from Supabase...')
        
        // Import supabase client
        const { supabase } = await import('./supabase')
        
        const stats: any = {}

        // Fetch all data in parallel to improve performance
        const [nocRequests, reports, certificates, opportunities] = await Promise.allSettled([
          supabase
            .from('noc_requests')
            .select('id, status, created_at, company_name')
            .eq('student_id', studentId)
            .order('created_at', { ascending: false }),
          
          supabase
            .from('weekly_reports')
            .select('id, title, status, created_at, week_number')
            .eq('student_id', studentId)
            .order('created_at', { ascending: false }),
          
          supabase
            .from('certificates')
            .select('id, title, status, created_at, certificate_type')
            .eq('student_id', studentId)
            .order('created_at', { ascending: false }),
          
          supabase
            .from('job_opportunities')
            .select('id, title, company_name, status, created_at, job_type')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(5)
        ])

        // Process NOC requests
        const nocData = nocRequests.status === 'fulfilled' ? nocRequests.value.data : []
        stats.nocRequests = {
          total: nocData?.length || 0,
          pending: nocData?.filter(r => r.status === 'pending').length || 0,
          approved: nocData?.filter(r => r.status === 'approved').length || 0,
          rejected: nocData?.filter(r => r.status === 'rejected').length || 0
        }

        // Process reports
        const reportsData = reports.status === 'fulfilled' ? reports.value.data : []
        stats.reports = {
          total: reportsData?.length || 0,
          submitted: reportsData?.filter(r => r.status === 'submitted' || r.status === 'pending').length || 0,
          reviewed: reportsData?.filter(r => r.status === 'reviewed' || r.status === 'approved').length || 0,
          recent: reportsData?.slice(0, 5) || []
        }

        // Process certificates
        const certsData = certificates.status === 'fulfilled' ? certificates.value.data : []
        stats.certificates = {
          total: certsData?.length || 0,
          pending: certsData?.filter(c => c.status === 'pending').length || 0,
          approved: certsData?.filter(c => c.status === 'approved').length || 0,
          recent: certsData?.slice(0, 5) || []
        }

        // Process opportunities
        const oppsData = opportunities.status === 'fulfilled' ? opportunities.value.data : []
        stats.opportunities = {
          total: oppsData?.length || 0,
          recent: oppsData || []
        }

        // Process recent activity
        stats.recentActivity = [
          ...(nocData || []).slice(0, 3).map(item => ({
            id: `noc-${item.id}`,
            type: 'noc',
            title: `NOC Request - ${item.company_name}`,
            status: item.status,
            created_at: item.created_at
          })),
          ...(reportsData || []).slice(0, 3).map(item => ({
            id: `report-${item.id}`,
            type: 'report',
            title: item.title,
            status: item.status,
            created_at: item.created_at
          })),
          ...(certsData || []).slice(0, 3).map(item => ({
            id: `cert-${item.id}`,
            type: 'certificate',
            title: item.title,
            status: item.status,
            created_at: item.created_at
          }))
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6)

        // Validate the data structure
        if (stats && typeof stats === 'object') {
          console.log('Successfully fetched Supabase data')
          return stats
        }
      }

      throw new Error('Supabase data fetch failed')
    },
    getMockStudentDashboardData(studentId)
  )
}

// Get current user with caching
export const getCurrentUser = async () => {
  const cacheKey = 'current-user'
  
  return getCachedData(
    cacheKey,
    async () => {
      if (supabaseAuth && supabaseAuth.getCurrentUser) {
        const user = await supabaseAuth.getCurrentUser()
        if (user) return user
      }
      throw new Error('No Supabase user found')
    },
    {
      id: "mock-user-123",
      name: "John Doe",
      email: "john.doe@charusat.edu.in",
      role: "student",
      department: "Computer Engineering",
      rollNumber: "22CE045",
      loginTime: new Date().toISOString()
    }
  )
}

// Teacher Dashboard Data with caching
export const getTeacherDashboardData = async (teacherId: string) => {
  const cacheKey = `teacher-dashboard-${teacherId}`
  
  return getCachedData(
    cacheKey,
    async () => {
      const { supabase } = await import('./supabase')
      
      // Get students assigned to this teacher
      const { data: studentAssignments } = await supabase
        .from('student_teacher_assignments')
        .select('student_id, students:student_id(id, name, email, roll_number)')
        .eq('teacher_id', teacherId)

      const studentIds = studentAssignments?.map(s => s.student_id) || []
      const students = studentAssignments?.map(s => s.students).filter(Boolean) || []

      // Get reports and certificates in parallel
      const [reportsResult, certificatesResult] = await Promise.allSettled([
        supabase
          .from('weekly_reports')
          .select('id, title, student_id, created_at, status')
          .in('student_id', studentIds)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('certificates')
          .select('id, title, student_id, created_at, status')
          .in('student_id', studentIds)
          .order('created_at', { ascending: false })
      ])

      const reports = reportsResult.status === 'fulfilled' ? reportsResult.value.data : []
      const certificates = certificatesResult.status === 'fulfilled' ? certificatesResult.value.data : []

      return {
        totalStudents: students.length,
        pendingReports: reports?.filter(r => r.status === 'pending' || r.status === 'submitted').length || 0,
        pendingCertificates: certificates?.filter(c => c.status === 'pending').length || 0,
        students: students,
        recentReports: reports?.slice(0, 10) || [],
        recentCertificates: certificates?.slice(0, 10) || []
      }
    },
    {
      totalStudents: 0,
      pendingReports: 0,
      pendingCertificates: 0,
      students: [],
      recentReports: [],
      recentCertificates: []
    }
  )
}

// TP Officer Dashboard Data with caching
export const getTPOfficerDashboardData = async () => {
  const cacheKey = 'tp-officer-dashboard'
  
  return getCachedData(
    cacheKey,
    async () => {
      const { supabase } = await import('./supabase')
      
      // Fetch all data in parallel
      const [nocResult, companiesResult, oppsResult] = await Promise.allSettled([
        supabase
          .from('noc_requests')
          .select('id, status, created_at, company_name, student_id')
          .order('created_at', { ascending: false }),
        
        supabase
          .from('companies')
          .select('id, name, status, created_at')
          .order('created_at', { ascending: false }),
        
        supabase
          .from('job_opportunities')
          .select('id, title, company_name, status, created_at')
          .order('created_at', { ascending: false })
      ])

      const nocRequests = nocResult.status === 'fulfilled' ? nocResult.value.data : []
      const companies = companiesResult.status === 'fulfilled' ? companiesResult.value.data : []
      const opportunities = oppsResult.status === 'fulfilled' ? oppsResult.value.data : []

      return {
        totalNOCRequests: nocRequests?.length || 0,
        pendingNOCRequests: nocRequests?.filter(n => n.status === 'pending').length || 0,
        approvedNOCRequests: nocRequests?.filter(n => n.status === 'approved').length || 0,
        totalCompanies: companies?.filter(c => c.status === 'active').length || 0,
        totalOpportunities: opportunities?.filter(o => o.status === 'active').length || 0,
        recentNOCRequests: nocRequests?.slice(0, 10) || [],
        recentCompanies: companies?.slice(0, 5) || [],
        recentOpportunities: opportunities?.slice(0, 5) || []
      }
    },
    {
      totalNOCRequests: 0,
      pendingNOCRequests: 0,
      approvedNOCRequests: 0,
      totalCompanies: 0,
      totalOpportunities: 0,
      recentNOCRequests: [],
      recentCompanies: [],
      recentOpportunities: []
    }
  )
}

// Admin Dashboard Data with caching
export const getAdminDashboardData = async () => {
  const cacheKey = 'admin-dashboard'
  
  return getCachedData(
    cacheKey,
    async () => {
      const { supabase } = await import('./supabase')
      
      // Fetch all data in parallel
      const [usersResult, reportsResult, certificatesResult, nocResult] = await Promise.allSettled([
        supabase
          .from('users')
          .select('id, role, is_active, created_at')
          .eq('is_active', true),
        
        supabase
          .from('weekly_reports')
          .select('id, status, created_at')
          .order('created_at', { ascending: false }),
        
        supabase
          .from('certificates')
          .select('id, status, created_at')
          .order('created_at', { ascending: false }),
        
        supabase
          .from('noc_requests')
          .select('id, status, created_at')
          .order('created_at', { ascending: false })
      ])

      const users = usersResult.status === 'fulfilled' ? usersResult.value.data : []
      const reports = reportsResult.status === 'fulfilled' ? reportsResult.value.data : []
      const certificates = certificatesResult.status === 'fulfilled' ? certificatesResult.value.data : []
      const nocRequests = nocResult.status === 'fulfilled' ? nocResult.value.data : []

      const usersByRole = users?.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      return {
        totalUsers: users?.length || 0,
        totalStudents: usersByRole.student || 0,
        totalTeachers: usersByRole.teacher || 0,
        totalTPOfficers: usersByRole['tp-officer'] || 0,
        totalAdmins: usersByRole.admin || 0,
        totalReports: reports?.length || 0,
        pendingReports: reports?.filter(r => r.status === 'pending').length || 0,
        totalCertificates: certificates?.length || 0,
        pendingCertificates: certificates?.filter(c => c.status === 'pending').length || 0,
        totalNOCRequests: nocRequests?.length || 0,
        pendingNOCRequests: nocRequests?.filter(n => n.status === 'pending').length || 0,
        recentActivity: [
          ...(reports || []).slice(0, 3).map(item => ({
            id: `report-${item.id}`,
            type: 'report',
            title: 'Weekly Report Submitted',
            status: item.status,
            created_at: item.created_at
          })),
          ...(certificates || []).slice(0, 3).map(item => ({
            id: `cert-${item.id}`,
            type: 'certificate',
            title: 'Certificate Uploaded',
            status: item.status,
            created_at: item.created_at
          })),
          ...(nocRequests || []).slice(0, 3).map(item => ({
            id: `noc-${item.id}`,
            type: 'noc',
            title: 'NOC Request Submitted',
            status: item.status,
            created_at: item.created_at
          }))
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 8)
      }
    },
    {
      totalUsers: 0,
      totalStudents: 0,
      totalTeachers: 0,
      totalTPOfficers: 0,
      totalAdmins: 0,
      totalReports: 0,
      pendingReports: 0,
      totalCertificates: 0,
      pendingCertificates: 0,
      totalNOCRequests: 0,
      pendingNOCRequests: 0,
      recentActivity: []
    }
  )
}

// NOC Requests with caching
export const getNOCRequestsByStudent = async (studentId: string) => {
  const cacheKey = `noc-requests-${studentId}`
  
  return getCachedData(
    cacheKey,
    async () => {
      const { supabase } = await import('./supabase')
      
      const { data, error } = await supabase
        .from('noc_requests')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        
      if (!error && data) {
        return data
      }
      throw new Error(error?.message || 'Failed to fetch NOC requests')
    },
    getMockNOCRequests(studentId)
  )
}

export const createNOCRequest = async (requestData: any) => {
  try {
    const { supabase } = await import('./supabase')
    
    const { data, error } = await supabase
      .from('noc_requests')
      .insert(requestData)
      .select()
      .single()
      
    if (!error && data) {
      // Clear cache to force refresh
      const cacheKey = `noc-requests-${requestData.student_id}`
      dataCache.delete(cacheKey)
      return data
    }
    throw new Error(error?.message || 'Failed to create NOC request')
  } catch (error) {
    console.warn('Supabase NOC request creation failed:', error)
  }

  // Mock creation
  return {
    id: Math.floor(Math.random() * 1000),
    ...requestData,
    status: 'pending',
    created_at: new Date().toISOString()
  }
}

// Certificates with caching
export const getCertificatesByStudent = async (studentId: string) => {
  const cacheKey = `certificates-${studentId}`
  
  return getCachedData(
    cacheKey,
    async () => {
      const { supabase } = await import('./supabase')
      
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        
      if (!error && data) {
        return data
      }
      throw new Error(error?.message || 'Failed to fetch certificates')
    },
    getMockCertificates(studentId)
  )
}

export const createCertificate = async (certificateData: any) => {
  try {
    const { supabase } = await import('./supabase')
    
    const { data, error } = await supabase
      .from('certificates')
      .insert(certificateData)
      .select()
      .single()
      
    if (!error && data) {
      // Clear cache to force refresh
      const cacheKey = `certificates-${certificateData.student_id}`
      dataCache.delete(cacheKey)
      return data
    }
    throw new Error(error?.message || 'Failed to create certificate')
  } catch (error) {
    console.warn('Supabase certificate creation failed:', error)
  }

  // Mock creation
  return {
    id: Math.floor(Math.random() * 1000),
    ...certificateData,
    status: 'pending',
    created_at: new Date().toISOString()
  }
}

// Legacy functions for compatibility
export const getAllCompanies = async () => {
  const cacheKey = 'all-companies'
  
  return getCachedData(
    cacheKey,
    async () => {
      const { supabase } = await import('./supabase')
      
      const { data } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false })
      
      return data || []
    },
    []
  )
}

export const getAllOpportunities = async () => {
  const cacheKey = 'all-opportunities'
  
  return getCachedData(
    cacheKey,
    async () => {
      const { supabase } = await import('./supabase')
      
      const { data } = await supabase
        .from('job_opportunities')
        .select('*')
        .order('created_at', { ascending: false })
      
      return data || getMockOpportunities()
    },
    getMockOpportunities()
  )
}

export const getAllNOCRequests = async () => {
  const cacheKey = 'all-noc-requests'
  
  return getCachedData(
    cacheKey,
    async () => {
      const { supabase } = await import('./supabase')
      
      const { data } = await supabase
        .from('noc_requests')
        .select('*')
        .order('created_at', { ascending: false })
      
      return data || []
    },
    []
  )
}

// Clear cache function (useful for forcing data refresh)
export const clearDataCache = (key?: string) => {
  if (key) {
    dataCache.delete(key)
    pendingRequests.delete(key)
  } else {
    dataCache.clear()
    pendingRequests.clear()
  }
}

// User statistics (for dashboard) with caching
export const getUserStats = async (userId: string, role: string) => {
  const cacheKey = `user-stats-${userId}-${role}`
  
  return getCachedData(
    cacheKey,
    async () => {
      const { supabase } = await import('./supabase')
      
      const stats: any = {}

      if (role === 'student') {
        // Fetch student-specific stats in parallel
        const [nocResult, reportsResult, certificatesResult, notificationsResult] = await Promise.allSettled([
          supabase.from('noc_requests').select('status').eq('student_id', userId),
          supabase.from('weekly_reports').select('status').eq('student_id', userId),
          supabase.from('certificates').select('status').eq('student_id', userId),
          supabase.from('notifications').select('is_read').eq('user_id', userId)
        ])

        const nocRequests = nocResult.status === 'fulfilled' ? nocResult.value.data : []
        const reports = reportsResult.status === 'fulfilled' ? reportsResult.value.data : []
        const certificates = certificatesResult.status === 'fulfilled' ? certificatesResult.value.data : []
        const notifications = notificationsResult.status === 'fulfilled' ? notificationsResult.value.data : []

        stats.nocRequests = {
          total: nocRequests?.length || 0,
          pending: nocRequests?.filter(r => r.status === 'pending').length || 0,
          approved: nocRequests?.filter(r => r.status === 'approved').length || 0
        }

        stats.reports = {
          total: reports?.length || 0,
          submitted: reports?.filter(r => r.status === 'submitted' || r.status === 'pending').length || 0,
          reviewed: reports?.filter(r => r.status === 'reviewed' || r.status === 'approved').length || 0
        }

        stats.certificates = {
          total: certificates?.length || 0,
          pending: certificates?.filter(c => c.status === 'pending').length || 0,
          approved: certificates?.filter(c => c.status === 'approved').length || 0
        }

        stats.notifications = {
          total: notifications?.length || 0,
          unread: notifications?.filter(n => !n.is_read).length || 0
        }
      }

      return stats
    },
    {}
  )
}

// Update user profile
export const updateUserProfile = async (userId: string, updates: any) => {
  try {
    const { supabase } = await import('./supabase')
    
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

    // Clear user cache to force refresh
    clearDataCache('current-user')

    return { success: true }
  } catch (error: any) {
    console.error('Error updating profile:', error)
    return { success: false, error: 'Failed to update profile' }
  }
}