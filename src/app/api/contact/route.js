import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimitRequest } from "@/lib/rate-limit";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  company: z.string().optional().default(""),
  role: z.string().optional().default(""),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(3000),
});

export async function POST(request) {
  try {
    const rl = await rateLimitRequest(request, {
      key: "contact:submit",
      endpoint: "POST /api/contact",
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });

    if (!rl.success) {
      return rl.response;
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.issues.map((i) => i.message).join(", "),
        },
        { status: 422 }
      );
    }

    const { name, email, company, role, message } = parsed.data;

    const contactRecord = await db.contactMessage.create({
      data: {
        name,
        email,
        company,
        role,
        message,
      },
    });

    return NextResponse.json({
      success: true,
      id: contactRecord.id,
      message:
        "Thank you for reaching out. A partner from our advisory desk will contact you within 24 hours.",
    });
  } catch (error) {
    console.error("Error submitting contact message:", error);
    return NextResponse.json(
      { error: "Failed to submit contact message. Please try again." },
      { status: 500 }
    );
  }
}
