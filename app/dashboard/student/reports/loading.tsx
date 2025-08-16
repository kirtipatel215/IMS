import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ReportsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Progress Overview Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-2 w-full" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <Skeleton className="h-8 w-8 mx-auto mb-2" />
                <Skeleton className="h-3 w-16 mx-auto" />
              </div>
              <div>
                <Skeleton className="h-8 w-8 mx-auto mb-2" />
                <Skeleton className="h-3 w-20 mx-auto" />
              </div>
              <div>
                <Skeleton className="h-8 w-8 mx-auto mb-2" />
                <Skeleton className="h-3 w-18 mx-auto" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Skeleton className="h-6 w-64" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-8" />
                  </div>
                  <Skeleton className="h-4 w-48 mb-2" />
                  <Skeleton className="h-4 w-full mb-3" />
                  <div className="mb-3">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
