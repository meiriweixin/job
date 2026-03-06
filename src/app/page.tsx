import Link from 'next/link'
import { Briefcase, Search, Bell, Bookmark, ArrowRight, MapPin, TrendingUp, Users } from 'lucide-react'

export default function HomePage() {
    return (
        <div className="flex flex-col">
            {/* Hero */}
            <section className="relative overflow-hidden gradient-hero text-white py-24 px-4">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <div className="relative container mx-auto max-w-4xl text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6 animate-fade-in">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                        </span>
                        Live Singapore job listings
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight animate-fade-in">
                        Find Your Next
                        <span className="block text-blue-300">Singapore Role</span>
                    </h1>
                    <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto animate-fade-in">
                        Real-time job listings aggregated from top Singapore companies. Full-time, internships, contracts — all in one place.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
                        <Link
                            href="/jobs"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            <Search className="h-5 w-5" />
                            Browse Jobs
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/auth/signin"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/30 hover:bg-white/20 transition-all"
                        >
                            <Bell className="h-5 w-5" />
                            Set Up Alerts
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-12 bg-white border-b">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
                        {[
                            { icon: Briefcase, value: '1,000+', label: 'Active Listings' },
                            { icon: Users, value: '200+', label: 'Companies' },
                            { icon: TrendingUp, value: 'Daily', label: 'Updated' },
                        ].map(({ icon: Icon, value, label }) => (
                            <div key={label} className="flex flex-col items-center gap-2">
                                <Icon className="h-8 w-8 text-blue-600" />
                                <span className="text-2xl font-bold text-gray-900">{value}</span>
                                <span className="text-sm text-gray-500">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 px-4 bg-gray-50">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
                        Everything you need to land your next role
                    </h2>
                    <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
                        Smart search, personalized alerts, and easy job saving — all optimized for Singapore's job market.
                    </p>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: Search,
                                title: 'Smart Search & Filters',
                                desc: 'Full-text search with fuzzy matching. Filter by type, location, salary, seniority, and more.',
                                color: 'bg-blue-50 text-blue-600',
                            },
                            {
                                icon: Bell,
                                title: 'Job Alerts',
                                desc: 'Set keyword + filter alerts. Get notified daily or weekly when matching jobs appear.',
                                color: 'bg-purple-50 text-purple-600',
                            },
                            {
                                icon: Bookmark,
                                title: 'Save Jobs & Notes',
                                desc: 'Bookmark interesting roles and add personal notes to track your applications.',
                                color: 'bg-green-50 text-green-600',
                            },
                        ].map(({ icon: Icon, title, desc, color }) => (
                            <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className={`inline-flex p-3 rounded-xl ${color} mb-4`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Job type highlights */}
            <section className="py-16 px-4 bg-white">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Browse by Category</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Full-time', count: 'Popular', href: '/jobs?employmentType=Full-time', emoji: '💼' },
                            { label: 'Internships', count: 'For Students', href: '/jobs?employmentType=Internship', emoji: '🎓' },
                            { label: 'Technology', count: 'In Demand', href: '/jobs?tags=Technology', emoji: '💻' },
                            { label: 'Finance', count: 'Growing', href: '/jobs?tags=Finance', emoji: '📈' },
                            { label: 'Healthcare', count: 'Essential', href: '/jobs?tags=Healthcare', emoji: '🏥' },
                            { label: 'Consulting', count: 'Competitive', href: '/jobs?tags=Consulting', emoji: '🤝' },
                            { label: 'Remote', count: 'Flexible', href: '/jobs?query=remote', emoji: '🏠' },
                            { label: 'Marketing', count: 'Creative', href: '/jobs?query=marketing', emoji: '📣' },
                        ].map(({ label, count, href, emoji }) => (
                            <Link
                                key={label}
                                href={href}
                                className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
                            >
                                <span className="text-2xl">{emoji}</span>
                                <div>
                                    <div className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">{label}</div>
                                    <div className="text-xs text-gray-400">{count}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-4 bg-blue-600">
                <div className="container mx-auto max-w-2xl text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">Ready to find your next opportunity?</h2>
                    <p className="text-blue-200 mb-8">
                        Join thousands of job seekers discovering opportunities in Singapore every day.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/jobs"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-lg"
                        >
                            <MapPin className="h-5 w-5" />
                            View All Jobs
                        </Link>
                        <Link
                            href="/auth/signin"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-700 text-white font-semibold rounded-xl border border-blue-500 hover:bg-blue-800 transition-all"
                        >
                            Create Free Account
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
