'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function StudentGradesPage() {
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

  // Calculate average grade
  const averageGrade =
    grades.length > 0
      ? grades.reduce((sum, g) => sum + Number(g.marks), 0) / grades.length
      : 0

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Grades</h1>
        <p className="text-muted-foreground">Your academic performance</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Average Grade: {averageGrade.toFixed(2)}</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grade Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Assessment</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead>Max Marks</TableHead>
                <TableHead>Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.map((grade, idx) => (
                <TableRow key={`${grade.assessment_id}-${grade.student_id}`} className={`hover:bg-slate-50 ${idx % 2 === 1 ? 'bg-slate-50/40' : ''}`}>
                  <TableCell>{grade.assessment.offering.course.code}</TableCell>
                  <TableCell>{grade.assessment.name}</TableCell>
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
