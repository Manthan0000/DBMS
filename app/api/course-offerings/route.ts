import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createCourseOfferingSchema } from '@/lib/validations'
import { getProfessorByUserId } from '@/lib/access'
import { Prisma } from '@prisma/client'

const offeringInclude = {
  course: { include: { department: true } },
  term: true,
  teachingAssignments: {
    include: {
      professor: true,
    },
  },
  enrollments: true,
} as const

export const GET = requireRole(['ADMIN', 'PROFESSOR', 'STUDENT'])(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const termId = searchParams.get('termId')
    const courseId = searchParams.get('courseId')

    const offerings = await prisma.courseOffering.findMany({
      where: {
        ...(termId && { term_id: termId }),
        ...(courseId && { course_id: courseId }),
      },
      include: offeringInclude,
      orderBy: [{ created_at: 'desc' }, { section: 'asc' }],
    })

    return NextResponse.json({ success: true, data: offerings })
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
    const data = createCourseOfferingSchema.parse(body)

    const course = await prisma.course.findUnique({
      where: { course_id: data.courseId },
    })
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      )
    }

    const term = await prisma.term.findUnique({
      where: { term_id: data.termId },
    })
    if (!term) {
      return NextResponse.json({ success: false, error: 'Term not found' }, { status: 404 })
    }

    if (user.role === 'PROFESSOR') {
      if (data.professorId) {
        return NextResponse.json(
          { success: false, error: 'professorId is only valid for admin requests' },
          { status: 400 }
        )
      }
      const prof = await getProfessorByUserId(user.userId)
      if (!prof) {
        return NextResponse.json(
          { success: false, error: 'Professor not found' },
          { status: 404 }
        )
      }
      if (course.department_id !== prof.department_id) {
        return NextResponse.json(
          { success: false, error: 'You can only create offerings for courses in your department' },
          { status: 403 }
        )
      }

      const offering = await prisma.$transaction(async (tx) => {
        const o = await tx.courseOffering.create({
          data: {
            course_id: data.courseId,
            term_id: data.termId,
            section: data.section,
            capacity: data.capacity ?? 30,
          },
        })
        await tx.teachingAssignment.create({
          data: {
            offering_id: o.offering_id,
            professor_id: prof.professor_id,
          },
        })
        return tx.courseOffering.findUniqueOrThrow({
          where: { offering_id: o.offering_id },
          include: offeringInclude,
        })
      })

      return NextResponse.json({ success: true, data: offering }, { status: 201 })
    }

    // ADMIN
    if (data.professorId) {
      const assignee = await prisma.professor.findUnique({
        where: { professor_id: data.professorId },
      })
      if (!assignee) {
        return NextResponse.json(
          { success: false, error: 'Professor not found for assignment' },
          { status: 404 }
        )
      }
    }

    const offering = await prisma.$transaction(async (tx) => {
      const o = await tx.courseOffering.create({
        data: {
          course_id: data.courseId,
          term_id: data.termId,
          section: data.section,
          capacity: data.capacity ?? 30,
        },
      })
      if (data.professorId) {
        await tx.teachingAssignment.create({
          data: {
            offering_id: o.offering_id,
            professor_id: data.professorId,
          },
        })
      }
      return tx.courseOffering.findUniqueOrThrow({
        where: { offering_id: o.offering_id },
        include: offeringInclude,
      })
    })

    return NextResponse.json({ success: true, data: offering }, { status: 201 })
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          error:
            'An offering already exists for this course, term, and section. Choose a different section.',
        },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create offering' },
      { status: 400 }
    )
  }
})
