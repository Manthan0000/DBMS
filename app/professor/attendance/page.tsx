'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'

type Offering = {
  offering_id: string
  code: string
  title: string
  term: string
  section: string
}

type SessionRow = {
  session_id: string
  session_date: string
  topic: string | null
}

type EnrollmentRow = {
  student_id: string
  student: { first_name: string; last_name: string; roll_no: string }
}

function ProfessorAttendanceInner() {
  const searchParams = useSearchParams()
  const [offerings, setOfferings] = useState<Offering[]>([])
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([])
  const [offeringId, setOfferingId] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [records, setRecords] = useState<Record<string, 'PRESENT' | 'ABSENT'>>({})
  const [loading, setLoading] = useState(true)
  const [newSessionDate, setNewSessionDate] = useState('')
  const [newSessionTopic, setNewSessionTopic] = useState('')

  const loadOfferings = useCallback(async () => {
    const res = await fetch('/api/professor/courses')
    const data = await res.json()
    if (data.success) {
      setOfferings(data.data)
    }
  }, [])

  useEffect(() => {
    loadOfferings().finally(() => setLoading(false))
  }, [loadOfferings])

  useEffect(() => {
    const oid = searchParams.get('offeringId')
    if (!oid || offerings.length === 0) return
    if (offerings.some((o) => o.offering_id === oid)) {
      setOfferingId(oid)
    }
  }, [searchParams, offerings])

  useEffect(() => {
    if (!offeringId) {
      setSessions([])
      setSessionId('')
      return
    }
    ;(async () => {
      const res = await fetch(`/api/class-sessions?offeringId=${offeringId}`)
      const data = await res.json()
      if (data.success) {
        setSessions(data.data)
        setSessionId('')
      }
    })()
  }, [offeringId])

  useEffect(() => {
    if (!offeringId) {
      setEnrollments([])
      return
    }
    ;(async () => {
      const res = await fetch(`/api/enrollments?offeringId=${offeringId}`)
      const data = await res.json()
      if (data.success) {
        setEnrollments(data.data)
      }
    })()
  }, [offeringId])

  useEffect(() => {
    if (!sessionId) {
      setRecords({})
      return
    }
    ;(async () => {
      const res = await fetch(`/api/attendance?sessionId=${sessionId}`)
      const data = await res.json()
      if (data.success) {
        const map: Record<string, 'PRESENT' | 'ABSENT'> = {}
        for (const row of data.data) {
          map[row.student_id] = row.status
        }
        setRecords(map)
      }
    })()
  }, [sessionId])

  const setStatus = async (studentId: string, status: 'PRESENT' | 'ABSENT') => {
    if (!sessionId) return
    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, studentId, status }),
    })
    const data = await res.json()
    if (data.success) {
      setRecords((prev) => ({ ...prev, [studentId]: status }))
    } else {
      alert(data.error || 'Failed to save attendance')
    }
  }

  const addSession = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!offeringId || !newSessionDate) return
    const res = await fetch('/api/class-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        offeringId,
        sessionDate: new Date(newSessionDate).toISOString(),
        topic: newSessionTopic || undefined,
      }),
    })
    const data = await res.json()
    if (data.success) {
      setSessions((prev) => [...prev, data.data].sort(
        (a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime()
      ))
      setSessionId(data.data.session_id)
      setNewSessionDate('')
      setNewSessionTopic('')
    } else {
      alert(data.error || 'Failed to create session')
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Class sessions & attendance</h1>
        <p className="text-muted-foreground">
          Create meeting dates for your section, then pick a session and mark each enrolled student present
          or absent.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meetings & roster</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Offering</label>
              <select
                className="w-full rounded border bg-white p-2"
                value={offeringId}
                onChange={(e) => setOfferingId(e.target.value)}
              >
                <option value="">Select course</option>
                {offerings.map((o) => (
                  <option key={o.offering_id} value={o.offering_id}>
                    {o.code} — {o.title} ({o.term}, sec. {o.section})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Class session</label>
              <select
                className="w-full rounded border bg-white p-2"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                disabled={!offeringId}
              >
                <option value="">Select session</option>
                {sessions.map((s) => (
                  <option key={s.session_id} value={s.session_id}>
                    {new Date(s.session_date).toLocaleDateString()}
                    {s.topic ? ` — ${s.topic}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <form onSubmit={addSession} className="flex flex-wrap items-end gap-3 border-t pt-4">
            <div>
              <label className="mb-1 block text-sm font-medium">New session date</label>
              <input
                type="datetime-local"
                className="rounded border p-2"
                value={newSessionDate}
                onChange={(e) => setNewSessionDate(e.target.value)}
                disabled={!offeringId}
              />
            </div>
            <div className="min-w-[200px] flex-1">
              <label className="mb-1 block text-sm font-medium">Topic (optional)</label>
              <input
                className="w-full rounded border p-2"
                value={newSessionTopic}
                onChange={(e) => setNewSessionTopic(e.target.value)}
                disabled={!offeringId}
                placeholder="e.g. Lecture 6"
              />
            </div>
            <Button type="submit" disabled={!offeringId || !newSessionDate}>
              Add session
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
        </CardHeader>
        <CardContent>
          {!sessionId ? (
            <p className="text-muted-foreground">Choose a session to mark attendance.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll no</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((e, idx) => {
                  const st = e.student_id
                  const current = records[st]
                  return (
                    <TableRow key={st} className={`hover:bg-slate-50 ${idx % 2 === 1 ? 'bg-slate-50/40' : ''}`}>
                      <TableCell>{e.student.roll_no}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: '#0ea5e9' }}>
                            {e.student.first_name?.[0]}{e.student.last_name?.[0]}
                          </span>
                          {e.student.first_name} {e.student.last_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {current ? (
                          <span
                            className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                            style={
                              current === 'PRESENT'
                                ? { background: '#d1fae5', color: '#065f46' }
                                : { background: '#fff1ec', color: '#9a3412' }
                            }
                          >
                            {current}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Not marked</span>
                        )}
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button size="sm" variant="outline" onClick={() => setStatus(st, 'PRESENT')}>
                          Present
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setStatus(st, 'ABSENT')}>
                          Absent
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {enrollments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                      No students enrolled in this offering.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ProfessorAttendancePage() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <ProfessorAttendanceInner />
    </Suspense>
  )
}
