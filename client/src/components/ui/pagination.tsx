interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Don't render pagination if there's only one page
  if (totalPages <= 1) return null;

  // Generate an array of page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    
    // Always include first page
    pages.push(1);
    
    // Add current page and adjacent pages
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    
    // Always include last page if there are more than 1 page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    // Add ellipses where needed
    const result = [];
    let previous = null;
    
    for (const page of pages) {
      if (previous !== null && page - previous > 1) {
        result.push('ellipsis');
      }
      result.push(page);
      previous = page;
    }
    
    return result;
  };

  const pageNumbers = getPageNumbers();

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex justify-center mt-8">
      <nav className="flex items-center gap-1">
        {/* Previous button */}
        <button 
          className={`w-9 h-9 flex items-center justify-center rounded border ${
            currentPage === 1 
              ? 'border-gray-200 bg-white cursor-not-allowed text-gray-300' 
              : 'border-gray-200 bg-white hover:bg-gray-50 text-neutral-500'
          }`}
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        
        {/* Page numbers */}
        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <span key={`ellipsis-${index}`} className="w-9 h-9 flex items-center justify-center">
                ...
              </span>
            );
          }
          
          return (
            <button 
              key={`page-${page}`}
              className={`w-9 h-9 flex items-center justify-center rounded border ${
                currentPage === page 
                  ? 'border-primary bg-primary text-white' 
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
              onClick={() => onPageChange(page as number)}
            >
              {page}
            </button>
          );
        })}
        
        {/* Next button */}
        <button 
          className={`w-9 h-9 flex items-center justify-center rounded border ${
            currentPage === totalPages 
              ? 'border-gray-200 bg-white cursor-not-allowed text-gray-300' 
              : 'border-gray-200 bg-white hover:bg-gray-50 text-neutral-500'
          }`}
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </nav>
    </div>
  );
}
