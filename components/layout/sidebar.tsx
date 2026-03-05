'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  FileText,
  CreditCard,
  Settings,
  LogOut,
} from 'lucide-react'

interface SidebarProps {
  role: 'ADMIN' | 'STUDENT' | 'PROFESSOR'
}

const adminMenuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/students', label: 'Students', icon: Users },
  { href: '/admin/professors', label: 'Professors', icon: GraduationCap },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/enrollments', label: 'Enrollments', icon: Calendar },
  { href: '/admin/attendance', label: 'Attendance', icon: FileText },
  { href: '/admin/grades', label: 'Grades', icon: FileText },
  { href: '/admin/fees', label: 'Fees', icon: CreditCard },
]

const studentMenuItems = [
  { href: '/student', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/student/courses', label: 'My Courses', icon: BookOpen },
  { href: '/student/attendance', label: 'Attendance', icon: Calendar },
  { href: '/student/grades', label: 'Grades', icon: FileText },
  { href: '/student/fees', label: 'Fees', icon: CreditCard },
]

const professorMenuItems = [
  { href: '/professor', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/professor/courses', label: 'My Courses', icon: BookOpen },
  { href: '/professor/attendance', label: 'Mark Attendance', icon: Calendar },
  { href: '/professor/grades', label: 'Enter Grades', icon: FileText },
]

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()

  const menuItems =
    role === 'ADMIN'
      ? adminMenuItems
      : role === 'STUDENT'
      ? studentMenuItems
      : professorMenuItems

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold">College ERP</h1>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  )
}
