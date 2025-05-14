import { Filter } from "@/App";

interface ActiveFiltersProps {
  filters: Filter;
  updateFilters: (filters: Partial<Filter>) => void;
  categories: any[];
  colors: any[];
  sizes: any[];
}

export default function ActiveFilters({ filters, updateFilters, categories, colors, sizes }: ActiveFiltersProps) {
  // If no active filters, don't render anything
  if (
    filters.categories.length === 0 &&
    filters.colors.length === 0 &&
    filters.sizes.length === 0 &&
    filters.priceRange[0] === 0 &&
    filters.priceRange[1] === 500 &&
    !filters.search
  ) {
    return null;
  }

  const handleRemoveCategory = (categoryId: number) => {
    updateFilters({
      categories: filters.categories.filter((id) => id !== categoryId)
    });
  };

  const handleRemoveColor = (colorId: number) => {
    updateFilters({
      colors: filters.colors.filter((id) => id !== colorId)
    });
  };

  const handleRemoveSize = (size: string) => {
    updateFilters({
      sizes: filters.sizes.filter((s) => s !== size)
    });
  };

  const handleRemovePriceRange = () => {
    updateFilters({
      priceRange: [0, 500]
    });
  };

  const handleRemoveSearch = () => {
    updateFilters({
      search: ""
    });
  };

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {/* Categories */}
      {filters.categories.map((categoryId) => {
        const category = categories.find((c) => c.id === categoryId);
        if (!category) return null;
        
        return (
          <span key={`cat-${categoryId}`} className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
            Category: {category.name}
            <button 
              className="ml-1 text-primary hover:text-primary/80"
              onClick={() => handleRemoveCategory(categoryId)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </span>
        );
      })}

      {/* Colors */}
      {filters.colors.map((colorId) => {
        const color = colors.find((c) => c.id === colorId);
        if (!color) return null;
        
        return (
          <span key={`color-${colorId}`} className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
            Color: {color.name}
            <button 
              className="ml-1 text-primary hover:text-primary/80"
              onClick={() => handleRemoveColor(colorId)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </span>
        );
      })}

      {/* Sizes */}
      {filters.sizes.map((size) => (
        <span key={`size-${size}`} className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
          Size: {size}
          <button 
            className="ml-1 text-primary hover:text-primary/80"
            onClick={() => handleRemoveSize(size)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </span>
      ))}

      {/* Price Range - only if not default */}
      {(filters.priceRange[0] > 0 || filters.priceRange[1] < 500) && (
        <span className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
          Price: ${filters.priceRange[0]} - ${filters.priceRange[1]}
          <button 
            className="ml-1 text-primary hover:text-primary/80"
            onClick={handleRemovePriceRange}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </span>
      )}

      {/* Search Term */}
      {filters.search && (
        <span className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
          Search: {filters.search}
          <button 
            className="ml-1 text-primary hover:text-primary/80"
            onClick={handleRemoveSearch}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </span>
      )}
    </div>
  );
}
