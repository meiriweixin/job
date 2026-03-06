import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { runSingleAlert } from '@/lib/ingest'
import { z } from 'zod'

const UpdateSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    query: z.string().max(200).optional(),
    filters: z.record(z.unknown()).optional(),
    frequency: z.enum(['DAILY', 'WEEKLY']).optional(),
})

async function getAlertAndVerify(alertId: string, userId: string) {
    const alert = await prisma.alert.findUnique({ where: { id: alertId } })
    if (!alert) return null
    if (alert.userId !== userId) return null
    return alert
}

export async function GET(
    _req: NextRequest,
    { params }: { params: { alertId: string } }
) {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = (session.user as { id: string }).id

    const alert = await prisma.alert.findUnique({
        where: { id: params.alertId },
        include: {
            runs: {
                orderBy: { runAt: 'desc' },
                take: 10,
                include: {
                    matchedJobs: {
                        include: { job: { select: { id: true, title: true, company: true, location: true, postedAt: true } } },
                    },
                },
            },
        },
    })

    if (!alert || alert.userId !== userId) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ alert })
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { alertId: string } }
) {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = (session.user as { id: string }).id

    const alert = await getAlertAndVerify(params.alertId, userId)
    if (!alert) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await req.json().catch(() => ({}))
    const parsed = UpdateSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const updated = await prisma.alert.update({
        where: { id: params.alertId },
        data: parsed.data,
    })

    return NextResponse.json({ alert: updated })
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: { alertId: string } }
) {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = (session.user as { id: string }).id

    const alert = await getAlertAndVerify(params.alertId, userId)
    if (!alert) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.alert.delete({ where: { id: params.alertId } })
    return NextResponse.json({ deleted: true })
}

// POST /api/alerts/[alertId]/run - manually trigger single alert
export async function POST(
    _req: NextRequest,
    { params }: { params: { alertId: string } }
) {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = (session.user as { id: string }).id

    const alert = await getAlertAndVerify(params.alertId, userId)
    if (!alert) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const matchCount = await runSingleAlert(params.alertId)
    return NextResponse.json({ matchCount })
}
