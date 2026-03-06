import { describe, it, expect } from '@jest/globals'
import { mapJob, mapJobs } from '../src/lib/job-mapper'

describe('mapJob', () => {
    const sgJobsRaw = {
        c: 'Deutsche Bank',
        t: 'Private Bank – Client Service Executive, SEA, AVP',
        u: 'https://careers.db.com/professionals/search-roles/#/professional/job/71538',
        m: 'Singapore…',
        d: '2026-03-05',
        g: ['Finance', 'Full-time'],
    }

    it('maps SG-Jobs minified keys correctly', () => {
        const mapped = mapJob(sgJobsRaw)
        expect(mapped.title).toBe('Private Bank – Client Service Executive, SEA, AVP')
        expect(mapped.company).toBe('Deutsche Bank')
        expect(mapped.applyUrl).toBe('https://careers.db.com/professionals/search-roles/#/professional/job/71538')
        expect(mapped.location).toBe('Singapore')
        expect(mapped.tags).toEqual(['Finance', 'Full-time'])
        expect(mapped.employmentType).toBe('Full-time')
        expect(mapped.source).toBe('sg-jobs')
    })

    it('detects internship from tags', () => {
        const raw = { c: 'Corp', t: 'Marketing Role', d: '2026-01-01', g: ['Internship'], u: 'http://example.com', m: 'SG' }
        const mapped = mapJob(raw)
        expect(mapped.employmentType).toBe('Internship')
    })

    it('detects seniority from title - Senior', () => {
        const raw = { t: 'Senior Software Engineer', c: 'Tech Co', u: '', m: 'SG', d: '2026-01-01', g: [] }
        const mapped = mapJob(raw)
        expect(mapped.seniority).toBe('Senior')
    })

    it('detects seniority from title - Entry/Intern', () => {
        const raw = { t: 'Junior Backend Developer', c: 'Startup', u: '', m: 'SG', d: '2026-01-01', g: [] }
        const mapped = mapJob(raw)
        expect(mapped.seniority).toBe('Entry')
    })

    it('strips trailing ellipsis from location', () => {
        const raw = { t: 'Role', c: 'Co', u: '', m: 'Bukit Merah, SG…', d: '2026-01-01', g: [] }
        const mapped = mapJob(raw)
        expect(mapped.location).toBe('Bukit Merah, SG')
    })

    it('generates stable externalId from hash when no native id', () => {
        const mapped1 = mapJob(sgJobsRaw)
        const mapped2 = mapJob(sgJobsRaw)
        expect(mapped1.externalId).toBe(mapped2.externalId)
    })

    it('uses native id when present', () => {
        const raw = { ...sgJobsRaw, id: '12345' }
        const mapped = mapJob(raw)
        expect(mapped.externalId).toBe('sg-jobs:12345')
    })

    it('handles long-form keys as fallback', () => {
        const longForm = {
            company: 'ACME Corp',
            title: 'Data Analyst',
            url: 'https://acme.com/jobs/1',
            location: 'Central Area, SG',
            date: '2026-01-01',
            tags: ['Technology'],
        }
        const mapped = mapJob(longForm)
        expect(mapped.company).toBe('ACME Corp')
        expect(mapped.title).toBe('Data Analyst')
    })

    it('strips HTML from description', () => {
        const raw = { t: 'Dev', c: 'Co', u: '', m: 'SG', d: '2026-01-01', g: [], description: '<p>Hello <b>world</b></p>' }
        const mapped = mapJob(raw)
        expect(mapped.description).toBe('Hello world')
    })
})

describe('mapJobs', () => {
    it('maps an array of jobs', () => {
        const raws = [
            { t: 'Job 1', c: 'Co 1', u: '', m: 'SG', d: '2026-01-01', g: [] },
            { t: 'Job 2', c: 'Co 2', u: '', m: 'SG', d: '2026-01-02', g: [] },
        ]
        const mapped = mapJobs(raws)
        expect(mapped).toHaveLength(2)
        expect(mapped[0].title).toBe('Job 1')
        expect(mapped[1].title).toBe('Job 2')
    })

    it('returns empty array for non-array input', () => {
        expect(mapJobs(null as unknown as unknown[])).toEqual([])
        expect(mapJobs({} as unknown as unknown[])).toEqual([])
    })

    it('filters out non-object entries', () => {
        const raws = [
            { t: 'Valid Job', c: 'Co', u: '', m: 'SG', d: '2026-01-01', g: [] },
            null,
            'string',
            42,
        ]
        const mapped = mapJobs(raws as unknown[])
        expect(mapped).toHaveLength(1)
    })
})
