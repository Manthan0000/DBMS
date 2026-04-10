import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { feeInvoiceStatusSchema } from '@/lib/validations'

// List fee invoices (admin sees all; optional studentId filter)
export const GET = requireRole(['ADMIN'])(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId')

    const invoices = await prisma.feeInvoice.findMany({
      where: studentId ? { student_id: studentId } : undefined,
      include: {
        student: {
          include: { department: true },
        },
        term: true,
        payments: true,
      },
      orderBy: { due_date: 'desc' },
    })

    return NextResponse.json({ success: true, data: invoices })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
})

// Update payment status (admin bookkeeping)
export const PATCH = requireRole(['ADMIN'])(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const data = feeInvoiceStatusSchema.parse(body)

    const existing = await prisma.feeInvoice.findUnique({
      where: { invoice_id: data.invoiceId },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      )
    }

    const updated = await prisma.feeInvoice.update({
      where: { invoice_id: data.invoiceId },
      data: { status: data.status },
      include: {
        student: true,
        term: true,
        payments: true,
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    )
  }
})
