import { pgTable, text, serial, integer, boolean, real, jsonb, timestamp, unique, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  logo: text("logo"),
  website: text("website"),
  apiKey: text("api_key"),
  apiEndpoint: text("api_endpoint"),
  apiType: text("api_type"), // "shopify", "woocommerce", "custom", etc.
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const colors = pgTable("colors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  hexCode: text("hex_code").notNull(),
});

export const sizes = pgTable("sizes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  discountedPrice: real("discounted_price"),
  brandId: integer("brand_id").notNull(),
  categoryId: integer("category_id").notNull(),
  images: text("images").array().notNull(),
  rating: real("rating"),
  reviewCount: integer("review_count"),
  inStock: boolean("in_stock").notNull().default(true),
  isNew: boolean("is_new").default(false),
  sizes: jsonb("sizes").notNull(),
  colors: jsonb("colors").notNull(),
  url: text("url").notNull(),
  externalId: text("external_id"), // ID from the brand's API
  lastUpdated: timestamp("last_updated").defaultNow(),
  priceHistory: jsonb("price_history"), // Store price snapshots over time
});

// User table and related tables for user features
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Match the Replit Auth ID
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  preferences: jsonb("preferences"), // Store user preferences like notification settings
});

// Wishlist/favorites table
export const wishlists = pgTable("wishlists", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull().default("Default"),
  isDefault: boolean("is_default").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Wishlist items
export const wishlistItems = pgTable("wishlist_items", {
  id: serial("id").primaryKey(),
  wishlistId: integer("wishlist_id").notNull(),
  productId: integer("product_id").notNull(),
  addedAt: timestamp("added_at").defaultNow(),
}, (table) => {
  return {
    wishlistProductUnique: unique().on(table.wishlistId, table.productId),
  };
});

// Price alerts for tracking
export const priceAlerts = pgTable("price_alerts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  productId: integer("product_id").notNull(),
  targetPrice: real("target_price").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastNotifiedAt: timestamp("last_notified_at"),
  notificationType: text("notification_type").notNull().default("email"), // email, sms, etc.
});

// API sync logs for monitoring brand APIs
export const apiSyncLogs = pgTable("api_sync_logs", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id").notNull(),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  status: text("status").notNull().default("running"), // running, success, failed
  productsAdded: integer("products_added").default(0),
  productsUpdated: integer("products_updated").default(0),
  error: text("error"),
});

// Schemas
export const insertBrandSchema = createInsertSchema(brands).omit({ id: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertColorSchema = createInsertSchema(colors).omit({ id: true });
export const insertSizeSchema = createInsertSchema(sizes).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWishlistSchema = createInsertSchema(wishlists).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWishlistItemSchema = createInsertSchema(wishlistItems).omit({ id: true, addedAt: true });
export const insertPriceAlertSchema = createInsertSchema(priceAlerts).omit({ id: true, createdAt: true, lastNotifiedAt: true });

// Types
export type Brand = typeof brands.$inferSelect;
export type InsertBrand = z.infer<typeof insertBrandSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Color = typeof colors.$inferSelect;
export type InsertColor = z.infer<typeof insertColorSchema>;

export type Size = typeof sizes.$inferSelect;
export type InsertSize = z.infer<typeof insertSizeSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Wishlist = typeof wishlists.$inferSelect;
export type InsertWishlist = z.infer<typeof insertWishlistSchema>;

export type WishlistItem = typeof wishlistItems.$inferSelect;
export type InsertWishlistItem = z.infer<typeof insertWishlistItemSchema>;

export type PriceAlert = typeof priceAlerts.$inferSelect;
export type InsertPriceAlert = z.infer<typeof insertPriceAlertSchema>;

export type ApiSyncLog = typeof apiSyncLogs.$inferSelect;

// Product filters type
export type ProductFilters = {
  brandIds?: number[];
  categoryIds?: number[];
  colors?: number[];
  sizes?: string[];
  priceMin?: number;
  priceMax?: number;
  search?: string;
  page?: number;
  limit?: number;
}
