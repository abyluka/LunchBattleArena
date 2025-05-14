import { Brand, InsertProduct } from "@shared/schema";

export class ShopifyAdapter {
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
      console.log(`Fetching products from Shopify for ${this.brand.name}...`);
      
      // Construct Shopify API URL with authentication
      const apiUrl = `${this.apiEndpoint}/admin/api/2023-07/products.json`;
      
      // Make API request to Shopify
      const response = await fetch(apiUrl, {
        headers: {
          'X-Shopify-Access-Token': this.apiKey,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      const shopifyProducts = data.products || [];
      
      // Transform Shopify products to our product format
      return shopifyProducts.map((shopifyProduct: any) => 
        this.transformShopifyProduct(shopifyProduct)
      );
    } catch (error) {
      console.error(`Error fetching products from Shopify for ${this.brand.name}:`, error);
      throw error;
    }
  }

  private transformShopifyProduct(shopifyProduct: any): InsertProduct {
    // Get the first image URL or null if no images
    const imageUrl = shopifyProduct.images && shopifyProduct.images.length > 0 
      ? shopifyProduct.images[0].src 
      : null;
    
    // Get all image URLs
    const images = (shopifyProduct.images || []).map((img: any) => img.src);
    
    // Get the price from variants (use first variant as default)
    const variant = shopifyProduct.variants && shopifyProduct.variants.length > 0
      ? shopifyProduct.variants[0]
      : null;
    
    const price = variant ? parseFloat(variant.price) : 0;
    const compareAtPrice = variant && variant.compare_at_price 
      ? parseFloat(variant.compare_at_price) 
      : null;
    
    // Get available sizes from variants
    const sizes = (shopifyProduct.variants || [])
      .map((v: any) => v.title)
      .filter((size: string) => size !== 'Default Title');
    
    // Product details
    const product: InsertProduct = {
      name: shopifyProduct.title,
      description: shopifyProduct.body_html || null,
      price,
      discountedPrice: compareAtPrice && compareAtPrice > price ? compareAtPrice : null,
      brandId: this.brand.id,
      categoryId: 1, // Default category, would need to map Shopify collections to categories
      colors: [], // Would need color mapping from Shopify tags or options
      sizes,
      images,
      url: `${this.brand.website}/products/${shopifyProduct.handle}`,
      rating: null,
      numberOfReviews: 0,
      inStock: shopifyProduct.published_at ? true : false,
      availableInUK: true, // Assume all Shopify products are available in the UK
      isFeatured: false,
      tags: shopifyProduct.tags ? shopifyProduct.tags.split(', ') : [],
      priceHistory: [
        { date: new Date().toISOString().split('T')[0], price }
      ]
    };
    
    return product;
  }
}