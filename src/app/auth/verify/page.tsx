import Link from 'next/link'
import { Mail } from 'lucide-react'

export default function VerifyPage() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
            <div className="text-center max-w-md">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-100 text-blue-600 mb-6">
                    <Mail className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">Check your email</h1>
                <p className="text-gray-500 mb-6">
                    A sign-in link has been sent to your email address. Click the link to complete your login.
                </p>
                <Link href="/" className="text-sm text-blue-600 hover:underline">
                    ← Back to home
                </Link>
            </div>
        </div>
    )
}
