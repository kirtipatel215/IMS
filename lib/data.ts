export interface Student {
  id: number
  name: string
  email: string
  rollNumber: string
  department: string
  semester: string
  phone: string
  teacherId: number
  company?: string
  position?: string
  status: "active" | "inactive" | "completed"
  progress: number
  reportsSubmitted: number
  totalReports: number
  lastActivity: string
  cgpa: number
}

export interface WeeklyReport {
  id: number
  studentId: number
  studentName: string
  studentEmail: string
  teacherId: number
  week: number
  title: string
  description: string
  achievements: string[]
  submittedAt: string
  status: "pending" | "approved" | "rejected" | "revision_required"
  grade?: string
  feedback?: string
  reviewedBy?: string
  reviewedAt?: string
  fileName: string
  company: string
}

export interface Certificate {
  id: number
  studentId: number
  studentName: string
  studentEmail: string
  teacherId: number
  internshipTitle: string
  company: string
  duration: string
  startDate: string
  endDate: string
  uploadDate: string
  status: "pending" | "approved" | "rejected"
  approvedBy?: string
  approvedDate?: string
  feedback?: string
  fileName: string
}

export interface NOCRequest {
  id: number
  studentId: number
  studentName: string
  studentEmail: string
  company: string
  position: string
  startDate: string
  endDate: string
  stipend: number
  location: string
  description: string
  submittedAt: string
  status: "pending" | "approved" | "rejected"
  reviewedBy?: string
  reviewedAt?: string
  feedback?: string
}

export interface AssignedTask {
  id: number
  teacherId: number
  title: string
  description: string
  dueDate: string
  fileName?: string
  assignedStudents: number[]
  createdAt: string
  updatedAt: string
  isDeleted: boolean
}

export interface TaskStatus {
  id: number
  taskId: number
  studentId: number
  status: "assigned" | "seen" | "completed"
  completedAt?: string
  submissionFile?: string
  notes?: string
}

export interface Application {
  id: number
  opportunityId: number
  studentId: number
  studentName: string
  studentEmail: string
  coverLetter: string
  resumeFileName: string
  status: "submitted" | "reviewed" | "accepted" | "rejected"
  submittedAt: string
}

export interface Company {
  id: number
  name: string
  email: string
  website: string
  industry: string
  location: string
  description: string
  verificationStatus: "pending" | "verified" | "rejected"
  verifiedBy?: string
  verifiedAt?: string
  contactPerson: string
  contactPhone: string
  establishedYear: number
  employeeCount: string
  submittedAt: string
}

export interface Opportunity {
  id: number
  companyId: number
  companyName: string
  title: string
  description: string
  requirements: string[]
  skills: string[]
  location: string
  duration: string
  stipend: number
  type: "internship" | "job"
  status: "active" | "inactive" | "expired"
  postedBy: string
  postedAt: string
  deadline: string
  positions: number
  applicants: number
}

export interface User {
  id: number
  name: string
  email: string
  role: "student" | "teacher" | "tp-officer" | "admin"
  department?: string
  rollNumber?: string
  employeeId?: string
  phone: string
  status: "active" | "inactive"
  lastLogin: string
  createdAt: string
}

export interface SystemLog {
  id: number
  userId: number
  userName: string
  action: string
  details: string
  timestamp: string
  ipAddress: string
  userAgent: string
  status: "success" | "error" | "warning"
}

// Mock data with comprehensive sample records
const mockStudents: Student[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@charusat.edu.in",
    rollNumber: "21CE001",
    department: "Computer Engineering",
    semester: "6th",
    phone: "+91 9876543210",
    teacherId: 2,
    company: "TechCorp Solutions",
    position: "Software Developer Intern",
    status: "active",
    progress: 75,
    reportsSubmitted: 8,
    totalReports: 12,
    lastActivity: "2024-01-15",
    cgpa: 8.5,
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@charusat.edu.in",
    rollNumber: "21CE002",
    department: "Computer Engineering",
    semester: "6th",
    phone: "+91 9876543211",
    teacherId: 2,
    company: "DataTech Analytics",
    position: "Data Analyst Intern",
    status: "active",
    progress: 60,
    reportsSubmitted: 6,
    totalReports: 12,
    lastActivity: "2024-01-14",
    cgpa: 9.1,
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.johnson@charusat.edu.in",
    rollNumber: "21CE003",
    department: "Computer Engineering",
    semester: "6th",
    phone: "+91 9876543212",
    teacherId: 2,
    company: "WebTech Solutions",
    position: "Frontend Developer Intern",
    status: "active",
    progress: 45,
    reportsSubmitted: 4,
    totalReports: 12,
    lastActivity: "2024-01-12",
    cgpa: 7.8,
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah.wilson@charusat.edu.in",
    rollNumber: "21CE004",
    department: "Computer Engineering",
    semester: "6th",
    phone: "+91 9876543213",
    teacherId: 3,
    company: "Microsoft",
    position: "Software Engineer Intern",
    status: "completed",
    progress: 100,
    reportsSubmitted: 12,
    totalReports: 12,
    lastActivity: "2024-01-10",
    cgpa: 9.3,
  },
  {
    id: 5,
    name: "Alex Brown",
    email: "alex.brown@charusat.edu.in",
    rollNumber: "21CE005",
    department: "Computer Engineering",
    semester: "6th",
    phone: "+91 9876543214",
    teacherId: 2,
    company: "Google",
    position: "ML Engineer Intern",
    status: "active",
    progress: 30,
    reportsSubmitted: 3,
    totalReports: 12,
    lastActivity: "2024-01-16",
    cgpa: 8.8,
  },
  {
    id: 6,
    name: "Emily Davis",
    email: "emily.davis@charusat.edu.in",
    rollNumber: "21CE006",
    department: "Computer Engineering",
    semester: "6th",
    phone: "+91 9876543215",
    teacherId: 3,
    company: "Amazon",
    position: "Cloud Engineer Intern",
    status: "active",
    progress: 85,
    reportsSubmitted: 10,
    totalReports: 12,
    lastActivity: "2024-01-17",
    cgpa: 8.9,
  },
  {
    id: 7,
    name: "David Lee",
    email: "david.lee@charusat.edu.in",
    rollNumber: "21CE007",
    department: "Computer Engineering",
    semester: "6th",
    phone: "+91 9876543216",
    teacherId: 2,
    status: "inactive",
    progress: 0,
    reportsSubmitted: 0,
    totalReports: 12,
    lastActivity: "2024-01-05",
    cgpa: 7.2,
  },
]

const mockReports: WeeklyReport[] = [
  {
    id: 1,
    studentId: 1,
    studentName: "John Doe",
    studentEmail: "john.doe@charusat.edu.in",
    teacherId: 2,
    week: 8,
    title: "Database Optimization Project",
    description:
      "This week I worked on optimizing database queries and improving application performance. I learned about indexing strategies and query optimization techniques.",
    achievements: [
      "Optimized 5 critical database queries",
      "Reduced page load time by 40%",
      "Implemented database indexing strategies",
    ],
    submittedAt: "2024-01-15T10:30:00Z",
    status: "pending",
    fileName: "week8_report_john_doe.pdf",
    company: "TechCorp Solutions",
  },
  {
    id: 2,
    studentId: 2,
    studentName: "Jane Smith",
    studentEmail: "jane.smith@charusat.edu.in",
    teacherId: 2,
    week: 7,
    title: "Machine Learning Model Development",
    description:
      "Developed and trained a new ML model for customer segmentation and behavior analysis. Worked with Python libraries like scikit-learn and pandas.",
    achievements: [
      "Built customer segmentation model with 85% accuracy",
      "Implemented data preprocessing pipeline",
      "Created visualization dashboard for insights",
    ],
    submittedAt: "2024-01-14T14:20:00Z",
    status: "approved",
    grade: "A",
    feedback: "Excellent work on the model architecture and implementation. Great attention to detail.",
    reviewedBy: "Dr. Sarah Wilson",
    reviewedAt: "2024-01-15T09:15:00Z",
    fileName: "week7_report_jane_smith.pdf",
    company: "DataTech Analytics",
  },
  {
    id: 3,
    studentId: 1,
    studentName: "John Doe",
    studentEmail: "john.doe@charusat.edu.in",
    teacherId: 2,
    week: 6,
    title: "API Development and Testing",
    description:
      "Focused on developing RESTful APIs and implementing comprehensive testing strategies. Used Node.js and Express framework.",
    achievements: [
      "Developed 8 REST API endpoints",
      "Implemented unit tests with 90% coverage",
      "Set up automated testing pipeline",
    ],
    submittedAt: "2024-01-08T16:45:00Z",
    status: "approved",
    grade: "A-",
    feedback: "Good progress on API development. Consider adding more error handling.",
    reviewedBy: "Dr. Sarah Wilson",
    reviewedAt: "2024-01-09T11:20:00Z",
    fileName: "week6_report_john_doe.pdf",
    company: "TechCorp Solutions",
  },
  {
    id: 4,
    studentId: 3,
    studentName: "Mike Johnson",
    studentEmail: "mike.johnson@charusat.edu.in",
    teacherId: 2,
    week: 5,
    title: "Frontend Component Development",
    description:
      "Created reusable React components for the company's main application. Focused on responsive design and accessibility.",
    achievements: [
      "Built 12 reusable React components",
      "Implemented responsive design patterns",
      "Added accessibility features (ARIA labels)",
    ],
    submittedAt: "2024-01-12T11:30:00Z",
    status: "revision_required",
    feedback: "Good work on components. Please add more documentation and improve code comments.",
    reviewedBy: "Dr. Sarah Wilson",
    reviewedAt: "2024-01-13T10:00:00Z",
    fileName: "week5_report_mike_johnson.pdf",
    company: "WebTech Solutions",
  },
  {
    id: 5,
    studentId: 4,
    studentName: "Sarah Wilson",
    studentEmail: "sarah.wilson@charusat.edu.in",
    teacherId: 3,
    week: 12,
    title: "Final Project Completion",
    description:
      "Completed the final internship project - a comprehensive web application with full-stack implementation.",
    achievements: [
      "Deployed full-stack application to Azure",
      "Implemented CI/CD pipeline",
      "Achieved 99.9% uptime",
      "Completed all project requirements",
    ],
    submittedAt: "2024-01-10T16:45:00Z",
    status: "approved",
    grade: "A+",
    feedback: "Outstanding work! Exceeded all expectations. Excellent technical implementation.",
    reviewedBy: "Prof. Michael Chen",
    reviewedAt: "2024-01-11T09:30:00Z",
    fileName: "week12_report_sarah_wilson.pdf",
    company: "Microsoft",
  },
  {
    id: 6,
    studentId: 5,
    studentName: "Alex Brown",
    studentEmail: "alex.brown@charusat.edu.in",
    teacherId: 2,
    week: 3,
    title: "Machine Learning Model Training",
    description: "Worked on training deep learning models for image classification using TensorFlow and Keras.",
    achievements: [
      "Trained CNN model with 87% accuracy",
      "Implemented data augmentation techniques",
      "Optimized model performance",
    ],
    submittedAt: "2024-01-16T14:20:00Z",
    status: "pending",
    fileName: "week3_report_alex_brown.pdf",
    company: "Google",
  },
  {
    id: 7,
    studentId: 6,
    studentName: "Emily Davis",
    studentEmail: "emily.davis@charusat.edu.in",
    teacherId: 3,
    week: 10,
    title: "Cloud Infrastructure Setup",
    description: "Set up and configured cloud infrastructure using AWS services including EC2, S3, and RDS.",
    achievements: [
      "Configured auto-scaling EC2 instances",
      "Set up S3 buckets with proper security",
      "Implemented RDS with backup strategies",
    ],
    submittedAt: "2024-01-17T13:15:00Z",
    status: "approved",
    grade: "A",
    feedback: "Great work on cloud architecture. Shows good understanding of AWS services.",
    reviewedBy: "Prof. Michael Chen",
    reviewedAt: "2024-01-18T10:45:00Z",
    fileName: "week10_report_emily_davis.pdf",
    company: "Amazon",
  },
]

const mockCertificates: Certificate[] = [
  {
    id: 1,
    studentId: 1,
    studentName: "John Doe",
    studentEmail: "john.doe@charusat.edu.in",
    teacherId: 2,
    internshipTitle: "Software Developer Intern",
    company: "TechCorp Solutions",
    duration: "6 months",
    startDate: "2024-01-15",
    endDate: "2024-07-15",
    uploadDate: "2024-07-16T16:20:00Z",
    status: "pending",
    fileName: "certificate_john_doe_techcorp.pdf",
  },
  {
    id: 2,
    studentId: 2,
    studentName: "Jane Smith",
    studentEmail: "jane.smith@charusat.edu.in",
    teacherId: 2,
    internshipTitle: "Data Analyst Intern",
    company: "DataTech Analytics",
    duration: "4 months",
    startDate: "2024-02-01",
    endDate: "2024-06-01",
    uploadDate: "2024-06-02T09:15:00Z",
    status: "approved",
    approvedBy: "Dr. Sarah Wilson",
    approvedDate: "2024-06-03T10:30:00Z",
    feedback: "Certificate verified and approved. Excellent performance during internship.",
    fileName: "certificate_jane_smith_datatech.pdf",
  },
  {
    id: 3,
    studentId: 4,
    studentName: "Sarah Wilson",
    studentEmail: "sarah.wilson@charusat.edu.in",
    teacherId: 3,
    internshipTitle: "Software Engineer Intern",
    company: "Microsoft",
    duration: "5 months",
    startDate: "2023-12-01",
    endDate: "2024-05-01",
    uploadDate: "2024-05-02T14:30:00Z",
    status: "approved",
    approvedBy: "Prof. Michael Chen",
    approvedDate: "2024-05-03T09:45:00Z",
    feedback: "Outstanding performance and dedication throughout the internship period.",
    fileName: "certificate_sarah_wilson_microsoft.pdf",
  },
  {
    id: 4,
    studentId: 6,
    studentName: "Emily Davis",
    studentEmail: "emily.davis@charusat.edu.in",
    teacherId: 3,
    internshipTitle: "Cloud Engineer Intern",
    company: "Amazon",
    duration: "6 months",
    startDate: "2024-01-01",
    endDate: "2024-07-01",
    uploadDate: "2024-07-02T11:20:00Z",
    status: "pending",
    fileName: "certificate_emily_davis_amazon.pdf",
  },
  {
    id: 5,
    studentId: 3,
    studentName: "Mike Johnson",
    studentEmail: "mike.johnson@charusat.edu.in",
    teacherId: 2,
    internshipTitle: "Frontend Developer Intern",
    company: "WebTech Solutions",
    duration: "4 months",
    startDate: "2024-02-15",
    endDate: "2024-06-15",
    uploadDate: "2024-06-16T15:45:00Z",
    status: "rejected",
    feedback: "Certificate format does not meet university standards. Please resubmit with proper documentation.",
    fileName: "certificate_mike_johnson_webtech.pdf",
  },
]

const mockNOCRequests: NOCRequest[] = [
  {
    id: 1,
    studentId: 1,
    studentName: "John Doe",
    studentEmail: "john.doe@charusat.edu.in",
    company: "TechCorp Solutions",
    position: "Software Developer Intern",
    startDate: "2024-01-15",
    endDate: "2024-07-15",
    stipend: 15000,
    location: "Ahmedabad, Gujarat",
    description: "Full-stack development internship focusing on web applications and database management.",
    submittedAt: "2024-01-10T10:30:00Z",
    status: "approved",
    reviewedBy: "Dr. Sarah Wilson",
    reviewedAt: "2024-01-11T14:20:00Z",
    feedback: "Application approved. Best wishes for your internship.",
  },
  {
    id: 2,
    studentId: 2,
    studentName: "Jane Smith",
    studentEmail: "jane.smith@charusat.edu.in",
    company: "DataTech Analytics",
    position: "Data Analyst Intern",
    startDate: "2024-02-01",
    endDate: "2024-06-01",
    stipend: 12000,
    location: "Mumbai, Maharashtra",
    description: "Data analysis and machine learning internship with focus on business intelligence.",
    submittedAt: "2024-01-25T16:45:00Z",
    status: "pending",
  },
  {
    id: 3,
    studentId: 3,
    studentName: "Mike Johnson",
    studentEmail: "mike.johnson@charusat.edu.in",
    company: "WebTech Solutions",
    position: "Frontend Developer Intern",
    startDate: "2024-02-15",
    endDate: "2024-06-15",
    stipend: 10000,
    location: "Pune, Maharashtra",
    description: "Frontend development internship working on React-based applications.",
    submittedAt: "2024-02-10T11:15:00Z",
    status: "approved",
    reviewedBy: "Dr. Sarah Wilson",
    reviewedAt: "2024-02-11T09:30:00Z",
    feedback: "Approved. Company is verified and position aligns with your studies.",
  },
  {
    id: 4,
    studentId: 5,
    studentName: "Alex Brown",
    studentEmail: "alex.brown@charusat.edu.in",
    company: "Google",
    position: "ML Engineer Intern",
    startDate: "2024-03-01",
    endDate: "2024-08-01",
    stipend: 25000,
    location: "Bangalore, Karnataka",
    description: "Machine learning engineering internship working on AI/ML projects.",
    submittedAt: "2024-02-20T14:30:00Z",
    status: "pending",
  },
  {
    id: 5,
    studentId: 6,
    studentName: "Emily Davis",
    studentEmail: "emily.davis@charusat.edu.in",
    company: "Amazon",
    position: "Cloud Engineer Intern",
    startDate: "2024-01-01",
    endDate: "2024-07-01",
    stipend: 20000,
    location: "Hyderabad, Telangana",
    description: "Cloud infrastructure and DevOps internship focusing on AWS services.",
    submittedAt: "2023-12-20T10:00:00Z",
    status: "approved",
    reviewedBy: "Prof. Michael Chen",
    reviewedAt: "2023-12-21T15:45:00Z",
    feedback: "Excellent opportunity. Company is well-established and position is relevant.",
  },
  {
    id: 6,
    studentId: 7,
    studentName: "David Lee",
    studentEmail: "david.lee@charusat.edu.in",
    company: "StartupXYZ",
    position: "Backend Developer Intern",
    startDate: "2024-03-15",
    endDate: "2024-08-15",
    stipend: 8000,
    location: "Remote",
    description: "Backend development internship working on microservices architecture.",
    submittedAt: "2024-03-01T12:00:00Z",
    status: "rejected",
    reviewedBy: "Dr. Sarah Wilson",
    reviewedAt: "2024-03-02T10:30:00Z",
    feedback: "Company verification failed. Unable to verify legitimacy of the organization.",
  },
]

const mockCompanies: Company[] = [
  {
    id: 1,
    name: "TechCorp Solutions",
    email: "hr@techcorp.com",
    website: "https://techcorp.com",
    industry: "Information Technology",
    location: "Ahmedabad, Gujarat",
    description: "Leading software development company specializing in web and mobile applications.",
    verificationStatus: "verified",
    verifiedBy: "TP Officer",
    verifiedAt: "2024-01-10T09:30:00Z",
    contactPerson: "Rajesh Kumar",
    contactPhone: "+91 9876543210",
    establishedYear: 2015,
    employeeCount: "100-500",
    submittedAt: "2024-01-05T14:20:00Z",
  },
  {
    id: 2,
    name: "DataTech Analytics",
    email: "careers@datatech.com",
    website: "https://datatech.com",
    industry: "Data Analytics",
    location: "Mumbai, Maharashtra",
    description: "Data analytics and business intelligence solutions provider.",
    verificationStatus: "verified",
    verifiedBy: "TP Officer",
    verifiedAt: "2024-01-12T11:45:00Z",
    contactPerson: "Priya Sharma",
    contactPhone: "+91 9876543211",
    establishedYear: 2018,
    employeeCount: "50-100",
    submittedAt: "2024-01-08T11:45:00Z",
  },
  {
    id: 3,
    name: "WebTech Solutions",
    email: "info@webtech.com",
    website: "https://webtech.com",
    industry: "Web Development",
    location: "Pune, Maharashtra",
    description: "Frontend and full-stack web development company.",
    verificationStatus: "verified",
    verifiedBy: "TP Officer",
    verifiedAt: "2024-02-05T10:15:00Z",
    contactPerson: "Amit Patel",
    contactPhone: "+91 9876543212",
    establishedYear: 2020,
    employeeCount: "20-50",
    submittedAt: "2024-02-01T09:30:00Z",
  },
  {
    id: 4,
    name: "Microsoft",
    email: "university@microsoft.com",
    website: "https://microsoft.com",
    industry: "Technology",
    location: "Bangalore, Karnataka",
    description: "Global technology company providing cloud services and software solutions.",
    verificationStatus: "verified",
    verifiedBy: "TP Officer",
    verifiedAt: "2023-11-15T14:30:00Z",
    contactPerson: "Vikram Singh",
    contactPhone: "+91 9876543213",
    establishedYear: 1975,
    employeeCount: "1000+",
    submittedAt: "2023-11-10T16:00:00Z",
  },
  {
    id: 5,
    name: "Google",
    email: "internships@google.com",
    website: "https://google.com",
    industry: "Technology",
    location: "Bangalore, Karnataka",
    description: "Leading technology company specializing in internet services and AI.",
    verificationStatus: "verified",
    verifiedBy: "TP Officer",
    verifiedAt: "2024-02-10T12:00:00Z",
    contactPerson: "Neha Gupta",
    contactPhone: "+91 9876543214",
    establishedYear: 1998,
    employeeCount: "1000+",
    submittedAt: "2024-02-05T10:30:00Z",
  },
  {
    id: 6,
    name: "Amazon",
    email: "university@amazon.com",
    website: "https://amazon.com",
    industry: "E-commerce & Cloud",
    location: "Hyderabad, Telangana",
    description: "Global e-commerce and cloud computing company.",
    verificationStatus: "verified",
    verifiedBy: "TP Officer",
    verifiedAt: "2023-12-15T11:20:00Z",
    contactPerson: "Ravi Kumar",
    contactPhone: "+91 9876543215",
    establishedYear: 1994,
    employeeCount: "1000+",
    submittedAt: "2023-12-10T14:45:00Z",
  },
  {
    id: 7,
    name: "StartupXYZ",
    email: "hr@startupxyz.com",
    website: "https://startupxyz.com",
    industry: "Technology Startup",
    location: "Remote",
    description: "Early-stage startup working on innovative tech solutions.",
    verificationStatus: "pending",
    contactPerson: "John Smith",
    contactPhone: "+91 9876543216",
    establishedYear: 2023,
    employeeCount: "1-20",
    submittedAt: "2024-02-28T16:30:00Z",
  },
]

const mockOpportunities: Opportunity[] = [
  {
    id: 1,
    companyId: 1,
    companyName: "TechCorp Solutions",
    title: "Software Developer Intern",
    description:
      "Join our development team to work on cutting-edge web applications using modern technologies like React, Node.js, and MongoDB.",
    requirements: ["React.js", "Node.js", "MongoDB"],
    skills: ["JavaScript", "HTML/CSS", "Git"],
    location: "Ahmedabad, Gujarat",
    duration: "6 months",
    stipend: 15000,
    type: "internship",
    status: "active",
    postedBy: "HR Team",
    postedAt: "2024-01-01T10:00:00Z",
    deadline: "2024-02-01",
    positions: 5,
    applicants: 23,
  },
  {
    id: 2,
    companyId: 2,
    companyName: "DataTech Analytics",
    title: "Data Analyst Intern",
    description: "Work with our data science team on machine learning projects and business intelligence solutions.",
    requirements: ["Python", "SQL", "Machine Learning"],
    skills: ["Statistics", "Data Visualization", "Excel"],
    location: "Mumbai, Maharashtra",
    duration: "4 months",
    stipend: 12000,
    type: "internship",
    status: "active",
    postedBy: "Data Science Team",
    postedAt: "2024-01-05T14:30:00Z",
    deadline: "2024-02-15",
    positions: 3,
    applicants: 18,
  },
  {
    id: 3,
    companyId: 3,
    companyName: "WebTech Solutions",
    title: "Frontend Developer Intern",
    description: "Develop responsive and interactive user interfaces using React and modern CSS frameworks.",
    requirements: ["React.js", "CSS", "JavaScript"],
    skills: ["HTML", "Responsive Design", "UI/UX"],
    location: "Pune, Maharashtra",
    duration: "4 months",
    stipend: 10000,
    type: "internship",
    status: "active",
    postedBy: "Development Team",
    postedAt: "2024-01-10T11:15:00Z",
    deadline: "2024-02-20",
    positions: 2,
    applicants: 15,
  },
  {
    id: 4,
    companyId: 5,
    companyName: "Google",
    title: "Machine Learning Engineer Intern",
    description: "Work on cutting-edge AI/ML projects and contribute to Google's machine learning initiatives.",
    requirements: ["Python", "TensorFlow", "Machine Learning"],
    skills: ["Deep Learning", "Computer Vision", "NLP"],
    location: "Bangalore, Karnataka",
    duration: "5 months",
    stipend: 25000,
    type: "internship",
    status: "active",
    postedBy: "AI Research Team",
    postedAt: "2024-01-15T09:00:00Z",
    deadline: "2024-03-01",
    positions: 1,
    applicants: 45,
  },
  {
    id: 5,
    companyId: 6,
    companyName: "Amazon",
    title: "Cloud Engineer Intern",
    description: "Gain hands-on experience with AWS services and cloud infrastructure management.",
    requirements: ["AWS", "Linux", "DevOps"],
    skills: ["Docker", "Kubernetes", "CI/CD"],
    location: "Hyderabad, Telangana",
    duration: "6 months",
    stipend: 20000,
    type: "internship",
    status: "active",
    postedBy: "Cloud Infrastructure Team",
    postedAt: "2024-01-20T13:45:00Z",
    deadline: "2024-03-15",
    positions: 3,
    applicants: 32,
  },
  {
    id: 6,
    companyId: 4,
    companyName: "Microsoft",
    title: "Software Engineer Intern",
    description: "Contribute to Microsoft's enterprise software solutions and gain experience with .NET technologies.",
    requirements: ["C#", ".NET", "SQL Server"],
    skills: ["Object-Oriented Programming", "Web APIs", "Azure"],
    location: "Bangalore, Karnataka",
    duration: "5 months",
    stipend: 22000,
    type: "internship",
    status: "active",
    postedBy: "Engineering Team",
    postedAt: "2024-01-25T16:20:00Z",
    deadline: "2024-03-10",
    positions: 4,
    applicants: 38,
  },
  {
    id: 7,
    companyId: 1,
    companyName: "TechCorp Solutions",
    title: "Full Stack Developer Intern",
    description: "Work on both frontend and backend development for enterprise applications.",
    requirements: ["React.js", "Node.js", "PostgreSQL"],
    skills: ["Full Stack Development", "REST APIs", "Database Design"],
    location: "Ahmedabad, Gujarat",
    duration: "6 months",
    stipend: 18000,
    type: "internship",
    status: "active",
    postedBy: "Development Team",
    postedAt: "2024-02-01T10:30:00Z",
    deadline: "2024-03-20",
    positions: 2,
    applicants: 12,
  },
]

const mockUsers: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@charusat.edu.in",
    role: "student",
    department: "Computer Engineering",
    rollNumber: "21CE001",
    phone: "+91 9876543210",
    status: "active",
    lastLogin: "2024-01-15T10:30:00Z",
    createdAt: "2023-08-01T09:00:00Z",
  },
  {
    id: 2,
    name: "Dr. Sarah Wilson",
    email: "sarah.wilson@charusat.ac.in",
    role: "teacher",
    department: "Computer Engineering",
    employeeId: "EMP001",
    phone: "+91 9876543220",
    status: "active",
    lastLogin: "2024-01-15T08:45:00Z",
    createdAt: "2020-06-01T09:00:00Z",
  },
  {
    id: 3,
    name: "Prof. Michael Chen",
    email: "michael.chen@charusat.ac.in",
    role: "teacher",
    department: "Computer Engineering",
    employeeId: "EMP002",
    phone: "+91 9876543221",
    status: "active",
    lastLogin: "2024-01-14T16:20:00Z",
    createdAt: "2019-08-15T09:00:00Z",
  },
  {
    id: 4,
    name: "TP Officer",
    email: "tp@charusat.ac.in",
    role: "tp-officer",
    department: "T&P Cell",
    employeeId: "TPO001",
    phone: "+91 9876543230",
    status: "active",
    lastLogin: "2024-01-15T09:15:00Z",
    createdAt: "2021-01-01T09:00:00Z",
  },
  {
    id: 5,
    name: "Admin User",
    email: "admin@charusat.ac.in",
    role: "admin",
    department: "IT Department",
    employeeId: "ADM001",
    phone: "+91 9876543240",
    status: "active",
    lastLogin: "2024-01-15T07:30:00Z",
    createdAt: "2019-01-01T09:00:00Z",
  },
  {
    id: 6,
    name: "Jane Smith",
    email: "jane.smith@charusat.edu.in",
    role: "student",
    department: "Computer Engineering",
    rollNumber: "21CE002",
    phone: "+91 9876543211",
    status: "active",
    lastLogin: "2024-01-14T14:20:00Z",
    createdAt: "2023-08-01T09:00:00Z",
  },
  {
    id: 7,
    name: "Mike Johnson",
    email: "mike.johnson@charusat.edu.in",
    role: "student",
    department: "Computer Engineering",
    rollNumber: "21CE003",
    phone: "+91 9876543212",
    status: "active",
    lastLogin: "2024-01-12T11:30:00Z",
    createdAt: "2023-08-01T09:00:00Z",
  },
]

const mockSystemLogs: SystemLog[] = [
  {
    id: 1,
    userId: 1,
    userName: "John Doe",
    action: "Login",
    details: "User logged in successfully",
    timestamp: "2024-01-15T10:30:00Z",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    status: "success",
  },
  {
    id: 2,
    userId: 2,
    userName: "Dr. Sarah Wilson",
    action: "Report Review",
    details: "Approved weekly report #8 for John Doe",
    timestamp: "2024-01-15T09:45:00Z",
    ipAddress: "192.168.1.101",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    status: "success",
  },
  {
    id: 3,
    userId: 4,
    userName: "TP Officer",
    action: "NOC Approval",
    details: "Approved NOC request for John Doe - TechCorp Solutions",
    timestamp: "2024-01-11T14:20:00Z",
    ipAddress: "192.168.1.102",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    status: "success",
  },
  {
    id: 4,
    userId: 5,
    userName: "Admin User",
    action: "User Creation",
    details: "Created new student account for Emily Davis",
    timestamp: "2024-01-10T11:15:00Z",
    ipAddress: "192.168.1.103",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    status: "success",
  },
  {
    id: 5,
    userId: 3,
    userName: "Prof. Michael Chen",
    action: "Certificate Approval",
    details: "Approved internship certificate for Sarah Wilson - Microsoft",
    timestamp: "2024-05-03T09:45:00Z",
    ipAddress: "192.168.1.104",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    status: "success",
  },
  {
    id: 6,
    userId: 1,
    userName: "John Doe",
    action: "Report Submission",
    details: "Submitted Week 8 report for review",
    timestamp: "2024-01-15T10:30:00Z",
    ipAddress: "192.168.1.105",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
    status: "success",
  },
  {
    id: 7,
    userId: 2,
    userName: "Dr. Sarah Wilson",
    action: "Login Failed",
    details: "Failed login attempt with incorrect password",
    timestamp: "2024-01-14T08:20:00Z",
    ipAddress: "192.168.1.101",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    status: "error",
  },
]

const mockTasks: AssignedTask[] = [
  {
    id: 1,
    teacherId: 2,
    title: "Mid-term Presentation Preparation",
    description:
      "Prepare a comprehensive presentation covering your internship progress, key learnings, and future goals.",
    dueDate: "2024-02-15",
    assignedStudents: [1, 2, 3],
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z",
    isDeleted: false,
  },
  {
    id: 2,
    teacherId: 2,
    title: "Technical Documentation Review",
    description: "Review and update your project documentation including API docs and user guides.",
    dueDate: "2024-02-20",
    fileName: "documentation_guidelines.pdf",
    assignedStudents: [1],
    createdAt: "2024-01-18T14:30:00Z",
    updatedAt: "2024-01-18T14:30:00Z",
    isDeleted: false,
  },
  {
    id: 3,
    teacherId: 3,
    title: "Code Review Assignment",
    description: "Conduct peer code reviews and provide constructive feedback on coding practices.",
    dueDate: "2024-02-25",
    assignedStudents: [4, 6],
    createdAt: "2024-01-22T11:45:00Z",
    updatedAt: "2024-01-22T11:45:00Z",
    isDeleted: false,
  },
  {
    id: 4,
    teacherId: 2,
    title: "Industry Research Report",
    description: "Research current industry trends and prepare a detailed report on emerging technologies.",
    dueDate: "2024-03-01",
    assignedStudents: [1, 2, 3, 5],
    createdAt: "2024-01-25T09:30:00Z",
    updatedAt: "2024-01-25T09:30:00Z",
    isDeleted: false,
  },
  {
    id: 5,
    teacherId: 3,
    title: "Final Project Proposal",
    description: "Submit a detailed proposal for your final internship project including timeline and deliverables.",
    dueDate: "2024-02-28",
    assignedStudents: [4, 6],
    createdAt: "2024-01-28T16:15:00Z",
    updatedAt: "2024-01-28T16:15:00Z",
    isDeleted: false,
  },
]

const mockTaskStatuses: TaskStatus[] = [
  {
    id: 1,
    taskId: 1,
    studentId: 1,
    status: "seen",
  },
  {
    id: 2,
    taskId: 1,
    studentId: 2,
    status: "completed",
    completedAt: "2024-01-22T16:45:00Z",
    notes: "Presentation completed and ready for review",
  },
  {
    id: 3,
    taskId: 1,
    studentId: 3,
    status: "assigned",
  },
  {
    id: 4,
    taskId: 2,
    studentId: 1,
    status: "assigned",
  },
  {
    id: 5,
    taskId: 3,
    studentId: 4,
    status: "completed",
    completedAt: "2024-01-24T14:30:00Z",
    submissionFile: "code_review_sarah_wilson.pdf",
    notes: "Completed comprehensive code review with detailed feedback",
  },
  {
    id: 6,
    taskId: 3,
    studentId: 6,
    status: "seen",
  },
  {
    id: 7,
    taskId: 4,
    studentId: 1,
    status: "assigned",
  },
  {
    id: 8,
    taskId: 4,
    studentId: 2,
    status: "assigned",
  },
  {
    id: 9,
    taskId: 4,
    studentId: 3,
    status: "assigned",
  },
  {
    id: 10,
    taskId: 4,
    studentId: 5,
    status: "assigned",
  },
]

const mockApplications: Application[] = [
  {
    id: 1,
    opportunityId: 1,
    studentId: 1,
    studentName: "John Doe",
    studentEmail: "john.doe@charusat.edu.in",
    coverLetter:
      "I am excited to apply for the Software Developer Intern position at TechCorp Solutions. With my strong background in React.js and Node.js, I believe I can contribute effectively to your development team.",
    resumeFileName: "john_doe_resume.pdf",
    status: "submitted",
    submittedAt: "2024-01-05T14:30:00Z",
  },
  {
    id: 2,
    opportunityId: 2,
    studentId: 2,
    studentName: "Jane Smith",
    studentEmail: "jane.smith@charusat.edu.in",
    coverLetter:
      "I am writing to express my interest in the Data Analyst Intern position. My experience with Python and machine learning makes me a perfect fit for this role.",
    resumeFileName: "jane_smith_resume.pdf",
    status: "reviewed",
    submittedAt: "2024-01-08T11:20:00Z",
  },
  {
    id: 3,
    opportunityId: 3,
    studentId: 3,
    studentName: "Mike Johnson",
    studentEmail: "mike.johnson@charusat.edu.in",
    coverLetter:
      "I am passionate about frontend development and would love to contribute to WebTech Solutions' innovative projects using React and modern CSS frameworks.",
    resumeFileName: "mike_johnson_resume.pdf",
    status: "accepted",
    submittedAt: "2024-01-12T09:45:00Z",
  },
  {
    id: 4,
    opportunityId: 4,
    studentId: 5,
    studentName: "Alex Brown",
    studentEmail: "alex.brown@charusat.edu.in",
    coverLetter:
      "Working at Google on machine learning projects would be a dream come true. My experience with TensorFlow and deep learning aligns perfectly with this opportunity.",
    resumeFileName: "alex_brown_resume.pdf",
    status: "submitted",
    submittedAt: "2024-01-18T16:00:00Z",
  },
  {
    id: 5,
    opportunityId: 5,
    studentId: 6,
    studentName: "Emily Davis",
    studentEmail: "emily.davis@charusat.edu.in",
    coverLetter:
      "I am excited about the Cloud Engineer Intern position at Amazon. My knowledge of AWS services and DevOps practices makes me an ideal candidate.",
    resumeFileName: "emily_davis_resume.pdf",
    status: "accepted",
    submittedAt: "2024-01-22T13:15:00Z",
  },
]

// Export functions
export const getCurrentUser = () => {
  if (typeof window !== "undefined") {
    const userData = localStorage.getItem("user")
    return userData ? JSON.parse(userData) : null
  }
  return null
}

// Student functions
export const getStudentsByTeacher = (teacherId: number): Student[] => {
  return mockStudents.filter((student) => student.teacherId === teacherId)
}

export const getReportsByStudent = (studentId: number): WeeklyReport[] => {
  return mockReports.filter((report) => report.studentId === studentId)
}

export const getCertificatesByStudent = (studentId: number): Certificate[] => {
  return mockCertificates.filter((cert) => cert.studentId === studentId)
}

export const getNOCRequestsByStudent = (studentId: number): NOCRequest[] => {
  return mockNOCRequests.filter((noc) => noc.studentId === studentId)
}

// Teacher functions
export const getReportsByTeacher = (teacherId: number): WeeklyReport[] => {
  return mockReports.filter((report) => report.teacherId === teacherId)
}

export const getCertificatesByTeacher = (teacherId: number): Certificate[] => {
  return mockCertificates.filter((cert) => cert.teacherId === teacherId)
}

export const getTasksByTeacher = (teacherId: number): AssignedTask[] => {
  return mockTasks.filter((task) => task.teacherId === teacherId && !task.isDeleted)
}

export const getTaskStatuses = (taskId: number): TaskStatus[] => {
  return mockTaskStatuses.filter((status) => status.taskId === taskId)
}

// TP Officer functions
export const getAllNOCRequests = (): NOCRequest[] => {
  return mockNOCRequests
}

export const getAllCompanies = (): Company[] => {
  return mockCompanies
}

export const getAllOpportunities = (): Opportunity[] => {
  return mockOpportunities
}

export const getCompanyById = (companyId: number): Company | undefined => {
  return mockCompanies.find((company) => company.id === companyId)
}

export const getOpportunitiesByCompany = (companyId: number): Opportunity[] => {
  return mockOpportunities.filter((opp) => opp.companyId === companyId)
}

// Admin functions
export const getAllUsers = (): User[] => {
  return mockUsers
}

export const getAllSystemLogs = (): SystemLog[] => {
  return mockSystemLogs
}

export const getUsersByRole = (role: string): User[] => {
  return mockUsers.filter((user) => user.role === role)
}

export const getSystemStats = () => {
  return {
    totalUsers: mockUsers.length,
    activeUsers: mockUsers.filter((user) => user.status === "active").length,
    totalStudents: mockUsers.filter((user) => user.role === "student").length,
    totalTeachers: mockUsers.filter((user) => user.role === "teacher").length,
    totalReports: mockReports.length,
    totalCertificates: mockCertificates.length,
    totalCompanies: mockCompanies.length,
    totalOpportunities: mockOpportunities.length,
  }
}

// Create functions
export const createReport = (reportData: Omit<WeeklyReport, "id" | "submittedAt">) => {
  const newReport: WeeklyReport = {
    id: mockReports.length + 1,
    ...reportData,
    submittedAt: new Date().toISOString(),
  }
  mockReports.push(newReport)
  return newReport
}

// Alias for backward-compatibility with pages that expect this name.
export const createWeeklyReport = createReport

export const createCertificate = (certificateData: Omit<Certificate, "id" | "uploadDate">) => {
  const newCertificate: Certificate = {
    id: mockCertificates.length + 1,
    ...certificateData,
    uploadDate: new Date().toISOString(),
  }
  mockCertificates.push(newCertificate)
  return newCertificate
}

export const createNOCRequest = (nocData: Omit<NOCRequest, "id" | "submittedAt">) => {
  const newNOC: NOCRequest = {
    id: mockNOCRequests.length + 1,
    ...nocData,
    submittedAt: new Date().toISOString(),
  }
  mockNOCRequests.push(newNOC)
  return newNOC
}

export const createCompany = (companyData: Omit<Company, "id" | "submittedAt">) => {
  const newCompany: Company = {
    id: mockCompanies.length + 1,
    ...companyData,
    submittedAt: new Date().toISOString(),
  }
  mockCompanies.push(newCompany)
  return newCompany
}

export const createOpportunity = (opportunityData: Omit<Opportunity, "id" | "postedAt">) => {
  const newOpportunity: Opportunity = {
    id: mockOpportunities.length + 1,
    ...opportunityData,
    postedAt: new Date().toISOString(),
  }
  mockOpportunities.push(newOpportunity)
  return newOpportunity
}

export const createUser = (userData: Omit<User, "id" | "createdAt">) => {
  const newUser: User = {
    id: mockUsers.length + 1,
    ...userData,
    createdAt: new Date().toISOString(),
  }
  mockUsers.push(newUser)
  return newUser
}

// Applications
export const getApplicationsByStudent = (studentId: number): Application[] => {
  return mockApplications.filter((app) => app.studentId === studentId)
}

export const createApplication = (applicationData: Omit<Application, "id" | "submittedAt" | "status">) => {
  const newApplication: Application = {
    id: mockApplications.length + 1,
    status: "submitted",
    submittedAt: new Date().toISOString(),
    ...applicationData,
  }
  mockApplications.push(newApplication)
  return newApplication
}

// Update functions
export const approveReport = (reportId: number, feedback: string, grade: string) => {
  const reportIndex = mockReports.findIndex((report) => report.id === reportId)
  if (reportIndex !== -1) {
    mockReports[reportIndex] = {
      ...mockReports[reportIndex],
      status: "approved",
      feedback,
      grade,
      reviewedBy: "Dr. Sarah Wilson",
      reviewedAt: new Date().toISOString(),
    }
    return mockReports[reportIndex]
  }
  return null
}

export const rejectReport = (reportId: number, feedback: string) => {
  const reportIndex = mockReports.findIndex((report) => report.id === reportId)
  if (reportIndex !== -1) {
    mockReports[reportIndex] = {
      ...mockReports[reportIndex],
      status: "rejected",
      feedback,
      reviewedBy: "Dr. Sarah Wilson",
      reviewedAt: new Date().toISOString(),
    }
    return mockReports[reportIndex]
  }
  return null
}

export const requestRevision = (reportId: number, feedback: string) => {
  const reportIndex = mockReports.findIndex((report) => report.id === reportId)
  if (reportIndex !== -1) {
    mockReports[reportIndex] = {
      ...mockReports[reportIndex],
      status: "revision_required",
      feedback,
      reviewedBy: "Dr. Sarah Wilson",
      reviewedAt: new Date().toISOString(),
    }
    return mockReports[reportIndex]
  }
  return null
}

export const approveCertificate = (certificateId: number, feedback: string) => {
  const certIndex = mockCertificates.findIndex((cert) => cert.id === certificateId)
  if (certIndex !== -1) {
    mockCertificates[certIndex] = {
      ...mockCertificates[certIndex],
      status: "approved",
      feedback,
      approvedBy: "Dr. Sarah Wilson",
      approvedDate: new Date().toISOString(),
    }
    return mockCertificates[certIndex]
  }
  return null
}

export const rejectCertificate = (certificateId: number, feedback: string) => {
  const certIndex = mockCertificates.findIndex((cert) => cert.id === certificateId)
  if (certIndex !== -1) {
    mockCertificates[certIndex] = {
      ...mockCertificates[certIndex],
      status: "rejected",
      feedback,
      reviewedBy: "Dr. Sarah Wilson",
      reviewedAt: new Date().toISOString(),
    }
    return mockCertificates[certIndex]
  }
  return null
}

export const approveNOCRequest = (nocId: number, feedback: string) => {
  const nocIndex = mockNOCRequests.findIndex((noc) => noc.id === nocId)
  if (nocIndex !== -1) {
    mockNOCRequests[nocIndex] = {
      ...mockNOCRequests[nocIndex],
      status: "approved",
      feedback,
      reviewedBy: "TP Officer",
      reviewedAt: new Date().toISOString(),
    }
    return mockNOCRequests[nocIndex]
  }
  return null
}

export const rejectNOCRequest = (nocId: number, feedback: string) => {
  const nocIndex = mockNOCRequests.findIndex((noc) => noc.id === nocId)
  if (nocIndex !== -1) {
    mockNOCRequests[nocIndex] = {
      ...mockNOCRequests[nocIndex],
      status: "rejected",
      feedback,
      reviewedBy: "TP Officer",
      reviewedAt: new Date().toISOString(),
    }
    return mockNOCRequests[nocIndex]
  }
  return null
}

export const verifyCompany = (companyId: number) => {
  const companyIndex = mockCompanies.findIndex((company) => company.id === companyId)
  if (companyIndex !== -1) {
    mockCompanies[companyIndex] = {
      ...mockCompanies[companyIndex],
      verificationStatus: "verified",
      verifiedBy: "TP Officer",
      verifiedAt: new Date().toISOString(),
    }
    return mockCompanies[companyIndex]
  }
  return null
}

export const rejectCompany = (companyId: number) => {
  const companyIndex = mockCompanies.findIndex((company) => company.id === companyId)
  if (companyIndex !== -1) {
    mockCompanies[companyIndex] = {
      ...mockCompanies[companyIndex],
      verificationStatus: "rejected",
      verifiedBy: "TP Officer",
      verifiedAt: new Date().toISOString(),
    }
    return mockCompanies[companyIndex]
  }
  return null
}

export const createTask = (taskData: Omit<AssignedTask, "id" | "createdAt" | "updatedAt" | "isDeleted">) => {
  const newTask: AssignedTask = {
    id: mockTasks.length + 1,
    ...taskData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDeleted: false,
  }
  mockTasks.push(newTask)

  // Create task statuses for assigned students
  taskData.assignedStudents.forEach((studentId) => {
    mockTaskStatuses.push({
      id: mockTaskStatuses.length + 1,
      taskId: newTask.id,
      studentId,
      status: "assigned",
    })
  })

  return newTask
}

export const updateTask = (taskId: number, updates: Partial<AssignedTask>) => {
  const taskIndex = mockTasks.findIndex((task) => task.id === taskId)
  if (taskIndex !== -1) {
    mockTasks[taskIndex] = {
      ...mockTasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    return mockTasks[taskIndex]
  }
  return null
}

export const deleteTask = (taskId: number) => {
  const taskIndex = mockTasks.findIndex((task) => task.id === taskId)
  if (taskIndex !== -1) {
    mockTasks[taskIndex].isDeleted = true
    mockTasks[taskIndex].updatedAt = new Date().toISOString()
    return true
  }
  return false
}

export const updateUser = (userId: number, updates: Partial<User>) => {
  const userIndex = mockUsers.findIndex((user) => user.id === userId)
  if (userIndex !== -1) {
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...updates,
    }
    return mockUsers[userIndex]
  }
  return null
}

export const deleteUser = (userId: number) => {
  const userIndex = mockUsers.findIndex((user) => user.id === userId)
  if (userIndex !== -1) {
    mockUsers[userIndex].status = "inactive"
    return true
  }
  return false
}

// Dashboard data functions
export const getTeacherDashboardData = (teacherId: number) => {
  const students = getStudentsByTeacher(teacherId)
  const reports = getReportsByTeacher(teacherId)
  const certificates = getCertificatesByTeacher(teacherId)
  const tasks = getTasksByTeacher(teacherId)

  return {
    stats: {
      totalStudents: students.length,
      pendingReports: reports.filter((r) => r.status === "pending").length,
      approvedReports: reports.filter((r) => r.status === "approved").length,
      certificatesToReview: certificates.filter((c) => c.status === "pending").length,
      activeTasks: tasks.length,
    },
    recentActivities: [
      ...reports.slice(-3).map((report) => ({
        type: "report",
        title: `${report.studentName} submitted Week ${report.week} report`,
        time: report.submittedAt,
        status: report.status,
      })),
      ...certificates.slice(-2).map((cert) => ({
        type: "certificate",
        title: `${cert.studentName} uploaded certificate`,
        time: cert.uploadDate,
        status: cert.status,
      })),
    ],
  }
}

export const getStudentDashboardData = (studentId: number) => {
  const reports = getReportsByStudent(studentId)
  const certificates = getCertificatesByStudent(studentId)
  const nocRequests = getNOCRequestsByStudent(studentId)

  return {
    stats: {
      totalReports: reports.length,
      approvedReports: reports.filter((r) => r.status === "approved").length,
      pendingReports: reports.filter((r) => r.status === "pending").length,
      totalCertificates: certificates.length,
      approvedCertificates: certificates.filter((c) => c.status === "approved").length,
      nocRequests: nocRequests.length,
      approvedNOCs: nocRequests.filter((n) => n.status === "approved").length,
    },
    recentActivities: [
      ...reports.slice(-3).map((report) => ({
        type: "report",
        title: `Week ${report.week} report submitted`,
        time: report.submittedAt,
        status: report.status,
      })),
      ...certificates.slice(-2).map((cert) => ({
        type: "certificate",
        title: `Certificate uploaded for ${cert.company}`,
        time: cert.uploadDate,
        status: cert.status,
      })),
    ],
  }
}

export const getTPOfficerDashboardData = () => {
  const nocRequests = getAllNOCRequests()
  const companies = getAllCompanies()
  const opportunities = getAllOpportunities()

  return {
    stats: {
      pendingNOCs: nocRequests.filter((n) => n.status === "pending").length,
      approvedNOCs: nocRequests.filter((n) => n.status === "approved").length,
      totalCompanies: companies.length,
      verifiedCompanies: companies.filter((c) => c.verificationStatus === "verified").length,
      pendingCompanies: companies.filter((c) => c.verificationStatus === "pending").length,
      totalOpportunities: opportunities.length,
      activeOpportunities: opportunities.filter((o) => o.status === "active").length,
    },
    recentActivities: [
      ...nocRequests.slice(-3).map((noc) => ({
        type: "noc",
        title: `NOC request from ${noc.studentName}`,
        time: noc.submittedAt,
        status: noc.status,
      })),
      ...companies.slice(-2).map((company) => ({
        type: "company",
        title: `Company registration: ${company.name}`,
        time: company.submittedAt,
        status: company.verificationStatus,
      })),
    ],
  }
}

export const getAdminDashboardData = () => {
  const users = getAllUsers()
  const logs = getAllSystemLogs()
  const stats = getSystemStats()

  return {
    stats,
    recentActivities: logs.slice(-5).map((log) => ({
      type: "system",
      title: `${log.userName}: ${log.action}`,
      time: log.timestamp,
      status: log.status,
    })),
    systemHealth: [
      { component: "Database", status: "healthy", uptime: 99.9 },
      { component: "Authentication", status: "healthy", uptime: 100 },
      { component: "File Storage", status: "warning", uptime: 98.5 },
      { component: "Email Service", status: "healthy", uptime: 99.7 },
    ],
  }
}

export const getTeacherAnalytics = (teacherId: number) => {
  const students = getStudentsByTeacher(teacherId)
  const reports = getReportsByTeacher(teacherId)
  const certificates = getCertificatesByTeacher(teacherId)

  return {
    totalStudents: students.length,
    reportsReviewed: reports.filter((r) => r.status !== "pending").length,
    certificatesApproved: certificates.filter((c) => c.status === "approved").length,
    avgResponseTime: 24,
    gradeDistribution: [
      { grade: "A+", count: 5, percentage: 25 },
      { grade: "A", count: 8, percentage: 40 },
      { grade: "B+", count: 4, percentage: 20 },
      { grade: "B", count: 2, percentage: 10 },
      { grade: "C", count: 1, percentage: 5 },
    ],
    monthlyActivity: [
      { month: "Jan", reviews: 12 },
      { month: "Feb", reviews: 18 },
      { month: "Mar", reviews: 15 },
      { month: "Apr", reviews: 22 },
      { month: "May", reviews: 20 },
      { month: "Jun", reviews: 25 },
    ],
    studentStatus: {
      onTrack: students.filter((s) => s.status === "active" && s.progress >= 70).length,
      needAttention: students.filter((s) => s.status === "active" && s.progress < 70).length,
      completed: students.filter((s) => s.status === "completed").length,
    },
    thisWeek: {
      reports: 8,
    },
    thisMonth: {
      certificates: 5,
    },
    efficiency: 94,
  }
}
