import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { gradeSchema } from '@/lib/validations'

// GET grade records
export const GET = requireRole(['ADMIN', 'PROFESSOR', 'STUDENT'])(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const assessmentId = searchParams.get('assessmentId')
    const studentId = searchParams.get('studentId')
    const offeringId = searchParams.get('offeringId')

    let where: any = {}

    if (assessmentId) {
      where.assessment_id = assessmentId
    }

    if (studentId) {
      where.student_id = studentId
    }

    if (offeringId) {
      const assessments = await prisma.assessment.findMany({
        where: { offering_id: offeringId },
        select: { assessment_id: true },
      })
      where.assessment_id = { in: assessments.map((a) => a.assessment_id) }
    }

    const grades = await prisma.gradeRecord.findMany({
      where,
      include: {
        student: {
          include: {
            department: true,
          },
        },
        assessment: {
          include: {
            offering: {
              include: {
                course: true,
              },
            },
          },
        },
      },
      orderBy: {
        graded_at: 'desc',
      },
    })

    return NextResponse.json({ success: true, data: grades })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
})

// POST create/update grade
export const POST = requireRole(['ADMIN', 'PROFESSOR'])(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const data = gradeSchema.parse(body)

    // Check if student is enrolled
    const assessment = await prisma.assessment.findUnique({
      where: { assessment_id: data.assessmentId },
      include: {
        offering: {
          include: {
            enrollments: {
              where: { student_id: data.studentId },
            },
          },
        },
      },
    })

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      )
    }

    if (assessment.offering.enrollments.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Student is not enrolled in this course' },
        { status: 400 }
      )
    }

    // Check marks don't exceed max_marks
    if (data.marks > Number(assessment.max_marks)) {
      return NextResponse.json(
        { success: false, error: `Marks cannot exceed ${assessment.max_marks}` },
        { status: 400 }
      )
    }

    // Upsert grade record
    const grade = await prisma.gradeRecord.upsert({
      where: {
        assessment_id_student_id: {
          assessment_id: data.assessmentId,
          student_id: data.studentId,
        },
      },
      update: {
        marks: data.marks,
      },
      create: {
        assessment_id: data.assessmentId,
        student_id: data.studentId,
        marks: data.marks,
      },
      include: {
        student: true,
        assessment: {
          include: {
            offering: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: grade }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    )
  }
})
