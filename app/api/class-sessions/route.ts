import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { classSessionSchema } from '@/lib/validations'
import {
  getProfessorByUserId,
  getStudentByUserId,
  offeringIdsForProfessor,
  professorTeachesOffering,
} from '@/lib/access'

export const GET = requireRole(['ADMIN', 'PROFESSOR', 'STUDENT'])(async (
  req: NextRequest,
  user
) => {
  try {
    const { searchParams } = new URL(req.url)
    const offeringId = searchParams.get('offeringId')

    let where: { offering_id?: string | { in: string[] } } = {}

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
      if (offeringId) {
        if (!ids.includes(offeringId)) {
          return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
        }
        where.offering_id = offeringId
      } else {
        where.offering_id = { in: ids }
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
      if (offeringId) {
        if (!oids.includes(offeringId)) {
          return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
        }
        where.offering_id = offeringId
      } else {
        where.offering_id = { in: oids }
      }
    } else {
      if (offeringId) {
        where.offering_id = offeringId
      }
    }

    const sessions = await prisma.classSession.findMany({
      where,
      include: {
        offering: {
          include: {
            course: true,
            term: true,
          },
        },
      },
      orderBy: { session_date: 'asc' },
    })

    return NextResponse.json({ success: true, data: sessions })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
})

export const POST = requireRole(['ADMIN', 'PROFESSOR'])(async (req: NextRequest, user) => {
  try {
    const body = await req.json()
    const data = classSessionSchema.parse(body)

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

    const session = await prisma.classSession.create({
      data: {
        offering_id: data.offeringId,
        session_date: new Date(data.sessionDate),
        topic: data.topic ?? null,
      },
      include: {
        offering: {
          include: {
            course: true,
            term: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: session }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    )
  }
})
