'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function ProfessorCoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch('/api/professor/courses')
        const data = await res.json()
        if (data.success) {
          setCourses(data.data)
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
        <p className="text-muted-foreground">
          Courses you are teaching. Add class sessions and assessments from each row, or use the sidebar.
        </p>
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
                <TableHead>Planning</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((c) => (
                <TableRow key={c.offering_id}>
                  <TableCell>{c.code}</TableCell>
                  <TableCell>{c.title}</TableCell>
                  <TableCell>{c.term}</TableCell>
                  <TableCell>{c.section}</TableCell>
                  <TableCell>{c.enrolled ?? 0}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/professor/attendance?offeringId=${c.offering_id}`}
                        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                      >
                        Class sessions
                      </Link>
                      <Link
                        href={`/professor/grades?offeringId=${c.offering_id}`}
                        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                      >
                        Assessments
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {courses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                    No teaching assignments yet.
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
