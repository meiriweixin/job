import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { JobFiltersSchema, buildJobWhere, buildJobOrderBy } from '@/lib/query-builder'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries())
        const parsed = JobFiltersSchema.safeParse(searchParams)

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
        }

        const filters = parsed.data
        const { page, limit } = filters
        const skip = (page - 1) * limit

        // Full-text search with tsvector when query is present
        if (filters.query && filters.query.trim().length > 0) {
            const q = filters.query.trim()

            // Build additional WHERE conditions for non-text filters
            const locationFilter = filters.location
                ? `AND LOWER("location") LIKE LOWER('%' || ${JSON.stringify(filters.location)} || '%')`
                : ''
            const empTypeFilter = filters.employmentType
                ? `AND LOWER("employmentType") LIKE LOWER('%' || ${JSON.stringify(filters.employmentType.split(',')[0])} || '%')`
                : ''
            const salMinFilter = filters.salaryMin != null ? `AND ("salaryMin" >= ${filters.salaryMin} OR "salaryMin" IS NULL)` : ''
            const salMaxFilter = filters.salaryMax != null ? `AND ("salaryMax" <= ${filters.salaryMax})` : ''

            const [jobs, countResult] = await Promise.all([
                prisma.$queryRaw<Array<Record<string, unknown>>>`
          SELECT 
            id, "externalId", source, title, company, description, location,
            "employmentType", seniority, "salaryMin", "salaryMax", currency,
            "postedAt", "applyUrl", tags, "createdAt", "updatedAt",
            ts_rank("searchVector", websearch_to_tsquery('english', ${q})) +
            similarity(title, ${q}) * 0.3 AS _rank
          FROM "jobs"
          WHERE "searchVector" @@ websearch_to_tsquery('english', ${q})
             OR similarity(title, ${q}) > 0.15
             OR similarity(COALESCE(company, ''), ${q}) > 0.15
          ORDER BY _rank DESC, "postedAt" DESC NULLS LAST
          LIMIT ${limit} OFFSET ${skip}
        `,
                prisma.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(*)::bigint as count FROM "jobs"
          WHERE "searchVector" @@ websearch_to_tsquery('english', ${q})
             OR similarity(title, ${q}) > 0.15
             OR similarity(COALESCE(company, ''), ${q}) > 0.15
        `,
            ])

            const total = Number(countResult[0]?.count ?? 0)

            return NextResponse.json({
                jobs,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            })
        }

        // No text search – use Prisma ORM
        const where = buildJobWhere(filters)
        const orderBy = buildJobOrderBy(filters)

        const [jobs, total] = await Promise.all([
            prisma.job.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                select: {
                    id: true,
                    externalId: true,
                    source: true,
                    title: true,
                    company: true,
                    description: true,
                    location: true,
                    employmentType: true,
                    seniority: true,
                    salaryMin: true,
                    salaryMax: true,
                    currency: true,
                    postedAt: true,
                    applyUrl: true,
                    tags: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            prisma.job.count({ where }),
        ])

        return NextResponse.json({
            jobs,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        })
    } catch (err) {
        console.error('[GET /api/jobs]', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
