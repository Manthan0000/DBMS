'use client'

import { useEffect, useState } from 'react'
import { BookOpen, Users } from 'lucide-react'

export default function ProfessorDashboard() {
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

  const cards = [
    {
      label: 'Courses Teaching',
      sub: 'Active sections',
      Icon: BookOpen,
      bg: '#f0fdf4',
      border: '#bbf7d0',
      iconBg: '#22c55e',
      valueColor: '#15803d',
      value: stats?.coursesTeaching || 0,
    },
    {
      label: 'Total Students',
      sub: 'Enrolled students',
      Icon: Users,
      bg: '#f0f9ff',
      border: '#bae6fd',
      iconBg: '#0ea5e9',
      valueColor: '#0369a1',
      value: stats?.totalStudents || 0,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#0f172a' }}>
          Professor Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">Your teaching overview</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.Icon
          return (
            <div
              key={card.label}
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
