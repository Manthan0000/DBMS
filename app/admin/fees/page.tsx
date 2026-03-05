'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function FeesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchInvoices() {
      try {
        // Note: You'll need to create an API route for invoices
        const res = await fetch('/api/payments')
        const data = await res.json()
        if (data.success) {
          // Group by invoice
          const invoiceMap = new Map()
          data.data.forEach((payment: any) => {
            if (!invoiceMap.has(payment.invoice_id)) {
              invoiceMap.set(payment.invoice_id, {
                ...payment.invoice,
                payments: [],
              })
            }
            invoiceMap.get(payment.invoice_id).payments.push(payment)
          })
          setInvoices(Array.from(invoiceMap.values()))
        }
      } catch (error) {
        console.error('Failed to fetch invoices:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInvoices()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Fee Management</h1>
        <p className="text-muted-foreground">All fee invoices and payments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fee Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.invoice_id}>
                  <TableCell>
                    {invoice.student.first_name} {invoice.student.last_name}
                  </TableCell>
                  <TableCell>{invoice.term.name}</TableCell>
                  <TableCell>₹{Number(invoice.total_amount).toLocaleString()}</TableCell>
                  <TableCell>
                    <span
                      className={
                        invoice.status === 'PAID'
                          ? 'text-green-600'
                          : invoice.status === 'PARTIAL'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }
                    >
                      {invoice.status}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
