import { Brand, InsertProduct } from "@shared/schema";
import { storage } from "../../storage";
import { ShopifyAdapter } from "./shopify";
import { WooCommerceAdapter } from "./woocommerce";
import { GenericAdapter } from "./generic";

// Interface for all API adapters
export interface BrandApiAdapter {
  fetchProducts(): Promise<InsertProduct[]>;
}

// Factory function to create the appropriate API adapter based on brand configuration
export function getBrandApiAdapter(brand: Brand): BrandApiAdapter | null {
  if (!brand.apiKey || !brand.apiEndpoint || !brand.apiType) {
    console.log(`Brand ${brand.name} is missing API configuration`);
    return null;
  }
  
  try {
    switch (brand.apiType.toLowerCase()) {
      case 'shopify':
        return new ShopifyAdapter(brand);
      case 'woocommerce':
        return new WooCommerceAdapter(brand);
      case 'generic':
      default:
        return new GenericAdapter(brand);
    }
  } catch (error) {
    console.error(`Error creating API adapter for brand ${brand.name}:`, error);
    return null;
  }
}

// Main function to sync products for a brand
export async function syncBrandProducts(brandId: number): Promise<{
  success: boolean;
  productsAdded: number;
  productsUpdated: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let productsAdded = 0;
  let productsUpdated = 0;
  
  try {
    // Get the brand
    const brand = await storage.getBrandById(brandId);
    
    if (!brand) {
      throw new Error(`Brand with ID ${brandId} not found`);
    }
    
    // Log the sync start
    const syncLog = await storage.logApiSync(brandId);
    
    try {
      // Get the appropriate adapter
      const adapter = getBrandApiAdapter(brand);
      
      if (!adapter) {
        throw new Error(`Could not create API adapter for brand ${brand.name}`);
      }
      
      // Fetch products from the brand API
      const products = await adapter.fetchProducts();
      
      console.log(`Fetched ${products.length} products from ${brand.name}`);
      
      // For each product, we need to either create it or update it
      for (const product of products) {
        try {
          // Try to find an existing product with the same URL
          const existingProducts = await storage.getProducts({ 
            brandIds: [brandId],
            search: product.url
          });
          
          const existingProduct = existingProducts.products.find(p => p.url === product.url);
          
          if (existingProduct) {
            // Update existing product
            await updatePriceHistory(existingProduct, product.price);
            
            await storage.updateProduct(existingProduct.id, {
              ...product,
              priceHistory: existingProduct.priceHistory
            });
            
            productsUpdated++;
          } else {
            // Create new product
            await storage.createProduct(product);
            productsAdded++;
          }
        } catch (productError: any) {
          errors.push(`Error processing product ${product.name}: ${productError.message}`);
        }
      }
      
      // Update sync log with success
      await storage.updateApiSyncLog(syncLog.id, {
        status: 'completed',
        completedAt: new Date(),
        productsAdded,
        productsUpdated,
        error: null
      });
      
      return {
        success: true,
        productsAdded,
        productsUpdated,
        errors
      };
    } catch (error: any) {
      // Update sync log with error
      await storage.updateApiSyncLog(syncLog.id, {
        status: 'failed',
        completedAt: new Date(),
        error: error.message
      });
      
      throw error;
    }
  } catch (error: any) {
    const errorMessage = `Failed to sync products for brand ${brandId}: ${error.message}`;
    errors.push(errorMessage);
    
    return {
      success: false,
      productsAdded,
      productsUpdated,
      errors
    };
  }
}

// Helper function to update price history
function updatePriceHistory(
  existingProduct: any, 
  currentPrice: number
): void {
  const priceHistory = existingProduct.priceHistory || [];
  const today = new Date().toISOString().split('T')[0];
  
  // Check if we already have a price for today
  const existingToday = priceHistory.find((entry: any) => entry.date === today);
  
  if (existingToday) {
    // Update today's price if it's different
    if (existingToday.price !== currentPrice) {
      existingToday.price = currentPrice;
    }
  } else {
    // Add today's price to history
    priceHistory.push({
      date: today,
      price: currentPrice
    });
  }
  
  // Sort by date (oldest first)
  priceHistory.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Limit history to last 90 days
  const maxHistoryDays = 90;
  if (priceHistory.length > maxHistoryDays) {
    priceHistory.splice(0, priceHistory.length - maxHistoryDays);
  }
  
  existingProduct.priceHistory = priceHistory;
}