import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AlertsClient } from '@/components/alerts/alerts-client'

export default async function AlertsPage() {
    const session = await auth()
    if (!session?.user) redirect('/auth/signin')

    const userId = (session.user as { id: string }).id

    const alerts = await prisma.alert.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
            runs: {
                orderBy: { runAt: 'desc' },
                take: 3,
                include: {
                    matchedJobs: {
                        include: {
                            job: {
                                select: { id: true, title: true, company: true, location: true, postedAt: true }
                            }
                        },
                        take: 5,
                    }
                }
            }
        }
    })

    return <AlertsClient alerts={JSON.parse(JSON.stringify(alerts))} />
}
