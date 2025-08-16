export default function TeacherCertificatesLoading() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>

      {/* Certificates List Skeleton */}
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-56 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    </div>
  )
}
