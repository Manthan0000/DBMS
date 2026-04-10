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

const STATUSES = ['PENDING', 'PARTIAL', 'PAID'] as const

export default function FeesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    fetchInvoices().finally(() => setLoading(false))
  }, [fetchInvoices])

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
              {invoices.map((invoice) => (
                <TableRow key={invoice.invoice_id}>
                  <TableCell>
                    {invoice.student.first_name} {invoice.student.last_name}
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
                    No invoices yet. Invoices are created for enrolled students in seed data, or you can add
                    them via the database / future tooling.
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
