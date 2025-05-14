import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // PREFIX all routes with /api
  
  // Get all brands
  app.get("/api/brands", async (req, res) => {
    try {
      const brands = await storage.getBrands();
      res.json(brands);
    } catch (error) {
      res.status(500).json({ message: "Error fetching brands" });
    }
  });

  // Get all categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Error fetching categories" });
    }
  });

  // Get all colors
  app.get("/api/colors", async (req, res) => {
    try {
      const colors = await storage.getColors();
      res.json(colors);
    } catch (error) {
      res.status(500).json({ message: "Error fetching colors" });
    }
  });

  // Get all sizes
  app.get("/api/sizes", async (req, res) => {
    try {
      const sizes = await storage.getSizes();
      res.json(sizes);
    } catch (error) {
      res.status(500).json({ message: "Error fetching sizes" });
    }
  });

  // Get products with filtering
  app.get("/api/products", async (req, res) => {
    try {
      const querySchema = z.object({
        brands: z.string().optional(),
        categories: z.string().optional(),
        colors: z.string().optional(),
        sizes: z.string().optional(),
        priceMin: z.string().optional(),
        priceMax: z.string().optional(),
        search: z.string().optional(),
        page: z.string().optional(),
        limit: z.string().optional(),
        country: z.string().optional(),
      });

      const query = querySchema.parse(req.query);
      
      const filters: any = {};
      
      if (query.brands) {
        filters.brandIds = query.brands.split(',').map(Number);
      }
      
      if (query.categories) {
        filters.categoryIds = query.categories.split(',').map(Number);
      }
      
      if (query.colors) {
        filters.colors = query.colors.split(',').map(Number);
      }
      
      if (query.sizes) {
        filters.sizes = query.sizes.split(',');
      }
      
      if (query.priceMin) {
        filters.priceMin = Number(query.priceMin);
      }
      
      if (query.priceMax) {
        filters.priceMax = Number(query.priceMax);
      }
      
      if (query.search) {
        filters.search = query.search;
      }
      
      if (query.page) {
        filters.page = Number(query.page);
      }
      
      if (query.limit) {
        filters.limit = Number(query.limit);
      }
      
      // Get country-specific products if country is provided
      let products, total;
      if (query.country === 'GB' || query.country === 'UK') {
        // Get UK-specific products
        ({ products, total } = await storage.getUKProducts(filters));
      } else {
        // Get all products
        ({ products, total } = await storage.getProducts(filters));
      }
      
      // Enhance products with related data
      const enhancedProducts = await Promise.all(
        products.map(async (product) => {
          const brand = await storage.getBrandById(product.brandId);
          const category = await storage.getCategoryById(product.categoryId);
          
          // Get color objects
          const productColorIds = product.colors as number[];
          const productColors = await Promise.all(
            productColorIds.map(async (colorId) => {
              return await storage.getColorById(colorId);
            })
          );
          
          // Get size objects
          const productSizeIds = product.sizes as number[];
          const productSizes = await Promise.all(
            productSizeIds.map(async (sizeId) => {
              return await storage.getSizeById(sizeId);
            })
          );
          
          return {
            ...product,
            brand,
            category,
            colors: productColors.filter(Boolean),
            sizes: productSizes.filter(Boolean),
          };
        })
      );
      
      res.json({
        products: enhancedProducts,
        total,
        page: filters.page || 1,
        limit: filters.limit || products.length,
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Error fetching products" });
    }
  });

  // Get product by ID
  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const product = await storage.getProductById(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      const brand = await storage.getBrandById(product.brandId);
      const category = await storage.getCategoryById(product.categoryId);
      
      // Get color objects
      const productColorIds = product.colors as number[];
      const productColors = await Promise.all(
        productColorIds.map(async (colorId) => {
          return await storage.getColorById(colorId);
        })
      );
      
      // Get size objects
      const productSizeIds = product.sizes as number[];
      const productSizes = await Promise.all(
        productSizeIds.map(async (sizeId) => {
          return await storage.getSizeById(sizeId);
        })
      );
      
      const enhancedProduct = {
        ...product,
        brand,
        category,
        colors: productColors.filter(Boolean),
        sizes: productSizes.filter(Boolean),
      };
      
      res.json(enhancedProduct);
    } catch (error) {
      res.status(500).json({ message: "Error fetching product" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
