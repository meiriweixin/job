import { NextResponse } from 'next/server'
import { previewIngest } from '@/lib/ingest'

/**
 * GET /api/ingest/preview
 *
 * ⚠️ WARNING: This endpoint is UNPROTECTED and should be disabled in production.
 * Set DISABLE_INGEST_PREVIEW=true in your environment to block access.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET() {
    if (process.env.DISABLE_INGEST_PREVIEW === 'true' && process.env.NODE_ENV === 'production') {
        return NextResponse.json(
            { error: 'Preview endpoint is disabled in production.' },
            { status: 403 }
        )
    }

    try {
        const result = await previewIngest()
        return NextResponse.json({
            _warning:
                process.env.NODE_ENV === 'production'
                    ? '⚠️  This endpoint is unprotected. Set DISABLE_INGEST_PREVIEW=true to disable.'
                    : undefined,
            count: result.count,
            rawSamples: result.rawSamples,
            mappedSamples: result.mappedSamples,
        })
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
