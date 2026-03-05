import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { enrollmentSchema } from '@/lib/validations'

// GET enrollments
export const GET = requireRole(['ADMIN', 'PROFESSOR', 'STUDENT'])(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId')
    const offeringId = searchParams.get('offeringId')

    const enrollments = await prisma.enrollment.findMany({
      where: {
        ...(studentId && { student_id: studentId }),
        ...(offeringId && { offering_id: offeringId }),
      },
      include: {
        student: {
          include: {
            department: true,
          },
        },
        offering: {
          include: {
            course: true,
            term: true,
            teachingAssignments: {
              include: {
                professor: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: enrollments })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
})

// POST create enrollment
export const POST = requireRole(['ADMIN', 'STUDENT'])(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const data = enrollmentSchema.parse(body)

    // Check if student is already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        offering_id_student_id: {
          offering_id: data.offeringId,
          student_id: data.studentId,
        },
      },
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { success: false, error: 'Student is already enrolled in this course' },
        { status: 400 }
      )
    }

    // Check capacity
    const offering = await prisma.courseOffering.findUnique({
      where: { offering_id: data.offeringId },
      include: {
        enrollments: true,
      },
    })

    if (!offering) {
      return NextResponse.json(
        { success: false, error: 'Course offering not found' },
        { status: 404 }
      )
    }

    if (offering.enrollments.length >= offering.capacity) {
      return NextResponse.json(
        { success: false, error: 'Course is full' },
        { status: 400 }
      )
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        offering_id: data.offeringId,
        student_id: data.studentId,
      },
      include: {
        student: true,
        offering: {
          include: {
            course: true,
            term: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: enrollment }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    )
  }
})
