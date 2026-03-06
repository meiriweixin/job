/**
 * Local dev cron scheduler using node-cron.
 * Run with: npx ts-node --project tsconfig.json scripts/cron.ts
 *
 * In production, use the docker health-check or an external cron
 * to POST /api/ingest with admin credentials.
 */
import cron from 'node-cron'
import { runIngest } from '../src/lib/ingest'

console.log('🕐 Cron scheduler started. Ingest will run every hour.')

// Every hour at minute 0
cron.schedule('0 * * * *', async () => {
    console.log(`[cron] Running ingest at ${new Date().toISOString()}`)
    const result = await runIngest()
    if (result.error) {
        console.error(`[cron] Ingest failed: ${result.error}`)
    } else {
        console.log(`[cron] Ingest complete: ${result.jobsFetched} fetched, ${result.jobsUpserted} upserted`)
    }
})

// Keep process alive
process.on('SIGTERM', () => { console.log('Cron scheduler stopped.'); process.exit(0) })
