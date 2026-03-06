/**
 * Seed script for local development.
 * Inserts mocked job records without hitting the live URL.
 */
import { PrismaClient } from '@prisma/client'
import { mapJobs } from '../src/lib/job-mapper'

const prisma = new PrismaClient()

const MOCK_JOBS = [
    { c: 'Google Singapore', t: 'Senior Software Engineer', u: 'https://careers.google.com/1', m: 'Queenstown, SG', d: '2026-03-05', g: ['Technology', 'Full-time'], salary: 'SGD 8,000 - 15,000 / month' },
    { c: 'DBS Bank', t: 'Data Analyst Intern', u: 'https://dbs.com/careers/1', m: 'Downtown Core, SG', d: '2026-03-04', g: ['Finance', 'Internship'] },
    { c: 'Grab', t: 'Product Manager', u: 'https://grab.com/sg/careers/1', m: 'Queenstown, SG', d: '2026-03-03', g: ['Technology', 'Full-time'], salary: 'SGD 7k-12k monthly' },
    { c: 'Singapore General Hospital', t: 'Healthcare Assistant', u: 'https://sgh.com.sg/careers/1', m: 'Bukit Merah, SG', d: '2026-03-02', g: ['Healthcare', 'Full-time'] },
    { c: 'McKinsey & Company', t: 'Business Analyst', u: 'https://mckinsey.com/careers/1', m: 'Downtown Core, SG', d: '2026-03-01', g: ['Consulting', 'Full-time'], salary: '10000 per month' },
    { c: 'Shopee Singapore', t: 'React Frontend Developer', u: 'https://shopee.sg/jobs/1', m: 'Central Area, SG', d: '2026-03-01', g: ['Technology', 'Full-time'], salary: 'SGD 5,000 - 9,000 / month' },
    { c: 'NTUC Health', t: 'Research Intern', u: 'https://ntuc.org.sg/careers/1', m: 'Serangoon, SG', d: '2026-02-28', g: ['Healthcare', 'Internship'] },
    { c: 'JPMorgan Chase', t: 'Investment Banking Analyst', u: 'https://jpmorgan.com/careers/1', m: 'Downtown Core, SG', d: '2026-02-27', g: ['Finance', 'Full-time'], salary: 'SGD 6,000 - 10,000 per month' },
    { c: 'Lazada Singapore', t: 'Marketing Intern', u: 'https://lazada.sg/careers/1', m: 'Toa Payoh, SG', d: '2026-02-26', g: ['Internship'] },
    { c: 'KPMG Singapore', t: 'Management Consultant', u: 'https://kpmg.com/sg/careers/1', m: 'Orchard, SG', d: '2026-02-25', g: ['Consulting', 'Full-time'], salary: 'SGD 5,500-8,000/month' },
]

async function main() {
    console.log('🌱 Seeding development database...')

    const mapped = mapJobs(MOCK_JOBS, 'seed')
    let count = 0

    for (const job of mapped) {
        await prisma.job.upsert({
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
            update: {},
        })
        count++
    }

    // Create a test admin user (configure in env for real use)
    const adminEmail = process.env.SEED_ADMIN_EMAIL
    if (adminEmail) {
        await prisma.user.upsert({
            where: { email: adminEmail },
            create: { email: adminEmail, name: 'Admin', role: 'admin' },
            update: { role: 'admin' },
        })
        console.log(`✅ Admin user created: ${adminEmail}`)
    }

    console.log(`✅ Seeded ${count} jobs successfully.`)
}

main()
    .catch((e) => { console.error(e); process.exit(1) })
    .finally(() => prisma.$disconnect())
