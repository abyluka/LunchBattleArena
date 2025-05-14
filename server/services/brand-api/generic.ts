import { Brand, InsertProduct } from "@shared/schema";
import { BrandApiAdapter } from "./index";

export class GenericAdapter implements BrandApiAdapter {
  private brand: Brand;

  constructor(brand: Brand) {
    this.brand = brand;
  }

  async fetchProducts(): Promise<InsertProduct[]> {
    try {
      // Generic API URL for products - using the brand's apiEndpoint
      const apiUrl = this.brand.apiEndpoint;
      
      if (!apiUrl) {
        throw new Error(`No API endpoint configured for brand ${this.brand.name}`);
      }
      
      // Make request to the generic API
      const response = await fetch(apiUrl, {
        headers: {
          "Authorization": `Bearer ${this.brand.apiKey}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`API error for ${this.brand.name}: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // The structure of the response is brand-dependent
      // We try to handle various common structures
      let products = data;
      
      // Handle common response structures
      if (data.products) {
        products = data.products;
      } else if (data.data && Array.isArray(data.data)) {
        products = data.data;
      } else if (data.items) {
        products = data.items;
      } else if (data.results) {
        products = data.results;
      }
      
      if (!Array.isArray(products)) {
        throw new Error(`Unexpected API response format from ${this.brand.name}`);
      }

      // Transform products to our standard format
      return products.map((product: any) => this.transformGenericProduct(product));
    } catch (error) {
      console.error(`Error fetching products from ${this.brand.name}:`, error);
      throw error;
    }
  }

  private transformGenericProduct(product: any): InsertProduct {
    // Try to extract common fields from various API formats
    
    // Name field (try common variations)
    const name = product.name || product.title || product.product_name || '';
    
    // Description field (try common variations)
    const description = product.description || product.desc || product.full_description || product.body_html || null;
    
    // Price field (try common variations)
    let price = 0;
    if (product.price !== undefined) {
      price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    } else if (product.current_price !== undefined) {
      price = typeof product.current_price === 'string' ? parseFloat(product.current_price) : product.current_price;
    } else if (product.regular_price !== undefined) {
      price = typeof product.regular_price === 'string' ? parseFloat(product.regular_price) : product.regular_price;
    }
    
    // Sale price or discounted price
    let discountedPrice = null;
    if (product.sale_price !== undefined && product.sale_price) {
      discountedPrice = typeof product.sale_price === 'string' ? parseFloat(product.sale_price) : product.sale_price;
    } else if (product.discount_price !== undefined && product.discount_price) {
      discountedPrice = typeof product.discount_price === 'string' ? parseFloat(product.discount_price) : product.discount_price;
    } else if (product.compare_at_price !== undefined && product.compare_at_price) {
      // For Shopify-like APIs where compare_at_price is the original price and price is the sale price
      const comparePrice = typeof product.compare_at_price === 'string' ? parseFloat(product.compare_at_price) : product.compare_at_price;
      if (comparePrice > price) {
        discountedPrice = price;
        price = comparePrice;
      }
    }
    
    // Images
    let images: string[] = [];
    if (product.images && Array.isArray(product.images)) {
      if (typeof product.images[0] === 'string') {
        images = product.images;
      } else if (typeof product.images[0] === 'object') {
        // Handle Shopify-like image objects
        images = product.images.map((img: any) => img.src || img.url || img.source || '').filter(Boolean);
      }
    } else if (product.image) {
      // Single image
      if (typeof product.image === 'string') {
        images = [product.image];
      } else if (typeof product.image === 'object') {
        const imgUrl = product.image.src || product.image.url || product.image.source;
        if (imgUrl) {
          images = [imgUrl];
        }
      }
    }
    
    // Stock status
    let inStock = true; // Default to in stock if not specified
    if (product.in_stock !== undefined) {
      inStock = !!product.in_stock;
    } else if (product.available !== undefined) {
      inStock = !!product.available;
    } else if (product.stock_status !== undefined) {
      inStock = product.stock_status === 'instock' || product.stock_status === 'in_stock';
    }
    
    // Is product new?
    let isNew = false;
    if (product.is_new !== undefined) {
      isNew = !!product.is_new;
    } else if (product.created_at || product.date_created) {
      const createdDate = new Date(product.created_at || product.date_created);
      isNew = createdDate > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    }
    
    // Product URL
    const url = product.url || product.permalink || product.product_url || `${this.brand.website}/products/${product.handle || product.slug || ''}`;
    
    // ID for tracking
    const id = product.id || product.product_id;
    const externalId = `${this.brand.apiType || 'generic'}-${id}`;

    return {
      name,
      description,
      price,
      discountedPrice,
      brandId: this.brand.id,
      // This would need to be mapped to your actual category system
      categoryId: 1, // Default category, would need proper mapping
      images,
      rating: product.rating || product.average_rating || null,
      reviewCount: product.review_count || product.rating_count || null,
      inStock,
      isNew,
      colors: [], // Would need to extract from various formats
      sizes: [], // Would need to extract from various formats
      url,
      externalId,
      lastUpdated: new Date()
    };
  }
}