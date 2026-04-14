'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  FileText,
  CreditCard,
  LogOut,
  PlusCircle,
  UserPlus,
} from 'lucide-react'

interface SidebarProps {
  role: 'ADMIN' | 'STUDENT' | 'PROFESSOR'
  userName?: string
  userEmail?: string
}

const adminMenuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/students', label: 'Students', icon: Users },
  { href: '/admin/professors', label: 'Professors', icon: GraduationCap },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/enrollments', label: 'Enrollments', icon: Calendar },
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
  { href: '/professor/offerings', label: 'Create offering', icon: PlusCircle },
  { href: '/professor/enrollments', label: 'Enroll students', icon: UserPlus },
  { href: '/professor/attendance', label: 'Sessions & attendance', icon: Calendar },
  { href: '/professor/grades', label: 'Assessments & grades', icon: FileText },
]

export function Sidebar({ role, userName, userEmail }: SidebarProps) {
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

  const initials = userName
    ? userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : role[0]

  return (
    <div
      className="flex h-screen w-64 flex-col"
      style={{ background: '#1a2332' }}
    >
      {/* Brand */}
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{ borderBottom: '0.5px solid #2a3547' }}
      >
        <div
          className="flex h-9 w-9 items-center justify-center text-sm font-bold text-white"
          style={{ background: '#0d9488', borderRadius: '7px' }}
        >
          E
        </div>
        <div>
          <h1 className="text-[15px] font-semibold" style={{ color: '#ffffff' }}>
            College ERP
          </h1>
          <p className="text-[11px]" style={{ color: '#64748b' }}>
            IIIT Vadodara
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors"
              style={{
                borderLeft: '2px solid',
                borderColor: isActive ? '#0d9488' : 'transparent',
                background: isActive ? 'rgba(13,148,136,0.15)' : 'transparent',
                color: isActive ? '#5eead4' : '#64748b',
              }}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-4 py-3" style={{ borderTop: '0.5px solid #2a3547' }}>
        <div className="mb-3 flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: '#0d9488' }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-[13px] font-medium"
              style={{ color: '#cbd5e1' }}
            >
              {userName || role}
            </p>
            {userEmail && (
              <p
                className="truncate text-[11px]"
                style={{ color: '#64748b' }}
              >
                {userEmail}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors hover:opacity-80"
          style={{ color: '#64748b' }}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  )
}
