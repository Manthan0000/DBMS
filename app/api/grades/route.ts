import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { gradeSchema } from '@/lib/validations'
import {
  getProfessorByUserId,
  getStudentByUserId,
  offeringIdsForProfessor,
  professorTeachesOffering,
} from '@/lib/access'

// GET grade records
export const GET = requireRole(['ADMIN', 'PROFESSOR', 'STUDENT'])(async (
  req: NextRequest,
  user
) => {
  try {
    const { searchParams } = new URL(req.url)
    const assessmentIdParam = searchParams.get('assessmentId')
    const studentIdParam = searchParams.get('studentId')
    const offeringIdParam = searchParams.get('offeringId')

    const where: any = {}

    if (user.role === 'STUDENT') {
      const student = await getStudentByUserId(user.userId)
      if (!student) {
        return NextResponse.json(
          { success: false, error: 'Student not found' },
          { status: 404 }
        )
      }
      where.student_id = student.student_id

      if (assessmentIdParam) {
        const a = await prisma.assessment.findUnique({
          where: { assessment_id: assessmentIdParam },
          select: { offering_id: true },
        })
        if (!a) {
          return NextResponse.json({ success: true, data: [] })
        }
        const enr = await prisma.enrollment.findUnique({
          where: {
            offering_id_student_id: {
              offering_id: a.offering_id,
              student_id: student.student_id,
            },
          },
        })
        if (!enr) {
          return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
        }
        where.assessment_id = assessmentIdParam
      } else if (offeringIdParam) {
        const enr = await prisma.enrollment.findUnique({
          where: {
            offering_id_student_id: {
              offering_id: offeringIdParam,
              student_id: student.student_id,
            },
          },
        })
        if (!enr) {
          return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
        }
        const assessments = await prisma.assessment.findMany({
          where: { offering_id: offeringIdParam },
          select: { assessment_id: true },
        })
        where.assessment_id = { in: assessments.map((x) => x.assessment_id) }
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

      if (assessmentIdParam) {
        const a = await prisma.assessment.findUnique({
          where: { assessment_id: assessmentIdParam },
          select: { offering_id: true },
        })
        if (!a || !oids.includes(a.offering_id)) {
          return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
        }
        where.assessment_id = assessmentIdParam
      } else if (offeringIdParam) {
        if (!oids.includes(offeringIdParam)) {
          return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
        }
        const assessments = await prisma.assessment.findMany({
          where: { offering_id: offeringIdParam },
          select: { assessment_id: true },
        })
        where.assessment_id = { in: assessments.map((x) => x.assessment_id) }
      } else {
        const assessments = await prisma.assessment.findMany({
          where: { offering_id: { in: oids } },
          select: { assessment_id: true },
        })
        where.assessment_id = { in: assessments.map((x) => x.assessment_id) }
      }

      if (where.assessment_id?.in?.length === 0) {
        return NextResponse.json({ success: true, data: [] })
      }

      if (studentIdParam) {
        where.student_id = studentIdParam
      }
    } else {
      if (studentIdParam) {
        where.student_id = studentIdParam
      }
      if (assessmentIdParam) {
        where.assessment_id = assessmentIdParam
      } else if (offeringIdParam) {
        const assessments = await prisma.assessment.findMany({
          where: { offering_id: offeringIdParam },
          select: { assessment_id: true },
        })
        where.assessment_id = { in: assessments.map((a) => a.assessment_id) }
      }
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
export const POST = requireRole(['ADMIN', 'PROFESSOR'])(async (req: NextRequest, user) => {
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

    if (user.role === 'PROFESSOR') {
      const prof = await getProfessorByUserId(user.userId)
      if (!prof) {
        return NextResponse.json(
          { success: false, error: 'Professor not found' },
          { status: 404 }
        )
      }
      const ok = await professorTeachesOffering(prof.professor_id, assessment.offering_id)
      if (!ok) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
      }
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
