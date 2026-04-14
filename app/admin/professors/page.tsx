'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'

export default function ProfessorsPage() {
  const [professors, setProfessors] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [currentProfessorId, setCurrentProfessorId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    empNo: '',
    departmentId: '',
    phone: '',
  })

  const fetchProfessors = async () => {
    try {
      const res = await fetch('/api/professors')
      const data = await res.json()
      if (data.success) {
        setProfessors(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch professors:', error)
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
    Promise.all([fetchProfessors(), fetchDepartments()]).finally(() => setLoading(false))
  }, [])

  const handleOpenModal = (mode: 'add' | 'edit', professor?: any) => {
    setModalMode(mode)
    if (mode === 'edit' && professor) {
      setCurrentProfessorId(professor.professor_id)
      setFormData({
        firstName: professor.first_name,
        lastName: professor.last_name,
        email: professor.user.email,
        password: '', // Password update not handled currently via this form
        empNo: professor.emp_no,
        departmentId: professor.department_id,
        phone: professor.phone || '',
      })
    } else {
      setCurrentProfessorId(null)
      setFormData({
        firstName: '', lastName: '', email: '', password: '', empNo: '', departmentId: '', phone: ''
      })
    }
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = modalMode === 'add' ? '/api/professors' : `/api/professors/${currentProfessorId}`
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
        fetchProfessors()
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Failed to save professor:', error)
      alert('Failed to save professor')
    }
  }

  const handleDelete = async (professorId: string) => {
    if (!confirm('Are you sure you want to delete this professor?')) return

    try {
      const res = await fetch(`/api/professors/${professorId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        fetchProfessors()
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Failed to delete professor:', error)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Professors</h1>
          <p className="text-muted-foreground">Manage all professors</p>
        </div>
        <Button onClick={() => handleOpenModal('add')}>Add Professor</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Professors</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Emp No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {professors.map((professor, idx) => (
                <TableRow key={professor.professor_id} className={`hover:bg-slate-50 ${idx % 2 === 1 ? 'bg-slate-50/40' : ''}`}>
                  <TableCell>{professor.emp_no}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: '#22c55e' }}>
                        {professor.first_name?.[0]}{professor.last_name?.[0]}
                      </span>
                      {professor.first_name} {professor.last_name}
                    </div>
                  </TableCell>
                  <TableCell>{professor.user?.email}</TableCell>
                  <TableCell>{professor.department?.name}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenModal('edit', professor)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(professor.professor_id)}>
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {professors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                    No professors found.
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
            <h2 className="text-xl font-bold mb-4">{modalMode === 'add' ? 'Add Professor' : 'Edit Professor'}</h2>
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
                <label className="block text-sm font-medium mb-1">Employee No</label>
                <input required className="w-full border rounded p-2" value={formData.empNo} onChange={e => setFormData({ ...formData, empNo: e.target.value })} />
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
