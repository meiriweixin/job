'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Briefcase, Menu, X, Bell, Bookmark, LayoutDashboard, LogIn, LogOut, User } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

const publicLinks = [
    { href: '/jobs', label: 'Browse Jobs' },
]

const authLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/saved', label: 'Saved', icon: Bookmark },
    { href: '/alerts', label: 'Alerts', icon: Bell },
]

export function Navbar() {
    const pathname = usePathname()
    const { data: session, status } = useSession()
    const [mobileOpen, setMobileOpen] = useState(false)

    const isActive = (href: string) => pathname.startsWith(href)

    return (
        <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md shadow-sm">
            <nav className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-700 hover:text-blue-800 transition-colors">
                        <Briefcase className="h-6 w-6" />
                        <span>SG Job Finder</span>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {publicLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                                    isActive(link.href)
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {status === 'authenticated' &&
                            authLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5',
                                        isActive(link.href)
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    )}
                                >
                                    <link.icon className="h-4 w-4" />
                                    {link.label}
                                </Link>
                            ))}
                    </div>

                    {/* Auth buttons */}
                    <div className="hidden md:flex items-center gap-2">
                        {status === 'authenticated' ? (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                        <User className="h-4 w-4 text-blue-700" />
                                    </div>
                                    <span className="font-medium">{session.user?.name ?? session.user?.email}</span>
                                </div>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 rounded-lg transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/auth/signin"
                                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                            >
                                <LogIn className="h-4 w-4" />
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div className="md:hidden py-3 border-t space-y-1 animate-fade-in">
                        {publicLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                    'block px-3 py-2 rounded-lg text-sm font-medium',
                                    isActive(link.href) ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {status === 'authenticated' &&
                            authLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={cn(
                                        'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
                                        isActive(link.href) ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                                    )}
                                >
                                    <link.icon className="h-4 w-4" />
                                    {link.label}
                                </Link>
                            ))}
                        <div className="pt-2 border-t">
                            {status === 'authenticated' ? (
                                <button
                                    onClick={() => { signOut({ callbackUrl: '/' }); setMobileOpen(false) }}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
                                >
                                    <LogOut className="h-4 w-4" /> Sign Out
                                </button>
                            ) : (
                                <Link
                                    href="/auth/signin"
                                    onClick={() => setMobileOpen(false)}
                                    className="block px-3 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 text-center"
                                >
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    )
}
