import { notFound } from 'next/navigation'
import { getCachedJobs } from '@/lib/job-cache'
import { JobDetailClient } from '@/components/jobs/job-detail-client'
import type { Metadata } from 'next'

interface Props {
    params: { id: string }
}

/**
 * Find a job by externalId from the cache.
 */
async function findJobById(id: string) {
    const jobs = await getCachedJobs()
    return jobs.find((j) => j.externalId === id) ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const job = await findJobById(params.id)
    if (!job) return { title: 'Job Not Found' }
    return {
        title: `${job.title} at ${job.company ?? 'Unknown'} | SG Job Finder`,
        description: `${job.title} role at ${job.company} in ${job.location ?? 'Singapore'}. Apply today.`,
    }
}

export default async function JobDetailPage({ params }: Props) {
    const job = await findJobById(params.id)

    if (!job) notFound()

    // Serialize for client component (convert Date to string, etc.)
    const serialized = {
        id: job.externalId,
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
        postedAt: job.postedAt?.toISOString() ?? null,
        applyUrl: job.applyUrl,
        tags: job.tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }

    return <JobDetailClient job={serialized} />
}
