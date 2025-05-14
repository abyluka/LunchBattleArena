import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { checkPriceAlerts } from "../services/price-alerts";

const router = Router();

// Get all price alerts for a user
router.get("/api/price-alerts", async (req, res) => {
  try {
    const userId = req.query.userId as string;
    
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    
    const alerts = await storage.getPriceAlerts(userId);
    
    // Enhance alerts with product details
    const enhancedAlerts = await Promise.all(
      alerts.map(async (alert) => {
        const product = await storage.getProductById(alert.productId);
        return {
          ...alert,
          product: product || null
        };
      })
    );
    
    res.json(enhancedAlerts);
  } catch (error) {
    console.error("Error fetching price alerts:", error);
    res.status(500).json({ error: "Failed to fetch price alerts" });
  }
});

// Create a new price alert
router.post("/api/price-alerts", async (req, res) => {
  try {
    // Validate request body
    const schema = z.object({
      userId: z.string(),
      productId: z.number(),
      targetPrice: z.number().positive(),
      notificationType: z.string().default("email")
    });
    
    const validatedData = schema.parse(req.body);
    
    // Check if product exists
    const product = await storage.getProductById(validatedData.productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    // Create price alert
    const alert = await storage.createPriceAlert(validatedData);
    
    res.status(201).json({
      ...alert,
      product
    });
  } catch (error) {
    console.error("Error creating price alert:", error);
    res.status(500).json({ error: "Failed to create price alert" });
  }
});

// Update price alert
router.patch("/api/price-alerts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate request body
    const schema = z.object({
      targetPrice: z.number().positive().optional(),
      isActive: z.boolean().optional(),
      notificationType: z.string().optional()
    });
    
    const validatedData = schema.parse(req.body);
    
    // Update price alert
    const alert = await storage.updatePriceAlert(parseInt(id), validatedData);
    
    // Get product details
    const product = await storage.getProductById(alert.productId);
    
    res.json({
      ...alert,
      product: product || null
    });
  } catch (error) {
    console.error("Error updating price alert:", error);
    res.status(500).json({ error: "Failed to update price alert" });
  }
});

// Delete price alert
router.delete("/api/price-alerts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    await storage.deletePriceAlert(parseInt(id));
    
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting price alert:", error);
    res.status(500).json({ error: "Failed to delete price alert" });
  }
});

// Manually check for price alerts that should be triggered
router.post("/api/price-alerts/check", async (req, res) => {
  try {
    const result = await checkPriceAlerts();
    
    res.json(result);
  } catch (error) {
    console.error("Error checking price alerts:", error);
    res.status(500).json({ error: "Failed to check price alerts" });
  }
});

export default router;