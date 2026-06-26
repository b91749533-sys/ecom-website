const CRM_API_URL = process.env.CRM_API_URL || "http://localhost:3001";
const CRM_SYNC_TOKEN = process.env.CRM_SYNC_TOKEN || "secure-crm-sync-token-987654";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function postToCRM(endpoint: string, payload: any) {
  const res = await fetch(`${CRM_API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Sync-Token": CRM_SYNC_TOKEN,
      "bypass-tunnel-reminder": "true",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const bodyText = await res.text().catch(() => "no-body");
    throw new Error(`CRM Sync failed for ${endpoint}. Status: ${res.status}, Response: ${bodyText}`);
  }
  return true;
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
