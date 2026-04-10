'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ProfessorOfferingsPage() {
  const [departmentId, setDepartmentId] = useState<string | null>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [terms, setTerms] = useState<any[]>([])
  const [courseId, setCourseId] = useState('')
  const [termId, setTermId] = useState('')
  const [section, setSection] = useState('')
  const [capacity, setCapacity] = useState('30')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      try {
        const meRes = await fetch('/api/auth/me')
        const meData = await meRes.json()
        const dept = meData.success ? meData.data?.professor?.department_id : null
        setDepartmentId(dept ?? null)

        const [cRes, tRes] = await Promise.all([
          dept ? fetch(`/api/courses?departmentId=${dept}`) : Promise.resolve(null as any),
          fetch('/api/terms'),
        ])
        if (cRes) {
          const cData = await cRes.json()
          if (cData.success) setCourses(cData.data)
        }
        const tData = await tRes.json()
        if (tData.success) {
          setTerms(tData.data)
          if (tData.data?.[0]?.term_id) setTermId(tData.data[0].term_id)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    const cap = parseInt(capacity, 10)
    if (!courseId || !termId || !section.trim()) {
      setMessage('Fill course, term, and section.')
      return
    }
    if (Number.isNaN(cap) || cap < 1) {
      setMessage('Capacity must be a positive number.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/course-offerings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          termId,
          section: section.trim(),
          capacity: cap,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage('Offering created. You are assigned as the instructor.')
        setSection('')
      } else {
        setMessage(data.error || 'Failed')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!departmentId) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Create offering</h1>
        <p className="text-muted-foreground">Professor profile or department not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create course offering</h1>
        <p className="text-muted-foreground">
          Open a new section for a course in your department. You will be assigned to teach it.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New section</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Course</label>
              <select
                className="w-full rounded border bg-white p-2"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                required
              >
                <option value="">Select course</option>
                {courses.map((c: any) => (
                  <option key={c.course_id} value={c.course_id}>
                    {c.code} — {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Term</label>
              <select
                className="w-full rounded border bg-white p-2"
                value={termId}
                onChange={(e) => setTermId(e.target.value)}
                required
              >
                <option value="">Select term</option>
                {terms.map((t: any) => (
                  <option key={t.term_id} value={t.term_id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Section</label>
              <input
                className="w-full rounded border p-2"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g. A, B, 1"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Capacity</label>
              <input
                type="number"
                min={1}
                className="w-full rounded border p-2"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>
            {message && (
              <p className={message.startsWith('Offering') ? 'text-green-700' : 'text-red-600'}>
                {message}
              </p>
            )}
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create offering'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
