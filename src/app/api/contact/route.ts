import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { db } from "@/lib/db";
import { sendContactNotificationEmail } from "@/lib/email";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid data", details: parsed.error.format() } },
        { status: 400 }
      );
    }

    const { name, email, phone, subject, message } = parsed.data;

    // Save to database
    await db.contactInquiry.create({
      data: { name, email, phone: phone || null, subject, message, status: "UNREAD" },
    });

    // Notify admin
    try {
      await sendContactNotificationEmail({ name, email, phone, subject, message });
    } catch {
      console.error("Failed to send contact notification email");
    }

    return NextResponse.json({
      data: { message: "Message sent successfully. We'll be in touch within 24 hours." },
    });
  } catch (error) {
    console.error("POST /api/contact error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to send message" } },
      { status: 500 }
    );
  }
}