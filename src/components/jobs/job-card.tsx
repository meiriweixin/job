'use client'

import Link from 'next/link'
import { MapPin, Clock, DollarSign, Bookmark, Building2, ExternalLink } from 'lucide-react'
import { formatSalary, formatDate, cn } from '@/lib/utils'
import { useState } from 'react'

interface Job {
    id: string
    title: string
    company: string | null
    location: string | null
    employmentType: string | null
    seniority: string | null
    salaryMin: number | null
    salaryMax: number | null
    currency: string
    postedAt: string | null
    applyUrl: string | null
    tags: string[]
}

const TYPE_COLORS: Record<string, string> = {
    'Full-time': 'bg-green-50 text-green-700 ring-green-200',
    'Part-time': 'bg-yellow-50 text-yellow-700 ring-yellow-200',
    'Internship': 'bg-purple-50 text-purple-700 ring-purple-200',
    'Contract': 'bg-orange-50 text-orange-700 ring-orange-200',
    'Freelance': 'bg-blue-50 text-blue-700 ring-blue-200',
}

const TAG_COLORS: Record<string, string> = {
    Technology: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
    Finance: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    Healthcare: 'bg-red-50 text-red-700 ring-red-200',
    Consulting: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
    Manufacturing: 'bg-amber-50 text-amber-700 ring-amber-200',
}

function getInitials(name: string | null): string {
    if (!name) return '?'
    return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

function getCompanyColor(name: string | null): string {
    const colors = [
        'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500',
        'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-red-500'
    ]
    const idx = (name ?? '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length
    return colors[idx]
}

export function JobCard({ job }: { job: Job }) {
    const [saved, setSaved] = useState(false)
    const [saving, setSaving] = useState(false)

    const handleSave = async (e: React.MouseEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const res = await fetch(`/api/saved/${job.id}`, { method: 'POST', body: JSON.stringify({}) })
            if (res.status === 401) {
                window.location.href = '/auth/signin'
                return
            }
            const data = await res.json()
            setSaved(data.saved)
        } catch { }
        setSaving(false)
    }

    return (
        <Link
            href={`/jobs/${job.id}`}
            className="job-card block bg-white rounded-2xl p-5 border border-gray-100 shadow-sm group"
        >
            <div className="flex items-start gap-4">
                {/* Company avatar */}
                <div className={cn(
                    'h-12 w-12 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-sm',
                    getCompanyColor(job.company)
                )}>
                    {getInitials(job.company)}
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                                {job.title}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-0.5 text-sm text-gray-500">
                                <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                                <span className="truncate">{job.company ?? 'Unknown Company'}</span>
                            </div>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={cn(
                                'flex-shrink-0 p-2 rounded-lg transition-colors',
                                saved ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                            )}
                            title={saved ? 'Unsave job' : 'Save job'}
                        >
                            <Bookmark className={cn('h-4 w-4', saved && 'fill-current')} />
                        </button>
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                        {job.location && (
                            <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {job.location}
                            </span>
                        )}
                        {(job.salaryMin || job.salaryMax) && (
                            <span className="flex items-center gap-1 text-green-700 font-medium">
                                <DollarSign className="h-3.5 w-3.5" />
                                {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                            </span>
                        )}
                        {job.postedAt && (
                            <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {formatDate(job.postedAt)}
                            </span>
                        )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {job.employmentType && (
                            <span className={cn('tag-badge', TYPE_COLORS[job.employmentType] ?? 'bg-gray-50 text-gray-600 ring-gray-200')}>
                                {job.employmentType}
                            </span>
                        )}
                        {job.seniority && (
                            <span className="tag-badge bg-gray-50 text-gray-600 ring-gray-200">
                                {job.seniority}
                            </span>
                        )}
                        {job.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className={cn('tag-badge', TAG_COLORS[tag] ?? 'bg-gray-50 text-gray-600 ring-gray-200')}>
                                {tag}
                            </span>
                        ))}
                        {job.applyUrl && (
                            <span className="ml-auto flex items-center gap-1 text-xs text-blue-600 group-hover:underline">
                                View <ExternalLink className="h-3 w-3" />
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    )
}
