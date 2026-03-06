import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const ToggleSchema = z.object({
    note: z.string().max(2000).optional(),
})

export async function POST(
    req: NextRequest,
    { params }: { params: { jobId: string } }
) {
    const session = await auth()
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as { id: string }).id
    const { jobId } = params

    const body = await req.json().catch(() => ({}))
    const parsed = ToggleSchema.safeParse(body)
    const note = parsed.success ? parsed.data.note : undefined

    // Check if job exists
    const job = await prisma.job.findUnique({ where: { id: jobId } })
    if (!job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Toggle: if saved, unsave; if not, save
    const existing = await prisma.savedJob.findUnique({
        where: { userId_jobId: { userId, jobId } },
    })

    if (existing) {
        await prisma.savedJob.delete({ where: { userId_jobId: { userId, jobId } } })
        return NextResponse.json({ saved: false })
    } else {
        const saved = await prisma.savedJob.create({
            data: { userId, jobId, note },
        })
        return NextResponse.json({ saved: true, savedJob: saved })
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { jobId: string } }
) {
    const session = await auth()
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as { id: string }).id
    const { jobId } = params

    const body = await req.json().catch(() => ({}))
    const parsed = ToggleSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const updated = await prisma.savedJob.update({
        where: { userId_jobId: { userId, jobId } },
        data: { note: parsed.data.note },
    })

    return NextResponse.json({ savedJob: updated })
}
