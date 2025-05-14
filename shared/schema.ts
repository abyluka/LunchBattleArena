import { pgTable, text, serial, integer, boolean, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  logo: text("logo"),
  website: text("website"),
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
});

// Schemas
export const insertBrandSchema = createInsertSchema(brands).omit({ id: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertColorSchema = createInsertSchema(colors).omit({ id: true });
export const insertSizeSchema = createInsertSchema(sizes).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });

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
