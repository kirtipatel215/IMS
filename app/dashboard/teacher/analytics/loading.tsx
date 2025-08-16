export default function TeacherAnalyticsLoading() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
      </div>

      {/* Key Metrics Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="h-80 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-80 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Status Overview Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>

      {/* Activity Summary Skeleton */}
      <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
    </div>
  )
}
