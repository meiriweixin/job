/**
 * Builds a Prisma WHERE clause + orderBy from URL search params.
 * Used by both the API route and server components.
 */
import { z } from 'zod'
import type { Prisma } from '@prisma/client'

// ─── Filter schema ─────────────────────────────────────────────────────────

export const JobFiltersSchema = z.object({
    query: z.string().optional(),
    location: z.string().optional(),
    employmentType: z.string().optional(), // comma-separated
    seniority: z.string().optional(),
    tags: z.string().optional(),           // comma-separated
    salaryMin: z.coerce.number().optional(),
    salaryMax: z.coerce.number().optional(),
    postedWithin: z.enum(['24h', '7d', '30d', 'custom']).optional(),
    postedFrom: z.string().optional(),
    postedTo: z.string().optional(),
    sort: z.enum(['relevance', 'newest', 'salary']).optional().default('newest'),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type JobFilters = z.infer<typeof JobFiltersSchema>

// ─── Builder ─────────────────────────────────────────────────────────────────

export function buildJobWhere(filters: JobFilters): Prisma.JobWhereInput {
    const where: Prisma.JobWhereInput = {}

    // Text search - handled via raw query when present (see getJobs)
    if (filters.location) {
        where.location = { contains: filters.location, mode: 'insensitive' }
    }

    if (filters.employmentType) {
        const types = filters.employmentType.split(',').map((t) => t.trim()).filter(Boolean)
        if (types.length === 1) {
            where.employmentType = { contains: types[0], mode: 'insensitive' }
        } else if (types.length > 1) {
            where.OR = types.map((t) => ({
                employmentType: { contains: t, mode: 'insensitive' },
            }))
        }
    }

    if (filters.seniority) {
        where.seniority = { equals: filters.seniority, mode: 'insensitive' }
    }

    if (filters.tags) {
        const tagList = filters.tags.split(',').map((t) => t.trim()).filter(Boolean)
        if (tagList.length > 0) {
            where.tags = { hasSome: tagList }
        }
    }

    if (filters.salaryMin != null) {
        where.salaryMin = { gte: filters.salaryMin }
    }

    if (filters.salaryMax != null) {
        where.salaryMax = { lte: filters.salaryMax }
    }

    // Posted within
    const now = new Date()
    if (filters.postedWithin === '24h') {
        where.postedAt = { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
    } else if (filters.postedWithin === '7d') {
        where.postedAt = { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
    } else if (filters.postedWithin === '30d') {
        where.postedAt = { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
    } else if (filters.postedWithin === 'custom') {
        const dateWhere: Prisma.DateTimeNullableFilter = {}
        if (filters.postedFrom) dateWhere.gte = new Date(filters.postedFrom)
        if (filters.postedTo) dateWhere.lte = new Date(filters.postedTo)
        if (Object.keys(dateWhere).length > 0) where.postedAt = dateWhere
    }

    return where
}

export function buildJobOrderBy(
    filters: JobFilters
): Prisma.JobOrderByWithRelationInput[] {
    switch (filters.sort) {
        case 'salary':
            return [{ salaryMax: 'desc' }, { salaryMin: 'desc' }, { postedAt: 'desc' }]
        case 'newest':
        default:
            return [{ postedAt: 'desc' }, { createdAt: 'desc' }]
        // 'relevance' is handled via raw full-text search ranking in the API
    }
}
