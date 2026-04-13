'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'

type Offering = {
  offering_id: string
  code: string
  title: string
  term: string
  section: string
}

type Assessment = {
  assessment_id: string
  name: string
  max_marks: string | number
}

type EnrollmentRow = {
  student_id: string
  student: { first_name: string; last_name: string; roll_no: string }
}

function ProfessorGradesInner() {
  const searchParams = useSearchParams()
  const [offerings, setOfferings] = useState<Offering[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([])
  const [offeringId, setOfferingId] = useState('')
  const [assessmentId, setAssessmentId] = useState('')
  const [marksByStudent, setMarksByStudent] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('Exam')
  const [newMax, setNewMax] = useState('100')

  const loadOfferings = useCallback(async () => {
    const res = await fetch('/api/professor/courses')
    const data = await res.json()
    if (data.success) {
      setOfferings(data.data)
    }
  }, [])

  useEffect(() => {
    loadOfferings().finally(() => setLoading(false))
  }, [loadOfferings])

  useEffect(() => {
    const oid = searchParams.get('offeringId')
    if (!oid || offerings.length === 0) return
    if (offerings.some((o) => o.offering_id === oid)) {
      setOfferingId(oid)
    }
  }, [searchParams, offerings])

  useEffect(() => {
    if (!offeringId) {
      setAssessments([])
      setAssessmentId('')
      setEnrollments([])
      return
    }
    ;(async () => {
      const [aRes, eRes] = await Promise.all([
        fetch(`/api/assessments?offeringId=${offeringId}`),
        fetch(`/api/enrollments?offeringId=${offeringId}`),
      ])
      const aData = await aRes.json()
      const eData = await eRes.json()
      if (aData.success) {
        setAssessments(aData.data)
        setAssessmentId('')
      }
      if (eData.success) {
        setEnrollments(eData.data)
      }
    })()
  }, [offeringId])

  useEffect(() => {
    if (!assessmentId) {
      setMarksByStudent({})
      return
    }
    ;(async () => {
      const res = await fetch(`/api/grades?assessmentId=${assessmentId}`)
      const data = await res.json()
      if (data.success) {
        const map: Record<string, string> = {}
        for (const row of data.data) {
          map[row.student_id] = String(row.marks)
        }
        setMarksByStudent(map)
      }
    })()
  }, [assessmentId])

  const selectedAssessment = assessments.find((a) => a.assessment_id === assessmentId)
  const maxMarks = selectedAssessment ? Number(selectedAssessment.max_marks) : 0

  const saveMark = async (studentId: string) => {
    if (!assessmentId) return
    const raw = marksByStudent[studentId]
    const marks = parseFloat(raw)
    if (raw === '' || Number.isNaN(marks) || marks < 0) {
      alert('Enter a valid non-negative mark.')
      return
    }
    if (maxMarks > 0 && marks > maxMarks) {
      alert(`Marks cannot exceed ${maxMarks}`)
      return
    }
    const res = await fetch('/api/grades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assessmentId, studentId, marks }),
    })
    const data = await res.json()
    if (!data.success) {
      alert(data.error || 'Failed to save grade')
    }
  }

  const createAssessment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!offeringId || !newName.trim()) return
    const max = parseFloat(newMax)
    if (Number.isNaN(max) || max < 0) {
      alert('Enter a valid max marks value')
      return
    }
    const res = await fetch('/api/assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        offeringId,
        name: newName.trim(),
        type: newType,
        maxMarks: max,
      }),
    })
    const data = await res.json()
    if (data.success) {
      setAssessments((prev) => [...prev, data.data])
      setAssessmentId(data.data.assessment_id)
      setNewName('')
    } else {
      alert(data.error || 'Failed to create assessment')
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Assessments & grades</h1>
        <p className="text-muted-foreground">
          Define exams, quizzes, and assignments for your section, then enter marks for enrolled students.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Offering, assessments, and entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Offering</label>
              <select
                className="w-full rounded border bg-white p-2"
                value={offeringId}
                onChange={(e) => setOfferingId(e.target.value)}
              >
                <option value="">Select course</option>
                {offerings.map((o) => (
                  <option key={o.offering_id} value={o.offering_id}>
                    {o.code} — {o.title} ({o.term}, sec. {o.section})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Assessment</label>
              <select
                className="w-full rounded border bg-white p-2"
                value={assessmentId}
                onChange={(e) => setAssessmentId(e.target.value)}
                disabled={!offeringId}
              >
                <option value="">Select assessment</option>
                {assessments.map((a) => (
                  <option key={a.assessment_id} value={a.assessment_id}>
                    {a.name} (max {a.max_marks})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <form onSubmit={createAssessment} className="flex flex-wrap items-end gap-3 border-t pt-4">
            <div className="min-w-[180px] flex-1">
              <label className="mb-1 block text-sm font-medium">New assessment name</label>
              <input
                className="w-full rounded border p-2"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                disabled={!offeringId}
                placeholder="e.g. Midterm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Type</label>
              <select
                className="rounded border bg-white p-2"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                disabled={!offeringId}
              >
                <option value="Exam">Exam</option>
                <option value="Quiz">Quiz</option>
                <option value="Assignment">Assignment</option>
                <option value="Project">Project</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Max marks</label>
              <input
                type="number"
                className="w-24 rounded border p-2"
                value={newMax}
                onChange={(e) => setNewMax(e.target.value)}
                disabled={!offeringId}
                min={0}
              />
            </div>
            <Button type="submit" disabled={!offeringId || !newName.trim()}>
              Add assessment
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Marks</CardTitle>
        </CardHeader>
        <CardContent>
          {!assessmentId ? (
            <p className="text-muted-foreground">Select an assessment to enter marks.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll no</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Marks (max {maxMarks})</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((e, idx) => {
                  const st = e.student_id
                  return (
                    <TableRow key={st} className={`hover:bg-slate-50 ${idx % 2 === 1 ? 'bg-slate-50/40' : ''}`}>
                      <TableCell>{e.student.roll_no}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: '#0ea5e9' }}>
                            {e.student.first_name?.[0]}{e.student.last_name?.[0]}
                          </span>
                          {e.student.first_name} {e.student.last_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <input
                          type="number"
                          className="w-28 rounded border p-2"
                          min={0}
                          step="0.01"
                          value={marksByStudent[st] ?? ''}
                          onChange={(ev) =>
                            setMarksByStudent((prev) => ({
                              ...prev,
                              [st]: ev.target.value,
                            }))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => saveMark(st)}>
                          Save
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {enrollments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                      No students enrolled in this offering.
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

export default function ProfessorGradesPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <ProfessorGradesInner />
    </Suspense>
  )
}
