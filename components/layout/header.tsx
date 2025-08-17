// components/layout/header.tsx - Fixed Header Component
"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Menu, Bell, Settings, LogOut, User, Moon, Sun, Shield } from "lucide-react"
import { logout } from "@/lib/auth"
import { useState, useCallback, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"

interface HeaderProps {
  onMenuClick: () => void
  user: any
  pageTitle?: string
}

export function Header({ onMenuClick, user, pageTitle = "Dashboard" }: HeaderProps) {
  const [darkMode, setDarkMode] = useState(false)
  const { toast } = useToast()

  // Memoize static values
  const notifications = useMemo(() => 3, []) // Mock notification count

  // Memoize user-related computations
  const userInitials = useMemo(() => {
    if (!user?.name) return "U"
    return user.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
  }, [user?.name])

  const userRoleFormatted = useMemo(() => {
    if (!user?.role) return "User"
    return user.role.replace("-", " ").split(" ").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ")
  }, [user?.role])

  const userEmail = useMemo(() => {
    return user?.email || "No email"
  }, [user?.email])

  const userEmployeeId = useMemo(() => {
    return user?.employeeId || user?.rollNumber || null
  }, [user?.employeeId, user?.rollNumber])

  // Memoize callback functions
  const handleLogout = useCallback(() => {
    try {
      toast({
        title: "Signing Out",
        description: "You are being logged out...",
      })
      
      // Small delay for better UX
      setTimeout(() => {
        logout()
      }, 500)
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Logout Error",
        description: "There was an error signing out. Please try again.",
        variant: "destructive",
      })
    }
  }, [toast])

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const newMode = !prev
      // Add dark mode logic here
      toast({
        title: newMode ? "Dark Mode" : "Light Mode",
        description: `Switched to ${newMode ? "dark" : "light"} mode`,
      })
      return newMode
    })
  }, [toast])

  const handleMenuClick = useCallback(() => {
    onMenuClick()
  }, [onMenuClick])

  // Memoize role-related functions
  const getRoleIcon = useCallback((role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-3 w-3" />
      default:
        return null
    }
  }, [])

  const getRoleBadgeColor = useCallback((role: string) => {
    switch (role) {
      case "student":
        return "bg-blue-100 text-blue-700 hover:bg-blue-200"
      case "teacher":
        return "bg-green-100 text-green-700 hover:bg-green-200"
      case "tp-officer":
        return "bg-purple-100 text-purple-700 hover:bg-purple-200"
      case "admin":
        return "bg-orange-100 text-orange-700 hover:bg-orange-200"
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }
  }, [])

  // Memoize badge props to prevent recreation
  const roleBadgeProps = useMemo(() => {
    if (!user?.role) return null
    return {
      className: getRoleBadgeColor(user.role),
      children: (
        <>
          {getRoleIcon(user.role)}
          <span className={user.role === "admin" ? "ml-1" : ""}>
            {userRoleFormatted}
          </span>
        </>
      )
    }
  }, [user?.role, getRoleBadgeColor, getRoleIcon, userRoleFormatted])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={handleMenuClick}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Page title area */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">
            {pageTitle}
          </h1>
          {user?.role === "admin" && roleBadgeProps && (
            <Badge variant="outline" className={roleBadgeProps.className}>
              {roleBadgeProps.children}
            </Badge>
          )}
        </div>
        {user?.department && (
          <p className="text-xs text-gray-500 mt-0.5">
            {user.department}
          </p>
        )}
      </div>

      {/* Header actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Dark mode toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleDarkMode} 
          className="hidden sm:flex"
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
          {notifications > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {notifications > 99 ? "99+" : notifications}
            </Badge>
          )}
          <span className="sr-only">
            {notifications} notification{notifications !== 1 ? "s" : ""}
          </span>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="end" forceMount>
            {/* User Info Section */}
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium text-sm">{user?.name || "Unknown User"}</p>
                <p className="w-[200px] truncate text-xs text-muted-foreground">
                  {userEmail}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {roleBadgeProps && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${roleBadgeProps.className}`}
                    >
                      {roleBadgeProps.children}
                    </Badge>
                  )}
                </div>
                {userEmployeeId && (
                  <p className="text-xs text-muted-foreground">
                    ID: {userEmployeeId}
                  </p>
                )}
              </div>
            </div>
            <DropdownMenuSeparator />
            
            {/* Menu Items */}
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            
            {/* Mobile dark mode toggle */}
            <DropdownMenuItem 
              className="cursor-pointer sm:hidden"
              onClick={toggleDarkMode}
            >
              {darkMode ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
              {darkMode ? "Light Mode" : "Dark Mode"}
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout} 
              className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}