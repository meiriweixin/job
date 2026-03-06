import { describe, it, expect } from '@jest/globals'
import { buildJobWhere, buildJobOrderBy, JobFiltersSchema } from '../src/lib/query-builder'

describe('JobFiltersSchema', () => {
    it('parses valid filters', () => {
        const result = JobFiltersSchema.parse({
            query: 'software engineer',
            employmentType: 'Full-time',
            sort: 'newest',
        })
        expect(result.query).toBe('software engineer')
        expect(result.sort).toBe('newest')
        expect(result.page).toBe(1)
        expect(result.limit).toBe(20)
    })

    it('coerces page and limit to numbers', () => {
        const result = JobFiltersSchema.parse({ page: '2', limit: '10' })
        expect(result.page).toBe(2)
        expect(result.limit).toBe(10)
    })

    it('rejects invalid sort value', () => {
        expect(() => JobFiltersSchema.parse({ sort: 'popularity' })).toThrow()
    })
})

describe('buildJobWhere', () => {
    it('adds location filter', () => {
        const filters = JobFiltersSchema.parse({ location: 'Raffles Place' })
        const where = buildJobWhere(filters)
        expect(where.location).toEqual({ contains: 'Raffles Place', mode: 'insensitive' })
    })

    it('adds salary range filters', () => {
        const filters = JobFiltersSchema.parse({ salaryMin: '3000', salaryMax: '8000' })
        const where = buildJobWhere(filters)
        expect(where.salaryMin).toEqual({ gte: 3000 })
        expect(where.salaryMax).toEqual({ lte: 8000 })
    })

    it('adds tags filter with hasSome', () => {
        const filters = JobFiltersSchema.parse({ tags: 'Technology,Finance' })
        const where = buildJobWhere(filters)
        expect(where.tags).toEqual({ hasSome: ['Technology', 'Finance'] })
    })

    it('adds postedWithin 24h filter', () => {
        const filters = JobFiltersSchema.parse({ postedWithin: '24h' })
        const where = buildJobWhere(filters)
        expect(where.postedAt).toBeDefined()
        expect((where.postedAt as { gte: Date }).gte).toBeInstanceOf(Date)
    })

    it('returns empty where for no filters', () => {
        const filters = JobFiltersSchema.parse({})
        const where = buildJobWhere(filters)
        expect(Object.keys(where).length).toBe(0)
    })
})

describe('buildJobOrderBy', () => {
    it('sorts by salary descending', () => {
        const filters = JobFiltersSchema.parse({ sort: 'salary' })
        const orderBy = buildJobOrderBy(filters)
        expect(orderBy[0]).toEqual({ salaryMax: 'desc' })
    })

    it('sorts by newest by default', () => {
        const filters = JobFiltersSchema.parse({})
        const orderBy = buildJobOrderBy(filters)
        expect(orderBy[0]).toEqual({ postedAt: 'desc' })
    })
})
