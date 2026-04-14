'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function StudentFeesPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPayments() {
      try {
        const res = await fetch('/api/payments')
        const data = await res.json()
        if (data.success) {
          setPayments(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch payments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Fees</h1>
        <p className="text-muted-foreground">Fee invoices and payment history</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Term</TableHead>
                <TableHead>Invoice Amount</TableHead>
                <TableHead>Payment Amount</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment, idx) => (
                <TableRow key={payment.payment_id} className={`hover:bg-slate-50 ${idx % 2 === 1 ? 'bg-slate-50/40' : ''}`}>
                  <TableCell>{payment.invoice.term.name}</TableCell>
                  <TableCell>₹{Number(payment.invoice.total_amount).toLocaleString()}</TableCell>
                  <TableCell>₹{Number(payment.amount).toLocaleString()}</TableCell>
                  <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span
                      className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={
                        payment.invoice.status === 'PAID'
                          ? { background: '#d1fae5', color: '#065f46' }
                          : payment.invoice.status === 'PARTIAL'
                          ? { background: '#fef3c7', color: '#78350f' }
                          : { background: '#fff1ec', color: '#9a3412' }
                      }
                    >
                      {payment.invoice.status}
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
