'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [terms, setTerms] = useState<any[]>([])
  const [offerings, setOfferings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [formTermId, setFormTermId] = useState('')
  const [formStudentId, setFormStudentId] = useState('')
  const [formOfferingId, setFormOfferingId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchEnrollments = useCallback(async () => {
    const res = await fetch('/api/enrollments')
    const data = await res.json()
    if (data.success) {
      setEnrollments(data.data)
    }
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const [eRes, sRes, tRes] = await Promise.all([
          fetch('/api/enrollments'),
          fetch('/api/students'),
          fetch('/api/terms'),
        ])
        const [eData, sData, tData] = await Promise.all([
          eRes.json(),
          sRes.json(),
          tRes.json(),
        ])
        if (eData.success) setEnrollments(eData.data)
        if (sData.success) setStudents(sData.data)
        if (tData.success) setTerms(tData.data)
      } catch (error) {
        console.error('Failed to load enrollments page:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!formTermId) {
      setOfferings([])
      setFormOfferingId('')
      return
    }
    ;(async () => {
      const res = await fetch(`/api/course-offerings?termId=${formTermId}`)
      const data = await res.json()
      if (data.success) {
        setOfferings(data.data)
        setFormOfferingId('')
      }
    })()
  }, [formTermId])

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formStudentId || !formOfferingId) {
      alert('Select a student and an offering.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: formStudentId,
          offeringId: formOfferingId,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setFormStudentId('')
        setFormOfferingId('')
        fetchEnrollments()
      } else {
        alert(data.error || 'Enrollment failed')
      }
    } catch (err) {
      console.error(err)
      alert('Enrollment failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Enrollments</h1>
        <p className="text-muted-foreground">Create enrollments and view all records</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enroll a student</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEnroll} className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end">
            <div className="min-w-[200px] flex-1">
              <label className="mb-1 block text-sm font-medium">Term</label>
              <select
                className="w-full rounded border bg-white p-2"
                value={formTermId}
                onChange={(e) => setFormTermId(e.target.value)}
              >
                <option value="">Select term</option>
                {terms.map((t: any) => (
                  <option key={t.term_id} value={t.term_id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-[200px] flex-1">
              <label className="mb-1 block text-sm font-medium">Course offering</label>
              <select
                className="w-full rounded border bg-white p-2"
                value={formOfferingId}
                onChange={(e) => setFormOfferingId(e.target.value)}
                disabled={!formTermId}
              >
                <option value="">Select offering</option>
                {offerings.map((o: any) => (
                  <option key={o.offering_id} value={o.offering_id}>
                    {o.course.code} — {o.course.title} (sec. {o.section}) —{' '}
                    {o.enrollments?.length ?? 0}/{o.capacity}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-[220px] flex-1">
              <label className="mb-1 block text-sm font-medium">Student</label>
              <select
                className="w-full rounded border bg-white p-2"
                value={formStudentId}
                onChange={(e) => setFormStudentId(e.target.value)}
              >
                <option value="">Select student</option>
                {students.map((s: any) => (
                  <option key={s.student_id} value={s.student_id}>
                    {s.roll_no} — {s.first_name} {s.last_name}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : 'Enroll'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All enrollments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Enrolled at</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.map((enrollment) => (
                <TableRow key={`${enrollment.offering_id}-${enrollment.student_id}`}>
                  <TableCell>
                    {enrollment.student.first_name} {enrollment.student.last_name} (
                    {enrollment.student.roll_no})
                  </TableCell>
                  <TableCell>
                    {enrollment.offering.course.code} - {enrollment.offering.course.title}
                  </TableCell>
                  <TableCell>{enrollment.offering.term.name}</TableCell>
                  <TableCell>{enrollment.offering.section}</TableCell>
                  <TableCell>{new Date(enrollment.enrolled_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {enrollments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                    No enrollments yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
