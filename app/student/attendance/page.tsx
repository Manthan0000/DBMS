'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type Enrollment = {
  offering_id: string
  offering: {
    section: string
    course: {
      code: string
      title: string
    }
    term: {
      name: string
    }
  }
}

type AttendanceRecord = {
  session_id: string
  student_id: string
  status: 'PRESENT' | 'ABSENT'
  session: {
    session_id: string
    session_date: string
    offering_id: string
    offering: {
      course: {
        code: string
        title: string
      }
    }
  }
}

type ClassSession = {
  session_id: string
  session_date: string
  offering_id: string
}

export default function StudentAttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [sessions, setSessions] = useState<ClassSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAttendance() {
      try {
        const [attendanceRes, enrollmentRes, sessionsRes] = await Promise.all([
          fetch('/api/attendance'),
          fetch('/api/enrollments'),
          fetch('/api/class-sessions'),
        ])
        const [attendanceData, enrollmentData, sessionsData] = await Promise.all([
          attendanceRes.json(),
          enrollmentRes.json(),
          sessionsRes.json(),
        ])

        if (attendanceData.success) {
          setAttendance(attendanceData.data)
        }
        if (enrollmentData.success) {
          setEnrollments(enrollmentData.data)
        }
        if (sessionsData.success) {
          setSessions(sessionsData.data)
        }
      } catch (error) {
        console.error('Failed to fetch attendance:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAttendance()
  }, [])

  // Overall attendance across all enrolled courses
  const totalSessions = sessions.length
  const presentSessions = attendance.filter((a) => a.status === 'PRESENT').length
  const attendancePercentage = totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 0

  // Course-wise attendance summary
  const courseWiseAttendance = enrollments.map((enrollment) => {
    const offeringId = enrollment.offering_id
    const courseSessions = sessions.filter((s) => s.offering_id === offeringId)
    const courseAttendance = attendance.filter((a) => a.session.offering_id === offeringId)
    const coursePresent = courseAttendance.filter((a) => a.status === 'PRESENT').length
    const courseTotal = courseSessions.length
    const percentage = courseTotal > 0 ? (coursePresent / courseTotal) * 100 : 0

    return {
      offeringId,
      courseCode: enrollment.offering.course.code,
      courseTitle: enrollment.offering.course.title,
      termName: enrollment.offering.term.name,
      section: enrollment.offering.section,
      present: coursePresent,
      total: courseTotal,
      percentage,
    }
  })

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Attendance</h1>
        <p className="text-muted-foreground">Your attendance records</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl p-5" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
          <span className="text-[13px] font-medium" style={{ color: '#64748b' }}>Total Sessions</span>
          <div className="mt-2 text-[28px] font-bold leading-none" style={{ color: '#0369a1' }}>{totalSessions}</div>
        </div>
        <div className="rounded-xl p-5" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <span className="text-[13px] font-medium" style={{ color: '#64748b' }}>Present</span>
          <div className="mt-2 text-[28px] font-bold leading-none" style={{ color: '#15803d' }}>{presentSessions}</div>
        </div>
        <div
          className="rounded-xl p-5"
          style={{
            background: attendancePercentage < 75 ? '#fff4f0' : '#fffbeb',
            border: `1px solid ${attendancePercentage < 75 ? '#fecab0' : '#fde68a'}`,
          }}
        >
          <span className="text-[13px] font-medium" style={{ color: '#64748b' }}>Attendance %</span>
          <div
            className="mt-2 text-[28px] font-bold leading-none"
            style={{ color: attendancePercentage < 75 ? '#c2410c' : '#b45309' }}
          >
            {attendancePercentage.toFixed(1)}%
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course-wise Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Present</TableHead>
                <TableHead>Total Sessions</TableHead>
                <TableHead>Attendance %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courseWiseAttendance.map((item, idx) => (
                <TableRow key={item.offeringId} className={`hover:bg-slate-50 ${idx % 2 === 1 ? 'bg-slate-50/40' : ''}`}>
                  <TableCell>
                    {item.courseCode} - {item.courseTitle}
                  </TableCell>
                  <TableCell>{item.termName}</TableCell>
                  <TableCell>{item.section}</TableCell>
                  <TableCell>{item.present}</TableCell>
                  <TableCell>{item.total}</TableCell>
                  <TableCell>
                    <span
                      className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={
                        item.percentage >= 75
                          ? { background: '#d1fae5', color: '#065f46' }
                          : { background: '#fff1ec', color: '#9a3412' }
                      }
                    >
                      {item.percentage.toFixed(1)}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {courseWiseAttendance.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                    No enrolled courses found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Session Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance.map((record, idx) => (
                <TableRow key={`${record.session_id}-${record.student_id}`} className={`hover:bg-slate-50 ${idx % 2 === 1 ? 'bg-slate-50/40' : ''}`}>
                  <TableCell>{record.session.offering.course.code}</TableCell>
                  <TableCell>{new Date(record.session.session_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span
                      className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={
                        record.status === 'PRESENT'
                          ? { background: '#d1fae5', color: '#065f46' }
                          : { background: '#fff1ec', color: '#9a3412' }
                      }
                    >
                      {record.status}
                    </span>
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
