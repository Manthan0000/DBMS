'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [currentCourseId, setCurrentCourseId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    credits: 3,
    departmentId: '',
  })

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses')
      const data = await res.json()
      if (data.success) {
        setCourses(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error)
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
    Promise.all([fetchCourses(), fetchDepartments()]).finally(() => setLoading(false))
  }, [])

  const handleOpenModal = (mode: 'add' | 'edit', course?: any) => {
    setModalMode(mode)
    if (mode === 'edit' && course) {
      setCurrentCourseId(course.course_id)
      setFormData({
        code: course.code,
        title: course.title,
        description: course.description || '',
        credits: course.credits,
        departmentId: course.department_id,
      })
    } else {
      setCurrentCourseId(null)
      setFormData({ code: '', title: '', description: '', credits: 3, departmentId: '' })
    }
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = modalMode === 'add' ? '/api/courses' : `/api/courses/${currentCourseId}`
    const method = modalMode === 'add' ? 'POST' : 'PUT'

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          credits: Number(formData.credits) // Ensure number type for API validation
        }),
      })
      const data = await res.json()
      if (data.success) {
        setModalOpen(false)
        fetchCourses()
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Failed to save course:', error)
      alert('Failed to save course')
    }
  }

  const handleDelete = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return

    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        fetchCourses()
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Failed to delete course:', error)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-muted-foreground">Manage all courses</p>
        </div>
        <Button onClick={() => handleOpenModal('add')}>Add Course</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.course_id}>
                  <TableCell>{course.code}</TableCell>
                  <TableCell>{course.title}</TableCell>
                  <TableCell>{course.credits}</TableCell>
                  <TableCell>{course.department?.name}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenModal('edit', course)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(course.course_id)}>
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {courses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                    No courses found.
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
            <h2 className="text-xl font-bold mb-4">{modalMode === 'add' ? 'Add Course' : 'Edit Course'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Course Code</label>
                <input required className="w-full border rounded p-2" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input required className="w-full border rounded p-2" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea className="w-full border rounded p-2" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Credits</label>
                <input required type="number" min="1" max="6" className="w-full border rounded p-2" value={formData.credits} onChange={e => setFormData({ ...formData, credits: Number(e.target.value) })} />
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
