import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createStudentSchema } from '@/lib/validations'

// GET all students
export const GET = requireRole(['ADMIN', 'PROFESSOR'])(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const departmentId = searchParams.get('departmentId')

    const students = await prisma.student.findMany({
      where: departmentId ? { department_id: departmentId } : undefined,
      include: {
        department: true,
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        roll_no: 'asc',
      },
    })

    return NextResponse.json({ success: true, data: students })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
})

// POST create student
export const POST = requireRole(['ADMIN'])(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const data = createStudentSchema.parse(body)

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Check if roll_no already exists
    const existingRollNo = await prisma.student.findUnique({
      where: { roll_no: data.rollNo },
    })

    if (existingRollNo) {
      return NextResponse.json(
        { success: false, error: 'Roll number already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10)

    // Create user and student
    const student = await prisma.student.create({
      data: {
        roll_no: data.rollNo,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        date_of_birth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        department: {
          connect: { department_id: data.departmentId },
        },
        user: {
          create: {
            email: data.email,
            password_hash: passwordHash,
            role: 'STUDENT',
          },
        },
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

    return NextResponse.json({ success: true, data: student }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    )
  }
})
