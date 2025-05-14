import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter } from "@/App";
import BrandNavigation from "@/components/ui/brand-navigation";
import FilterSidebar from "@/components/filters/filter-sidebar";
import MobileFilterDrawer from "@/components/filters/mobile-filter-drawer";
import ActiveFilters from "@/components/filters/active-filters";
import ProductGrid from "@/components/product/product-grid";
import Pagination from "@/components/ui/pagination";
import ProductDetailDialog from "@/components/product/product-detail-dialog";

interface HomeProps {
  filters: Filter;
  updateFilters: (filters: Partial<Filter>) => void;
  country?: string | null;
  isUK?: boolean;
}

export default function Home({ filters, updateFilters, country, isUK }: HomeProps) {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  
  const limit = 12;

  // Build query string from filters
  const buildQueryString = () => {
    const queryParams = [];
    
    if (filters.brands.length > 0) {
      queryParams.push(`brands=${filters.brands.join(',')}`);
    }
    
    if (filters.categories.length > 0) {
      queryParams.push(`categories=${filters.categories.join(',')}`);
    }
    
    if (filters.colors.length > 0) {
      queryParams.push(`colors=${filters.colors.join(',')}`);
    }
    
    if (filters.sizes.length > 0) {
      queryParams.push(`sizes=${filters.sizes.join(',')}`);
    }
    
    if (filters.priceRange[0] > 0) {
      queryParams.push(`priceMin=${filters.priceRange[0]}`);
    }
    
    if (filters.priceRange[1] < 500) {
      queryParams.push(`priceMax=${filters.priceRange[1]}`);
    }
    
    if (filters.search) {
      queryParams.push(`search=${encodeURIComponent(filters.search)}`);
    }
    
    queryParams.push(`page=${currentPage}`);
    queryParams.push(`limit=${limit}`);
    
    return queryParams.join('&');
  };

  // Fetch products with filters
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['/api/products', filters, currentPage],
    queryFn: async () => {
      const queryString = buildQueryString();
      const response = await fetch(`/api/products?${queryString}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      return response.json();
    }
  });

  // Fetch brands for filtering
  const { data: brands } = useQuery({
    queryKey: ['/api/brands'],
    queryFn: async () => {
      const response = await fetch('/api/brands');
      
      if (!response.ok) {
        throw new Error('Failed to fetch brands');
      }
      
      return response.json();
    }
  });

  // Fetch categories for filtering
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      return response.json();
    }
  });

  // Fetch colors for filtering
  const { data: colors } = useQuery({
    queryKey: ['/api/colors'],
    queryFn: async () => {
      const response = await fetch('/api/colors');
      
      if (!response.ok) {
        throw new Error('Failed to fetch colors');
      }
      
      return response.json();
    }
  });

  // Fetch sizes for filtering
  const { data: sizes } = useQuery({
    queryKey: ['/api/sizes'],
    queryFn: async () => {
      const response = await fetch('/api/sizes');
      
      if (!response.ok) {
        throw new Error('Failed to fetch sizes');
      }
      
      return response.json();
    }
  });

  const openMobileFilter = () => {
    setIsMobileFilterOpen(true);
  };

  const closeMobileFilter = () => {
    setIsMobileFilterOpen(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openProductDetail = (productId: number) => {
    setSelectedProductId(productId);
  };

  const closeProductDetail = () => {
    setSelectedProductId(null);
  };

  const calculateTotalPages = () => {
    if (!productsData) return 1;
    return Math.ceil(productsData.total / limit);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Brand navigation */}
      <BrandNavigation 
        brands={brands || []} 
        selectedBrands={filters.brands} 
        onSelectBrand={(brandId) => {
          const updatedBrands = filters.brands.includes(brandId)
            ? filters.brands.filter(id => id !== brandId)
            : [...filters.brands, brandId];
          
          updateFilters({ brands: updatedBrands });
          setCurrentPage(1); // Reset to first page when filters change
        }}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters sidebar (desktop) */}
        <FilterSidebar 
          filters={filters}
          updateFilters={(newFilters) => {
            updateFilters(newFilters);
            setCurrentPage(1); // Reset to first page when filters change
          }}
          categories={categories || []}
          colors={colors || []}
          sizes={sizes || []}
        />

        {/* Product listing */}
        <div className="flex-1">
          {/* Mobile filters and sort */}
          <div className="flex lg:hidden gap-2 mb-4">
            <button 
              onClick={openMobileFilter}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              <span>Filters</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="21" y1="10" x2="3" y2="10" />
                <line x1="21" y1="6" x2="3" y2="6" />
                <line x1="21" y1="14" x2="3" y2="14" />
                <line x1="21" y1="18" x2="3" y2="18" />
              </svg>
              <span>Sort</span>
            </button>
          </div>

          {/* Active filters */}
          <ActiveFilters 
            filters={filters} 
            updateFilters={updateFilters}
            categories={categories || []}
            colors={colors || []}
            sizes={sizes || []}
          />

          {/* Results count and sort */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-neutral-500 text-sm">
              Showing <span className="font-medium text-neutral-900">{productsData?.total || 0}</span> results
            </p>
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-sm">Sort by:</span>
              <select className="border-none text-sm font-medium focus:ring-0 p-0 pr-6">
                <option>Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Most Popular</option>
              </select>
            </div>
          </div>

          {/* Product grid */}
          <ProductGrid 
            products={productsData?.products || []} 
            isLoading={isLoading}
            onProductClick={openProductDetail}
          />

          {/* Pagination */}
          {productsData && productsData.total > limit && (
            <Pagination 
              currentPage={currentPage}
              totalPages={calculateTotalPages()}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <MobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={closeMobileFilter}
        filters={filters}
        updateFilters={(newFilters) => {
          updateFilters(newFilters);
          setCurrentPage(1); // Reset to first page when filters change
        }}
        categories={categories || []}
        colors={colors || []}
        sizes={sizes || []}
      />

      {/* Product detail dialog */}
      {selectedProductId && (
        <ProductDetailDialog
          productId={selectedProductId}
          isOpen={selectedProductId !== null}
          onClose={closeProductDetail}
        />
      )}
    </div>
  );
}
