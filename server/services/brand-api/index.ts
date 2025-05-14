import { Brand, InsertProduct } from "@shared/schema";
import { storage } from "../../storage";
import { ShopifyAdapter } from "./shopify";
import { WooCommerceAdapter } from "./woocommerce";
import { GenericAdapter } from "./generic";

// Base adapter interface
export interface BrandApiAdapter {
  fetchProducts(): Promise<InsertProduct[]>;
}

// Factory to create appropriate API adapter
export function getBrandApiAdapter(brand: Brand): BrandApiAdapter | null {
  if (!brand.apiEndpoint || !brand.apiKey || !brand.apiType) {
    console.warn(`Brand ${brand.name} does not have valid API configuration`);
    return null;
  }

  switch (brand.apiType.toLowerCase()) {
    case 'shopify':
      return new ShopifyAdapter(brand);
    case 'woocommerce':
      return new WooCommerceAdapter(brand);
    default:
      return new GenericAdapter(brand);
  }
}

// Main service function to sync products from a brand's API
export async function syncBrandProducts(brandId: number): Promise<{
  added: number;
  updated: number;
  errors: string[];
}> {
  const brand = await storage.getBrandById(brandId);
  if (!brand) {
    throw new Error(`Brand with ID ${brandId} not found`);
  }

  // Create sync log entry
  const syncLog = await storage.logApiSync(brandId);
  const errors: string[] = [];
  let added = 0;
  let updated = 0;

  try {
    const adapter = getBrandApiAdapter(brand);
    if (!adapter) {
      throw new Error(`Could not create API adapter for brand ${brand.name}`);
    }

    // Fetch products from the brand's API
    const products = await adapter.fetchProducts();

    // Process each product
    for (const product of products) {
      try {
        // Check if product already exists by externalId
        const existingProducts = await storage.getProducts({
          brandIds: [brandId],
          search: product.externalId as string
        });

        if (existingProducts.total === 0) {
          // Product doesn't exist, create it
          await storage.createProduct(product);
          added++;
        } else {
          // Product exists, update it
          const existingProduct = existingProducts.products[0];
          await storage.updateProduct(existingProduct.id, {
            ...product,
            // Store historical price data
            priceHistory: updatePriceHistory(existingProduct.priceHistory, product.price)
          });
          updated++;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push(`Error processing product: ${errorMessage}`);
      }
    }

    // Update sync log
    await storage.updateApiSyncLog(syncLog.id, {
      completedAt: new Date(),
      status: 'success',
      productsAdded: added,
      productsUpdated: updated,
      error: errors.length > 0 ? errors.join('\n') : null
    });

    return { added, updated, errors };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Update sync log with error
    await storage.updateApiSyncLog(syncLog.id, {
      completedAt: new Date(),
      status: 'failed',
      productsAdded: added,
      productsUpdated: updated,
      error: errorMessage
    });

    throw error;
  }
}

// Helper function to update price history
function updatePriceHistory(
  existingHistory: any | null | undefined,
  currentPrice: number
): any {
  const now = new Date().toISOString();
  const history = existingHistory ? [...existingHistory] : [];
  
  // Add current price to history
  history.push({
    date: now,
    price: currentPrice
  });
  
  // Keep only the last 30 entries to avoid excessive storage
  return history.slice(-30);
}