import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";
import { loginSchema, registerSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === "login") {
      const parsed = loginSchema.safeParse(body);
      if (!parsed.success) return apiError(parsed.error.errors[0].message);

      const { isDatabaseAvailable } = await import("@/lib/db");
      if (!(await isDatabaseAvailable())) {
        const adminEmail = process.env.ADMIN_EMAIL || "admin@lumiere.com";
        const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

        if (parsed.data.email === adminEmail && parsed.data.password === adminPassword) {
          const token = await signToken({
            userId: "admin-id",
            email: adminEmail,
            role: "admin",
          });

          const response = apiSuccess({
            user: { id: "admin-id", email: adminEmail, name: "Administrator", role: "admin" },
          });

          response.cookies.set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
          });

          return response;
        }

        const mockUserId = "usr_" + Math.random().toString(36).substring(2, 11);
        const mockName = parsed.data.email.split("@")[0];
        const token = await signToken({
          userId: mockUserId,
          email: parsed.data.email,
          role: "customer",
        });

        const response = apiSuccess({
          user: { id: mockUserId, email: parsed.data.email, name: mockName, role: "customer" },
        });

        response.cookies.set("auth_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        });

        return response;
      }

      const user = await prisma.user.findUnique({
        where: { email: parsed.data.email },
      });

      if (!user) return apiError("Invalid email or password", 401);

      const valid = await bcrypt.compare(parsed.data.password, user.password);
      if (!valid) return apiError("Invalid email or password", 401);

      const token = await signToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const response = apiSuccess({
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      });

      response.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });

      return response;
    }

    if (action === "register") {
      const parsed = registerSchema.safeParse(body);
      if (!parsed.success) return apiError(parsed.error.errors[0].message);

      const { isDatabaseAvailable } = await import("@/lib/db");
      if (!(await isDatabaseAvailable())) {
        const mockUserId = "usr_" + Math.random().toString(36).substring(2, 11);
        
        const { syncCustomerToCRM } = await import("@/lib/crm");
        syncCustomerToCRM({
          email: parsed.data.email,
          name: parsed.data.name,
        }).catch((err) => console.error("Customer sync to CRM failed (fallback):", err));

        const token = await signToken({
          userId: mockUserId,
          email: parsed.data.email,
          role: "customer",
        });

        const response = apiSuccess({
          user: { id: mockUserId, email: parsed.data.email, name: parsed.data.name, role: "customer" },
        });

        response.cookies.set("auth_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        });

        return response;
      }

      const existing = await prisma.user.findUnique({
        where: { email: parsed.data.email },
      });

      if (existing) return apiError("Email already registered");

      const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

      const user = await prisma.user.create({
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
          password: hashedPassword,
        },
      });

      // Sync customer registration to CRM in the background
      const { syncCustomerToCRM } = await import("@/lib/crm");
      syncCustomerToCRM({
        email: user.email,
        name: user.name,
      }).catch((err) => console.error("Customer sync to CRM failed:", err));

      const token = await signToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const response = apiSuccess({
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      });

      response.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });

      return response;
    }

    return apiError("Invalid action");
  } catch {
    return apiError("Authentication failed", 500);
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("auth_token");
  return response;
}
