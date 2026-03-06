/**
 * Server-side in-memory job cache.
 * Fetches from JOB_JSON_URL, maps to MappedJob[], and caches for 1 hour.
 * No database needed for job listings.
 */
import { mapJobs, type MappedJob } from './job-mapper'

const JOB_JSON_URL =
    process.env.JOB_JSON_URL ??
    'https://raw.githubusercontent.com/eaziym/sg-jobs/refs/heads/main/docs/data/jobs.min.json'

/** Cache TTL in milliseconds (1 hour) */
const CACHE_TTL = 60 * 60 * 1000

/** In-memory cache */
let cachedJobs: MappedJob[] | null = null
let cachedAt: number = 0
let fetchPromise: Promise<MappedJob[]> | null = null

/**
 * Fetch all jobs from the remote URL.
 */
async function fetchJobsFromSource(): Promise<MappedJob[]> {
    console.log('[job-cache] Fetching jobs from source...')
    const res = await fetch(JOB_JSON_URL, {
        headers: {
            'Accept': 'application/json',
            'User-Agent': 'SG-Job-Finder/1.0',
        },
        next: { revalidate: 3600 }, // Next.js fetch cache: 1 hour
    })

    if (!res.ok) {
        throw new Error(`Failed to fetch jobs: HTTP ${res.status}`)
    }

    const data: unknown = await res.json()

    // Handle array or envelope format
    let records: unknown[]
    if (Array.isArray(data)) {
        records = data
    } else if (typeof data === 'object' && data !== null) {
        const obj = data as Record<string, unknown>
        records =
            (Array.isArray(obj['data']) ? obj['data'] :
                Array.isArray(obj['jobs']) ? obj['jobs'] :
                    Array.isArray(obj['results']) ? obj['results'] :
                        []) as unknown[]
    } else {
        records = []
    }

    const mapped = mapJobs(records)
    console.log(`[job-cache] Mapped ${mapped.length} jobs`)
    return mapped
}

/**
 * Get all jobs from the cache, refreshing if stale.
 * Uses a deduplication lock so concurrent requests share the same fetch.
 */
export async function getCachedJobs(): Promise<MappedJob[]> {
    const now = Date.now()

    // Return cached data if still fresh
    if (cachedJobs && now - cachedAt < CACHE_TTL) {
        return cachedJobs
    }

    // If a fetch is already in progress, wait for it
    if (fetchPromise) {
        return fetchPromise
    }

    // Start a new fetch
    fetchPromise = fetchJobsFromSource()
        .then((jobs) => {
            cachedJobs = jobs
            cachedAt = Date.now()
            fetchPromise = null
            return jobs
        })
        .catch((err) => {
            fetchPromise = null
            // If we have stale data, return it rather than failing
            if (cachedJobs) {
                console.warn('[job-cache] Fetch failed, returning stale data:', err)
                return cachedJobs
            }
            throw err
        })

    return fetchPromise
}

/**
 * Force refresh the cache (e.g., from an admin action).
 */
export async function refreshJobCache(): Promise<number> {
    cachedJobs = null
    cachedAt = 0
    const jobs = await getCachedJobs()
    return jobs.length
}

// ─── Filtering & Search Utilities ────────────────────────────────────────────

export interface JobFilterParams {
    query?: string
    location?: string
    employmentType?: string
    seniority?: string
    tags?: string
    salaryMin?: number
    salaryMax?: number
    sort?: 'newest' | 'relevance' | 'salary'
    page?: number
    limit?: number
}

/**
 * Simple case-insensitive fuzzy match: checks if all words in the query
 * appear somewhere in the target string.
 */
function fuzzyMatch(target: string, query: string): boolean {
    const tLower = target.toLowerCase()
    const words = query.toLowerCase().split(/\s+/).filter(Boolean)
    return words.every((w) => tLower.includes(w))
}

/**
 * Calculate a relevance score for a job against a search query.
 * Higher = better match.
 */
function relevanceScore(job: MappedJob, query: string): number {
    const q = query.toLowerCase()
    let score = 0

    // Title matches are most important
    const title = job.title.toLowerCase()
    if (title === q) score += 100
    else if (title.startsWith(q)) score += 50
    else if (title.includes(q)) score += 30

    // Company match
    if (job.company?.toLowerCase().includes(q)) score += 20

    // Location match
    if (job.location?.toLowerCase().includes(q)) score += 10

    // Tag match
    if (job.tags.some((t) => t.toLowerCase().includes(q))) score += 15

    // Word-level matching for multi-word queries
    const words = q.split(/\s+/).filter(Boolean)
    for (const w of words) {
        if (title.includes(w)) score += 5
        if (job.company?.toLowerCase().includes(w)) score += 3
        if (job.description?.toLowerCase().includes(w)) score += 1
    }

    return score
}

/**
 * Filter, sort, and paginate jobs from cache.
 */
export async function getFilteredJobs(params: JobFilterParams): Promise<{
    jobs: MappedJob[]
    pagination: { page: number; limit: number; total: number; pages: number }
}> {
    const allJobs = await getCachedJobs()
    const {
        query,
        location,
        employmentType,
        seniority,
        tags,
        salaryMin,
        salaryMax,
        sort = 'newest',
        page = 1,
        limit = 20,
    } = params

    // Filter
    let filtered = allJobs.filter((job) => {
        // Text search across title, company, description, tags
        if (query && query.trim()) {
            const searchable = [
                job.title,
                job.company ?? '',
                job.description ?? '',
                ...job.tags,
            ].join(' ')
            if (!fuzzyMatch(searchable, query)) return false
        }

        // Location filter
        if (location && job.location && !job.location.toLowerCase().includes(location.toLowerCase())) {
            return false
        }
        if (location && !job.location) return false

        // Employment type filter
        if (employmentType) {
            const types = employmentType.split(',').map((t) => t.trim().toLowerCase())
            if (!job.employmentType || !types.includes(job.employmentType.toLowerCase())) return false
        }

        // Seniority filter
        if (seniority && job.seniority?.toLowerCase() !== seniority.toLowerCase()) {
            return false
        }

        // Tags filter
        if (tags) {
            const tagList = tags.split(',').map((t) => t.trim().toLowerCase())
            if (!job.tags.some((t) => tagList.includes(t.toLowerCase()))) return false
        }

        // Salary filter
        if (salaryMin != null && (job.salaryMin == null || job.salaryMin < salaryMin)) return false
        if (salaryMax != null && (job.salaryMax == null || job.salaryMax > salaryMax)) return false

        return true
    })

    // Sort
    if (sort === 'relevance' && query) {
        filtered.sort((a, b) => relevanceScore(b, query) - relevanceScore(a, query))
    } else if (sort === 'salary') {
        filtered.sort((a, b) => (b.salaryMax ?? b.salaryMin ?? 0) - (a.salaryMax ?? a.salaryMin ?? 0))
    } else {
        // newest
        filtered.sort((a, b) => {
            const da = a.postedAt?.getTime() ?? 0
            const db = b.postedAt?.getTime() ?? 0
            return db - da
        })
    }

    // Paginate
    const total = filtered.length
    const pages = Math.ceil(total / limit)
    const skip = (page - 1) * limit
    const paged = filtered.slice(skip, skip + limit)

    return {
        jobs: paged,
        pagination: { page, limit, total, pages },
    }
}
