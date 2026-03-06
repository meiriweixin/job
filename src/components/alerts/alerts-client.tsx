'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell, Plus, Trash2, Play, ChevronDown, ChevronUp, Briefcase, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Job {
    id: string
    title: string
    company: string | null
    location: string | null
    postedAt: string | null
}

interface AlertRun {
    id: string
    runAt: string
    matchCount: number
    matchedJobs: { job: Job }[]
}

interface Alert {
    id: string
    name: string
    query: string | null
    frequency: string
    lastRunAt: string | null
    createdAt: string
    runs: AlertRun[]
}

export function AlertsClient({ alerts: initialAlerts }: { alerts: Alert[] }) {
    const [alerts, setAlerts] = useState(initialAlerts)
    const [showCreate, setShowCreate] = useState(false)
    const [expanded, setExpanded] = useState<string | null>(null)
    const [creating, setCreating] = useState(false)
    const [form, setForm] = useState({
        name: '',
        query: '',
        frequency: 'DAILY' as const,
    })

    const createAlert = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreating(true)
        try {
            const res = await fetch('/api/alerts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    query: form.query || undefined,
                    frequency: form.frequency,
                    filters: {},
                }),
            })
            if (res.ok) {
                const data = await res.json()
                setAlerts([{ ...data.alert, runs: [] }, ...alerts])
                setShowCreate(false)
                setForm({ name: '', query: '', frequency: 'DAILY' })
            }
        } catch { }
        setCreating(false)
    }

    const deleteAlert = async (alertId: string) => {
        if (!confirm('Delete this alert?')) return
        await fetch(`/api/alerts/${alertId}`, { method: 'DELETE' })
        setAlerts(alerts.filter((a) => a.id !== alertId))
    }

    const runAlert = async (alertId: string) => {
        const res = await fetch(`/api/alerts/${alertId}`, { method: 'POST' })
        const data = await res.json()
        alert(`Alert run complete! Found ${data.matchCount} matching jobs.`)
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Bell className="h-8 w-8 text-purple-600" />
                        Job Alerts
                    </h1>
                    <p className="text-gray-500 mt-1">Get notified when new matching jobs appear</p>
                </div>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm text-sm"
                >
                    <Plus className="h-4 w-4" />
                    New Alert
                </button>
            </div>

            {/* Create alert form */}
            {showCreate && (
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 mb-6 animate-fade-in">
                    <h2 className="font-semibold text-gray-900 mb-4">Create New Alert</h2>
                    <form onSubmit={createAlert} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Alert Name *</label>
                            <input
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g. Software Engineer jobs"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Search Keywords</label>
                            <input
                                value={form.query}
                                onChange={(e) => setForm({ ...form, query: e.target.value })}
                                placeholder="e.g. React developer, marketing manager…"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Frequency</label>
                            <select
                                value={form.frequency}
                                onChange={(e) => setForm({ ...form, frequency: e.target.value as 'DAILY' | 'WEEKLY' })}
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="DAILY">Daily</option>
                                <option value="WEEKLY">Weekly</option>
                            </select>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={creating}
                                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
                            >
                                {creating ? 'Creating…' : 'Create Alert'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowCreate(false)}
                                className="px-6 py-2.5 text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Alert list */}
            {alerts.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-5xl mb-4">🔔</p>
                    <h2 className="text-xl font-semibold text-gray-700">No alerts set up</h2>
                    <p className="text-gray-500 mt-2">Create an alert to get notified about new matching jobs.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {alerts.map((alert) => (
                        <div key={alert.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between px-6 py-4">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900">{alert.name}</h3>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                        {alert.query && (
                                            <span className="bg-gray-100 text-gray-600 rounded-full px-2.5 py-0.5 text-xs">
                                                &ldquo;{alert.query}&rdquo;
                                            </span>
                                        )}
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${alert.frequency === 'DAILY' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                                            }`}>
                                            {alert.frequency}
                                        </span>
                                        {alert.lastRunAt && (
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5" />
                                                Last run: {formatDate(alert.lastRunAt)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => runAlert(alert.id)}
                                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                        title="Run now"
                                    >
                                        <Play className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setExpanded(expanded === alert.id ? null : alert.id)}
                                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                                    >
                                        {expanded === alert.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </button>
                                    <button
                                        onClick={() => deleteAlert(alert.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Run history */}
                            {expanded === alert.id && (
                                <div className="border-t border-gray-100 px-6 py-4 space-y-4 animate-fade-in">
                                    <h4 className="text-sm font-medium text-gray-700">Recent Matches</h4>
                                    {alert.runs.length === 0 ? (
                                        <p className="text-sm text-gray-400">No runs yet. Click the play button to run now.</p>
                                    ) : (
                                        alert.runs.map((run) => (
                                            <div key={run.id} className="space-y-2">
                                                <div className="text-xs text-gray-400 font-medium">{formatDate(run.runAt)} · {run.matchCount} matches</div>
                                                {run.matchedJobs.map(({ job }) => (
                                                    <Link
                                                        key={job.id}
                                                        href={`/jobs/${job.id}`}
                                                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-sm"
                                                    >
                                                        <Briefcase className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                        <div className="min-w-0">
                                                            <div className="font-medium text-gray-900 truncate">{job.title}</div>
                                                            <div className="text-gray-500 text-xs">{job.company} · {job.location}</div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
