import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { enrollmentSchema } from '@/lib/validations'
import {
  getProfessorByUserId,
  getStudentByUserId,
  offeringIdsForProfessor,
  professorTeachesOffering,
} from '@/lib/access'

// GET enrollments
export const GET = requireRole(['ADMIN', 'PROFESSOR', 'STUDENT'])(async (
  req: NextRequest,
  user
) => {
  try {
    const { searchParams } = new URL(req.url)
    const studentIdParam = searchParams.get('studentId')
    const offeringIdParam = searchParams.get('offeringId')

    let where: { student_id?: string; offering_id?: string | { in: string[] } } = {}

    if (user.role === 'STUDENT') {
      const student = await getStudentByUserId(user.userId)
      if (!student) {
        return NextResponse.json(
          { success: false, error: 'Student not found' },
          { status: 404 }
        )
      }
      where.student_id = student.student_id
      if (offeringIdParam) {
        where.offering_id = offeringIdParam
      }
    } else if (user.role === 'PROFESSOR') {
      const prof = await getProfessorByUserId(user.userId)
      if (!prof) {
        return NextResponse.json(
          { success: false, error: 'Professor not found' },
          { status: 404 }
        )
      }
      const oids = offeringIdsForProfessor(prof)
      if (oids.length === 0) {
        return NextResponse.json({ success: true, data: [] })
      }
      if (offeringIdParam) {
        if (!oids.includes(offeringIdParam)) {
          return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
        }
        where.offering_id = offeringIdParam
      } else {
        where.offering_id = { in: oids }
      }
      if (studentIdParam) {
        where.student_id = studentIdParam
      }
    } else {
      if (studentIdParam) where.student_id = studentIdParam
      if (offeringIdParam) where.offering_id = offeringIdParam
    }

    const enrollments = await prisma.enrollment.findMany({
      where,
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
export const POST = requireRole(['ADMIN', 'PROFESSOR'])(async (
  req: NextRequest,
  user
) => {
  try {
    const body = await req.json()
    const data = enrollmentSchema.parse(body)

    if (user.role === 'PROFESSOR') {
      const prof = await getProfessorByUserId(user.userId)
      if (!prof) {
        return NextResponse.json(
          { success: false, error: 'Professor not found' },
          { status: 404 }
        )
      }
      const ok = await professorTeachesOffering(prof.professor_id, data.offeringId)
      if (!ok) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
      }
    }

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
