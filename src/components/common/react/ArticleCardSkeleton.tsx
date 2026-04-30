import { Skeleton } from './Skeleton';

/**
 * Skeleton for a single article card, matching ArticleGrid card layout.
 * Mobile: left image + right content; Desktop: top image + bottom content.
 */
export function ArticleCardSkeleton() {
  return (
    <div className="rounded overflow-hidden">
      <div className="flex gap-3 md:block">
        {/* Image placeholder */}
        <Skeleton className="flex-shrink-0 w-22 h-22 md:w-full md:h-48" />

        {/* Content area */}
        <div className="flex-1 md:mt-5">
          {/* Category + tag */}
          <div className="flex gap-1 md:gap-2">
            <Skeleton className="h-3 w-16 md:h-4 md:w-20" variant="text" />
            <Skeleton className="h-3 w-12 md:h-4 md:w-16" variant="text" />
          </div>

          {/* Title */}
          <div className="pt-1">
            <Skeleton className="h-5 w-full mb-1 md:h-6 md:mb-2" variant="text" />
            <Skeleton className="h-5 w-3/4 md:h-6" variant="text" />

            {/* Subtitle (desktop only) */}
            <div className="hidden md:block mt-2">
              <Skeleton className="h-4 w-full mb-1" variant="text" />
              <Skeleton className="h-4 w-5/6" variant="text" />
            </div>

            {/* Meta: date / by author */}
            <div className="flex items-center gap-1 mt-2">
              <Skeleton className="h-3 w-16" variant="text" />
              <Skeleton className="h-3 w-6" variant="text" />
              <Skeleton className="h-3 w-20" variant="text" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ArticleGridSkeletonProps {
  count?: number;
}

/**
 * Grid of skeleton cards matching ArticleGrid layout.
 */
export function ArticleGridSkeleton({ count = 8 }: ArticleGridSkeletonProps) {
  return (
    <div className="space-y-4 md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-6 md:space-y-0 mb-1 md:mb-12 mt-5 md:mt-6 px-4 md:px-6">
      {Array.from({ length: count }).map((_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  );
}
