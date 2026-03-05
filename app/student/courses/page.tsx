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
      } catch (error) {
        console.error('Failed to fetch enrollments:', error)
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
        <p className="text-muted-foreground">Courses you are enrolled in</p>
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
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
