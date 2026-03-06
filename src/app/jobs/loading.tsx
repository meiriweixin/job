export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="mb-6">
                <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-2" />
                <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="h-12 bg-gray-200 rounded-xl animate-pulse mb-6" />
            <div className="space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
                        <div className="flex gap-4">
                            <div className="h-12 w-12 rounded-xl bg-gray-200 flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-5 bg-gray-200 rounded w-3/4" />
                                <div className="h-4 bg-gray-100 rounded w-1/2" />
                                <div className="flex gap-2">
                                    <div className="h-5 w-16 bg-gray-100 rounded-full" />
                                    <div className="h-5 w-20 bg-gray-100 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
