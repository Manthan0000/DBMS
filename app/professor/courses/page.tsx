'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function ProfessorCoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch('/api/enrollments')
        const data = await res.json()
        if (data.success) {
          // Filter to get unique course offerings
          const uniqueOfferings = new Map()
          data.data.forEach((enrollment: any) => {
            if (!uniqueOfferings.has(enrollment.offering_id)) {
              uniqueOfferings.set(enrollment.offering_id, enrollment.offering)
            }
          })
          setCourses(Array.from(uniqueOfferings.values()))
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Courses</h1>
        <p className="text-muted-foreground">Courses you are teaching</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teaching Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Code</TableHead>
                <TableHead>Course Title</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Enrolled Students</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((offering) => (
                <TableRow key={offering.offering_id}>
                  <TableCell>{offering.course.code}</TableCell>
                  <TableCell>{offering.course.title}</TableCell>
                  <TableCell>{offering.term.name}</TableCell>
                  <TableCell>{offering.section}</TableCell>
                  <TableCell>{offering.enrollments?.length || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
