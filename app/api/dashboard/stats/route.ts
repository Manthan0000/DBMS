import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const GET = requireAuth(async (req: NextRequest, user) => {
  try {
    if (user.role === 'ADMIN') {
      const [totalStudents, totalProfessors, totalCourses, totalRevenue] = await Promise.all([
        prisma.student.count(),
        prisma.professor.count(),
        prisma.course.count(),
        prisma.payment.aggregate({
          _sum: {
            amount: true,
          },
        }),
      ])

      return NextResponse.json({
        success: true,
        data: {
          totalStudents,
          totalProfessors,
          totalCourses,
          totalRevenue: totalRevenue._sum.amount || 0,
        },
      })
    }

    if (user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { user_id: user.userId },
        include: {
          enrollments: {
            include: {
              offering: {
                include: {
                  course: true,
                },
              },
            },
          },
          attendance: {
            include: {
              session: true,
            },
          },
          grades: {
            include: {
              assessment: true,
            },
          },
          invoices: {
            include: {
              payments: true,
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

      // Calculate attendance percentage
      const totalSessions = student.attendance.length
      const presentSessions = student.attendance.filter((a) => a.status === 'PRESENT').length
      const attendancePercentage =
        totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 0

      // Calculate average grade
      const grades = student.grades.map((g) => Number(g.marks))
      const averageGrade = grades.length > 0 ? grades.reduce((a, b) => a + b, 0) / grades.length : 0

      // Calculate fee status
      const pendingInvoices = student.invoices.filter((i) => i.status === 'PENDING').length
      const totalFee = student.invoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0)

      return NextResponse.json({
        success: true,
        data: {
          enrolledCourses: student.enrollments.length,
          attendancePercentage: Math.round(attendancePercentage * 100) / 100,
          averageGrade: Math.round(averageGrade * 100) / 100,
          pendingInvoices,
          totalFee,
        },
      })
    }

    if (user.role === 'PROFESSOR') {
      const professor = await prisma.professor.findUnique({
        where: { user_id: user.userId },
        include: {
          teachingAssignments: {
            include: {
              offering: {
                include: {
                  course: true,
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

      return NextResponse.json({
        success: true,
        data: {
          coursesTeaching: professor.teachingAssignments.length,
          totalStudents: professor.teachingAssignments.reduce(
            (sum, ta) => sum + ta.offering.enrollments.length,
            0
          ),
        },
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid role' },
      { status: 400 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
})
