'use client'

import { useEffect, useState } from 'react'
import { BookOpen, Calendar, FileText, CreditCard } from 'lucide-react'

export default function StudentDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/dashboard/stats')
        const data = await res.json()
        if (data.success) {
          setStats(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div
          className="h-7 w-7 animate-spin rounded-full"
          style={{ border: '3px solid #e2e8f0', borderTopColor: '#0d9488' }}
        />
      </div>
    )
  }

  const attendancePct = stats?.attendancePercentage ?? 0
  const isLowAttendance = attendancePct < 75

  const cards = [
    {
      key: 'enrolledCourses',
      label: 'Enrolled Courses',
      sub: 'Current semester',
      Icon: BookOpen,
      bg: '#f0f9ff',
      border: '#bae6fd',
      iconBg: '#0ea5e9',
      valueColor: '#0369a1',
      value: stats?.enrolledCourses ?? 0,
    },
    {
      key: 'attendancePercentage',
      label: 'Attendance %',
      sub: isLowAttendance ? 'Below 75% threshold' : 'Overall attendance',
      Icon: Calendar,
      bg: isLowAttendance ? '#fff4f0' : '#f0fdf4',
      border: isLowAttendance ? '#fecab0' : '#bbf7d0',
      iconBg: isLowAttendance ? '#f97316' : '#22c55e',
      valueColor: isLowAttendance ? '#c2410c' : '#15803d',
      value: `${attendancePct}%`,
    },
    {
      key: 'averageGrade',
      label: 'Average Grade',
      sub: 'Across assessments',
      Icon: FileText,
      bg: '#fffbeb',
      border: '#fde68a',
      iconBg: '#f59e0b',
      valueColor: '#b45309',
      value: stats?.averageGrade ?? 0,
    },
    {
      key: 'pendingInvoices',
      label: 'Pending Fees',
      sub: 'Unpaid invoices',
      Icon: CreditCard,
      bg: '#fff4f0',
      border: '#fecab0',
      iconBg: '#f97316',
      valueColor: '#c2410c',
      value: stats?.pendingInvoices ?? 0,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#0f172a' }}>
          Student Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">Your academic overview</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.Icon
          return (
            <div
              key={card.key}
              className="rounded-xl p-5"
              style={{
                background: card.bg,
                border: `1px solid ${card.border}`,
              }}
            >
              <div className="mb-4 flex items-center justify-between">
                <span
                  className="text-[13px] font-medium"
                  style={{ color: '#64748b' }}
                >
                  {card.label}
                </span>
                <div
                  className="flex h-9 w-9 items-center justify-center text-white"
                  style={{ background: card.iconBg, borderRadius: '8px' }}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div
                className="text-[28px] font-bold leading-none"
                style={{ color: card.valueColor }}
              >
                {card.value}
              </div>
              <p className="mt-1.5 text-[12px]" style={{ color: '#94a3b8' }}>
                {card.sub}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
