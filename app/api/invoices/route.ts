import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createFeeInvoiceSchema, feeInvoiceStatusSchema } from '@/lib/validations'

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

// Create fee invoice (admin)
export const POST = requireRole(['ADMIN'])(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const data = createFeeInvoiceSchema.parse(body)

    const [student, term] = await Promise.all([
      prisma.student.findUnique({
        where: { student_id: data.studentId },
      }),
      prisma.term.findUnique({
        where: { term_id: data.termId },
      }),
    ])

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      )
    }

    if (!term) {
      return NextResponse.json(
        { success: false, error: 'Term not found' },
        { status: 404 }
      )
    }

    const existing = await prisma.feeInvoice.findUnique({
      where: {
        student_id_term_id: {
          student_id: data.studentId,
          term_id: data.termId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Invoice already exists for this student and term' },
        { status: 409 }
      )
    }

    const invoice = await prisma.feeInvoice.create({
      data: {
        student_id: data.studentId,
        term_id: data.termId,
        total_amount: data.totalAmount,
        due_date: new Date(data.dueDate),
        status: 'PENDING',
      },
      include: {
        student: true,
        term: true,
        payments: true,
      },
    })

    return NextResponse.json({ success: true, data: invoice }, { status: 201 })
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Invoice already exists for this student and term' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create invoice' },
      { status: 400 }
    )
  }
})
