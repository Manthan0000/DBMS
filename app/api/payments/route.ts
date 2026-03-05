import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { paymentSchema } from '@/lib/validations'

// GET payments
export const GET = requireRole(['ADMIN', 'STUDENT'])(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const invoiceId = searchParams.get('invoiceId')
    const studentId = searchParams.get('studentId')

    let where: any = {}

    if (invoiceId) {
      where.invoice_id = invoiceId
    }

    if (studentId) {
      const invoices = await prisma.feeInvoice.findMany({
        where: { student_id: studentId },
        select: { invoice_id: true },
      })
      where.invoice_id = { in: invoices.map((i) => i.invoice_id) }
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        invoice: {
          include: {
            student: true,
            term: true,
          },
        },
      },
      orderBy: {
        payment_date: 'desc',
      },
    })

    return NextResponse.json({ success: true, data: payments })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
})

// POST create payment
export const POST = requireRole(['ADMIN', 'STUDENT'])(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const data = paymentSchema.parse(body)

    // Get invoice
    const invoice = await prisma.feeInvoice.findUnique({
      where: { invoice_id: data.invoiceId },
      include: {
        payments: true,
      },
    })

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Calculate total paid
    const totalPaid = invoice.payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    )

    // Check if payment exceeds remaining amount
    const remainingAmount = Number(invoice.total_amount) - totalPaid
    if (data.amount > remainingAmount) {
      return NextResponse.json(
        { success: false, error: `Payment cannot exceed remaining amount of ${remainingAmount}` },
        { status: 400 }
      )
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        invoice_id: data.invoiceId,
        amount: data.amount,
        payment_method: data.paymentMethod || 'ONLINE',
        transaction_id: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      },
      include: {
        invoice: {
          include: {
            student: true,
            term: true,
          },
        },
      },
    })

    // Update invoice status
    const newTotalPaid = totalPaid + Number(data.amount)
    let status = 'PARTIAL'
    if (newTotalPaid >= Number(invoice.total_amount)) {
      status = 'PAID'
    }

    await prisma.feeInvoice.update({
      where: { invoice_id: data.invoiceId },
      data: { status },
    })

    return NextResponse.json({ success: true, data: payment }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    )
  }
})
