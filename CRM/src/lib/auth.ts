import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const secret = new TextEncoder().encode(
  process.env.CRM_JWT_SECRET || "crm-dev-secret-change-me"
);

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

export async function signToken(payload: AuthPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as AuthPayload;
  } catch {
    return null;
  }
}

export async function getAuthUser(): Promise<AuthPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("crm_auth_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(): Promise<AuthPayload> {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireRole(allowedRoles: string[]): Promise<AuthPayload> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden");
  }
  return user;
}

// Log actions in the Audit Log
export async function logAuditAction(action: string, details: string, request?: Request) {
  try {
    const user = await getAuthUser();
    let ipAddress = "127.0.0.1";
    
    if (request) {
      const forwarded = request.headers.get("x-forwarded-for");
      ipAddress = forwarded ? forwarded.split(",")[0] : "127.0.0.1";
    }

    await prisma.auditLog.create({
      data: {
        userId: user?.userId || null,
        userName: user?.name || "System/Sync Bridge",
        action,
        details,
        ipAddress,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
