// lib/auth.ts - Legacy Authentication System (for compatibility)
export interface User {
  id: number | string
  email: string
  role: "student" | "teacher" | "tp-officer" | "admin"
  name: string
  loginTime: string
  department?: string
  designation?: string
  employeeId?: string
  phone?: string
  rollNumber?: string
}

// Mock users database with proper role assignments
const mockUsers: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@charusat.edu.in",
    role: "student",
    loginTime: new Date().toISOString(),
    department: "Computer Engineering",
    phone: "+91 9876543210",
    rollNumber: "22CE045"
  },
  {
    id: 2,
    name: "Dr. Sarah Wilson",
    email: "sarah.wilson@charusat.ac.in",
    role: "teacher",
    loginTime: new Date().toISOString(),
    department: "Computer Engineering",
    designation: "Associate Professor",
    employeeId: "EMP001",
    phone: "+91 9876543212",
  },
  {
    id: 3,
    name: "Dr. Rajesh Gupta",
    email: "tp@charusat.ac.in",
    role: "tp-officer",
    loginTime: new Date().toISOString(),
    department: "Training & Placement",
    designation: "T&P Officer",
    employeeId: "TPO001",
    phone: "+91 9876543213",
  },
  {
    id: 4,
    name: "Admin User",
    email: "admin@charusat.ac.in",
    role: "admin",
    loginTime: new Date().toISOString(),
    department: "Administration",
    designation: "System Administrator",
    employeeId: "ADM001",
    phone: "+91 9876543214",
  },
]

// Enhanced role detection with better validation
export const getUserRole = (email: string): string | null => {
  if (!email || typeof email !== 'string') return null
  
  const normalizedEmail = email.toLowerCase().trim()
  
  if (normalizedEmail.endsWith("@charusat.edu.in")) {
    return "student"
  } else if (normalizedEmail.endsWith("@charusat.ac.in")) {
    // Check for specific admin accounts
    if (normalizedEmail.includes("admin") || normalizedEmail === "admin@charusat.ac.in") {
      return "admin"
    } 
    // Check for T&P officer accounts
    else if (normalizedEmail.includes("tp") || normalizedEmail === "tp@charusat.ac.in") {
      return "tp-officer"
    } 
    // All other @charusat.ac.in emails are teachers
    else {
      return "teacher"
    }
  }
  return null
}

// Enhanced user creation from email
export const getNameFromEmail = (email: string): string => {
  if (!email) return "Unknown User"
  
  const name = email.split("@")[0]
  return name
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

// Safe localStorage operations with error handling - DEPRECATED
export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null

  try {
    // Check if we're using Supabase auth
    const supabaseAuth = require('./auth-supabase')
    if (supabaseAuth && supabaseAuth.getCurrentUser) {
      // This is async, but we'll return null and let the caller use the async version
      return null
    }
  } catch (e) {
    // Fallback to localStorage
  }

  try {
    const userData = localStorage.getItem("user")
    if (!userData) return null
    
    const user = JSON.parse(userData)
    
    // Validate user object structure
    if (user && user.id && user.email && user.role && user.name) {
      return user
    }
    
    // Remove invalid user data
    localStorage.removeItem("user")
    return null
  } catch (error) {
    console.error("Error reading user data:", error)
    if (typeof window !== "undefined") {
      localStorage.removeItem("user")
    }
    return null
  }
}

export const setCurrentUser = (user: User | null) => {
  if (typeof window === "undefined") return

  try {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user))
    } else {
      localStorage.removeItem("user")
    }
  } catch (error) {
    console.error("Error saving user data:", error)
  }
}

// Enhanced login with better validation and error handling - DEPRECATED
export const loginUser = (email: string): User | null => {
  if (!email || typeof email !== 'string') return null
  
  const normalizedEmail = email.toLowerCase().trim()
  const role = getUserRole(normalizedEmail)
  
  if (!role) return null
  
  // Try to find existing user or create new one
  let user = mockUsers.find((u) => u.email.toLowerCase() === normalizedEmail)
  
  if (!user) {
    // Create new user if not found
    user = {
      id: Math.floor(Math.random() * 10000) + 1000,
      email: normalizedEmail,
      role: role as "student" | "teacher" | "tp-officer" | "admin",
      name: getNameFromEmail(normalizedEmail),
      loginTime: new Date().toISOString(),
      department: role === "student" ? "Computer Engineering" : 
                 role === "teacher" ? "Computer Engineering" :
                 role === "tp-officer" ? "Training & Placement" : "Administration"
    }
  } else {
    // Update login time for existing user
    user = {
      ...user,
      loginTime: new Date().toISOString(),
    }
  }
  
  setCurrentUser(user)
  return user
}

// Enhanced logout with proper cleanup - DEPRECATED
export const logout = () => {
  if (typeof window !== "undefined") {
    try {
      // Try Supabase logout first
      const supabaseAuth = require('./auth-supabase')
      if (supabaseAuth && supabaseAuth.logout) {
        supabaseAuth.logout()
        return
      }
    } catch (e) {
      // Fallback to localStorage cleanup
    }

    try {
      localStorage.removeItem("user")
      localStorage.removeItem("authToken")
      localStorage.removeItem("refreshToken")
      
      // Redirect to auth page
      window.location.href = "/auth"
    } catch (error) {
      console.error("Error during logout:", error)
      window.location.href = "/auth"
    }
  }
}

// Enhanced auth requirement check
export const requireAuth = (allowedRoles?: string[]) => {
  const user = getCurrentUser()

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/auth"
    }
    return null
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard/" + user.role
    }
    return null
  }

  return user
}

// Utility function to check if user has specific role
export const hasRole = (requiredRole: string): boolean => {
  const user = getCurrentUser()
  return user ? user.role === requiredRole : false
}

// Utility function to check if user has any of the specified roles
export const hasAnyRole = (requiredRoles: string[]): boolean => {
  const user = getCurrentUser()
  return user ? requiredRoles.includes(user.role) : false
}

// Function to get dashboard path for user role
export const getDashboardPath = (role: string): string => {
  return `/dashboard/${role}`
}

// Function to validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Function to validate institutional email
export const isValidInstitutionalEmail = (email: string): boolean => {
  if (!isValidEmail(email)) return false
  
  const normalizedEmail = email.toLowerCase().trim()
  return normalizedEmail.endsWith("@charusat.edu.in") || normalizedEmail.endsWith("@charusat.ac.in")
}

// Extract user data based on email and role
export const extractUserData = (email: string, role: string) => {
  let department = ''
  let rollNumber = ''
  let employeeId = ''

  if (role === 'student') {
    department = getDepartmentFromEmail(email)
    rollNumber = getRollNumberFromEmail(email) || ''
  } else if (role === 'teacher') {
    department = getDepartmentFromEmail(email) || 'Computer Engineering'
  } else if (role === 'tp-officer') {
    department = 'Training & Placement'
    employeeId = 'TPO' + Math.random().toString(36).substr(2, 6).toUpperCase()
  } else if (role === 'admin') {
    department = 'Administration'
    employeeId = 'ADM' + Math.random().toString(36).substr(2, 6).toUpperCase()
  }

  return { department, rollNumber, employeeId }
}

// Helper to extract department from student email
const getDepartmentFromEmail = (email: string): string => {
  const rollPattern = email.match(/(\d{2})([A-Z]{2})/);
  if (rollPattern) {
    const deptCode = rollPattern[2];
    const departmentMap: { [key: string]: string } = {
      'CE': 'Computer Engineering',
      'IT': 'Information Technology',
      'EC': 'Electronics & Communication',
      'ME': 'Mechanical Engineering',
      'CL': 'Civil Engineering',
      'CH': 'Chemical Engineering',
      'EE': 'Electrical Engineering',
      'IC': 'Instrumentation & Control',
      'CS': 'Computer Science'
    };
    return departmentMap[deptCode] || 'Computer Engineering';
  }
  return 'Computer Engineering';
}

// Helper to extract roll number from student email
const getRollNumberFromEmail = (email: string): string | undefined => {
  const rollPattern = email.match(/(\d{2}[A-Z]{2}\d{3})/);
  return rollPattern ? rollPattern[1] : undefined;
}

// Check if user has permission
export const hasPermission = (user: User, requiredRole: string): boolean => {
  const roleHierarchy = ['student', 'teacher', 'tp-officer', 'admin'];
  const userRoleIndex = roleHierarchy.indexOf(user.role);
  const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
  
  return userRoleIndex >= requiredRoleIndex;
}