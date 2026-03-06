import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatSalary(min: number | null, max: number | null, currency = 'SGD'): string {
    if (!min && !max) return 'Salary not specified'
    const sym = currency === 'SGD' ? 'S$' : currency
    const fmt = (n: number) => {
        if (n >= 1000) return `${sym}${(n / 1000).toFixed(1)}k`
        return `${sym}${n}`
    }
    if (min && max) return `${fmt(min)} – ${fmt(max)}/mo`
    if (min) return `From ${fmt(min)}/mo`
    return `Up to ${fmt(max!)}/mo`
}

export function formatDate(date: Date | string | null | undefined): string {
    if (!date) return 'Unknown date'
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    if (days < 365) return `${Math.floor(days / 30)} months ago`
    return d.toLocaleDateString('en-SG', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function truncate(str: string, maxLen: number): string {
    if (str.length <= maxLen) return str
    return str.slice(0, maxLen).trimEnd() + '…'
}

export function isAdminEmail(email: string | null | undefined): boolean {
    if (!email) return false
    const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').filter(Boolean)
    return adminEmails.includes(email)
}
