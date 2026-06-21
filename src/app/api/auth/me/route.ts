import { getAuthUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) return apiSuccess({ user: null });

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { id: true, email: true, name: true, role: true },
    });

    return apiSuccess({ user });
  } catch {
    return apiError("Failed to get user", 500);
  }
}
