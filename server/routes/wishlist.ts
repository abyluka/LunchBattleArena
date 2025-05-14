import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { wishlistService } from "../services/wishlist";

const router = Router();

// Get all wishlists for a user
router.get("/api/wishlists", async (req, res) => {
  try {
    // In a real app, this would come from authenticated user
    const userId = req.query.userId as string;
    
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    
    const wishlists = await wishlistService.getWishlistsWithItems(userId);
    
    res.json(wishlists);
  } catch (error) {
    console.error("Error fetching wishlists:", error);
    res.status(500).json({ error: "Failed to fetch wishlists" });
  }
});

// Create a new wishlist
router.post("/api/wishlists", async (req, res) => {
  try {
    // Validate request body
    const schema = z.object({
      userId: z.string(),
      name: z.string(),
      isDefault: z.boolean().optional()
    });
    
    const validatedData = schema.parse(req.body);
    
    const wishlist = await storage.createWishlist(validatedData);
    
    res.status(201).json(wishlist);
  } catch (error) {
    console.error("Error creating wishlist:", error);
    res.status(500).json({ error: "Failed to create wishlist" });
  }
});

// Update wishlist
router.patch("/api/wishlists/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate request body
    const schema = z.object({
      name: z.string().optional(),
      isDefault: z.boolean().optional()
    });
    
    const validatedData = schema.parse(req.body);
    
    const wishlist = await storage.updateWishlist(parseInt(id), validatedData);
    
    res.json(wishlist);
  } catch (error) {
    console.error("Error updating wishlist:", error);
    res.status(500).json({ error: "Failed to update wishlist" });
  }
});

// Delete wishlist
router.delete("/api/wishlists/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    await storage.deleteWishlist(parseInt(id));
    
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting wishlist:", error);
    res.status(500).json({ error: "Failed to delete wishlist" });
  }
});

// Get items in a wishlist
router.get("/api/wishlists/:id/items", async (req, res) => {
  try {
    const { id } = req.params;
    
    const products = await wishlistService.getWishlistProducts(parseInt(id));
    
    res.json(products);
  } catch (error) {
    console.error("Error fetching wishlist items:", error);
    res.status(500).json({ error: "Failed to fetch wishlist items" });
  }
});

// Add product to wishlist
router.post("/api/wishlists/:id/items", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate request body
    const schema = z.object({
      userId: z.string(),
      productId: z.number()
    });
    
    const { userId, productId } = schema.parse(req.body);
    
    const item = await wishlistService.addToWishlist(userId, productId, parseInt(id));
    
    res.status(201).json(item);
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ error: "Failed to add product to wishlist" });
  }
});

// Remove product from wishlist
router.delete("/api/wishlists/:id/items/:productId", async (req, res) => {
  try {
    const { id, productId } = req.params;
    const userId = req.query.userId as string;
    
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    
    await wishlistService.removeFromWishlist(userId, parseInt(productId), parseInt(id));
    
    res.status(204).end();
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({ error: "Failed to remove product from wishlist" });
  }
});

// Check if product is in any wishlist
router.get("/api/wishlists/check/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.query.userId as string;
    
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    
    const isInWishlist = await wishlistService.isInWishlist(userId, parseInt(productId));
    
    res.json({ isInWishlist });
  } catch (error) {
    console.error("Error checking wishlist:", error);
    res.status(500).json({ error: "Failed to check if product is in wishlist" });
  }
});

export default router;