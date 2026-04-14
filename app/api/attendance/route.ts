import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { attendanceSchema } from '@/lib/validations'
import {
  getProfessorByUserId,
  getStudentByUserId,
  offeringIdsForProfessor,
  professorTeachesOffering,
} from '@/lib/access'

// GET attendance records
export const GET = requireRole(['ADMIN', 'PROFESSOR', 'STUDENT'])(async (
  req: NextRequest,
  user
) => {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')
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

      if (sessionId) {
        const sess = await prisma.classSession.findUnique({
          where: { session_id: sessionId },
          select: { offering_id: true },
        })
        if (!sess) {
          return NextResponse.json({ success: true, data: [] })
        }
        const enr = await prisma.enrollment.findUnique({
          where: {
            offering_id_student_id: {
              offering_id: sess.offering_id,
              student_id: student.student_id,
            },
          },
        })
        if (!enr) {
          return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
        }
        where.session_id = sessionId
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
        const sessions = await prisma.classSession.findMany({
          where: { offering_id: offeringIdParam },
          select: { session_id: true },
        })
        where.session_id = { in: sessions.map((s) => s.session_id) }
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

      if (sessionId) {
        const sess = await prisma.classSession.findUnique({
          where: { session_id: sessionId },
          select: { offering_id: true },
        })
        if (!sess || !oids.includes(sess.offering_id)) {
          return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
        }
        where.session_id = sessionId
      } else {
        const targetOffering = offeringIdParam
        if (targetOffering) {
          if (!oids.includes(targetOffering)) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
          }
          const sessions = await prisma.classSession.findMany({
            where: { offering_id: targetOffering },
            select: { session_id: true },
          })
          where.session_id = { in: sessions.map((s) => s.session_id) }
        } else {
          const sessions = await prisma.classSession.findMany({
            where: { offering_id: { in: oids } },
            select: { session_id: true },
          })
          where.session_id = { in: sessions.map((s) => s.session_id) }
        }
      }

      if (where.session_id?.in?.length === 0) {
        return NextResponse.json({ success: true, data: [] })
      }

      if (studentIdParam) {
        where.student_id = studentIdParam
      }
    } else {
      if (studentIdParam) {
        where.student_id = studentIdParam
      }
      if (sessionId) {
        where.session_id = sessionId
      } else if (offeringIdParam) {
        const sessions = await prisma.classSession.findMany({
          where: { offering_id: offeringIdParam },
          select: { session_id: true },
        })
        where.session_id = { in: sessions.map((s) => s.session_id) }
      }
    }

    const attendance = await prisma.attendanceRecord.findMany({
      where,
      include: {
        student: {
          include: {
            department: true,
          },
        },
        session: {
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
        marked_at: 'desc',
      },
    })

    return NextResponse.json({ success: true, data: attendance })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
})

// POST mark attendance
export const POST = requireRole(['ADMIN', 'PROFESSOR'])(async (req: NextRequest, user) => {
  try {
    const body = await req.json()
    const data = attendanceSchema.parse(body)

    // Check if student is enrolled in the course offering
    const session = await prisma.classSession.findUnique({
      where: { session_id: data.sessionId },
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

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Class session not found' },
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
      const ok = await professorTeachesOffering(prof.professor_id, session.offering_id)
      if (!ok) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
      }
    }

    if (session.offering.enrollments.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Student is not enrolled in this course' },
        { status: 400 }
      )
    }

    // Upsert attendance record
    const attendance = await prisma.attendanceRecord.upsert({
      where: {
        session_id_student_id: {
          session_id: data.sessionId,
          student_id: data.studentId,
        },
      },
      update: {
        status: data.status,
      },
      create: {
        session_id: data.sessionId,
        student_id: data.studentId,
        status: data.status,
      },
      include: {
        student: true,
        session: {
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

    return NextResponse.json({ success: true, data: attendance }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    )
  }
})
