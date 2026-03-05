import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { attendanceSchema } from '@/lib/validations'

// GET attendance records
export const GET = requireRole(['ADMIN', 'PROFESSOR', 'STUDENT'])(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')
    const studentId = searchParams.get('studentId')
    const offeringId = searchParams.get('offeringId')

    let where: any = {}

    if (sessionId) {
      where.session_id = sessionId
    }

    if (studentId) {
      where.student_id = studentId
    }

    if (offeringId) {
      const sessions = await prisma.classSession.findMany({
        where: { offering_id: offeringId },
        select: { session_id: true },
      })
      where.session_id = { in: sessions.map((s) => s.session_id) }
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
export const POST = requireRole(['ADMIN', 'PROFESSOR'])(async (req: NextRequest) => {
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
