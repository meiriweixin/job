import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const AlertSchema = z.object({
    name: z.string().min(1).max(100),
    query: z.string().max(200).optional(),
    filters: z.record(z.unknown()).default({}),
    frequency: z.enum(['DAILY', 'WEEKLY']).default('DAILY'),
})

// GET /api/alerts - list user's alerts
export async function GET(req: NextRequest) {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userId = (session.user as { id: string }).id

    const alerts = await prisma.alert.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
            runs: {
                orderBy: { runAt: 'desc' },
                take: 5,
                include: {
                    matchedJobs: {
                        include: {
                            job: {
                                select: {
                                    id: true, title: true, company: true, location: true, postedAt: true,
                                },
                            },
                        },
                        take: 10,
                    },
                },
            },
        },
    })

    return NextResponse.json({ alerts })
}

// POST /api/alerts - create alert
export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userId = (session.user as { id: string }).id
    const body = await req.json().catch(() => ({}))
    const parsed = AlertSchema.safeParse(body)

    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const alert = await prisma.alert.create({
        data: {
            userId,
            name: parsed.data.name,
            query: parsed.data.query,
            filters: parsed.data.filters as import('@prisma/client').Prisma.InputJsonValue,
            frequency: parsed.data.frequency,
        },
    })

    return NextResponse.json({ alert }, { status: 201 })
}
