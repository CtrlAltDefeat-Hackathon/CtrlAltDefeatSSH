import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Main Quiz Content */}
          <div className="flex-1 space-y-6">
            
            {/* Header Skeleton */}
            <Card className="border-0 shadow-lg bg-card/95 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Subject Info */}
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  
                  {/* Timer and Controls */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-5 h-5 rounded" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="w-10 h-10 rounded-lg" />
                      <Skeleton className="w-10 h-10 rounded-lg" />
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Progress Bar Skeleton */}
            <Card className="border-0 shadow-sm bg-card/90 backdrop-blur-sm">
              <CardContent className="py-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-2 w-full rounded-full" />
                    <div className="flex justify-between text-xs">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Question Card Skeleton */}
            <Card className="border-0 shadow-xl bg-card/95 backdrop-blur-sm">
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4 rounded" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                </div>
                
                {/* Question Text */}
                <div className="space-y-3">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-4/5" />
                  <Skeleton className="h-6 w-3/4" />
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Answer Options */}
                {[1, 2, 3, 4].map((index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 transition-all duration-200">
                      <Skeleton className="w-6 h-6 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                  <Skeleton className="h-12 flex-1 rounded-xl" />
                  <Skeleton className="h-12 w-full sm:w-32 rounded-xl" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Skeleton */}
          <div className="w-full lg:w-80 space-y-6">
            
            {/* Progress Stats */}
            <Card className="border-0 shadow-lg bg-card/95 backdrop-blur-sm">
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-6">
                {/* XP and Level */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-5 h-5 rounded" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>

                {/* Coins and Streak */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-1">
                      <Skeleton className="w-4 h-4 rounded" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                    <Skeleton className="h-3 w-12 mx-auto" />
                  </div>
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-1">
                      <Skeleton className="w-4 h-4 rounded" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                    <Skeleton className="h-3 w-12 mx-auto" />
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="space-y-3 pt-4 border-t border-border/30">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Question Navigator */}
            <Card className="border-0 shadow-lg bg-card/95 backdrop-blur-sm">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-3">
                  {Array.from({ length: 15 }, (_, index) => (
                    <div key={index} className="aspect-square">
                      <Skeleton className="w-full h-full rounded-lg" />
                    </div>
                  ))}
                </div>
                
                {/* Legend */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-4 h-4 rounded" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-4 h-4 rounded" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-4 h-4 rounded" />
                    <Skeleton className="h-3 w-18" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg bg-card/95 backdrop-blur-sm">
              <CardHeader>
                <Skeleton className="h-6 w-28" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Loading Indicator */}
        <div className="fixed bottom-6 right-6">
          <div className="flex items-center gap-3 bg-card/95 backdrop-blur-sm border border-border/30 rounded-xl px-4 py-3 shadow-lg">
            <div className="animate-spin">
              <Skeleton className="w-5 h-5 rounded-full" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}