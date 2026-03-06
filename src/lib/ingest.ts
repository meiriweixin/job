/**
 * Data ingest pipeline.
 * Fetches jobs from JOB_JSON_URL, maps them, and upserts into Postgres.
 */
import { prisma } from './prisma'
import { mapJobs, type MappedJob } from './job-mapper'

const JOB_JSON_URL =
    process.env.JOB_JSON_URL ??
    'https://raw.githubusercontent.com/eaziym/sg-jobs/refs/heads/main/docs/data/jobs.min.json'

interface FetchResult {
    records: unknown[]
    nextUrl: string | null
}

/**
 * Sleep for N milliseconds.
 */
function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Fetch a URL with exponential backoff retries.
 */
async function fetchWithRetry(url: string, maxRetries = 3): Promise<Response> {
    let lastError: unknown
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'SG-Job-Finder/1.0',
                    ...(process.env.JOB_API_TOKEN
                        ? { Authorization: `Bearer ${process.env.JOB_API_TOKEN}` }
                        : {}),
                },
                next: { revalidate: 0 }, // bypass Next.js cache for ingest
            })
            if (!response.ok && response.status >= 500) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }
            return response
        } catch (err) {
            lastError = err
            if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500
                console.warn(`[ingest] Fetch attempt ${attempt + 1} failed, retrying in ${Math.round(delay)}ms`)
                await sleep(delay)
            }
        }
    }
    throw lastError
}

/**
 * Fetch a single page of jobs from a URL.
 * Detects common pagination patterns in the response.
 */
async function fetchPage(url: string): Promise<FetchResult> {
    const res = await fetchWithRetry(url)
    const data = await res.json() as unknown

    // If data is a plain array → no pagination
    if (Array.isArray(data)) {
        return { records: data, nextUrl: null }
    }

    // If data is an object, look for common pagination envelopes
    if (typeof data === 'object' && data !== null) {
        const obj = data as Record<string, unknown>
        const records: unknown[] =
            (Array.isArray(obj['data']) ? obj['data'] :
                Array.isArray(obj['jobs']) ? obj['jobs'] :
                    Array.isArray(obj['results']) ? obj['results'] :
                        Array.isArray(obj['items']) ? obj['items'] :
                            []) as unknown[]

        // Detect next page URL
        let nextUrl: string | null = null
        if (typeof obj['next'] === 'string') {
            nextUrl = obj['next']
        } else if (typeof obj['nextPage'] === 'string') {
            nextUrl = obj['nextPage']
        } else if (typeof obj['meta'] === 'object' && obj['meta'] !== null) {
            const meta = obj['meta'] as Record<string, unknown>
            if (typeof meta['nextUrl'] === 'string') nextUrl = meta['nextUrl']
        }

        return { records, nextUrl }
    }

    return { records: [], nextUrl: null }
}

/**
 * Fetch ALL pages of jobs from the source URL.
 */
async function fetchAllJobs(): Promise<unknown[]> {
    const allRecords: unknown[] = []
    let url: string | null = JOB_JSON_URL
    let pageCount = 0
    const MAX_PAGES = 100 // safety cap

    while (url && pageCount < MAX_PAGES) {
        console.log(`[ingest] Fetching page ${pageCount + 1}: ${url}`)
        const { records, nextUrl } = await fetchPage(url)
        allRecords.push(...records)
        url = nextUrl
        pageCount++
        if (nextUrl) await sleep(300) // be polite between pages
    }

    console.log(`[ingest] Fetched ${allRecords.length} raw records across ${pageCount} page(s)`)
    return allRecords
}

/**
 * Upsert a batch of mapped jobs into the database.
 */
async function upsertJobs(jobs: MappedJob[]): Promise<number> {
    let upsertCount = 0
    const BATCH_SIZE = 50

    for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
        const batch = jobs.slice(i, i + BATCH_SIZE)

        // Prisma doesn't support bulk upsert with complex types easily,
        // so we use individual upserts within a transaction
        await prisma.$transaction(
            batch.map((job) =>
                prisma.job.upsert({
                    where: { externalId: job.externalId },
                    create: {
                        externalId: job.externalId,
                        source: job.source,
                        title: job.title,
                        company: job.company,
                        description: job.description,
                        location: job.location,
                        employmentType: job.employmentType,
                        seniority: job.seniority,
                        salaryMin: job.salaryMin,
                        salaryMax: job.salaryMax,
                        currency: job.currency,
                        postedAt: job.postedAt,
                        applyUrl: job.applyUrl,
                        tags: job.tags,
                        raw: job.raw as object,
                    },
                    update: {
                        title: job.title,
                        company: job.company,
                        description: job.description,
                        location: job.location,
                        employmentType: job.employmentType,
                        seniority: job.seniority,
                        salaryMin: job.salaryMin,
                        salaryMax: job.salaryMax,
                        currency: job.currency,
                        postedAt: job.postedAt,
                        applyUrl: job.applyUrl,
                        tags: job.tags,
                        raw: job.raw as object,
                        updatedAt: new Date(),
                    },
                })
            )
        )

        upsertCount += batch.length
        console.log(`[ingest] Upserted ${upsertCount}/${jobs.length} jobs`)
    }

    return upsertCount
}

/**
 * Main ingest function.
 * Fetches, maps, upserts, and logs the run.
 */
export async function runIngest(): Promise<{
    jobsFetched: number
    jobsUpserted: number
    error: string | null
}> {
    const log = await prisma.ingestLog.create({
        data: { status: 'running' },
    })

    try {
        const rawRecords = await fetchAllJobs()
        const mapped = mapJobs(rawRecords)
        const upsertCount = await upsertJobs(mapped)

        await prisma.ingestLog.update({
            where: { id: log.id },
            data: {
                status: 'success',
                finishedAt: new Date(),
                jobsFetched: rawRecords.length,
                jobsUpserted: upsertCount,
            },
        })

        // After ingest, run any due alerts
        await runDueAlerts()

        return { jobsFetched: rawRecords.length, jobsUpserted: upsertCount, error: null }
    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        console.error('[ingest] Error:', errorMsg)

        await prisma.ingestLog.update({
            where: { id: log.id },
            data: {
                status: 'error',
                finishedAt: new Date(),
                error: errorMsg,
            },
        })

        return { jobsFetched: 0, jobsUpserted: 0, error: errorMsg }
    }
}

/**
 * Preview: fetch just enough to return first 2 items + mapped output.
 */
export async function previewIngest() {
    const { records } = await fetchPage(JOB_JSON_URL)
    const preview = records.slice(0, 2)
    const mapped = mapJobs(preview)
    return {
        count: records.length,
        rawSamples: preview,
        mappedSamples: mapped,
    }
}

/**
 * Run all alerts that are due (daily or weekly).
 */
async function runDueAlerts() {
    const now = new Date()
    const alerts = await prisma.alert.findMany({
        where: {
            OR: [
                { lastRunAt: null },
                {
                    frequency: 'DAILY',
                    lastRunAt: { lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
                },
                {
                    frequency: 'WEEKLY',
                    lastRunAt: { lt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
                },
            ],
        },
    })

    for (const alert of alerts) {
        try {
            await runSingleAlert(alert.id)
        } catch (e) {
            console.error(`[alerts] Failed to run alert ${alert.id}:`, e)
        }
    }
}

/**
 * Run a single alert and create an AlertRun record.
 */
export async function runSingleAlert(alertId: string) {
    const alert = await prisma.alert.findUniqueOrThrow({ where: { id: alertId } })
    const filters = (alert.filters ?? {}) as Record<string, unknown>

    const since = alert.lastRunAt ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    // Build WHERE clause from alert params
    const jobs = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM "jobs"
    WHERE "createdAt" > ${since}
    AND (
      ${alert.query ? `"searchVector" @@ plainto_tsquery('english', ${alert.query})` : 'TRUE'}
    )
    LIMIT 100
  `

    const matchedJobIds = jobs.map((j) => j.id)

    await prisma.$transaction([
        prisma.alertRun.create({
            data: {
                alertId,
                matchCount: matchedJobIds.length,
                matchedJobs: {
                    create: matchedJobIds.map((jobId) => ({ jobId })),
                },
            },
        }),
        prisma.alert.update({
            where: { id: alertId },
            data: { lastRunAt: new Date() },
        }),
    ])

    return matchedJobIds.length
}
