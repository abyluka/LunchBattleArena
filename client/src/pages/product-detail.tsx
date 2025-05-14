import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import ColorBadge from "@/components/ui/color-badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetail() {
  const [_, params] = useRoute("/product/:id");
  const productId = params?.id ? parseInt(params.id) : null;
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<number | null>(null);

  const { data: product, isLoading, error } = useQuery({
    queryKey: [`/api/products/${productId}`],
    queryFn: async () => {
      if (!productId) return null;
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch product details");
      }
      return response.json();
    },
    enabled: !!productId
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Skeleton className="w-full aspect-square rounded-lg" />
            <div className="flex gap-2 mt-4">
              <Skeleton className="w-20 h-20 rounded-md" />
              <Skeleton className="w-20 h-20 rounded-md" />
              <Skeleton className="w-20 h-20 rounded-md" />
            </div>
          </div>
          <div>
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-24 w-full mb-6" />
            <Skeleton className="h-10 w-32 mb-4" />
            <Skeleton className="h-6 w-full mb-4" />
            <div className="flex gap-2 mb-6">
              <Skeleton className="w-10 h-10 rounded-md" />
              <Skeleton className="w-10 h-10 rounded-md" />
              <Skeleton className="w-10 h-10 rounded-md" />
              <Skeleton className="w-10 h-10 rounded-md" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="text-neutral-600 mb-6">Sorry, we couldn't find the product you're looking for.</p>
        <Button asChild>
          <a href="/">Return to Home</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <div className="bg-white rounded-lg overflow-hidden border border-gray-100">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="w-full h-auto object-cover aspect-square"
            />
          </div>
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {product.images.map((image: string, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`w-20 h-20 rounded-md overflow-hidden border-2 flex-shrink-0 ${
                  selectedImage === index ? "border-primary" : "border-gray-200"
                }`}
              >
                <img
                  src={image}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div>
          {/* Brand */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-primary font-medium">{product.brand?.name}</span>
            <div className="flex items-center gap-1">
              <div className="flex items-center text-yellow-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-sm text-neutral-500">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>

          {/* Product Description */}
          <p className="text-neutral-600 mb-4">{product.description}</p>

          {/* Price */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">${product.discountedPrice || product.price}</span>
              {product.discountedPrice && (
                <span className="text-sm text-neutral-500 line-through">${product.price}</span>
              )}
              <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded ml-auto">
                {product.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>
          </div>

          {/* Category */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600">Category:</span>
              <span className="text-sm font-medium">{product.category?.name}</span>
            </div>
          </div>

          {/* Size Selection */}
          <div className="mb-4">
            <h3 className="font-medium mb-2">Size</h3>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size: any) => (
                <button
                  key={size.id}
                  onClick={() => setSelectedSize(size.name)}
                  className={`w-10 h-10 rounded-md border ${
                    selectedSize === size.name
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-primary hover:bg-primary/5"
                  } flex items-center justify-center transition`}
                >
                  {size.name}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">Color</h3>
            <div className="flex gap-3">
              {product.colors.map((color: any) => (
                <ColorBadge
                  key={color.id}
                  color={color}
                  isSelected={selectedColor === color.id}
                  onClick={() => setSelectedColor(color.id)}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <Button variant="outline" className="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span>Add to Wishlist</span>
            </Button>
            <Button asChild className="flex items-center justify-center gap-2">
              <a href={product.url} target="_blank" rel="noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <span>Shop at {product.brand?.name}</span>
              </a>
            </Button>
          </div>

          {/* Additional Info */}
          <Separator className="my-6" />
          <div className="text-sm text-neutral-500 space-y-2">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              <span>Free shipping available at retailer</span>
            </div>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 4v6h-6M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              <span>Check retailer for return policy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
