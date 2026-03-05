import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET course by ID
export const GET = requireAuth(async (req: NextRequest, user) => {
    try {
        const params = new URL(req.url).pathname.split('/')
        const courseId = params[params.length - 1]

        const course = await prisma.course.findUnique({
            where: { course_id: courseId },
            include: {
                department: true,
            },
        })

        if (!course) {
            return NextResponse.json(
                { success: false, error: 'Course not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, data: course })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
})

// PUT update course
export const PUT = requireAuth(async (req: NextRequest, user) => {
    try {
        if (user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Forbidden' },
                { status: 403 }
            )
        }

        const params = new URL(req.url).pathname.split('/')
        const courseId = params[params.length - 1]
        const body = await req.json()

        const updatedCourse = await prisma.course.update({
            where: { course_id: courseId },
            data: {
                code: body.code,
                title: body.title,
                description: body.description,
                credits: body.credits,
                department: {
                    connect: { department_id: body.departmentId }
                },
            },
            include: {
                department: true,
            },
        })

        return NextResponse.json({ success: true, data: updatedCourse })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
})

// DELETE course
export const DELETE = requireAuth(async (req: NextRequest, user) => {
    try {
        if (user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Forbidden' },
                { status: 403 }
            )
        }

        const params = new URL(req.url).pathname.split('/')
        const courseId = params[params.length - 1]

        const course = await prisma.course.findUnique({
            where: { course_id: courseId },
        })

        if (!course) {
            return NextResponse.json(
                { success: false, error: 'Course not found' },
                { status: 404 }
            )
        }

        await prisma.course.delete({
            where: { course_id: courseId },
        })

        return NextResponse.json({ success: true, data: { deleted: true } })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
})
