import { Brand, InsertProduct } from "@shared/schema";
import { BrandApiAdapter } from "./index";

export class WooCommerceAdapter implements BrandApiAdapter {
  private brand: Brand;

  constructor(brand: Brand) {
    this.brand = brand;
  }

  async fetchProducts(): Promise<InsertProduct[]> {
    try {
      // WooCommerce API URL for products
      const apiUrl = `${this.brand.apiEndpoint}/wp-json/wc/v3/products`;
      
      // Make request to WooCommerce API
      const response = await fetch(apiUrl, {
        headers: {
          "Authorization": `Bearer ${this.brand.apiKey}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`WooCommerce API error: ${response.status} ${response.statusText}`);
      }

      const wooProducts = await response.json();

      // Transform WooCommerce products to our product format
      return wooProducts.map((product: any) => this.transformWooCommerceProduct(product));
    } catch (error) {
      console.error("Error fetching products from WooCommerce:", error);
      throw error;
    }
  }

  private transformWooCommerceProduct(wooProduct: any): InsertProduct {
    // Extract images
    const images = wooProduct.images?.map((img: any) => img.src) || [];
    
    // Extract attributes (size, color, etc)
    const attributes = wooProduct.attributes || [];
    
    // Extract sizes
    const sizeAttribute = attributes.find((attr: any) => 
      attr.name.toLowerCase() === 'size' || attr.name.toLowerCase() === 'sizes'
    );
    const sizes = sizeAttribute ? sizeAttribute.options || [] : [];
    
    // Extract colors
    const colorAttribute = attributes.find((attr: any) => 
      attr.name.toLowerCase() === 'color' || attr.name.toLowerCase() === 'colours'
    );
    const colorNames = colorAttribute ? colorAttribute.options || [] : [];
    
    // Price handling
    const price = parseFloat(wooProduct.price);
    const regularPrice = parseFloat(wooProduct.regular_price);
    const salePrice = wooProduct.sale_price ? parseFloat(wooProduct.sale_price) : null;
    
    // Determine discounted price
    const discountedPrice = salePrice && salePrice < regularPrice ? salePrice : null;

    return {
      name: wooProduct.name,
      description: wooProduct.description || null,
      price: price || regularPrice,
      discountedPrice: discountedPrice,
      brandId: this.brand.id,
      // This would need to be mapped to your actual category system
      categoryId: 1, // Default category, would need proper mapping
      images,
      rating: wooProduct.average_rating ? parseFloat(wooProduct.average_rating) : null,
      reviewCount: wooProduct.rating_count || null,
      inStock: wooProduct.in_stock,
      isNew: wooProduct.date_created 
        ? (new Date(wooProduct.date_created) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        : false,
      sizes,
      colors: colorNames,
      url: wooProduct.permalink,
      externalId: `woocommerce-${wooProduct.id}`,
      lastUpdated: new Date()
    };
  }
}