import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const job = await prisma.job.findUnique({
            where: { id: params.id },
        })

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 })
        }

        return NextResponse.json({ job })
    } catch (err) {
        console.error('[GET /api/jobs/[id]]', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
