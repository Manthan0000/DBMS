import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET student by ID
export const GET = requireAuth(async (req: NextRequest, user) => {
  try {
    const params = new URL(req.url).pathname.split('/')
    const studentId = params[params.length - 1]

    // Students can only view their own profile unless admin/professor
    if (user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { user_id: user.userId },
      })
      if (student?.student_id !== studentId) {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 }
        )
      }
    }

    const student = await prisma.student.findUnique({
      where: { student_id: studentId },
      include: {
        department: true,
        user: {
          select: {
            email: true,
            role: true,
          },
        },
        enrollments: {
          include: {
            offering: {
              include: {
                course: true,
                term: true,
              },
            },
          },
        },
      },
    })

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: student })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
})

// PUT update student
export const PUT = requireAuth(async (req: NextRequest, user) => {
  try {
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    const params = new URL(req.url).pathname.split('/')
    const studentId = params[params.length - 1]
    const body = await req.json()

    const updatedStudent = await prisma.student.update({
      where: { student_id: studentId },
      data: {
        first_name: body.firstName,
        last_name: body.lastName,
        phone: body.phone,
        department: {
          connect: { department_id: body.departmentId }
        },
        date_of_birth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        roll_no: body.rollNo,
      },
      include: {
        department: true,
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: updatedStudent })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
})

// DELETE student
export const DELETE = requireAuth(async (req: NextRequest, user) => {
  try {
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    const params = new URL(req.url).pathname.split('/')
    const studentId = params[params.length - 1]

    const student = await prisma.student.findUnique({
      where: { student_id: studentId },
    })

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      )
    }

    // This will cascade and delete the student since student -> user has onDelete: Cascade
    await prisma.user.delete({
      where: { user_id: student.user_id },
    })

    return NextResponse.json({ success: true, data: { deleted: true } })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
})
