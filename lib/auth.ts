export interface User {
  id: number
  email: string
  role: "student" | "teacher" | "tp-officer" | "admin"
  name: string
  loginTime: string
  department?: string
  designation?: string
  employeeId?: string
  phone?: string
}

// Mock users database
const mockUsers: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@charusat.edu.in",
    role: "student",
    loginTime: new Date().toISOString(),
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
  },
]

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null

  const userData = localStorage.getItem("user")
  if (!userData) return null

  try {
    return JSON.parse(userData)
  } catch {
    return null
  }
}

export const setCurrentUser = (user: User | null) => {
  if (typeof window === "undefined") return

  if (user) {
    localStorage.setItem("user", JSON.stringify(user))
  } else {
    localStorage.removeItem("user")
  }
}

export const loginUser = (email: string): User | null => {
  const user = mockUsers.find((u) => u.email === email)
  if (user) {
    const userWithLoginTime = {
      ...user,
      loginTime: new Date().toISOString(),
    }
    setCurrentUser(userWithLoginTime)
    return userWithLoginTime
  }
  return null
}

export const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user")
    window.location.href = "/auth"
  }
}

export const requireAuth = (allowedRoles?: string[]) => {
  const user = getCurrentUser()

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/auth"
    }
    return null
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard/" + user.role
    }
    return null
  }

  return user
}

export const getUserRole = (email: string): string | null => {
  if (email.endsWith("@charusat.edu.in")) {
    return "student"
  } else if (email.endsWith("@charusat.ac.in")) {
    if (email.includes("admin") || email === "admin@charusat.ac.in") {
      return "admin"
    } else if (email.includes("tp") || email === "tp@charusat.ac.in") {
      return "tp-officer"
    } else {
      return "teacher"
    }
  }
  return null
}

export const getNameFromEmail = (email: string): string => {
  const name = email.split("@")[0]
  return name
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}
