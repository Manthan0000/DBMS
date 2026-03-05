'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function EnrollmentsPage() {
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
        <h1 className="text-3xl font-bold">Enrollments</h1>
        <p className="text-muted-foreground">All course enrollments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Enrollments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Enrolled At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.map((enrollment) => (
                <TableRow key={`${enrollment.offering_id}-${enrollment.student_id}`}>
                  <TableCell>
                    {enrollment.student.first_name} {enrollment.student.last_name} ({enrollment.student.roll_no})
                  </TableCell>
                  <TableCell>
                    {enrollment.offering.course.code} - {enrollment.offering.course.title}
                  </TableCell>
                  <TableCell>{enrollment.offering.term.name}</TableCell>
                  <TableCell>{enrollment.offering.section}</TableCell>
                  <TableCell>{new Date(enrollment.enrolled_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
