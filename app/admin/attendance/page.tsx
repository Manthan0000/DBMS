'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAttendance() {
      try {
        const res = await fetch('/api/attendance')
        const data = await res.json()
        if (data.success) {
          setAttendance(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch attendance:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAttendance()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Attendance Records</h1>
        <p className="text-muted-foreground">All attendance records</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Session Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Marked At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance.map((record) => (
                <TableRow key={`${record.session_id}-${record.student_id}`}>
                  <TableCell>
                    {record.student.first_name} {record.student.last_name}
                  </TableCell>
                  <TableCell>{record.session.offering.course.code}</TableCell>
                  <TableCell>{new Date(record.session.session_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={record.status === 'PRESENT' ? 'text-green-600' : 'text-red-600'}>
                      {record.status}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(record.marked_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
