import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCachedJobs } from '@/lib/job-cache'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Briefcase, Bell, Bookmark, TrendingUp, ArrowRight } from 'lucide-react'

export default async function DashboardPage() {
    const session = await auth()
    if (!session?.user) redirect('/auth/signin')

    const userId = (session.user as { id: string }).id

    // Fetch recent jobs from cache, user stats from DB
    const [allJobs, savedCount, alertCount] = await Promise.all([
        getCachedJobs(),
        prisma.savedJob.count({ where: { userId } }),
        prisma.alert.count({ where: { userId } }),
    ])

    // Get 5 most recent jobs sorted by postedAt
    const recentJobs = [...allJobs]
        .sort((a, b) => (b.postedAt?.getTime() ?? 0) - (a.postedAt?.getTime() ?? 0))
        .slice(0, 5)

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {session.user?.name?.split(' ')[0] ?? 'there'} 👋
                </h1>
                <p className="text-gray-500 mt-1">Here&apos;s a summary of your job search activity.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                    { icon: Bookmark, label: 'Saved Jobs', value: savedCount, href: '/saved', color: 'text-blue-600 bg-blue-50' },
                    { icon: Bell, label: 'Active Alerts', value: alertCount, href: '/alerts', color: 'text-purple-600 bg-purple-50' },
                    {
                        icon: TrendingUp,
                        label: 'Total Jobs',
                        value: `${allJobs.length.toLocaleString()}`,
                        href: '/jobs',
                        color: 'text-green-600 bg-green-50',
                    },
                ].map(({ icon: Icon, label, value, href, color }) => (
                    <Link
                        key={label}
                        href={href}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
                    >
                        <div className={`inline-flex p-2.5 rounded-xl ${color} mb-3`}>
                            <Icon className="h-5 w-5" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{value}</div>
                        <div className="text-sm text-gray-500">{label}</div>
                    </Link>
                ))}
            </div>

            {/* Recent jobs */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-gray-400" />
                        Latest Listings
                    </h2>
                    <Link href="/jobs" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        View all <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>
                <div className="divide-y divide-gray-50">
                    {recentJobs.map((job) => (
                        <Link
                            key={job.externalId}
                            href={`/jobs/${job.externalId}`}
                            className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                        >
                            <div>
                                <div className="font-medium text-gray-900 text-sm">{job.title}</div>
                                <div className="text-xs text-gray-500 mt-0.5">{job.company} · {job.location}</div>
                            </div>
                            <div className="text-xs text-gray-400 flex-shrink-0 ml-4">{formatDate(job.postedAt)}</div>
                        </Link>
                    ))}
                    {recentJobs.length === 0 && (
                        <div className="px-6 py-8 text-center text-gray-400 text-sm">
                            Loading job data...
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
