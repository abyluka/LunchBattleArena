import { storage } from "../../storage";
import { PriceAlert, Product } from "@shared/schema";

// Price alert service to check for alerts that should be triggered
export async function checkPriceAlerts(): Promise<{
  alertsTriggered: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let alertsTriggered = 0;

  try {
    // Fetch all active price alerts
    const activeAlerts = await getAllActiveAlerts();
    
    // For each alert, check if the current price is below the target price
    for (const alert of activeAlerts) {
      try {
        const product = await storage.getProductById(alert.productId);
        
        if (!product) {
          errors.push(`Product with ID ${alert.productId} not found for alert ${alert.id}`);
          continue;
        }
        
        // Get the current price (use discounted price if available)
        const currentPrice = product.discountedPrice || product.price;
        
        // Check if the current price is less than or equal to the target price
        if (currentPrice <= alert.targetPrice) {
          // Alert should be triggered
          await triggerAlert(alert, product, currentPrice);
          alertsTriggered++;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push(`Error processing alert ${alert.id}: ${errorMessage}`);
      }
    }
    
    return { alertsTriggered, errors };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push(`Error checking price alerts: ${errorMessage}`);
    return { alertsTriggered, errors };
  }
}

// Helper function to get all active alerts
async function getAllActiveAlerts(): Promise<PriceAlert[]> {
  // This would be implemented by adding a method to storage
  // For now, we'll simulate by filtering active alerts from all users
  
  // Get all users
  const users = await getAllUsers();
  
  // Collect all active alerts from all users
  const allAlerts: PriceAlert[] = [];
  
  for (const user of users) {
    const userAlerts = await storage.getPriceAlerts(user.id);
    const activeAlerts = userAlerts.filter(alert => alert.isActive);
    allAlerts.push(...activeAlerts);
  }
  
  return allAlerts;
}

// Helper function to get all users (for demo purposes)
async function getAllUsers() {
  // In a real implementation, you would have a method to get all users
  // For now, we'll return a stub
  return [{ id: 'demo-user' }];
}

// Trigger a price alert notification
async function triggerAlert(
  alert: PriceAlert,
  product: Product,
  currentPrice: number
): Promise<void> {
  try {
    // 1. Update the alert's lastNotifiedAt timestamp
    await storage.updatePriceAlert(alert.id, {
      lastNotifiedAt: new Date()
    });
    
    // 2. Send notification based on the alert's notificationType
    if (alert.notificationType === 'email') {
      await sendEmailAlert(alert, product, currentPrice);
    } else if (alert.notificationType === 'sms') {
      await sendSmsAlert(alert, product, currentPrice);
    }
    
    console.log(`Price alert triggered for product ${product.name} (${alert.notificationType})`);
  } catch (error) {
    console.error('Error triggering alert:', error);
    throw error;
  }
}

// Send email alert
async function sendEmailAlert(
  alert: PriceAlert,
  product: Product,
  currentPrice: number
): Promise<void> {
  // In a real implementation, you would:
  // 1. Get the user's email address
  // 2. Format a nice HTML email
  // 3. Send via a service like SendGrid, AWS SES, etc.
  
  console.log(`[EMAIL ALERT] To: User ${alert.userId}, Product: ${product.name} is now £${currentPrice} (Target: £${alert.targetPrice})`);
}

// Send SMS alert
async function sendSmsAlert(
  alert: PriceAlert,
  product: Product,
  currentPrice: number
): Promise<void> {
  // In a real implementation, you would:
  // 1. Get the user's phone number
  // 2. Format a concise text message
  // 3. Send via a service like Twilio, AWS SNS, etc.
  
  console.log(`[SMS ALERT] To: User ${alert.userId}, Product: ${product.name} is now £${currentPrice} (Target: £${alert.targetPrice})`);
}

// Schedule regular price alert checks (e.g., every hour)
export function schedulePriceAlertChecks(intervalMinutes: number = 60): NodeJS.Timeout {
  console.log(`Scheduling price alert checks every ${intervalMinutes} minutes`);
  
  const intervalMs = intervalMinutes * 60 * 1000;
  
  const interval = setInterval(async () => {
    try {
      const result = await checkPriceAlerts();
      console.log(`Price alert check completed: ${result.alertsTriggered} alerts triggered, ${result.errors.length} errors`);
      
      if (result.errors.length > 0) {
        console.error('Price alert check errors:', result.errors);
      }
    } catch (error) {
      console.error('Error in scheduled price alert check:', error);
    }
  }, intervalMs);
  
  return interval;
}