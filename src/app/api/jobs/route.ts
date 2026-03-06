import { NextRequest, NextResponse } from 'next/server'
import { getFilteredJobs, type JobFilterParams } from '@/lib/job-cache'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

/**
 * Query parameter schema for job search.
 */
const SearchParamsSchema = z.object({
    query: z.string().optional(),
    location: z.string().optional(),
    employmentType: z.string().optional(),
    seniority: z.string().optional(),
    tags: z.string().optional(),
    salaryMin: z.coerce.number().optional(),
    salaryMax: z.coerce.number().optional(),
    sort: z.enum(['relevance', 'newest', 'salary']).optional().default('newest'),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
})

export async function GET(req: NextRequest) {
    try {
        const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries())
        const parsed = SearchParamsSchema.safeParse(searchParams)

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
        }

        const filters: JobFilterParams = parsed.data

        const { jobs, pagination } = await getFilteredJobs(filters)

        // Serialize for JSON (convert Date to ISO string, strip raw/description for list view)
        const serializedJobs = jobs.map((job) => ({
            id: job.externalId,
            externalId: job.externalId,
            title: job.title,
            company: job.company,
            location: job.location,
            employmentType: job.employmentType,
            seniority: job.seniority,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            currency: job.currency,
            postedAt: job.postedAt?.toISOString() ?? null,
            applyUrl: job.applyUrl,
            tags: job.tags,
        }))

        return NextResponse.json({ jobs: serializedJobs, pagination })
    } catch (err) {
        console.error('[GET /api/jobs]', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
