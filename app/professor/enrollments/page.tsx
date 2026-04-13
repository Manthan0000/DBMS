'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'

export default function ProfessorEnrollmentsPage() {
  const [myCourses, setMyCourses] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [offeringId, setOfferingId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const loadRoster = useCallback(async (oid: string) => {
    if (!oid) {
      setEnrolledIds(new Set())
      return
    }
    const res = await fetch(`/api/enrollments?offeringId=${oid}`)
    const data = await res.json()
    if (data.success) {
      setEnrolledIds(new Set(data.data.map((e: any) => e.student_id)))
    }
  }, [])

  useEffect(() => {
    async function init() {
      try {
        const [cRes, sRes] = await Promise.all([
          fetch('/api/professor/courses'),
          fetch('/api/students'),
        ])
        const cData = await cRes.json()
        const sData = await sRes.json()
        if (cData.success) setMyCourses(cData.data)
        if (sData.success) setStudents(sData.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  useEffect(() => {
    loadRoster(offeringId)
  }, [offeringId, loadRoster])

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!offeringId || !studentId) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offeringId, studentId }),
      })
      const data = await res.json()
      if (data.success) {
        setStudentId('')
        loadRoster(offeringId)
      } else {
        alert(data.error || 'Failed to enroll')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  const selected = myCourses.find((c) => c.offering_id === offeringId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Enroll students</h1>
        <p className="text-muted-foreground">
          Add students to a section you teach. Only your offerings are listed.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enroll in my section</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEnroll} className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end">
            <div className="min-w-[240px] flex-1">
              <label className="mb-1 block text-sm font-medium">Your offering</label>
              <select
                className="w-full rounded border bg-white p-2"
                value={offeringId}
                onChange={(e) => setOfferingId(e.target.value)}
              >
                <option value="">Select section</option>
                {myCourses.map((c: any) => (
                  <option key={c.offering_id} value={c.offering_id}>
                    {c.code} — {c.title} ({c.term}, sec. {c.section})
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-[220px] flex-1">
              <label className="mb-1 block text-sm font-medium">Student</label>
              <select
                className="w-full rounded border bg-white p-2"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              >
                <option value="">Select student</option>
                {students.map((s: any) => (
                  <option key={s.student_id} value={s.student_id}>
                    {s.roll_no} — {s.first_name} {s.last_name}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={submitting || !offeringId || !studentId}>
              {submitting ? 'Saving…' : 'Enroll student'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {offeringId && (
        <Card>
          <CardHeader>
            <CardTitle>
              Currently enrolled
              {selected ? ` — ${selected.code} (${selected.section})` : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll no</TableHead>
                  <TableHead>Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students
                  .filter((s) => enrolledIds.has(s.student_id))
                  .map((s, idx) => (
                    <TableRow key={s.student_id} className={`hover:bg-slate-50 ${idx % 2 === 1 ? 'bg-slate-50/40' : ''}`}>
                      <TableCell>{s.roll_no}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: '#0ea5e9' }}>
                            {s.first_name?.[0]}{s.last_name?.[0]}
                          </span>
                          {s.first_name} {s.last_name}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                {enrolledIds.size === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="py-6 text-center text-muted-foreground">
                      No students enrolled yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
