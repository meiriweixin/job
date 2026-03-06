import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Bookmark, MapPin, Clock, Trash2, FileText } from 'lucide-react'
import { formatDate, formatSalary } from '@/lib/utils'

export default async function SavedPage() {
    const session = await auth()
    if (!session?.user) redirect('/auth/signin')

    const userId = (session.user as { id: string }).id

    const savedJobs = await prisma.savedJob.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
            job: {
                select: {
                    id: true, title: true, company: true, location: true,
                    postedAt: true, employmentType: true, salaryMin: true, salaryMax: true, currency: true
                }
            }
        }
    })

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Bookmark className="h-8 w-8 text-blue-600" />
                    Saved Jobs
                </h1>
                <p className="text-gray-500 mt-1">{savedJobs.length} job{savedJobs.length !== 1 ? 's' : ''} saved</p>
            </div>

            {savedJobs.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-5xl mb-4">📋</p>
                    <h2 className="text-xl font-semibold text-gray-700">No saved jobs yet</h2>
                    <p className="text-gray-500 mt-2">Browse jobs and click the bookmark icon to save them here.</p>
                    <Link href="/jobs" className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                        Browse Jobs
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {savedJobs.map((saved) => (
                        <div key={saved.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <div className="flex items-start justify-between gap-4">
                                <Link href={`/jobs/${saved.job.id}`} className="flex-1 min-w-0 group">
                                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                                        {saved.job.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-0.5">{saved.job.company}</p>
                                </Link>
                                <form action={`/api/saved/${saved.jobId}`} method="post">
                                    <button
                                        type="button"
                                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                                        title="Remove saved job"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </form>
                            </div>

                            <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                                {saved.job.location && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-3.5 w-3.5" />
                                        {saved.job.location}
                                    </span>
                                )}
                                {saved.job.postedAt && (
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        Posted {formatDate(saved.job.postedAt)}
                                    </span>
                                )}
                                {(saved.job.salaryMin || saved.job.salaryMax) && (
                                    <span className="text-green-700 font-medium">
                                        {formatSalary(saved.job.salaryMin, saved.job.salaryMax, saved.job.currency)}
                                    </span>
                                )}
                            </div>

                            {saved.note && (
                                <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-sm text-amber-800 flex items-start gap-2">
                                    <FileText className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-500" />
                                    {saved.note}
                                </div>
                            )}

                            <div className="mt-3 text-xs text-gray-400">
                                Saved {formatDate(saved.createdAt)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
