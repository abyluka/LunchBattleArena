import { 
  InsertWishlist, 
  InsertWishlistItem, 
  Wishlist, 
  WishlistItem, 
  Product 
} from "@shared/schema";
import { storage } from "../../storage";

// Service for managing user wishlists
export class WishlistService {
  // Create a default wishlist for a new user
  async createDefaultWishlist(userId: string): Promise<Wishlist> {
    const defaultWishlist: InsertWishlist = {
      userId,
      name: "My Favorites",
      isDefault: true
    };
    
    return await storage.createWishlist(defaultWishlist);
  }
  
  // Get or create a default wishlist for a user
  async getOrCreateDefaultWishlist(userId: string): Promise<Wishlist> {
    const wishlists = await storage.getWishlists(userId);
    
    // Find the default wishlist
    const defaultWishlist = wishlists.find(w => w.isDefault);
    
    if (defaultWishlist) {
      return defaultWishlist;
    }
    
    // Create a default wishlist if one doesn't exist
    return await this.createDefaultWishlist(userId);
  }
  
  // Get all wishlists for a user with items
  async getWishlistsWithItems(userId: string): Promise<{
    wishlist: Wishlist;
    items: Product[];
  }[]> {
    const wishlists = await storage.getWishlists(userId);
    
    // For each wishlist, get its items
    const wishlistsWithItems = await Promise.all(
      wishlists.map(async (wishlist) => {
        const items = await this.getWishlistProducts(wishlist.id);
        return {
          wishlist,
          items
        };
      })
    );
    
    return wishlistsWithItems;
  }
  
  // Get products in a wishlist
  async getWishlistProducts(wishlistId: number): Promise<Product[]> {
    // Get wishlist items
    const wishlistItems = await storage.getWishlistItems(wishlistId);
    
    // Get products by ID
    const products = await Promise.all(
      wishlistItems.map(async (item) => {
        const product = await storage.getProductById(item.productId);
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }
        return product;
      })
    );
    
    return products;
  }
  
  // Add product to wishlist
  async addToWishlist(
    userId: string,
    productId: number,
    wishlistId?: number
  ): Promise<WishlistItem> {
    // If no wishlist ID is provided, use the default wishlist
    const targetWishlistId = wishlistId || (await this.getOrCreateDefaultWishlist(userId)).id;
    
    // Check if the product is already in the wishlist
    const wishlistItems = await storage.getWishlistItems(targetWishlistId);
    const existingItem = wishlistItems.find(item => item.productId === productId);
    
    if (existingItem) {
      return existingItem;
    }
    
    // Add the product to the wishlist
    const item: InsertWishlistItem = {
      wishlistId: targetWishlistId,
      productId
    };
    
    return await storage.addToWishlist(item);
  }
  
  // Remove product from wishlist
  async removeFromWishlist(
    userId: string,
    productId: number,
    wishlistId?: number
  ): Promise<void> {
    // If no wishlist ID is provided, get all wishlists and check each one
    if (!wishlistId) {
      const wishlists = await storage.getWishlists(userId);
      
      // Check all wishlists and remove the product from any that contain it
      for (const wishlist of wishlists) {
        await storage.removeFromWishlist(wishlist.id, productId);
      }
    } else {
      // Remove from the specified wishlist
      await storage.removeFromWishlist(wishlistId, productId);
    }
  }
  
  // Move product from one wishlist to another
  async moveToWishlist(
    userId: string,
    productId: number,
    sourceWishlistId: number,
    targetWishlistId: number
  ): Promise<WishlistItem> {
    // Remove from source wishlist
    await storage.removeFromWishlist(sourceWishlistId, productId);
    
    // Add to target wishlist
    const item: InsertWishlistItem = {
      wishlistId: targetWishlistId,
      productId
    };
    
    return await storage.addToWishlist(item);
  }
  
  // Check if a product is in any wishlist
  async isInWishlist(userId: string, productId: number): Promise<boolean> {
    const wishlists = await storage.getWishlists(userId);
    
    // Check each wishlist
    for (const wishlist of wishlists) {
      const items = await storage.getWishlistItems(wishlist.id);
      if (items.some(item => item.productId === productId)) {
        return true;
      }
    }
    
    return false;
  }
}

// Create an instance to export
export const wishlistService = new WishlistService();