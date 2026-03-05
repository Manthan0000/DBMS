'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    rollNo: '',
    departmentId: '',
    phone: '',
    dateOfBirth: ''
  })

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students')
      const data = await res.json()
      if (data.success) {
        setStudents(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch students:', error)
    }
  }

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments')
      const data = await res.json()
      if (data.success) {
        setDepartments(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error)
    }
  }

  useEffect(() => {
    Promise.all([fetchStudents(), fetchDepartments()]).finally(() => setLoading(false))
  }, [])

  const handleOpenModal = (mode: 'add' | 'edit', student?: any) => {
    setModalMode(mode)
    if (mode === 'edit' && student) {
      setCurrentStudentId(student.student_id)
      setFormData({
        firstName: student.first_name,
        lastName: student.last_name,
        email: student.user.email,
        password: '', // Password update not handled currently
        rollNo: student.roll_no,
        departmentId: student.department_id,
        phone: student.phone || '',
        dateOfBirth: student.date_of_birth ? new Date(student.date_of_birth).toISOString().split('T')[0] : ''
      })
    } else {
      setCurrentStudentId(null)
      setFormData({
        firstName: '', lastName: '', email: '', password: '', rollNo: '', departmentId: '', phone: '', dateOfBirth: ''
      })
    }
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = modalMode === 'add' ? '/api/students' : `/api/students/${currentStudentId}`
    const method = modalMode === 'add' ? 'POST' : 'PUT'

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.success) {
        setModalOpen(false)
        fetchStudents()
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Failed to save student:', error)
      alert('Failed to save student')
    }
  }

  const handleDelete = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return

    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        fetchStudents()
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Failed to delete student:', error)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="text-muted-foreground">Manage all students</p>
        </div>
        <Button onClick={() => handleOpenModal('add')}>Add Student</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.student_id}>
                  <TableCell>{student.roll_no}</TableCell>
                  <TableCell>
                    {student.first_name} {student.last_name}
                  </TableCell>
                  <TableCell>{student.user?.email}</TableCell>
                  <TableCell>{student.department?.name}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenModal('edit', student)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(student.student_id)}>
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {students.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                    No students found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Basic Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white text-black p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{modalMode === 'add' ? 'Add Student' : 'Edit Student'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input required className="w-full border rounded p-2" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input required className="w-full border rounded p-2" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input required disabled={modalMode === 'edit'} type="email" className="w-full border rounded p-2 disabled:bg-gray-100 disabled:text-gray-500" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
              {modalMode === 'add' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input required minLength={6} type="password" className="w-full border rounded p-2" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Roll No</label>
                <input required className="w-full border rounded p-2" value={formData.rollNo} onChange={e => setFormData({ ...formData, rollNo: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <select required className="w-full border rounded p-2 bg-white" value={formData.departmentId} onChange={e => setFormData({ ...formData, departmentId: e.target.value })}>
                  <option value="" disabled>Select Department</option>
                  {departments.map((dept: any) => (
                    <option key={dept.department_id} value={dept.department_id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input className="w-full border rounded p-2" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date of Birth</label>
                <input type="date" className="w-full border rounded p-2" value={formData.dateOfBirth} onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })} />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="submit">{modalMode === 'add' ? 'Save' : 'Update'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
