const CRM_API_URL = process.env.CRM_API_URL || "http://localhost:3001";
const CRM_SYNC_TOKEN = process.env.CRM_SYNC_TOKEN || "secure-crm-sync-token-987654";

// Helper to make secure POST requests to CRM sync APIs
async function postToCRM(endpoint: string, payload: any) {
  try {
    const res = await fetch(`${CRM_API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Sync-Token": CRM_SYNC_TOKEN,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error(`CRM Sync failed for ${endpoint}. Status: ${res.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Network error syncing data to CRM at ${endpoint}:`, err);
    return false;
  }
}

// 1. Sync completed orders instantly
export async function syncOrderToCRM(order: {
  orderNumber: string;
  email: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  status: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  items: Array<{
    productId: string;
    name: string;
    brand: string;
    price: number;
    quantity: number;
    image: string;
  }>;
}) {
  return postToCRM("/api/sync/order", order);
}

// 2. Sync customer registration / updates
export async function syncCustomerToCRM(customer: {
  email: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}) {
  return postToCRM("/api/sync/customer", customer);
}

// 3. Sync shopping carts for abandoned cart tracking
export async function syncCartToCRM(cart: {
  sessionId: string;
  customerEmail?: string | null;
  items: Array<{
    productId: string;
    name: string;
    brand: string;
    price: number;
    quantity: number;
  }>;
  value: number;
  isCheckedOut: boolean;
}) {
  return postToCRM("/api/sync/cart", cart);
}

// 4. Sync browsing activity tracking
export async function syncActivityToCRM(activity: {
  customerEmail?: string | null;
  page: string;
  duration?: number;
  device?: string;
  browser?: string;
}) {
  return postToCRM("/api/sync/activity", activity);
}
