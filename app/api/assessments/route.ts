import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { assessmentSchema } from '@/lib/validations'

// GET assessments
export const GET = requireRole(['ADMIN', 'PROFESSOR', 'STUDENT'])(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const offeringId = searchParams.get('offeringId')

    const assessments = await prisma.assessment.findMany({
      where: offeringId ? { offering_id: offeringId } : undefined,
      include: {
        offering: {
          include: {
            course: true,
            term: true,
          },
        },
        gradeRecords: {
          include: {
            student: true,
          },
        },
      },
      orderBy: {
        due_date: 'asc',
      },
    })

    return NextResponse.json({ success: true, data: assessments })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
})

// POST create assessment
export const POST = requireRole(['ADMIN', 'PROFESSOR'])(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const data = assessmentSchema.parse(body)

    const assessment = await prisma.assessment.create({
      data: {
        offering_id: data.offeringId,
        name: data.name,
        type: data.type,
        max_marks: data.maxMarks,
        due_date: data.dueDate ? new Date(data.dueDate) : null,
      },
      include: {
        offering: {
          include: {
            course: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: assessment }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    )
  }
})
