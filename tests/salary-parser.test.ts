import { describe, it, expect } from '@jest/globals'
import { parseSalary } from '../src/lib/salary-parser'

describe('parseSalary', () => {
    it('parses SGD monthly range', () => {
        const result = parseSalary('SGD 3,000 - 4,500 / month')
        expect(result.salaryMin).toBe(3000)
        expect(result.salaryMax).toBe(4500)
        expect(result.currency).toBe('SGD')
    })

    it('parses k-notation range', () => {
        const result = parseSalary('$3k–$5k per month')
        expect(result.salaryMin).toBe(3000)
        expect(result.salaryMax).toBe(5000)
    })

    it('parses hourly rate and converts to monthly', () => {
        const result = parseSalary('$18/hour')
        // 18 * 8 * 22 = 3168
        expect(result.salaryMin).toBe(18 * 8 * 22)
        expect(result.salaryMax).toBeNull()
    })

    it('parses annual salary and converts to monthly', () => {
        const result = parseSalary('SGD 60,000 per annum')
        expect(result.salaryMin).toBe(5000)
        expect(result.salaryMax).toBeNull()
    })

    it('parses daily rate', () => {
        const result = parseSalary('SGD 200 daily')
        expect(result.salaryMin).toBe(200 * 22)
    })

    it('returns nulls for unparseable input', () => {
        const result = parseSalary('competitive salary')
        expect(result.salaryMin).toBeNull()
        expect(result.salaryMax).toBeNull()
    })

    it('returns nulls for non-string input', () => {
        const result = parseSalary(null)
        expect(result.salaryMin).toBeNull()
        expect(result.salaryMax).toBeNull()
    })

    it('handles single number', () => {
        const result = parseSalary('3500')
        expect(result.salaryMin).toBe(3500)
        expect(result.salaryMax).toBeNull()
    })
})
