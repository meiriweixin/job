import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        app: 'SG Job Finder',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
    })
}
