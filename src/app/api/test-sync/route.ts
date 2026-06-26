import { NextResponse } from "next/server";
import { syncOrderToCRM } from "@/lib/crm";

export async function GET() {
  const testEmail = `vercel-test-sync-${Date.now()}@example.com`;
  const payload = {
    orderNumber: `TEST-${Date.now()}`,
    email: testEmail,
    name: "Test Sync from Vercel",
    address: "123 Vercel St",
    city: "San Francisco",
    state: "CA",
    zip: "94107",
    country: "US",
    status: "confirmed",
    subtotal: 100,
    shipping: 10,
    tax: 5,
    total: 115,
    items: [
      {
        productId: "static-1",
        name: "Sauvage Eau de Parfum",
        brand: "Dior",
        price: 165,
        quantity: 1,
        image: ""
      }
    ]
  };

  try {
    console.log("Attempting test sync to CRM...");
    const success = await syncOrderToCRM(payload);
    return NextResponse.json({
      success,
      CRM_API_URL: process.env.CRM_API_URL || "not-set",
      message: "Sync request completed."
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      CRM_API_URL: process.env.CRM_API_URL || "not-set",
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
