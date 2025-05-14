import { db } from "./db";
import { IStorage } from "./storage";
import {
  Brand, InsertBrand,
  Category, InsertCategory,
  Color, InsertColor,
  Size, InsertSize,
  Product, InsertProduct,
  User, InsertUser,
  Wishlist, InsertWishlist,
  WishlistItem, InsertWishlistItem,
  PriceAlert, InsertPriceAlert,
  ApiSyncLog,
  ProductFilters,
  brands,
  categories,
  colors,
  sizes,
  products,
  users,
  wishlists,
  wishlistItems,
  priceAlerts,
  apiSyncLogs
} from "@shared/schema";
import { and, eq, gte, lte, like, or, inArray, desc, asc } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  // Brand methods
  async getBrands(): Promise<Brand[]> {
    return await db.select().from(brands);
  }

  async getBrandById(id: number): Promise<Brand | undefined> {
    const [brand] = await db.select().from(brands).where(eq(brands.id, id));
    return brand;
  }

  async getBrandByName(name: string): Promise<Brand | undefined> {
    const [brand] = await db.select().from(brands).where(eq(brands.name, name));
    return brand;
  }

  async createBrand(brand: InsertBrand): Promise<Brand> {
    const [newBrand] = await db.insert(brands).values(brand).returning();
    return newBrand;
  }

  async updateBrand(id: number, brandData: Partial<InsertBrand>): Promise<Brand> {
    const [updatedBrand] = await db
      .update(brands)
      .set(brandData)
      .where(eq(brands.id, id))
      .returning();
    return updatedBrand;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async getCategoryByName(name: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.name, name));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Color methods
  async getColors(): Promise<Color[]> {
    return await db.select().from(colors);
  }

  async getColorById(id: number): Promise<Color | undefined> {
    const [color] = await db.select().from(colors).where(eq(colors.id, id));
    return color;
  }

  async createColor(color: InsertColor): Promise<Color> {
    const [newColor] = await db.insert(colors).values(color).returning();
    return newColor;
  }

  // Size methods
  async getSizes(): Promise<Size[]> {
    return await db.select().from(sizes);
  }

  async getSizeById(id: number): Promise<Size | undefined> {
    const [size] = await db.select().from(sizes).where(eq(sizes.id, id));
    return size;
  }

  async createSize(size: InsertSize): Promise<Size> {
    const [newSize] = await db.insert(sizes).values(size).returning();
    return newSize;
  }

  // Product methods
  async getProducts(filters?: ProductFilters): Promise<{ products: Product[], total: number }> {
    let query = db.select().from(products);
    const conditions = [];

    if (filters?.brandIds && filters.brandIds.length > 0) {
      conditions.push(inArray(products.brandId, filters.brandIds));
    }

    if (filters?.categoryIds && filters.categoryIds.length > 0) {
      conditions.push(inArray(products.categoryId, filters.categoryIds));
    }

    if (filters?.priceMin !== undefined) {
      conditions.push(gte(products.price, filters.priceMin));
    }

    if (filters?.priceMax !== undefined) {
      conditions.push(lte(products.price, filters.priceMax));
    }

    if (filters?.search) {
      conditions.push(
        or(
          like(products.name, `%${filters.search}%`),
          like(products.description || '', `%${filters.search}%`)
        )
      );
    }

    // Apply all conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // First get the total count
    const allProducts = await query;
    const total = allProducts.length;

    // Then apply pagination
    if (filters?.page !== undefined && filters?.limit !== undefined) {
      const offset = (filters.page - 1) * filters.limit;
      query = query.limit(filters.limit).offset(offset);
    }

    // Execute the query with pagination
    const productsList = await query;

    return {
      products: productsList,
      total
    };
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set(productData)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  // Get UK-specific products (products from UK-based brands)
  async getUKProducts(filters?: ProductFilters): Promise<{ products: Product[], total: number }> {
    // UK-based brands IDs - Primark, River Island, John Lewis, Next, Matalan, New Look
    const ukBrandIds = [2, 3, 6, 5, 9, 10]; 
    
    // Create a copy of the filters or initialize a new one
    const ukFilters: ProductFilters = filters ? { ...filters } : {};
    
    // Set or merge the UK brand IDs with any existing brand filter
    if (ukFilters.brandIds && ukFilters.brandIds.length > 0) {
      // If specific brands are requested, only include UK brands from that selection
      ukFilters.brandIds = ukFilters.brandIds.filter(id => ukBrandIds.includes(id));
      
      // If no UK brands are in the requested brands, use all UK brands
      if (ukFilters.brandIds.length === 0) {
        ukFilters.brandIds = [...ukBrandIds];
      }
    } else {
      // Use all UK brands if no specific brands are requested
      ukFilters.brandIds = [...ukBrandIds];
    }
    
    // Use the regular getProducts method with the UK filters
    return this.getProducts(ukFilters);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Wishlist methods
  async getWishlists(userId: string): Promise<Wishlist[]> {
    return await db.select().from(wishlists).where(eq(wishlists.userId, userId));
  }

  async getWishlistById(id: number): Promise<Wishlist | undefined> {
    const [wishlist] = await db.select().from(wishlists).where(eq(wishlists.id, id));
    return wishlist;
  }

  async createWishlist(wishlistData: InsertWishlist): Promise<Wishlist> {
    const [wishlist] = await db.insert(wishlists).values(wishlistData).returning();
    return wishlist;
  }

  async updateWishlist(id: number, wishlistData: Partial<InsertWishlist>): Promise<Wishlist> {
    const [updatedWishlist] = await db
      .update(wishlists)
      .set({ ...wishlistData, updatedAt: new Date() })
      .where(eq(wishlists.id, id))
      .returning();
    return updatedWishlist;
  }

  async deleteWishlist(id: number): Promise<void> {
    await db.delete(wishlists).where(eq(wishlists.id, id));
  }

  // Wishlist items methods
  async getWishlistItems(wishlistId: number): Promise<WishlistItem[]> {
    return await db.select()
      .from(wishlistItems)
      .where(eq(wishlistItems.wishlistId, wishlistId));
  }

  async addToWishlist(item: InsertWishlistItem): Promise<WishlistItem> {
    const [wishlistItem] = await db.insert(wishlistItems).values(item).returning();
    return wishlistItem;
  }

  async removeFromWishlist(wishlistId: number, productId: number): Promise<void> {
    await db.delete(wishlistItems)
      .where(
        and(
          eq(wishlistItems.wishlistId, wishlistId),
          eq(wishlistItems.productId, productId)
        )
      );
  }

  // Price alerts methods
  async getPriceAlerts(userId: string): Promise<PriceAlert[]> {
    return await db.select()
      .from(priceAlerts)
      .where(eq(priceAlerts.userId, userId));
  }

  async getPriceAlertById(id: number): Promise<PriceAlert | undefined> {
    const [alert] = await db.select().from(priceAlerts).where(eq(priceAlerts.id, id));
    return alert;
  }

  async createPriceAlert(alertData: InsertPriceAlert): Promise<PriceAlert> {
    const [alert] = await db.insert(priceAlerts).values(alertData).returning();
    return alert;
  }

  async updatePriceAlert(id: number, alertData: Partial<InsertPriceAlert>): Promise<PriceAlert> {
    const [updatedAlert] = await db
      .update(priceAlerts)
      .set(alertData)
      .where(eq(priceAlerts.id, id))
      .returning();
    return updatedAlert;
  }

  async deletePriceAlert(id: number): Promise<void> {
    await db.delete(priceAlerts).where(eq(priceAlerts.id, id));
  }

  // API sync log methods
  async logApiSync(brandId: number): Promise<ApiSyncLog> {
    const [log] = await db.insert(apiSyncLogs)
      .values({ brandId, startedAt: new Date() })
      .returning();
    return log;
  }

  async updateApiSyncLog(id: number, logData: Partial<ApiSyncLog>): Promise<ApiSyncLog> {
    const [updatedLog] = await db
      .update(apiSyncLogs)
      .set(logData)
      .where(eq(apiSyncLogs.id, id))
      .returning();
    return updatedLog;
  }

  async getLatestApiSyncLog(brandId: number): Promise<ApiSyncLog | undefined> {
    const [log] = await db.select()
      .from(apiSyncLogs)
      .where(eq(apiSyncLogs.brandId, brandId))
      .orderBy(desc(apiSyncLogs.startedAt))
      .limit(1);
    return log;
  }
}