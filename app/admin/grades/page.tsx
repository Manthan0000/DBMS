'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function GradesPage() {
  const [grades, setGrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGrades() {
      try {
        const res = await fetch('/api/grades')
        const data = await res.json()
        if (data.success) {
          setGrades(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch grades:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGrades()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Grade Records</h1>
        <p className="text-muted-foreground">All grade records</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Grade Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Assessment</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead>Max Marks</TableHead>
                <TableHead>Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.map((grade) => (
                <TableRow key={`${grade.assessment_id}-${grade.student_id}`}>
                  <TableCell>
                    {grade.student.first_name} {grade.student.last_name}
                  </TableCell>
                  <TableCell>{grade.assessment.name}</TableCell>
                  <TableCell>{grade.assessment.offering.course.code}</TableCell>
                  <TableCell>{Number(grade.marks)}</TableCell>
                  <TableCell>{Number(grade.assessment.max_marks)}</TableCell>
                  <TableCell>
                    {((Number(grade.marks) / Number(grade.assessment.max_marks)) * 100).toFixed(1)}%
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
