import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { syncBrandProducts } from "../services/brand-api";

const router = Router();

// Get all brands with API configuration status
router.get("/api/brands/api-status", async (req, res) => {
  try {
    const brandsData = await storage.getBrands();
    
    // Map brands to include API configuration status
    const brandsWithStatus = brandsData.map(brand => ({
      ...brand,
      hasApiConfig: !!(brand.apiKey && brand.apiEndpoint && brand.apiType)
    }));
    
    res.json(brandsWithStatus);
  } catch (error) {
    console.error("Error fetching brands API status:", error);
    res.status(500).json({ error: "Failed to fetch brands API status" });
  }
});

// Update brand API configuration
router.patch("/api/brands/:id/api-config", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate request body
    const schema = z.object({
      apiKey: z.string().optional(),
      apiEndpoint: z.string().optional(),
      apiType: z.string().optional()
    });
    
    const validatedData = schema.parse(req.body);
    
    // Update brand
    const updatedBrand = await storage.updateBrand(parseInt(id), validatedData);
    
    res.json(updatedBrand);
  } catch (error) {
    console.error("Error updating brand API config:", error);
    res.status(500).json({ error: "Failed to update brand API configuration" });
  }
});

// Trigger a brand API sync
router.post("/api/brands/:id/sync", async (req, res) => {
  try {
    const { id } = req.params;
    const brandId = parseInt(id);
    
    // Check if brand exists
    const brand = await storage.getBrandById(brandId);
    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }
    
    // Check if brand has API configuration
    if (!brand.apiKey || !brand.apiEndpoint || !brand.apiType) {
      return res.status(400).json({ error: "Brand API configuration is incomplete" });
    }
    
    // Start sync in background
    const syncPromise = syncBrandProducts(brandId);
    
    // Return immediate response
    res.json({ 
      message: "Brand sync started",
      brandId
    });
    
    // Wait for sync to complete (background task)
    syncPromise.catch(error => {
      console.error(`Background sync for brand ${brandId} failed:`, error);
    });
  } catch (error) {
    console.error("Error triggering brand sync:", error);
    res.status(500).json({ error: "Failed to trigger brand sync" });
  }
});

// Get brand sync history
router.get("/api/brands/:id/sync-history", async (req, res) => {
  try {
    const { id } = req.params;
    const brandId = parseInt(id);
    
    // Check if brand exists
    const brand = await storage.getBrandById(brandId);
    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }
    
    // Get latest sync log
    const latestSync = await storage.getLatestApiSyncLog(brandId);
    
    res.json({ 
      latestSync: latestSync || null
    });
  } catch (error) {
    console.error("Error fetching brand sync history:", error);
    res.status(500).json({ error: "Failed to fetch brand sync history" });
  }
});

export default router;