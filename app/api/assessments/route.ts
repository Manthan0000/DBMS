import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { assessmentSchema } from '@/lib/validations'
import {
  getProfessorByUserId,
  getStudentByUserId,
  offeringIdsForProfessor,
  professorTeachesOffering,
} from '@/lib/access'

// GET assessments
export const GET = requireRole(['ADMIN', 'PROFESSOR', 'STUDENT'])(async (
  req: NextRequest,
  user
) => {
  try {
    const { searchParams } = new URL(req.url)
    const offeringIdParam = searchParams.get('offeringId')

    let where: { offering_id?: string | { in: string[] } } | undefined

    if (user.role === 'STUDENT') {
      const student = await getStudentByUserId(user.userId)
      if (!student) {
        return NextResponse.json(
          { success: false, error: 'Student not found' },
          { status: 404 }
        )
      }
      const enrolled = await prisma.enrollment.findMany({
        where: { student_id: student.student_id },
        select: { offering_id: true },
      })
      const ids = enrolled.map((e) => e.offering_id)
      if (ids.length === 0) {
        return NextResponse.json({ success: true, data: [] })
      }
      if (offeringIdParam) {
        if (!ids.includes(offeringIdParam)) {
          return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
        }
        where = { offering_id: offeringIdParam }
      } else {
        where = { offering_id: { in: ids } }
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
        where = { offering_id: offeringIdParam }
      } else {
        where = { offering_id: { in: oids } }
      }
    } else {
      where = offeringIdParam ? { offering_id: offeringIdParam } : undefined
    }

    const assessments = await prisma.assessment.findMany({
      where,
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
export const POST = requireRole(['ADMIN', 'PROFESSOR'])(async (req: NextRequest, user) => {
  try {
    const body = await req.json()
    const data = assessmentSchema.parse(body)

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
