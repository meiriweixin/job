'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    ArrowLeft, MapPin, Clock, DollarSign, Bookmark, ExternalLink,
    Building2, ChevronDown, ChevronUp, Tag, Briefcase
} from 'lucide-react'
import { formatSalary, formatDate, cn } from '@/lib/utils'

interface Job {
    id: string
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
    postedAt: string | null
    applyUrl: string | null
    tags: string[]
    raw: Record<string, unknown>
    createdAt: string
}

function getInitials(name: string | null) {
    if (!name) return '?'
    return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

function getCompanyColor(name: string | null): string {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500']
    const idx = (name ?? '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length
    return colors[idx]
}

export function JobDetailClient({ job }: { job: Job }) {
    const [saved, setSaved] = useState(false)
    const [saving, setSaving] = useState(false)
    const [rawOpen, setRawOpen] = useState(false)
    const [note, setNote] = useState('')

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch(`/api/saved/${job.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ note: note || undefined }),
            })
            if (res.status === 401) { window.location.href = '/auth/signin'; return }
            const data = await res.json()
            setSaved(data.saved)
        } catch { }
        setSaving(false)
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Back */}
            <Link
                href="/jobs"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to jobs
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main content */}
                <div className="md:col-span-2 space-y-6">
                    {/* Header card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-start gap-4">
                            <div className={cn(
                                'h-16 w-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-white font-bold text-lg',
                                getCompanyColor(job.company)
                            )}>
                                {getInitials(job.company)}
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                                <div className="flex items-center gap-1.5 mt-1 text-gray-600">
                                    <Building2 className="h-4 w-4" />
                                    <span className="font-medium">{job.company ?? 'Unknown Company'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Meta grid */}
                        <div className="grid grid-cols-2 gap-3 mt-5">
                            {job.location && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    {job.location}
                                </div>
                            )}
                            {job.postedAt && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    {formatDate(job.postedAt)}
                                </div>
                            )}
                            {(job.salaryMin || job.salaryMax) && (
                                <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                                    <DollarSign className="h-4 w-4" />
                                    {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                                </div>
                            )}
                            {job.employmentType && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Briefcase className="h-4 w-4 text-gray-400" />
                                    {job.employmentType}
                                    {job.seniority && ` · ${job.seniority}`}
                                </div>
                            )}
                        </div>

                        {/* Tags */}
                        {job.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {job.tags.map((tag) => (
                                    <span key={tag} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 rounded-full px-3 py-1">
                                        <Tag className="h-3 w-3" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    {job.description && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">About the Role</h2>
                            <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap leading-relaxed">
                                {job.description}
                            </div>
                        </div>
                    )}

                    {/* Raw JSON viewer */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <button
                            onClick={() => setRawOpen(!rawOpen)}
                            className="flex items-center justify-between w-full px-6 py-4 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-2xl transition-colors"
                        >
                            <span>View Raw JSON</span>
                            {rawOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        {rawOpen && (
                            <div className="px-6 pb-6 border-t border-gray-100">
                                <pre className="mt-3 bg-gray-900 text-green-400 rounded-xl p-4 text-xs overflow-auto max-h-96 scrollbar-thin">
                                    {JSON.stringify(job.raw, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Apply button */}
                    {job.applyUrl && (
                        <a
                            href={job.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
                        >
                            Apply Now
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    )}

                    {/* Save job */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                        <h3 className="text-sm font-medium text-gray-700">Save this Job</h3>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Add a personal note (optional)…"
                            rows={3}
                            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={cn(
                                'flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                                saved
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200'
                            )}
                        >
                            <Bookmark className={cn('h-4 w-4', saved && 'fill-current')} />
                            {saved ? 'Saved!' : 'Save Job'}
                        </button>
                    </div>

                    {/* Job info card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3 text-sm">
                        <h3 className="font-medium text-gray-700">Job Details</h3>
                        <dl className="space-y-2">
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Source</dt>
                                <dd className="text-gray-900 font-medium capitalize">{job.source}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Listed</dt>
                                <dd className="text-gray-900">{formatDate(job.createdAt)}</dd>
                            </div>
                            {job.employmentType && (
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Type</dt>
                                    <dd className="text-gray-900">{job.employmentType}</dd>
                                </div>
                            )}
                            {job.seniority && (
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Level</dt>
                                    <dd className="text-gray-900">{job.seniority}</dd>
                                </div>
                            )}
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    )
}
