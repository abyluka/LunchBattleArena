import { useState } from "react";
import { Filter } from "@/App";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import ColorBadge from "@/components/ui/color-badge";

interface FilterSidebarProps {
  filters: Filter;
  updateFilters: (filters: Partial<Filter>) => void;
  categories: any[];
  colors: any[];
  sizes: any[];
}

export default function FilterSidebar({ filters, updateFilters, categories, colors, sizes }: FilterSidebarProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>(filters.priceRange);
  const [minPrice, setMinPrice] = useState<string>(filters.priceRange[0].toString());
  const [maxPrice, setMaxPrice] = useState<string>(filters.priceRange[1].toString());

  const handlePriceChange = (newValues: number[]) => {
    const newRange: [number, number] = [newValues[0], newValues[1]];
    setPriceRange(newRange);
    setMinPrice(newRange[0].toString());
    setMaxPrice(newRange[1].toString());
    updateFilters({ priceRange: newRange });
  };

  const handleMinPriceChange = (value: string) => {
    setMinPrice(value);
    const min = value === "" ? 0 : Number(value);
    if (!isNaN(min) && min >= 0 && min <= filters.priceRange[1]) {
      const newRange: [number, number] = [min, filters.priceRange[1]];
      setPriceRange(newRange);
      updateFilters({ priceRange: newRange });
    }
  };

  const handleMaxPriceChange = (value: string) => {
    setMaxPrice(value);
    const max = value === "" ? 500 : Number(value);
    if (!isNaN(max) && max >= filters.priceRange[0] && max <= 500) {
      const newRange: [number, number] = [filters.priceRange[0], max];
      setPriceRange(newRange);
      updateFilters({ priceRange: newRange });
    }
  };

  const handleCategoryChange = (categoryId: number, checked: boolean) => {
    const updatedCategories = checked
      ? [...filters.categories, categoryId]
      : filters.categories.filter(id => id !== categoryId);
    
    updateFilters({ categories: updatedCategories });
  };

  const handleSizeChange = (size: string, checked: boolean) => {
    const updatedSizes = checked
      ? [...filters.sizes, size]
      : filters.sizes.filter(s => s !== size);
    
    updateFilters({ sizes: updatedSizes });
  };

  const handleColorChange = (colorId: number) => {
    const updatedColors = filters.colors.includes(colorId)
      ? filters.colors.filter(id => id !== colorId)
      : [...filters.colors, colorId];
    
    updateFilters({ colors: updatedColors });
  };

  const handleResetFilters = () => {
    updateFilters({
      categories: [],
      colors: [],
      sizes: [],
      priceRange: [0, 500],
      search: ""
    });
    setPriceRange([0, 500]);
    setMinPrice("0");
    setMaxPrice("500");
  };

  return (
    <aside className="hidden lg:block w-64 flex-shrink-0">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Filters</h2>
          <button
            className="text-sm text-primary hover:underline"
            onClick={handleResetFilters}
          >
            Reset All
          </button>
        </div>
        
        {/* Price Range */}
        <div className="py-3 border-t border-gray-100">
          <h3 className="font-medium mb-3">Price Range</h3>
          <div className="space-y-2 pl-1">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}+</span>
            </div>
            <Slider
              defaultValue={[0, 500]}
              max={500}
              step={1}
              value={[priceRange[0], priceRange[1]]}
              onValueChange={handlePriceChange}
              className="w-full"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <input
              type="text"
              placeholder="Min"
              className="w-1/2 p-2 text-sm border border-gray-200 rounded"
              value={minPrice}
              onChange={(e) => handleMinPriceChange(e.target.value)}
            />
            <input
              type="text"
              placeholder="Max"
              className="w-1/2 p-2 text-sm border border-gray-200 rounded"
              value={maxPrice}
              onChange={(e) => handleMaxPriceChange(e.target.value)}
            />
          </div>
        </div>
        
        {/* Categories */}
        <div className="py-3 border-t border-gray-100">
          <h3 className="font-medium mb-3">Category</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={filters.categories.includes(category.id)}
                  onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                />
                <Label
                  htmlFor={`category-${category.id}`}
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Sizes */}
        <div className="py-3 border-t border-gray-100">
          <h3 className="font-medium mb-3">Size</h3>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size.id}
                onClick={() => handleSizeChange(size.name, !filters.sizes.includes(size.name))}
                className={`w-9 h-9 rounded-md border ${
                  filters.sizes.includes(size.name)
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
        <div className="py-3 border-t border-gray-100">
          <h3 className="font-medium mb-3">Color</h3>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <ColorBadge
                key={color.id}
                color={color}
                isSelected={filters.colors.includes(color.id)}
                onClick={() => handleColorChange(color.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
