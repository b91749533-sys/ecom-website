import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    CRM_API_URL: process.env.CRM_API_URL || "not-set",
    NODE_ENV: process.env.NODE_ENV || "not-set"
  });
}
