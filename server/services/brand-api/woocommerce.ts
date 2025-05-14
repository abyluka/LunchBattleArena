import { Brand, InsertProduct } from "@shared/schema";

export class WooCommerceAdapter {
  private brand: Brand;
  private consumerKey: string;
  private consumerSecret: string;
  private apiEndpoint: string;

  constructor(brand: Brand) {
    this.brand = brand;
    
    if (!brand.apiKey || !brand.apiEndpoint) {
      throw new Error(`Brand ${brand.name} is missing API configuration`);
    }
    
    // WooCommerce uses consumer key and secret for authentication
    // We'll store them as JSON in the apiKey field: {"consumerKey": "...", "consumerSecret": "..."}
    try {
      const apiCredentials = JSON.parse(brand.apiKey);
      this.consumerKey = apiCredentials.consumerKey;
      this.consumerSecret = apiCredentials.consumerSecret;
    } catch (error) {
      throw new Error(`Invalid API credentials format for ${brand.name}`);
    }
    
    this.apiEndpoint = brand.apiEndpoint;
  }

  async fetchProducts(): Promise<InsertProduct[]> {
    try {
      console.log(`Fetching products from WooCommerce for ${this.brand.name}...`);
      
      // Construct WooCommerce API URL with authentication
      const apiUrl = `${this.apiEndpoint}/wp-json/wc/v3/products`;
      
      // Create URL with Basic auth credentials in the query string
      const url = new URL(apiUrl);
      url.searchParams.append('consumer_key', this.consumerKey);
      url.searchParams.append('consumer_secret', this.consumerSecret);
      
      // Make API request to WooCommerce
      const response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`WooCommerce API error: ${response.status} ${response.statusText}`);
      }
      
      const wooProducts = await response.json();
      
      // Transform WooCommerce products to our product format
      return wooProducts.map((wooProduct: any) => 
        this.transformWooCommerceProduct(wooProduct)
      );
    } catch (error) {
      console.error(`Error fetching products from WooCommerce for ${this.brand.name}:`, error);
      throw error;
    }
  }

  private transformWooCommerceProduct(wooProduct: any): InsertProduct {
    // Get all image URLs
    const images = (wooProduct.images || []).map((img: any) => img.src);
    
    // Get the price
    const price = parseFloat(wooProduct.price);
    const regularPrice = parseFloat(wooProduct.regular_price);
    
    // Get discounted price if there is one
    const discountedPrice = regularPrice > price ? regularPrice : null;
    
    // Get available attributes like sizes and colors
    const attributes = wooProduct.attributes || [];
    
    // Find size attribute
    const sizeAttribute = attributes.find((attr: any) => 
      attr.name.toLowerCase() === 'size' || attr.name.toLowerCase() === 'sizes'
    );
    
    // Find color attribute
    const colorAttribute = attributes.find((attr: any) => 
      attr.name.toLowerCase() === 'color' || attr.name.toLowerCase() === 'colours' || attr.name.toLowerCase() === 'colors'
    );
    
    // Extract sizes
    const sizes = sizeAttribute ? sizeAttribute.options : [];
    
    // Extract colors (we would need to map these to our color IDs)
    const colorNames = colorAttribute ? colorAttribute.options : [];
    
    // Product details
    const product: InsertProduct = {
      name: wooProduct.name,
      description: wooProduct.description || null,
      price,
      discountedPrice,
      brandId: this.brand.id,
      categoryId: 1, // Default category, would need to map WooCommerce categories to our categories
      colors: [], // Would need color mapping from color names to our color IDs
      sizes,
      images,
      url: wooProduct.permalink,
      rating: wooProduct.average_rating ? parseFloat(wooProduct.average_rating) : null,
      numberOfReviews: wooProduct.rating_count || 0,
      inStock: wooProduct.in_stock,
      availableInUK: true, // Assume all WooCommerce products are available in the UK
      isFeatured: wooProduct.featured,
      tags: (wooProduct.tags || []).map((tag: any) => tag.name),
      priceHistory: [
        { date: new Date().toISOString().split('T')[0], price }
      ]
    };
    
    return product;
  }
}