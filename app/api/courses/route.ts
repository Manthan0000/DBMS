import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createCourseSchema } from '@/lib/validations'

// GET all courses
export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const departmentId = searchParams.get('departmentId')

    const courses = await prisma.course.findMany({
      where: departmentId ? { department_id: departmentId } : undefined,
      include: {
        department: true,
      },
      orderBy: {
        code: 'asc',
      },
    })

    return NextResponse.json({ success: true, data: courses })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST create course
export const POST = requireRole(['ADMIN'])(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const data = createCourseSchema.parse(body)

    // Check if course code already exists
    const existingCourse = await prisma.course.findUnique({
      where: { code: data.code },
    })

    if (existingCourse) {
      return NextResponse.json(
        { success: false, error: 'Course code already exists' },
        { status: 400 }
      )
    }

    const course = await prisma.course.create({
      data: {
        code: data.code,
        title: data.title,
        description: data.description,
        credits: data.credits,
        department: {
          connect: { department_id: data.departmentId }
        },
      },
      include: {
        department: true,
      },
    })

    return NextResponse.json({ success: true, data: course }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    )
  }
})
