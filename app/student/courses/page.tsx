'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'

export default function StudentCoursesPage() {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [terms, setTerms] = useState<any[]>([])
  const [browseTermId, setBrowseTermId] = useState('')
  const [offerings, setOfferings] = useState<any[]>([])
  const [studentId, setStudentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrollingId, setEnrollingId] = useState<string | null>(null)

  const enrolledOfferingIds = new Set(enrollments.map((e) => e.offering_id))

  const fetchEnrollments = useCallback(async () => {
    const res = await fetch('/api/enrollments')
    const data = await res.json()
    if (data.success) {
      setEnrollments(data.data)
    }
  }, [])

  useEffect(() => {
    async function init() {
      try {
        const [meRes, tRes] = await Promise.all([fetch('/api/auth/me'), fetch('/api/terms')])
        const meData = await meRes.json()
        const tData = await tRes.json()
        if (meData.success && meData.data?.studentId) {
          setStudentId(meData.data.studentId)
        }
        if (tData.success) {
          setTerms(tData.data)
          if (tData.data?.[0]?.term_id) {
            setBrowseTermId(tData.data[0].term_id)
          }
        }
        await fetchEnrollments()
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [fetchEnrollments])

  useEffect(() => {
    if (!browseTermId) {
      setOfferings([])
      return
    }
    ;(async () => {
      const res = await fetch(`/api/course-offerings?termId=${browseTermId}`)
      const data = await res.json()
      if (data.success) {
        setOfferings(data.data)
      }
    })()
  }, [browseTermId])

  const enroll = async (offeringId: string) => {
    if (!studentId) {
      alert('Could not resolve your student profile.')
      return
    }
    setEnrollingId(offeringId)
    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offeringId, studentId }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchEnrollments()
      } else {
        alert(data.error || 'Enrollment failed')
      }
    } finally {
      setEnrollingId(null)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My courses</h1>
        <p className="text-muted-foreground">Enrolled sections and open registration</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enrolled courses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course code</TableHead>
                <TableHead>Course title</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Professor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.map((enrollment) => (
                <TableRow key={`${enrollment.offering_id}-${enrollment.student_id}`}>
                  <TableCell>{enrollment.offering.course.code}</TableCell>
                  <TableCell>{enrollment.offering.course.title}</TableCell>
                  <TableCell>{enrollment.offering.term.name}</TableCell>
                  <TableCell>{enrollment.offering.section}</TableCell>
                  <TableCell>
                    {enrollment.offering.teachingAssignments[0]?.professor
                      ? `${enrollment.offering.teachingAssignments[0].professor.first_name} ${enrollment.offering.teachingAssignments[0].professor.last_name}`
                      : 'TBA'}
                  </TableCell>
                </TableRow>
              ))}
              {enrollments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                    You are not enrolled in any courses yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Browse and enroll</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-md">
            <label className="mb-1 block text-sm font-medium">Term</label>
            <select
              className="w-full rounded border bg-white p-2"
              value={browseTermId}
              onChange={(e) => setBrowseTermId(e.target.value)}
            >
              <option value="">Select term</option>
              {terms.map((t: any) => (
                <option key={t.term_id} value={t.term_id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {!browseTermId ? (
            <p className="text-muted-foreground">Choose a term to see offerings.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {offerings.map((o: any) => {
                  const full = (o.enrollments?.length ?? 0) >= o.capacity
                  const already = enrolledOfferingIds.has(o.offering_id)
                  return (
                    <TableRow key={o.offering_id}>
                      <TableCell>
                        {o.course.code} — {o.course.title}
                      </TableCell>
                      <TableCell>{o.section}</TableCell>
                      <TableCell>
                        {o.enrollments?.length ?? 0}/{o.capacity}
                      </TableCell>
                      <TableCell>
                        {o.teachingAssignments?.[0]?.professor
                          ? `${o.teachingAssignments[0].professor.first_name} ${o.teachingAssignments[0].professor.last_name}`
                          : 'TBA'}
                      </TableCell>
                      <TableCell>
                        {already ? (
                          <span className="text-muted-foreground">Enrolled</span>
                        ) : full ? (
                          <span className="text-muted-foreground">Full</span>
                        ) : (
                          <Button
                            size="sm"
                            disabled={enrollingId === o.offering_id}
                            onClick={() => enroll(o.offering_id)}
                          >
                            {enrollingId === o.offering_id ? '…' : 'Enroll'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
                {offerings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                      No offerings for this term.
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
