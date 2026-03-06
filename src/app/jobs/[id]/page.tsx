import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { JobDetailClient } from '@/components/jobs/job-detail-client'
import type { Metadata } from 'next'

interface Props {
    params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const job = await prisma.job.findUnique({
        where: { id: params.id },
        select: { title: true, company: true, location: true },
    })
    if (!job) return { title: 'Job Not Found' }
    return {
        title: `${job.title} at ${job.company ?? 'Unknown'} | SG Job Finder`,
        description: `${job.title} role at ${job.company} in ${job.location ?? 'Singapore'}. Apply today.`,
    }
}

export default async function JobDetailPage({ params }: Props) {
    const job = await prisma.job.findUnique({
        where: { id: params.id },
    })

    if (!job) notFound()

    // Serialize for client component
    const serialized = JSON.parse(JSON.stringify(job))

    return <JobDetailClient job={serialized} />
}
