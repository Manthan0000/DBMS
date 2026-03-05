import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch full user details
    const fullUser = await prisma.user.findUnique({
      where: { user_id: user.userId },
      include: {
        student: {
          include: {
            department: true,
          },
        },
        professor: {
          include: {
            department: true,
          },
        },
        admin: true,
      },
    })

    if (!fullUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: fullUser.user_id,
        email: fullUser.email,
        role: fullUser.role,
        student: fullUser.student,
        professor: fullUser.professor,
        admin: fullUser.admin,
      },
    })
  } catch (error: any) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get user' },
      { status: 500 }
    )
  }
}
