import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET all courses taught by the current professor
export const GET = requireAuth(async (req: NextRequest, user) => {
    try {
        if (user.role !== 'PROFESSOR') {
            return NextResponse.json(
                { success: false, error: 'Forbidden' },
                { status: 403 }
            )
        }

        const professor = await prisma.professor.findUnique({
            where: { user_id: user.userId },
            include: {
                teachingAssignments: {
                    include: {
                        offering: {
                            include: {
                                course: {
                                    include: {
                                        department: true
                                    }
                                },
                                term: true,
                                enrollments: true,
                            },
                        },
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

        // Map relationships to a cleaner flat array for the frontend
        const courses = professor.teachingAssignments.map((ta) => ({
            offering_id: ta.offering.offering_id,
            course_id: ta.offering.course.course_id,
            code: ta.offering.course.code,
            title: ta.offering.course.title,
            credits: ta.offering.course.credits,
            department: ta.offering.course.department.name,
            term: ta.offering.term.name,
            section: ta.offering.section,
            enrolled: ta.offering.enrollments.length,
            capacity: ta.offering.capacity,
        }))

        return NextResponse.json({ success: true, data: courses })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
})
