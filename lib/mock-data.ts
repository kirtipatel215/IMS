// lib/mock-data.ts - Mock Data Service for Development
export interface MockDashboardStats {
  nocRequests: {
    total: number
    pending: number
    approved: number
    rejected: number
  }
  reports: {
    total: number
    submitted: number
    reviewed: number
    recent: any[]
  }
  certificates: {
    total: number
    pending: number
    approved: number
    recent: any[]
  }
  opportunities: {
    total: number
    recent: any[]
  }
  recentActivity: any[]
}

// Mock student dashboard data
export const getMockStudentDashboardData = (studentId: string): MockDashboardStats => {
  return {
    nocRequests: {
      total: 2,
      pending: 1,
      approved: 1,
      rejected: 0
    },
    reports: {
      total: 8,
      submitted: 2,
      reviewed: 6,
      recent: [
        {
          id: 1,
          title: "Week 8 Progress Report",
          status: "pending",
          created_at: "2024-01-15T10:00:00Z",
          week_number: 8
        },
        {
          id: 2,
          title: "Week 7 Progress Report",
          status: "reviewed",
          created_at: "2024-01-08T10:00:00Z",
          week_number: 7
        },
        {
          id: 3,
          title: "Week 6 Progress Report",
          status: "approved",
          created_at: "2024-01-01T10:00:00Z",
          week_number: 6
        }
      ]
    },
    certificates: {
      total: 1,
      pending: 1,
      approved: 0,
      recent: [
        {
          id: 1,
          title: "Internship Completion Certificate",
          status: "pending",
          created_at: "2024-01-10T10:00:00Z",
          certificate_type: "completion"
        }
      ]
    },
    opportunities: {
      total: 12,
      recent: [
        {
          id: 1,
          title: "Software Development Intern",
          company_name: "TechCorp Solutions",
          status: "active",
          created_at: "2024-01-14T10:00:00Z",
          job_type: "internship"
        },
        {
          id: 2,
          title: "Data Science Intern",
          company_name: "DataTech Analytics",
          status: "active",
          created_at: "2024-01-13T10:00:00Z",
          job_type: "internship"
        },
        {
          id: 3,
          title: "Frontend Developer Intern",
          company_name: "WebSoft Inc",
          status: "active",
          created_at: "2024-01-12T10:00:00Z",
          job_type: "internship"
        }
      ]
    },
    recentActivity: [
      {
        id: "noc-1",
        type: "noc",
        title: "NOC Request - TechCorp Solutions",
        status: "approved",
        created_at: "2024-01-15T10:00:00Z"
      },
      {
        id: "report-8",
        type: "report",
        title: "Week 8 Progress Report",
        status: "pending",
        created_at: "2024-01-15T10:00:00Z"
      },
      {
        id: "cert-1",
        type: "certificate",
        title: "Internship Completion Certificate",
        status: "pending",
        created_at: "2024-01-10T10:00:00Z"
      },
      {
        id: "report-7",
        type: "report",
        title: "Week 7 Progress Report",
        status: "reviewed",
        created_at: "2024-01-08T10:00:00Z"
      },
      {
        id: "noc-2",
        type: "noc",
        title: "NOC Request - DataTech Analytics",
        status: "pending",
        created_at: "2024-01-05T10:00:00Z"
      }
    ]
  }
}

// Enhanced getStudentDashboardData function with fallback
export const getStudentDashboardDataWithFallback = async (studentId: string): Promise<MockDashboardStats> => {
  try {
    // Try to use real Supabase data first
    if (typeof window !== 'undefined' && window.supabase) {
      // Add your real Supabase logic here
      // const { data } = await supabase.from('...').select('...')
      // return processedData
    }
    
    // Fallback to mock data
    console.log('Using mock data for student dashboard')
    return getMockStudentDashboardData(studentId)
  } catch (error) {
    console.warn('Error fetching real data, using mock data:', error)
    return getMockStudentDashboardData(studentId)
  }
}

// Additional mock functions for other pages
export const getMockNOCRequests = (studentId: string) => [
  {
    id: 1,
    studentId,
    company: "TechCorp Solutions",
    position: "Software Development Intern",
    duration: "6 months",
    startDate: "2024-02-01",
    status: "approved",
    submittedDate: "2024-01-15",
    approvedDate: "2024-01-18",
    description: "Full-stack development internship focusing on React and Node.js",
    feedback: "All requirements met. NOC approved for the specified duration."
  },
  {
    id: 2,
    studentId,
    company: "DataTech Analytics",
    position: "Data Science Intern",
    duration: "4 months",
    startDate: "2024-02-15",
    status: "pending",
    submittedDate: "2024-01-20",
    description: "Machine learning and data analysis internship using Python and R"
  }
]

export const getMockCertificates = (studentId: string) => [
  {
    id: 1,
    studentId,
    studentName: "John Doe",
    studentEmail: "john.doe@charusat.edu.in",
    internshipTitle: "Software Development Intern",
    company: "TechCorp Solutions",
    duration: "6 months",
    startDate: "2023-08-01",
    endDate: "2024-01-31",
    status: "pending",
    uploadDate: "2024-02-01",
    fileName: "certificate_john_doe_techcorp.pdf"
  }
]

export const getMockOpportunities = () => [
  {
    id: 1,
    title: "Software Development Intern",
    company: "TechCorp Solutions",
    location: "Bangalore",
    duration: "6 months",
    type: "Full-time",
    status: "active",
    description: "Join our development team to work on cutting-edge web applications using React, Node.js, and MongoDB.",
    requirements: ["React.js", "Node.js", "JavaScript", "MongoDB"],
    stipend: "₹25,000/month",
    positions: 3,
    applicants: 45,
    deadline: "2024-02-28",
    verified: true
  },
  {
    id: 2,
    title: "Data Science Intern",
    company: "DataTech Analytics",
    location: "Mumbai",
    duration: "4 months",
    type: "Full-time",
    status: "active",
    description: "Work with our data science team on machine learning projects and data analysis.",
    requirements: ["Python", "Machine Learning", "Pandas", "TensorFlow"],
    stipend: "₹30,000/month",
    positions: 2,
    applicants: 32,
    deadline: "2024-03-15",
    verified: true
  },
  {
    id: 3,
    title: "Frontend Developer Intern",
    company: "WebSoft Inc",
    location: "Pune",
    duration: "3 months",
    type: "Part-time",
    status: "active",
    description: "Create responsive and interactive user interfaces using modern frontend technologies.",
    requirements: ["HTML5", "CSS3", "JavaScript", "Vue.js"],
    stipend: "₹20,000/month",
    positions: 4,
    applicants: 28,
    deadline: "2024-03-01",
    verified: false
  }
]