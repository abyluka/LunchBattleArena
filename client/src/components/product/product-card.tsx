import { useState } from "react";
import { Link } from "wouter";

interface ProductCardProps {
  product: any;
  onClick: (productId: number) => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
  
  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick(product.id);
  };

  return (
    <article 
      className="bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={`/product/${product.id}`} className="block relative">
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-full h-72 object-cover object-center"
          />
          {product.isNew && (
            <span className="absolute top-2 right-2 bg-white rounded-full px-2 py-0.5 text-xs font-medium text-neutral-900">
              New
            </span>
          )}
          {product.discountedPrice && (
            <span className="absolute top-2 right-2 bg-secondary rounded-full px-2 py-0.5 text-xs font-medium text-white">
              -{Math.round(((product.price - product.discountedPrice) / product.price) * 100)}%
            </span>
          )}
          <div className={`absolute inset-0 bg-black bg-opacity-20 transition flex items-center justify-center ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <button 
              className="bg-white text-neutral-900 rounded-full w-10 h-10 flex items-center justify-center hover:bg-primary hover:text-white transition"
              onClick={handleQuickView}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
      </Link>
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <div>
            <h3 className="font-medium">{product.name}</h3>
            <p className="text-sm text-neutral-500">{product.brand?.name}</p>
          </div>
          <button className="text-neutral-400 hover:text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
        <div className="flex justify-between mt-2">
          <div className="flex items-center gap-2">
            <p className="font-bold">${product.discountedPrice || product.price}</p>
            {product.discountedPrice && (
              <p className="text-sm text-neutral-500 line-through">${product.price}</p>
            )}
          </div>
          <div className="flex items-center gap-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-medium">{product.rating}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
