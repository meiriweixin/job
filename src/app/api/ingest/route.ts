import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { runIngest } from '@/lib/ingest'
import { prisma } from '@/lib/prisma'
import { isAdminEmail } from '@/lib/utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(req: NextRequest) {
    // Check auth
    const session = await auth()
    const user = session?.user as { email?: string; role?: string } | undefined

    const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').filter(Boolean)
    const isAdmin =
        user?.role === 'admin' || (user?.email ? isAdminEmail(user.email) : false)

    if (!isAdmin) {
        return NextResponse.json({ error: 'Forbidden: admin only' }, { status: 403 })
    }

    const result = await runIngest()

    return NextResponse.json({
        success: !result.error,
        ...result,
    })
}

export async function GET(req: NextRequest) {
    // Return list of recent ingest logs
    const session = await auth()
    const user = session?.user as { email?: string; role?: string } | undefined
    const isAdmin = user?.role === 'admin' || (user?.email ? isAdminEmail(user.email) : false)

    if (!isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const logs = await prisma.ingestLog.findMany({
        orderBy: { startedAt: 'desc' },
        take: 20,
    })

    return NextResponse.json({ logs })
}
