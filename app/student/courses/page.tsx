'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function StudentCoursesPage() {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEnrollments() {
      try {
        const res = await fetch('/api/enrollments')
        const data = await res.json()
        if (data.success) {
          setEnrollments(data.data)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchEnrollments()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Courses</h1>
        <p className="text-muted-foreground">View your enrolled courses</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enrolled Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Code</TableHead>
                <TableHead>Course Title</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Professor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.map((enrollment, idx) => (
                <TableRow key={`${enrollment.offering_id}-${enrollment.student_id}`} className={`hover:bg-slate-50 ${idx % 2 === 1 ? 'bg-slate-50/40' : ''}`}>
                  <TableCell>{enrollment.offering.course.code}</TableCell>
                  <TableCell>{enrollment.offering.course.title}</TableCell>
                  <TableCell>{enrollment.offering.term.name}</TableCell>
                  <TableCell>{enrollment.offering.section}</TableCell>
                  <TableCell>
                    {enrollment.offering.teachingAssignments[0]?.professor
                      ? (
                        <div className="flex items-center gap-2">
                          <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: '#22c55e' }}>
                            {enrollment.offering.teachingAssignments[0].professor.first_name?.[0]}{enrollment.offering.teachingAssignments[0].professor.last_name?.[0]}
                          </span>
                          {`${enrollment.offering.teachingAssignments[0].professor.first_name} ${enrollment.offering.teachingAssignments[0].professor.last_name}`}
                        </div>
                      )
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
    </div>
  )
}

