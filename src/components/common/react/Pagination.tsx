import type { Locale } from '@/types'

interface PaginationProps {
  currentPage: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  locale: Locale
  onlyNext?: boolean
  hasMore?: boolean
}

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  locale,
  onlyNext = false,
  hasMore = false
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Don't render if there's only one page (unless using onlyNext mode)
  if (!onlyNext && totalPages <= 1) {
    return null
  }

  // For onlyNext mode, don't render if on first page and no more pages
  if (onlyNext && currentPage === 1 && !hasMore) {
    return null
  }

  const handlePageChange = (page: number) => {
    if (onlyNext) {
      // For onlyNext mode, allow navigation based on hasMore and current page
      if ((page === currentPage - 1 && currentPage > 1) || (page === currentPage + 1 && hasMore)) {
        onPageChange(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } else {
      // Original logic for full pagination
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        onPageChange(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const delta = 2 // Number of pages to show around current page
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else {
      if (totalPages > 1) {
        rangeWithDots.push(totalPages)
      }
    }

    return rangeWithDots
  }

  const pageNumbers = getPageNumbers()

  return (
    <nav className="flex items-center justify-center space-x-1 mt-8" aria-label="Pagination">
      {/* Previous Button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`
          flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md
          ${currentPage === 1
            ? 'text-muted-foreground cursor-not-allowed'
            : 'text-foreground hover:bg-accent hover:text-accent-foreground'
          }
        `}
        aria-label={locale === 'us' ? 'Previous page' : '上一页'}
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {locale === 'us' ? 'Previous' : '上一页'}
      </button>

      {/* Page Numbers - only show in full pagination mode */}
      {!onlyNext && (
        <div className="flex items-center space-x-1">
          {pageNumbers.map((pageNumber, index) => {
            if (pageNumber === '...') {
              return (
                <span key={`dots-${index}`} className="px-3 py-2 text-muted-foreground">
                  ...
                </span>
              )
            }

            const isCurrentPage = pageNumber === currentPage

            return (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber as number)}
                className={`
                  flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md min-w-[40px]
                  ${isCurrentPage
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  }
                `}
                aria-label={`${locale === 'us' ? 'Page' : '第'} ${pageNumber} ${locale === 'us' ? '' : '页'}`}
                aria-current={isCurrentPage ? 'page' : undefined}
              >
                {pageNumber}
              </button>
            )
          })}
        </div>
      )}

      {/* Next Button */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={onlyNext ? !hasMore : currentPage === totalPages}
        className={`
          flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md
          ${(onlyNext ? !hasMore : currentPage === totalPages)
            ? 'text-muted-foreground cursor-not-allowed'
            : 'text-foreground hover:bg-accent hover:text-accent-foreground'
          }
        `}
        aria-label={locale === 'us' ? 'Next page' : '下一页'}
      >
        {locale === 'us' ? 'Next' : '下一页'}
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  )
}