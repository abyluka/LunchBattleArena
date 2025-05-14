import { useState, useEffect, useRef } from "react";
import { Filter } from "@/App";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import ColorBadge from "@/components/ui/color-badge";

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: Filter;
  updateFilters: (filters: Partial<Filter>) => void;
  categories: any[];
  colors: any[];
  sizes: any[];
}

export default function MobileFilterDrawer({
  isOpen,
  onClose,
  filters,
  updateFilters,
  categories,
  colors,
  sizes
}: MobileFilterDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  
  // Local state for drawer-specific filters that will only be applied when user clicks "Apply Filters"
  const [localFilters, setLocalFilters] = useState<Filter>({ ...filters });
  
  // Update local filters when main filters change
  useEffect(() => {
    if (isOpen) {
      setLocalFilters({ ...filters });
    }
  }, [isOpen, filters]);
  
  const handlePriceChange = (newValues: number[]) => {
    const newRange: [number, number] = [newValues[0], newValues[1]];
    setLocalFilters(prev => ({ ...prev, priceRange: newRange }));
  };
  
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const min = value === "" ? 0 : Number(value);
    if (!isNaN(min) && min >= 0 && min <= localFilters.priceRange[1]) {
      setLocalFilters(prev => ({
        ...prev,
        priceRange: [min, prev.priceRange[1]]
      }));
    }
  };
  
  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const max = value === "" ? 500 : Number(value);
    if (!isNaN(max) && max >= localFilters.priceRange[0] && max <= 500) {
      setLocalFilters(prev => ({
        ...prev,
        priceRange: [prev.priceRange[0], max]
      }));
    }
  };
  
  const handleCategoryChange = (categoryId: number, checked: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      categories: checked
        ? [...prev.categories, categoryId]
        : prev.categories.filter(id => id !== categoryId)
    }));
  };
  
  const handleSizeChange = (size: string, checked: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      sizes: checked
        ? [...prev.sizes, size]
        : prev.sizes.filter(s => s !== size)
    }));
  };
  
  const handleColorChange = (colorId: number) => {
    setLocalFilters(prev => ({
      ...prev,
      colors: prev.colors.includes(colorId)
        ? prev.colors.filter(id => id !== colorId)
        : [...prev.colors, colorId]
    }));
  };
  
  const handleResetFilters = () => {
    setLocalFilters({
      brands: [],
      categories: [],
      colors: [],
      sizes: [],
      priceRange: [0, 500],
      search: ""
    });
  };
  
  const handleApplyFilters = () => {
    updateFilters(localFilters);
    onClose();
  };
  
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);
  
  // Prevent scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div
        ref={drawerRef}
        className="absolute right-0 top-0 h-full w-80 max-w-full bg-white shadow-xl flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="font-semibold text-lg">Filters</h2>
          <button
            className="text-neutral-500 hover:text-neutral-900"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {/* Price Range */}
          <div className="py-3 border-b border-gray-100">
            <h3 className="font-medium mb-3">Price Range</h3>
            <div className="space-y-2 pl-1">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>${localFilters.priceRange[0]}</span>
                <span>${localFilters.priceRange[1]}+</span>
              </div>
              <Slider
                max={500}
                step={1}
                value={[localFilters.priceRange[0], localFilters.priceRange[1]]}
                onValueChange={handlePriceChange}
                className="w-full"
              />
            </div>
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                placeholder="Min"
                className="w-1/2 p-2 text-sm border border-gray-200 rounded"
                value={localFilters.priceRange[0]}
                onChange={handleMinPriceChange}
              />
              <input
                type="text"
                placeholder="Max"
                className="w-1/2 p-2 text-sm border border-gray-200 rounded"
                value={localFilters.priceRange[1]}
                onChange={handleMaxPriceChange}
              />
            </div>
          </div>
          
          {/* Categories */}
          <div className="py-3 border-b border-gray-100">
            <h3 className="font-medium mb-3">Category</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`mobile-category-${category.id}`}
                    checked={localFilters.categories.includes(category.id)}
                    onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                  />
                  <Label
                    htmlFor={`mobile-category-${category.id}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Sizes */}
          <div className="py-3 border-b border-gray-100">
            <h3 className="font-medium mb-3">Size</h3>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => handleSizeChange(size.name, !localFilters.sizes.includes(size.name))}
                  className={`w-9 h-9 rounded-md border ${
                    localFilters.sizes.includes(size.name)
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-primary hover:bg-primary/5"
                  } flex items-center justify-center text-sm transition`}
                >
                  {size.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Colors */}
          <div className="py-3 border-b border-gray-100">
            <h3 className="font-medium mb-3">Color</h3>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <ColorBadge
                  key={color.id}
                  color={color}
                  isSelected={localFilters.colors.includes(color.id)}
                  onClick={() => handleColorChange(color.id)}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleResetFilters}
            >
              Reset
            </Button>
            <Button
              onClick={handleApplyFilters}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
