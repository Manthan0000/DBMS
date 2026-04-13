'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'

type Invoice = {
  invoice_id: string
  total_amount: string | number
  status: string
  due_date: string
  student: { first_name: string; last_name: string; roll_no: string }
  term: { name: string }
}

type Student = {
  student_id: string
  first_name: string
  last_name: string
  roll_no: string
}

type Term = {
  term_id: string
  name: string
}

const STATUSES = ['PENDING', 'PARTIAL', 'PAID'] as const

export default function FeesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [terms, setTerms] = useState<Term[]>([])
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submittingInvoice, setSubmittingInvoice] = useState(false)
  const [submittingTerm, setSubmittingTerm] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [termFeedback, setTermFeedback] = useState<string | null>(null)
  const [formStudentId, setFormStudentId] = useState('')
  const [formTermId, setFormTermId] = useState('')
  const [formAmount, setFormAmount] = useState('')
  const [formDueDate, setFormDueDate] = useState('')
  const [newTermName, setNewTermName] = useState('')
  const [newTermStartDate, setNewTermStartDate] = useState('')
  const [newTermEndDate, setNewTermEndDate] = useState('')

  const fetchInvoices = useCallback(async () => {
    const res = await fetch('/api/invoices')
    const data = await res.json()
    if (data.success) {
      setInvoices(data.data)
      const d: Record<string, string> = {}
      for (const inv of data.data) {
        d[inv.invoice_id] = inv.status
      }
      setDraft(d)
    }
  }, [])

  const fetchStudentsAndTerms = useCallback(async () => {
    const [sRes, tRes] = await Promise.all([fetch('/api/students'), fetch('/api/terms')])
    const [sData, tData] = await Promise.all([sRes.json(), tRes.json()])

    if (sData.success) {
      setStudents(sData.data)
      if (!formStudentId && sData.data[0]?.student_id) {
        setFormStudentId(sData.data[0].student_id)
      }
    }

    if (tData.success) {
      setTerms(tData.data)
      if (!formTermId && tData.data[0]?.term_id) {
        setFormTermId(tData.data[0].term_id)
      }
    }
  }, [formStudentId, formTermId])

  useEffect(() => {
    Promise.all([fetchInvoices(), fetchStudentsAndTerms()]).finally(() => setLoading(false))
  }, [fetchInvoices, fetchStudentsAndTerms])

  const updateStatus = async (invoiceId: string) => {
    const status = draft[invoiceId]
    if (!status || !STATUSES.includes(status as (typeof STATUSES)[number])) {
      alert('Invalid status')
      return
    }
    const res = await fetch('/api/invoices', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId, status }),
    })
    const data = await res.json()
    if (data.success) {
      setInvoices((prev) =>
        prev.map((i) => (i.invoice_id === invoiceId ? { ...i, status } : i))
      )
    } else {
      alert(data.error || 'Update failed')
    }
  }

  const createInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback(null)

    const amount = Number(formAmount)
    if (!formStudentId || !formTermId || !formDueDate || Number.isNaN(amount) || amount <= 0) {
      setFeedback('Select student and term, and provide a valid amount and due date.')
      return
    }

    setSubmittingInvoice(true)
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: formStudentId,
          termId: formTermId,
          totalAmount: amount,
          dueDate: formDueDate,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setFeedback('Invoice created successfully.')
        setFormAmount('')
        setFormDueDate('')
        await fetchInvoices()
        return
      }

      if (res.status === 409) {
        setFeedback('Invoice already exists for this student and term.')
      } else {
        setFeedback(data.error || 'Failed to create invoice.')
      }
    } catch (error) {
      console.error(error)
      setFeedback('Failed to create invoice.')
    } finally {
      setSubmittingInvoice(false)
    }
  }

  const createTerm = async (e: React.FormEvent) => {
    e.preventDefault()
    setTermFeedback(null)

    if (!newTermName.trim() || !newTermStartDate || !newTermEndDate) {
      setTermFeedback('Provide term name, start date, and end date.')
      return
    }

    setSubmittingTerm(true)
    try {
      const res = await fetch('/api/terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTermName.trim(),
          startDate: newTermStartDate,
          endDate: newTermEndDate,
        }),
      })
      const data = await res.json()

      if (data.success) {
        setTermFeedback('Term created successfully.')
        setNewTermName('')
        setNewTermStartDate('')
        setNewTermEndDate('')
        await fetchStudentsAndTerms()
        if (data.data?.term_id) {
          setFormTermId(data.data.term_id)
        }
      } else {
        setTermFeedback(data.error || 'Failed to create term.')
      }
    } catch (error) {
      console.error(error)
      setTermFeedback('Failed to create term.')
    } finally {
      setSubmittingTerm(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Fee management</h1>
        <p className="text-muted-foreground">
          All fee invoices (including unpaid with no payments). Update payment status as needed.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fee invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 rounded-md border p-4">
            <h3 className="text-lg font-semibold">Create fee invoice</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Create one invoice per student per term. Duplicate student-term invoices are blocked.
            </p>
            <form onSubmit={createInvoice} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Student</label>
                <select
                  className="w-full rounded border bg-white p-2"
                  value={formStudentId}
                  onChange={(e) => setFormStudentId(e.target.value)}
                  required
                >
                  <option value="">Select student</option>
                  {students.map((student) => (
                    <option key={student.student_id} value={student.student_id}>
                      {student.roll_no} - {student.first_name} {student.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Term</label>
                <select
                  className="w-full rounded border bg-white p-2"
                  value={formTermId}
                  onChange={(e) => setFormTermId(e.target.value)}
                  required
                >
                  <option value="">Select term</option>
                  {terms.map((term) => (
                    <option key={term.term_id} value={term.term_id}>
                      {term.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Total amount</label>
                <input
                  type="number"
                  min={0.01}
                  step="0.01"
                  className="w-full rounded border p-2"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  placeholder="e.g. 50000"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Due date</label>
                <input
                  type="date"
                  className="w-full rounded border p-2"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  required
                />
              </div>

              <div className="md:col-span-2">
                {feedback && (
                  <p className={feedback.toLowerCase().includes('success') ? 'text-green-700' : 'text-red-600'}>
                    {feedback}
                  </p>
                )}
                <Button type="submit" disabled={submittingInvoice} className="mt-2">
                  {submittingInvoice ? 'Creating...' : 'Create invoice'}
                </Button>
              </div>
            </form>
          </div>

          <div className="mb-6 rounded-md border p-4">
            <h3 className="text-lg font-semibold">Create term</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Add a new academic term, then use it immediately for invoice creation.
            </p>
            <form onSubmit={createTerm} className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Term name</label>
                <input
                  className="w-full rounded border p-2"
                  value={newTermName}
                  onChange={(e) => setNewTermName(e.target.value)}
                  placeholder="e.g. Fall 2026"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Start date</label>
                <input
                  type="date"
                  className="w-full rounded border p-2"
                  value={newTermStartDate}
                  onChange={(e) => setNewTermStartDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">End date</label>
                <input
                  type="date"
                  className="w-full rounded border p-2"
                  value={newTermEndDate}
                  onChange={(e) => setNewTermEndDate(e.target.value)}
                  required
                />
              </div>
              <div className="md:col-span-3">
                {termFeedback && (
                  <p
                    className={
                      termFeedback.toLowerCase().includes('success') ? 'text-green-700' : 'text-red-600'
                    }
                  >
                    {termFeedback}
                  </p>
                )}
                <Button type="submit" disabled={submittingTerm} className="mt-2">
                  {submittingTerm ? 'Creating...' : 'Create term'}
                </Button>
              </div>
            </form>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Roll no</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Total amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice, idx) => (
                <TableRow key={invoice.invoice_id} className={`hover:bg-slate-50 ${idx % 2 === 1 ? 'bg-slate-50/40' : ''}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: '#0ea5e9' }}>
                        {invoice.student.first_name?.[0]}{invoice.student.last_name?.[0]}
                      </span>
                      {invoice.student.first_name} {invoice.student.last_name}
                    </div>
                  </TableCell>
                  <TableCell>{invoice.student.roll_no}</TableCell>
                  <TableCell>{invoice.term.name}</TableCell>
                  <TableCell>₹{Number(invoice.total_amount).toLocaleString()}</TableCell>
                  <TableCell>
                    <select
                      className="rounded border bg-white p-2 text-sm"
                      value={draft[invoice.invoice_id] ?? invoice.status}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          [invoice.invoice_id]: e.target.value,
                        }))
                      }
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(invoice.invoice_id)}
                      disabled={
                        (draft[invoice.invoice_id] ?? invoice.status).toUpperCase() ===
                        invoice.status.toUpperCase()
                      }
                    >
                      Save status
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {invoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-6 text-center text-muted-foreground">
                    No invoices yet. Use the form above to create the first invoice.
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
