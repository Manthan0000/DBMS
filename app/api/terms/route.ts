import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createTermSchema } from '@/lib/validations'

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

// Create term (admin)
export const POST = requireRole(['ADMIN'])(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const data = createTermSchema.parse(body)

    const existingByName = await prisma.term.findFirst({
      where: {
        name: data.name.trim(),
      },
    })

    if (existingByName) {
      return NextResponse.json(
        { success: false, error: 'A term with this name already exists' },
        { status: 409 }
      )
    }

    const created = await prisma.term.create({
      data: {
        name: data.name.trim(),
        start_date: new Date(data.startDate),
        end_date: new Date(data.endDate),
      },
    })

    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create term' },
      { status: 400 }
    )
  }
})
