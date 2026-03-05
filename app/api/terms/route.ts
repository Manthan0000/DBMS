import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const terms = await prisma.term.findMany({
      orderBy: {
        start_date: 'desc',
      },
    })

    return NextResponse.json({ success: true, data: terms })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
