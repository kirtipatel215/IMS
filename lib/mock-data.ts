// lib/mock-data.ts - Additional Mock Functions (Add these to your existing mock-data.ts)

// Mock Reports Data
export const getMockReports = (studentId: string) => [
  {
    id: 1,
    studentId,
    week: 1,
    title: "Week 1 - Project Setup and Onboarding",
    description: "Completed project setup, team introductions, and initial training sessions.",
    achievements: [
      "Set up development environment",
      "Completed React basics training",
      "Met with team members and mentor"
    ],
    status: "approved",
    grade: "A",
    submittedDate: "2024-01-08T10:00:00Z",
    feedback: "Great start! Good documentation of setup process.",
    fileName: "week1_report.pdf"
  },
  {
    id: 2,
    studentId,
    week: 2,
    title: "Week 2 - Learning Phase",
    description: "Focused on learning new technologies and understanding project requirements.",
    achievements: [
      "Completed TypeScript fundamentals",
      "Understanding project architecture",
      "Started working on first task"
    ],
    status: "pending",
    submittedDate: "2024-01-15T14:30:00Z",
    fileName: "week2_report.pdf"
  },
  {
    id: 3,
    studentId,
    week: 3,
    title: "Week 3 - First Development Tasks",
    description: "Started implementing components and working on actual project tasks.",
    achievements: [
      "Implemented user authentication UI",
      "Fixed responsive design issues",
      "Learned advanced React patterns"
    ],
    status: "revision_required",
    submittedDate: "2024-01-22T09:15:00Z",
    feedback: "Good progress, but please add more technical details about the authentication implementation.",
    fileName: "week3_report.pdf"
  }
]

// Mock Applications Data
export const getMockApplications = (studentId: string) => [
  {
    id: 1,
    studentId,
    opportunityId: 1,
    coverLetter: "I am very interested in this internship position because it aligns with my career goals in software development. I have experience with React and Node.js...",
    status: "pending",
    appliedDate: "2024-01-10T11:20:00Z",
    resumeFileName: "john_doe_resume.pdf"
  },
  {
    id: 2,
    studentId,
    opportunityId: 3,
    coverLetter: "This data science internship would be perfect for applying my machine learning knowledge gained through coursework...",
    status: "shortlisted",
    appliedDate: "2024-01-05T16:45:00Z",
    resumeFileName: "john_doe_resume.pdf",
    feedback: "Great application! You've been shortlisted for the next round."
  },
  {
    id: 3,
    studentId,
    opportunityId: 2,
    coverLetter: "I am excited to contribute to your mobile development team with my Flutter and React Native experience...",
    status: "rejected",
    appliedDate: "2023-12-28T14:10:00Z",
    resumeFileName: "john_doe_resume.pdf",
    feedback: "Thank you for your interest. We've selected candidates with more mobile development experience."
  }
]

// Enhanced Mock Student Dashboard Data
export const getMockStudentDashboardData = (studentId: string) => {
  const mockReports = getMockReports(studentId)
  const mockNOCRequests = getMockNOCRequests(studentId)
  const mockCertificates = getMockCertificates(studentId)
  const mockOpportunities = getMockOpportunities()
  
  return {
    nocRequests: {
      total: mockNOCRequests.length,
      pending: mockNOCRequests.filter(r => r.status === 'pending').length,
      approved: mockNOCRequests.filter(r => r.status === 'approved').length,
      rejected: mockNOCRequests.filter(r => r.status === 'rejected').length
    },
    reports: {
      total: mockReports.length,
      submitted: mockReports.filter(r => r.status === 'pending' || r.status === 'submitted').length,
      reviewed: mockReports.filter(r => r.status === 'approved' || r.status === 'revision_required').length,
      recent: mockReports.slice(0, 5)
    },
    certificates: {
      total: mockCertificates.length,
      pending: mockCertificates.filter(c => c.status === 'pending').length,
      approved: mockCertificates.filter(c => c.status === 'approved').length,
      recent: mockCertificates.slice(0, 5)
    },
    opportunities: {
      total: mockOpportunities.length,
      recent: mockOpportunities.slice(0, 5)
    },
    recentActivity: [
      ...mockReports.slice(0, 2).map(item => ({
        id: `report-${item.id}`,
        type: 'report',
        title: item.title,
        status: item.status,
        created_at: item.submittedDate
      })),
      ...mockNOCRequests.slice(0, 2).map(item => ({
        id: `noc-${item.id}`,
        type: 'noc',
        title: `NOC Request - ${item.company}`,
        status: item.status,
        created_at: item.submittedDate
      })),
      ...mockCertificates.slice(0, 2).map(item => ({
        id: `cert-${item.id}`,
        type: 'certificate',
        title: `${item.internshipTitle} Certificate`,
        status: item.status,
        created_at: item.uploadDate
      }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6)
  }
}

// Enhanced Mock NOC Requests
export const getMockNOCRequests = (studentId: string) => [
  {
    id: 1,
    studentId,
    studentName: "John Doe",
    studentEmail: "john.doe@charusat.edu.in",
    company: "TechCorp Solutions",
    position: "Software Development Intern",
    duration: "6 months",
    startDate: "2024-02-01",
    description: "Full-stack web development internship focusing on React and Node.js applications.",
    status: "approved",
    submittedDate: "2024-01-10T10:30:00Z",
    approvedDate: "2024-01-15T14:20:00Z",
    feedback: "All documents are in order. NOC approved.",
    documents: ["offer_letter.pdf", "company_profile.pdf"]
  },
  {
    id: 2,
    studentId,
    studentName: "John Doe",
    studentEmail: "john.doe@charusat.edu.in",
    company: "DataTech Analytics",
    position: "Data Science Intern",
    duration: "4 months",
    startDate: "2024-03-01",
    description: "Machine learning and data analysis internship with focus on Python and ML frameworks.",
    status: "pending",
    submittedDate: "2024-01-20T09:15:00Z",
    documents: ["offer_letter.pdf"]
  }
]

// Enhanced Mock Certificates
export const getMockCertificates = (studentId: string) => [
  {
    id: 1,
    studentId,
    studentName: "John Doe",
    studentEmail: "john.doe@charusat.edu.in",
    internshipTitle: "Software Development Intern",
    company: "TechCorp Solutions",
    duration: "6 months",
    startDate: "2023-06-01",
    endDate: "2023-11-30",
    status: "approved",
    uploadDate: "2023-12-05T16:45:00Z",
    approvedDate: "2023-12-10T11:20:00Z",
    approvedBy: "Dr. Sarah Wilson",
    feedback: "Excellent work during the internship. Certificate verified and approved.",
    fileName: "techcorp_certificate.pdf"
  },
  {
    id: 2,
    studentId,
    studentName: "John Doe",
    studentEmail: "john.doe@charusat.edu.in",
    internshipTitle: "Frontend Developer Intern",
    company: "WebTech Studios",
    duration: "3 months",
    startDate: "2023-01-15",
    endDate: "2023-04-15",
    status: "pending",
    uploadDate: "2023-04-20T10:30:00Z",
    fileName: "webtech_certificate.pdf"
  }
]

// Enhanced Mock Opportunities
export const getMockOpportunities = () => [
  {
    id: 1,
    title: "Full Stack Development Intern",
    company: "InnovateX Solutions",
    location: "Bangalore",
    duration: "6 months",
    type: "Paid Internship",
    description: "Work on cutting-edge web applications using React, Node.js, and MongoDB. Perfect for students looking to gain hands-on experience in full-stack development.",
    requirements: ["React.js", "Node.js", "JavaScript", "MongoDB"],
    stipend: "₹25,000/month",
    positions: 5,
    applicants: 45,
    deadline: "2024-02-15",
    status: "active",
    verified: true,
    postedDate: "2024-01-05T09:00:00Z"
  },
  {
    id: 2,
    title: "Mobile App Development Intern",
    company: "MobileFirst Tech",
    location: "Mumbai",
    duration: "4 months",
    type: "Paid Internship",
    description: "Develop cross-platform mobile applications using React Native and Flutter. Gain experience in mobile UI/UX design and app deployment.",
    requirements: ["React Native", "Flutter", "Dart", "Mobile UI"],
    stipend: "₹22,000/month",
    positions: 3,
    applicants: 32,
    deadline: "2024-02-20",
    status: "active",
    verified: true,
    postedDate: "2024-01-08T11:30:00Z"
  },
  {
    id: 3,
    title: "Data Science Intern",
    company: "DataMine Analytics",
    location: "Pune",
    duration: "6 months",
    type: "Paid Internship",
    description: "Work with large datasets, build machine learning models, and create data visualizations. Experience with Python, pandas, and scikit-learn required.",
    requirements: ["Python", "Machine Learning", "Pandas", "SQL"],
    stipend: "₹28,000/month",
    positions: 4,
    applicants: 67,
    deadline: "2024-02-10",
    status: "active",
    verified: true,
    postedDate: "2024-01-03T14:15:00Z"
  },
  {
    id: 4,
    title: "UI/UX Design Intern",
    company: "DesignCraft Studio",
    location: "Ahmedabad",
    duration: "3 months",
    type: "Paid Internship",
    description: "Create user interfaces and experiences for web and mobile applications. Work with design tools like Figma and Adobe Creative Suite.",
    requirements: ["Figma", "Adobe XD", "UI Design", "Prototyping"],
    stipend: "₹20,000/month",
    positions: 2,
    applicants: 28,
    deadline: "2024-02-25",
    status: "active",
    verified: true,
    postedDate: "2024-01-10T10:45:00Z"
  },
  {
    id: 5,
    title: "DevOps Engineer Intern",
    company: "CloudOps Technologies",
    location: "Hyderabad",
    duration: "5 months",
    type: "Paid Internship",
    description: "Learn about cloud infrastructure, CI/CD pipelines, and containerization. Work with AWS, Docker, and Kubernetes.",
    requirements: ["AWS", "Docker", "Linux", "CI/CD"],
    stipend: "₹30,000/month",
    positions: 3,
    applicants: 41,
    deadline: "2024-02-18",
    status: "active",
    verified: true,
    postedDate: "2024-01-07T13:20:00Z"
  }
]