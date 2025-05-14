import { Brand, InsertProduct } from "@shared/schema";
import { BrandApiAdapter } from "./index";

export class ShopifyAdapter implements BrandApiAdapter {
  private brand: Brand;

  constructor(brand: Brand) {
    this.brand = brand;
  }

  async fetchProducts(): Promise<InsertProduct[]> {
    try {
      // Shopify API URL for products
      const apiUrl = `${this.brand.apiEndpoint}/admin/api/2023-07/products.json`;
      
      // Make request to Shopify API
      const response = await fetch(apiUrl, {
        headers: {
          "X-Shopify-Access-Token": this.brand.apiKey || "",
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const shopifyProducts = data.products || [];

      // Transform Shopify products to our product format
      return shopifyProducts.map((product: any) => this.transformShopifyProduct(product));
    } catch (error) {
      console.error("Error fetching products from Shopify:", error);
      throw error;
    }
  }

  private transformShopifyProduct(shopifyProduct: any): InsertProduct {
    // Extract the first image URL or use a placeholder
    const images = shopifyProduct.images?.map((img: any) => img.src) || [];
    
    // Extract variants for colors and sizes
    const variants = shopifyProduct.variants || [];
    const sizes = Array.from(new Set(variants.map((v: any) => v.option2 || v.title).filter(Boolean)));
    
    // Extract price
    const price = variants.length > 0 
      ? parseFloat(variants[0].price) 
      : 0;
    
    // Extract discounted price if available (from compare_at_price)
    const discountedPrice = variants.length > 0 && variants[0].compare_at_price
      ? parseFloat(variants[0].compare_at_price) > price 
        ? price 
        : null
      : null;

    return {
      name: shopifyProduct.title,
      description: shopifyProduct.body_html || null,
      price,
      discountedPrice,
      brandId: this.brand.id,
      // This would need to be mapped to your actual category system
      categoryId: 1, // Default category, would need proper mapping
      images,
      rating: null,
      reviewCount: null,
      inStock: shopifyProduct.variants.some((v: any) => v.inventory_quantity > 0),
      isNew: new Date(shopifyProduct.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      colors: [], // Would need to extract color info from variants
      sizes: sizes,
      url: `${this.brand.website}/products/${shopifyProduct.handle}`,
      externalId: `shopify-${shopifyProduct.id}`,
      lastUpdated: new Date()
    };
  }
}