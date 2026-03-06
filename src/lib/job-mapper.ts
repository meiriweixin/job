/**
 * Maps raw JSON from the SG-Jobs API (or any similar source)
 * into our normalized Job shape.
 *
 * The source schema uses minified keys:
 *   c = company, t = title, u = applyUrl, m = location, d = date, g = tags[]
 *
 * We also accept long-form keys as fallbacks for other sources.
 */
import { parseSalary } from './salary-parser'

export interface MappedJob {
    externalId: string
    source: string
    title: string
    company: string | null
    description: string | null
    location: string | null
    employmentType: string | null
    seniority: string | null
    salaryMin: number | null
    salaryMax: number | null
    currency: string
    postedAt: Date | null
    applyUrl: string | null
    tags: string[]
    raw: Record<string, unknown>
}

/** Simple string hash (DJB2) — no crypto dependency needed */
function simpleHash(str: string): string {
    let hash = 5381
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0
    }
    return hash.toString(16).padStart(8, '0')
}

/** Generate a stable hash-based external ID from stable fields */
function hashJob(raw: Record<string, unknown>): string {
    const stable = JSON.stringify({
        t: raw['t'] ?? raw['title'],
        c: raw['c'] ?? raw['company'],
        u: raw['u'] ?? raw['url'] ?? raw['applyUrl'],
    })
    return simpleHash(stable)
}

/** Strip basic HTML tags from a string */
function stripHtml(s: string): string {
    return s.replace(/<[^>]*>/g, ' ').replace(/\s{2,}/g, ' ').trim()
}

/** Detect employment type from tags or title */
function detectEmploymentType(tags: string[], title: string): string | null {
    const all = [...tags.map((t) => t.toLowerCase()), title.toLowerCase()]
    if (all.some((s) => s.includes('full-time') || s.includes('full time'))) return 'Full-time'
    if (all.some((s) => s.includes('part-time') || s.includes('part time'))) return 'Part-time'
    if (all.some((s) => s.includes('intern'))) return 'Internship'
    if (all.some((s) => s.includes('contract') || s.includes('temp'))) return 'Contract'
    if (all.some((s) => s.includes('freelance'))) return 'Freelance'
    return null
}

/** Best-effort seniority detection from title */
function detectSeniority(title: string): string | null {
    const t = title.toLowerCase()
    if (/\b(vp|vice president|director|head of|chief|cxo|ceo|cto|coo|cfo)\b/.test(t)) return 'Executive'
    if (/\b(senior|sr\.|principal|lead|staff)\b/.test(t)) return 'Senior'
    if (/\b(mid|intermediate)\b/.test(t)) return 'Mid'
    if (/\b(junior|jr\.|entry|graduate|fresh|intern)\b/.test(t)) return 'Entry'
    return null
}

/** Parse a date string robustly */
function parseDate(raw: unknown): Date | null {
    if (!raw) return null
    const s = String(raw)
    const d = new Date(s)
    return isNaN(d.getTime()) ? null : d
}

/**
 * Map a single raw JSON record to our MappedJob shape.
 */
export function mapJob(raw: Record<string, unknown>, source = 'sg-jobs'): MappedJob {
    // Prefer short keys (SG-Jobs format), fall back to common long-form names
    const title = String(raw['t'] ?? raw['title'] ?? raw['jobTitle'] ?? raw['job_title'] ?? 'Untitled')
    const company = raw['c'] ?? raw['company'] ?? raw['employer'] ?? raw['companyName'] ?? null
    const applyUrl = raw['u'] ?? raw['url'] ?? raw['applyUrl'] ?? raw['apply_url'] ?? raw['link'] ?? null
    const location = raw['m'] ?? raw['location'] ?? raw['city'] ?? raw['area'] ?? null
    const dateRaw = raw['d'] ?? raw['date'] ?? raw['postedAt'] ?? raw['posted_at'] ?? raw['createdAt'] ?? null
    const descRaw = raw['description'] ?? raw['desc'] ?? raw['body'] ?? null
    const salaryRaw = raw['salary'] ?? raw['pay'] ?? raw['compensation'] ?? null
    const tagsRaw = raw['g'] ?? raw['tags'] ?? raw['categories'] ?? raw['category'] ?? []

    // Normalize tags to string[]
    const tags: string[] = Array.isArray(tagsRaw)
        ? tagsRaw.map(String)
        : typeof tagsRaw === 'string'
            ? [tagsRaw]
            : []

    // Strip HTML from description if present
    const description = descRaw
        ? stripHtml(String(descRaw))
        : null

    // Generate externalId: prefer a native id field, else hash stable fields
    const nativeId =
        raw['id'] ??
        raw['jobId'] ??
        raw['job_id'] ??
        raw['externalId'] ??
        raw['external_id'] ??
        null

    const externalId = nativeId
        ? `${source}:${String(nativeId)}`
        : `${source}:${hashJob(raw)}`

    // Salary
    const { salaryMin, salaryMax, currency } = parseSalary(salaryRaw)

    return {
        externalId,
        source,
        title,
        company: company ? String(company) : null,
        description,
        location: location ? String(location).replace(/…$/, '').trim() : null,
        employmentType: detectEmploymentType(tags, title),
        seniority: detectSeniority(title),
        salaryMin,
        salaryMax,
        currency,
        postedAt: parseDate(dateRaw),
        applyUrl: applyUrl ? String(applyUrl) : null,
        tags,
        raw,
    }
}

/**
 * Map an array of raw records.
 */
export function mapJobs(records: unknown[], source = 'sg-jobs'): MappedJob[] {
    if (!Array.isArray(records)) return []
    return records
        .filter((r): r is Record<string, unknown> => typeof r === 'object' && r !== null)
        .map((r) => mapJob(r, source))
}
