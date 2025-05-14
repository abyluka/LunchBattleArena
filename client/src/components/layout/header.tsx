import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Filter } from "@/App";

interface HeaderProps {
  filters: Filter;
  updateFilters: (filters: Partial<Filter>) => void;
}

export default function Header({ filters, updateFilters }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState(filters.search);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchTerm });
    
    // Navigate to home page if on another page
    if (location !== '/') {
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <h1 className="text-xl font-semibold">Fashion Finder</h1>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <nav>
              <ul className="flex gap-6">
                <li><Link href="/" className="hover:text-primary transition">Women</Link></li>
                <li><Link href="/" className="hover:text-primary transition">Men</Link></li>
                <li><Link href="/" className="hover:text-primary transition">Kids</Link></li>
                <li><Link href="/" className="hover:text-primary transition">Accessories</Link></li>
              </ul>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              className="text-neutral-500 hover:text-primary transition md:hidden"
              onClick={toggleMobileMenu}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <button className="text-neutral-500 hover:text-primary transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            <button className="text-neutral-500 hover:text-primary transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            <button className="text-neutral-500 hover:text-primary transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Search bar */}
        <form onSubmit={handleSearch} className="pb-4 relative">
          <Input
            type="text"
            placeholder="Search for products, brands, and more..."
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>
      </div>
      
      {/* Mobile menu */}
      <div className={`md:hidden border-t border-gray-200 ${isMobileMenuOpen ? '' : 'hidden'}`}>
        <div className="container mx-auto px-4 py-3">
          <nav>
            <ul className="space-y-2">
              <li><Link href="/" className="block py-1 hover:text-primary transition">Women</Link></li>
              <li><Link href="/" className="block py-1 hover:text-primary transition">Men</Link></li>
              <li><Link href="/" className="block py-1 hover:text-primary transition">Kids</Link></li>
              <li><Link href="/" className="block py-1 hover:text-primary transition">Accessories</Link></li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
