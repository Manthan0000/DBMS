import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const departments = await prisma.department.findMany({
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json({ success: true, data: departments })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
