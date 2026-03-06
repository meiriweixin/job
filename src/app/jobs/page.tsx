'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { JobCard } from '@/components/jobs/job-card'
import { JobFilters } from '@/components/jobs/job-filters'
import { cn } from '@/lib/utils'

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

interface Pagination {
    page: number
    limit: number
    total: number
    pages: number
}

export default function JobsPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [jobs, setJobs] = useState<Job[]>([])
    const [pagination, setPagination] = useState<Pagination | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filtersOpen, setFiltersOpen] = useState(false)
    const [query, setQuery] = useState(searchParams.get('query') ?? '')
    const searchInputRef = useRef<HTMLInputElement>(null)

    const fetchJobs = useCallback(async (params: URLSearchParams) => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`/api/jobs?${params.toString()}`)
            if (!res.ok) throw new Error('Failed to fetch jobs')
            const data = await res.json()
            setJobs(data.jobs ?? [])
            setPagination(data.pagination)
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error loading jobs')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchJobs(new URLSearchParams(searchParams.toString()))
        setQuery(searchParams.get('query') ?? '')
    }, [searchParams, fetchJobs])

    const updateParam = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        params.delete('page')
        router.push(`/jobs?${params.toString()}`)
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        updateParam('query', query || null)
    }

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', String(newPage))
        router.push(`/jobs?${params.toString()}`)
    }

    const clearFilters = () => {
        setQuery('')
        router.push('/jobs')
    }

    const activeFilterCount = ['location', 'employmentType', 'seniority', 'tags', 'salaryMin', 'salaryMax', 'postedWithin']
        .filter((key) => searchParams.has(key)).length

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Page header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Singapore Jobs</h1>
                <p className="text-gray-500 mt-1">
                    {pagination ? `${pagination.total.toLocaleString()} jobs found` : 'Finding the best opportunities…'}
                </p>
            </div>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search job title, company, or keyword…"
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm text-gray-900 placeholder-gray-400"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => { setQuery(''); updateParam('query', null) }}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                >
                    Search
                </button>
                <button
                    type="button"
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    className={cn(
                        'flex items-center gap-2 px-4 py-3 border rounded-xl font-medium transition-colors',
                        filtersOpen || activeFilterCount > 0
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    )}
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
            </form>

            <div className="flex gap-6">
                {/* Sidebar filters */}
                {filtersOpen && (
                    <aside className="w-72 flex-shrink-0">
                        <JobFilters
                            params={searchParams}
                            onFilter={(key, value) => updateParam(key, value)}
                            onClear={clearFilters}
                        />
                    </aside>
                )}

                {/* Job list */}
                <div className="flex-1 min-w-0">
                    {/* Sort + active filters */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                            {searchParams.get('query') && (
                                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-sm rounded-full px-3 py-1">
                                    &quot;{searchParams.get('query')}&quot;
                                    <button onClick={() => updateParam('query', null)}><X className="h-3 w-3" /></button>
                                </span>
                            )}
                            {searchParams.get('employmentType') && (
                                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-sm rounded-full px-3 py-1">
                                    {searchParams.get('employmentType')}
                                    <button onClick={() => updateParam('employmentType', null)}><X className="h-3 w-3" /></button>
                                </span>
                            )}
                        </div>
                        <select
                            value={searchParams.get('sort') ?? 'newest'}
                            onChange={(e) => updateParam('sort', e.target.value)}
                            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="newest">Newest First</option>
                            <option value="relevance">Most Relevant</option>
                            <option value="salary">Highest Salary</option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-gray-200 flex-shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-5 bg-gray-200 rounded w-3/4" />
                                            <div className="h-4 bg-gray-100 rounded w-1/2" />
                                            <div className="h-4 bg-gray-100 rounded w-1/3" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-16 text-red-600">
                            <p className="text-lg font-medium">{error}</p>
                            <button onClick={() => fetchJobs(new URLSearchParams(searchParams.toString()))} className="mt-4 text-sm text-blue-600 underline">
                                Try again
                            </button>
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <p className="text-6xl mb-4">🔍</p>
                            <p className="text-xl font-medium text-gray-700">No jobs found</p>
                            <p className="mt-2">Try adjusting your search or filters</p>
                            <button onClick={clearFilters} className="mt-4 text-sm text-blue-600 underline">
                                Clear all filters
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {jobs.map((job) => (
                                <JobCard key={job.id} job={job} />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination && pagination.pages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            <button
                                disabled={pagination.page <= 1}
                                onClick={() => handlePageChange(pagination.page - 1)}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            {Array.from({ length: Math.min(7, pagination.pages) }, (_, i) => {
                                const p = i + 1
                                return (
                                    <button
                                        key={p}
                                        onClick={() => handlePageChange(p)}
                                        className={cn(
                                            'w-9 h-9 rounded-lg text-sm font-medium transition-colors',
                                            p === pagination.page
                                                ? 'bg-blue-600 text-white'
                                                : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
                                        )}
                                    >
                                        {p}
                                    </button>
                                )
                            })}
                            {pagination.pages > 7 && <span className="px-2 text-gray-400">…</span>}
                            <button
                                disabled={pagination.page >= pagination.pages}
                                onClick={() => handlePageChange(pagination.page + 1)}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
