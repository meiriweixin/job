'use client'

import { X } from 'lucide-react'
import { ReadonlyURLSearchParams } from 'next/navigation'

interface JobFiltersProps {
    params: ReadonlyURLSearchParams
    onFilter: (key: string, value: string | null) => void
    onClear: () => void
}

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance']
const SENIORITY_LEVELS = ['Entry', 'Mid', 'Senior', 'Executive']
const TAGS = ['Technology', 'Finance', 'Healthcare', 'Consulting', 'Manufacturing', 'Others']
const POSTED_WITHIN = [
    { label: 'Last 24 hours', value: '24h' },
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 30 days', value: '30d' },
]

export function JobFilters({ params, onFilter, onClear }: JobFiltersProps) {
    const get = (key: string) => params.get(key) ?? ''

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-6 sticky top-20">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Filters</h2>
                <button
                    onClick={onClear}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                    <X className="h-3 w-3" />
                    Clear all
                </button>
            </div>

            {/* Employment Type */}
            <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Employment Type</h3>
                <div className="space-y-1.5">
                    {EMPLOYMENT_TYPES.map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="employmentType"
                                value={type}
                                checked={get('employmentType') === type}
                                onChange={(e) => onFilter('employmentType', e.target.checked ? type : null)}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 group-hover:text-gray-900">{type}</span>
                        </label>
                    ))}
                    {get('employmentType') && (
                        <button onClick={() => onFilter('employmentType', null)} className="text-xs text-blue-600 mt-1">
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Seniority */}
            <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Seniority Level</h3>
                <div className="space-y-1.5">
                    {SENIORITY_LEVELS.map((level) => (
                        <label key={level} className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="seniority"
                                value={level}
                                checked={get('seniority') === level}
                                onChange={(e) => onFilter('seniority', e.target.checked ? level : null)}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 group-hover:text-gray-900">{level}</span>
                        </label>
                    ))}
                    {get('seniority') && (
                        <button onClick={() => onFilter('seniority', null)} className="text-xs text-blue-600 mt-1">
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Industry Tags */}
            <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Industry</h3>
                <div className="flex flex-wrap gap-2">
                    {TAGS.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => onFilter('tags', get('tags') === tag ? null : tag)}
                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${get('tags') === tag
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                                }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Salary Range */}
            <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Salary (SGD/month)</h3>
                <div className="flex gap-2 items-center">
                    <input
                        type="number"
                        placeholder="Min"
                        value={get('salaryMin')}
                        onChange={(e) => onFilter('salaryMin', e.target.value || null)}
                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <span className="text-gray-400 text-sm">–</span>
                    <input
                        type="number"
                        placeholder="Max"
                        value={get('salaryMax')}
                        onChange={(e) => onFilter('salaryMax', e.target.value || null)}
                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
            </div>

            {/* Location */}
            <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Location</h3>
                <input
                    type="text"
                    placeholder="e.g. Raffles Place, Toa Payoh…"
                    value={get('location')}
                    onChange={(e) => onFilter('location', e.target.value || null)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>

            {/* Posted within */}
            <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Posted Within</h3>
                <div className="space-y-1.5">
                    {POSTED_WITHIN.map(({ label, value }) => (
                        <label key={value} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="postedWithin"
                                value={value}
                                checked={get('postedWithin') === value}
                                onChange={(e) => onFilter('postedWithin', e.target.checked ? value : null)}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{label}</span>
                        </label>
                    ))}
                    {get('postedWithin') && (
                        <button onClick={() => onFilter('postedWithin', null)} className="text-xs text-blue-600 mt-1">
                            Clear
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
