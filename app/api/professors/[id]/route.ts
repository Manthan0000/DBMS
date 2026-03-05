import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET professor by ID
export const GET = requireAuth(async (req: NextRequest, user) => {
    try {
        const params = new URL(req.url).pathname.split('/')
        const professorId = params[params.length - 1]

        if (user.role === 'PROFESSOR') {
            const professor = await prisma.professor.findUnique({
                where: { user_id: user.userId },
            })
            if (professor?.professor_id !== professorId) {
                return NextResponse.json(
                    { success: false, error: 'Forbidden' },
                    { status: 403 }
                )
            }
        }

        const professor = await prisma.professor.findUnique({
            where: { professor_id: professorId },
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

        if (!professor) {
            return NextResponse.json(
                { success: false, error: 'Professor not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, data: professor })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
})

// PUT update professor
export const PUT = requireAuth(async (req: NextRequest, user) => {
    try {
        if (user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Forbidden' },
                { status: 403 }
            )
        }

        const params = new URL(req.url).pathname.split('/')
        const professorId = params[params.length - 1]
        const body = await req.json()

        const updatedProfessor = await prisma.professor.update({
            where: { professor_id: professorId },
            data: {
                first_name: body.firstName,
                last_name: body.lastName,
                phone: body.phone,
                emp_no: body.empNo,
                department: {
                    connect: { department_id: body.departmentId }
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

        return NextResponse.json({ success: true, data: updatedProfessor })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
})

// DELETE professor
export const DELETE = requireAuth(async (req: NextRequest, user) => {
    try {
        if (user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Forbidden' },
                { status: 403 }
            )
        }

        const params = new URL(req.url).pathname.split('/')
        const professorId = params[params.length - 1]

        const professor = await prisma.professor.findUnique({
            where: { professor_id: professorId },
        })

        if (!professor) {
            return NextResponse.json(
                { success: false, error: 'Professor not found' },
                { status: 404 }
            )
        }

        // Cascade delete professor via user
        await prisma.user.delete({
            where: { user_id: professor.user_id },
        })

        return NextResponse.json({ success: true, data: { deleted: true } })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
})
