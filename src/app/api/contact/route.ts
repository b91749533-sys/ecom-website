import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api";
import { contactSchema, newsletterSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const type = body.type;

    if (type === "newsletter") {
      const parsed = newsletterSchema.safeParse(body);
      if (!parsed.success) return apiError(parsed.error.errors[0].message);

      await prisma.newsletter.upsert({
        where: { email: parsed.data.email },
        update: {},
        create: { email: parsed.data.email },
      });

      return apiSuccess({ message: "Subscribed successfully" });
    }

    if (type === "contact") {
      const parsed = contactSchema.safeParse(body);
      if (!parsed.success) return apiError(parsed.error.errors[0].message);

      await prisma.contactMessage.create({ data: parsed.data });

      return apiSuccess({ message: "Message sent successfully" });
    }

    return apiError("Invalid type");
  } catch {
    return apiError("Failed to process request", 500);
  }
}
