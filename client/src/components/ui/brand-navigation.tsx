import { useRef } from "react";

interface BrandNavigationProps {
  brands: any[];
  selectedBrands: number[];
  onSelectBrand: (brandId: number) => void;
}

export default function BrandNavigation({ brands, selectedBrands, onSelectBrand }: BrandNavigationProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Map brand logos based on brand name
  const getBrandLogo = (brandName: string) => {
    // Return null as we removed icon imports
    return null;
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="mb-6 relative">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:block">
        <button 
          onClick={scrollLeft}
          className="bg-white shadow-md rounded-full p-2 text-neutral-500 hover:text-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      </div>
      
      <div 
        ref={scrollRef}
        className="overflow-x-auto no-scrollbar flex gap-2 pb-2 px-0 md:px-10"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <button 
          className={`px-4 py-2 ${
            selectedBrands.length === 0 
              ? 'border border-primary bg-primary text-white' 
              : 'border border-gray-200 hover:bg-gray-50'
          } rounded-full whitespace-nowrap font-medium flex items-center`}
          onClick={() => {
            if (selectedBrands.length > 0) {
              onSelectBrand(selectedBrands[0]); // Clear all selected brands
            }
          }}
        >
          All Brands
        </button>
        
        {brands.map((brand) => (
          <button 
            key={brand.id}
            className={`px-4 py-2 ${
              selectedBrands.includes(brand.id) 
                ? 'border border-primary bg-primary text-white' 
                : 'border border-gray-200 hover:bg-gray-50'
            } rounded-full whitespace-nowrap transition flex items-center`}
            onClick={() => onSelectBrand(brand.id)}
          >
            {getBrandLogo(brand.name)}
            {brand.name}
          </button>
        ))}
      </div>
      
      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:block">
        <button 
          onClick={scrollRight}
          className="bg-white shadow-md rounded-full p-2 text-neutral-500 hover:text-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
}
