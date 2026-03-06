import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/navbar'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: {
        default: 'SG Job Finder – Singapore Jobs & Internships',
        template: '%s | SG Job Finder',
    },
    description:
        'Find the latest jobs and internships in Singapore. Real-time listings from multiple sources, advanced filters, and job alerts.',
    keywords: ['Singapore jobs', 'internships Singapore', 'SG careers', 'job search Singapore'],
    openGraph: {
        type: 'website',
        locale: 'en_SG',
        url: 'https://sg-job-finder.app',
        siteName: 'SG Job Finder',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <Providers>
                    <div className="min-h-screen flex flex-col bg-gray-50">
                        <Navbar />
                        <main className="flex-1">{children}</main>
                        <footer className="border-t bg-white py-8 mt-auto">
                            <div className="container mx-auto px-4 text-center text-sm text-gray-500">
                                <p>© {new Date().getFullYear()} SG Job Finder · Built for Singapore job seekers</p>
                            </div>
                        </footer>
                    </div>
                </Providers>
            </body>
        </html>
    )
}
