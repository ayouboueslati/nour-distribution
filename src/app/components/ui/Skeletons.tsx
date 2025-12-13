// Reusable Skeleton Components for Admin Screens

export const SkeletonCard = () => (
    <div className="bg-white rounded-xl border border-stone-200 p-6 animate-pulse">
        <div className="h-4 bg-stone-200 rounded w-1/3 mb-4 skeleton"></div>
        <div className="h-8 bg-stone-200 rounded w-1/2 skeleton"></div>
    </div>
);

export const SkeletonStatCard = () => (
    <div className="bg-white rounded-xl border border-stone-200 p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-stone-200 rounded w-1/3 skeleton"></div>
            <div className="w-10 h-10 bg-stone-200 rounded-lg skeleton"></div>
        </div>
        <div className="h-8 bg-stone-200 rounded w-2/3 mb-2 skeleton"></div>
        <div className="h-3 bg-stone-200 rounded w-1/2 skeleton"></div>
    </div>
);

export const SkeletonTable = ({ rows = 5 }: { rows?: number }) => (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        {/* Table Header */}
        <div className="border-b border-stone-200 p-4">
            <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-4 bg-stone-200 rounded skeleton"></div>
                ))}
            </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-stone-100">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="p-4 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((j) => (
                            <div key={j} className="h-4 bg-stone-200 rounded skeleton"></div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const SkeletonChart = () => (
    <div className="bg-white rounded-xl border border-stone-200 p-6 animate-pulse">
        <div className="h-6 bg-stone-200 rounded w-1/4 mb-6 skeleton"></div>
        <div className="h-64 bg-stone-100 rounded skeleton"></div>
    </div>
);

export const SkeletonOrderCard = () => (
    <div className="bg-white rounded-xl border border-stone-200 p-4 animate-pulse">
        <div className="flex items-center justify-between mb-3">
            <div className="h-5 bg-stone-200 rounded w-1/3 skeleton"></div>
            <div className="h-6 bg-stone-200 rounded-full w-20 skeleton"></div>
        </div>
        <div className="space-y-2">
            <div className="h-3 bg-stone-200 rounded w-2/3 skeleton"></div>
            <div className="h-3 bg-stone-200 rounded w-1/2 skeleton"></div>
        </div>
    </div>
);

export const SkeletonProductCard = () => (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden animate-pulse">
        <div className="h-48 bg-stone-200 skeleton"></div>
        <div className="p-4">
            <div className="h-5 bg-stone-200 rounded w-3/4 mb-2 skeleton"></div>
            <div className="h-4 bg-stone-200 rounded w-1/2 mb-3 skeleton"></div>
            <div className="flex items-center justify-between">
                <div className="h-6 bg-stone-200 rounded w-1/4 skeleton"></div>
                <div className="h-8 bg-stone-200 rounded w-1/3 skeleton"></div>
            </div>
        </div>
    </div>
);

export const SkeletonUserCard = () => (
    <div className="bg-white rounded-xl border border-stone-200 p-4 animate-pulse">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-stone-200 rounded-full skeleton"></div>
            <div className="flex-1">
                <div className="h-4 bg-stone-200 rounded w-2/3 mb-2 skeleton"></div>
                <div className="h-3 bg-stone-200 rounded w-1/2 skeleton"></div>
            </div>
        </div>
    </div>
);

export const SkeletonList = ({ items = 3 }: { items?: number }) => (
    <div className="space-y-3">
        {Array.from({ length: items }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-stone-200 p-4 animate-pulse" style={{ animationDelay: `${i * 75}ms` }}>
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="h-4 bg-stone-200 rounded w-3/4 mb-2 skeleton"></div>
                        <div className="h-3 bg-stone-200 rounded w-1/2 skeleton"></div>
                    </div>
                    <div className="h-8 bg-stone-200 rounded w-16 skeleton"></div>
                </div>
            </div>
        ))}
    </div>
);
