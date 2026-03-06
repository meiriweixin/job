'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { Github, Mail, Loader2, Briefcase } from 'lucide-react'

export default function SignInPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState<string | null>(null)
    const [emailSent, setEmailSent] = useState(false)

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading('email')
        try {
            await signIn('nodemailer', { email, callbackUrl: '/dashboard', redirect: false })
            setEmailSent(true)
        } catch { }
        setLoading(null)
    }

    const handleOAuth = (provider: string) => {
        setLoading(provider)
        signIn(provider, { callbackUrl: '/dashboard' })
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 bg-gray-50">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-blue-600 text-white mb-4">
                        <Briefcase className="h-7 w-7" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Sign in to SG Job Finder</h1>
                    <p className="text-gray-500 mt-2">Save jobs, set alerts, and track applications</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                    {emailSent ? (
                        <div className="text-center py-6">
                            <div className="text-4xl mb-3">📧</div>
                            <h2 className="font-semibold text-gray-900">Check your inbox</h2>
                            <p className="text-gray-500 text-sm mt-2">
                                We sent a magic link to <strong>{email}</strong>. Click it to sign in.
                            </p>
                            <button
                                onClick={() => setEmailSent(false)}
                                className="mt-4 text-sm text-blue-600 hover:underline"
                            >
                                Use a different email
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* OAuth providers */}
                            <button
                                onClick={() => handleOAuth('github')}
                                disabled={!!loading}
                                className="flex items-center justify-center gap-3 w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                {loading === 'github' ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                    <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" fill="currentColor" /></svg>
                                )}
                                Continue with GitHub
                            </button>

                            <button
                                onClick={() => handleOAuth('google')}
                                disabled={!!loading}
                                className="flex items-center justify-center gap-3 w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                {loading === 'google' ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                )}
                                Continue with Google
                            </button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative flex justify-center text-xs text-gray-500">
                                    <span className="px-3 bg-white">or sign in with email</span>
                                </div>
                            </div>

                            {/* Email magic link */}
                            <form onSubmit={handleEmailSignIn} className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!!loading}
                                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {loading === 'email' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                                    Send Magic Link
                                </button>
                            </form>
                        </>
                    )}
                </div>

                <p className="text-center text-xs text-gray-400 mt-4">
                    By signing in, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    )
}
