import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createProfessorSchema } from '@/lib/validations'

// GET all professors
export const GET = requireRole(['ADMIN'])(async (req: NextRequest) => {
  try {
    const professors = await prisma.professor.findMany({
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
        emp_no: 'asc',
      },
    })

    return NextResponse.json({ success: true, data: professors })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
})

// POST create professor
export const POST = requireRole(['ADMIN'])(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const data = createProfessorSchema.parse(body)

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

    // Check if emp_no already exists
    const existingEmpNo = await prisma.professor.findUnique({
      where: { emp_no: data.empNo },
    })

    if (existingEmpNo) {
      return NextResponse.json(
        { success: false, error: 'Employee number already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10)

    // Create user and professor
    const professor = await prisma.professor.create({
      data: {
        emp_no: data.empNo,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        department: {
          connect: { department_id: data.departmentId }
        },
        user: {
          create: {
            email: data.email,
            password_hash: passwordHash,
            role: 'PROFESSOR',
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

    return NextResponse.json({ success: true, data: professor }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    )
  }
})
