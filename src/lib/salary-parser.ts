/**
 * Salary parsing utilities.
 * Normalizes various salary formats to SGD/month integers.
 */

type SalaryResult = {
    salaryMin: number | null
    salaryMax: number | null
    currency: string
}

const MONTHLY_HOURS = 8 * 22 // 176 hours
const WORKING_DAYS = 22

/**
 * Try to detect currency from string prefix.
 */
function detectCurrency(s: string): string {
    if (/SGD|S\$|\$SG/i.test(s)) return 'SGD'
    if (/USD|\$(?!SG)/i.test(s)) return 'USD'
    if (/GBP|£/i.test(s)) return 'GBP'
    if (/MYR|RM/i.test(s)) return 'MYR'
    return 'SGD'
}

/**
 * Convert amount to SGD/month based on period keyword.
 */
function toMonthly(amount: number, period: string, currency: string): number {
    // Very simple FX: SGD ≈ 1, USD ≈ 1.35, MYR ≈ 0.29 (rough)
    const fxToSGD: Record<string, number> = {
        SGD: 1,
        USD: 1.35,
        GBP: 1.7,
        MYR: 0.29,
    }
    const fxRate = fxToSGD[currency] ?? 1

    const p = period.toLowerCase()
    if (p.includes('hour') || p.includes('hr')) {
        return Math.round(amount * MONTHLY_HOURS * fxRate)
    }
    if (p.includes('day') || p.includes('daily')) {
        return Math.round(amount * WORKING_DAYS * fxRate)
    }
    if (p.includes('year') || p.includes('annual') || p.includes('per annum') || p.includes('pa')) {
        return Math.round((amount / 12) * fxRate)
    }
    // Default = monthly
    return Math.round(amount * fxRate)
}

/**
 * Parse a numeric string that may contain k/K suffix or commas.
 */
function parseNumber(s: string): number | null {
    const cleaned = s.replace(/,/g, '').trim()
    const k = /^(\d+(?:\.\d+)?)\s*k$/i.exec(cleaned)
    if (k) return parseFloat(k[1]) * 1000
    const n = parseFloat(cleaned)
    return isNaN(n) ? null : n
}

/**
 * Parse salary from arbitrary string. Returns normalized SGD/month values.
 * Examples:
 *   "SGD 3,000 - 4,500 / month"
 *   "$3k–$5k per month"
 *   "50k/year"
 *   "$18/hour"
 *   "3500"
 */
export function parseSalary(raw: unknown): SalaryResult {
    const nothing: SalaryResult = { salaryMin: null, salaryMax: null, currency: 'SGD' }
    if (!raw || typeof raw !== 'string') return nothing

    const currency = detectCurrency(raw)

    // Detect period
    const periodMatch =
        /per\s+(?:hour|hr|day|month|year|annum)|\/\s*(?:hr|hour|day|month|mo|year|yr|annum|pa)\b|hourly|daily|monthly|annually|annual|per\s+annum/i.exec(
            raw
        )
    const period = periodMatch ? periodMatch[0] : 'month'

    // Strip currency symbols and words so we can find numbers
    const stripped = raw
        .replace(/SGD|S\$|USD|GBP|MYR|RM|\$|£/gi, '')
        .replace(/per\s+\w+|\/\s*\w+|hourly|daily|monthly|annually|annual/gi, '')

    // Try to find a range: 3,000 - 4,500 or 3k–5k
    const rangeMatch = /(\d[\d,kK.]*)\s*[-–—to]\s*(\d[\d,kK.]*)/i.exec(stripped)
    if (rangeMatch) {
        const min = parseNumber(rangeMatch[1])
        const max = parseNumber(rangeMatch[2])
        if (min !== null && max !== null) {
            return {
                salaryMin: toMonthly(min, period, currency),
                salaryMax: toMonthly(max, period, currency),
                currency,
            }
        }
    }

    // Single number
    const singleMatch = /(\d[\d,kK.]*)/.exec(stripped)
    if (singleMatch) {
        const amount = parseNumber(singleMatch[1])
        if (amount !== null) {
            return {
                salaryMin: toMonthly(amount, period, currency),
                salaryMax: null,
                currency,
            }
        }
    }

    return nothing
}
