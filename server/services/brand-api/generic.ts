import { Brand, InsertProduct } from "@shared/schema";

export class GenericAdapter {
  private brand: Brand;
  private apiKey: string;
  private apiEndpoint: string;

  constructor(brand: Brand) {
    this.brand = brand;
    
    if (!brand.apiKey || !brand.apiEndpoint) {
      throw new Error(`Brand ${brand.name} is missing API configuration`);
    }
    
    this.apiKey = brand.apiKey;
    this.apiEndpoint = brand.apiEndpoint;
  }

  async fetchProducts(): Promise<InsertProduct[]> {
    try {
      console.log(`Fetching products from generic API for ${this.brand.name}...`);
      
      // Make API request
      const response = await fetch(this.apiEndpoint, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // The response format will vary depending on the API
      // We'll assume a simple array of products
      const products = Array.isArray(data) ? data : data.products || [];
      
      // Transform products to our format
      return products.map((product: any) => 
        this.transformGenericProduct(product)
      );
    } catch (error) {
      console.error(`Error fetching products from API for ${this.brand.name}:`, error);
      throw error;
    }
  }

  private transformGenericProduct(product: any): InsertProduct {
    // Generic transformation logic that attempts to map common field names
    
    // Handle different image formats
    let images: string[] = [];
    if (Array.isArray(product.images)) {
      images = product.images.map((img: any) => 
        typeof img === 'string' ? img : img.url || img.src || ''
      ).filter(Boolean);
    } else if (product.image) {
      const image = typeof product.image === 'string' ? product.image : product.image.url || product.image.src || '';
      if (image) {
        images.push(image);
      }
    }
    
    // Handle price field variations
    const price = parseFloat(product.price || product.amount || product.cost || '0');
    
    // Handle discounted price variations
    let discountedPrice = null;
    if (product.regular_price && parseFloat(product.regular_price) > price) {
      discountedPrice = parseFloat(product.regular_price);
    } else if (product.compare_at_price && parseFloat(product.compare_at_price) > price) {
      discountedPrice = parseFloat(product.compare_at_price);
    } else if (product.original_price && parseFloat(product.original_price) > price) {
      discountedPrice = parseFloat(product.original_price);
    }
    
    // Handle different size formats
    let sizes: string[] = [];
    if (product.sizes) {
      sizes = Array.isArray(product.sizes) ? product.sizes : [product.sizes];
    } else if (product.variants) {
      // Extract sizes from variants if available
      const sizeSet = new Set<string>();
      product.variants.forEach((variant: any) => {
        if (variant.size) {
          sizeSet.add(variant.size);
        } else if (variant.title && !variant.title.includes('Default')) {
          sizeSet.add(variant.title);
        }
      });
      sizes = Array.from(sizeSet);
    }
    
    // Determine if in stock
    const inStock = product.in_stock !== undefined ? product.in_stock : 
                   product.available !== undefined ? product.available :
                   product.inventory_quantity > 0;
    
    // Convert to our product format
    return {
      name: product.name || product.title || '',
      description: product.description || product.body_html || null,
      price,
      discountedPrice,
      brandId: this.brand.id,
      categoryId: 1, // Default category, would need mapping
      colors: [], // Would need color mapping
      sizes,
      images,
      url: product.url || product.permalink || `${this.brand.website}/products/${product.handle || product.slug || product.id}`,
      rating: product.rating ? parseFloat(product.rating) : null,
      numberOfReviews: product.review_count || product.reviews_count || 0,
      inStock,
      availableInUK: true, // Assume all products are available in the UK
      isFeatured: !!product.featured,
      tags: product.tags ? (Array.isArray(product.tags) ? product.tags : product.tags.split(',').map((t: string) => t.trim())) : [],
      priceHistory: [
        { date: new Date().toISOString().split('T')[0], price }
      ]
    };
  }
}