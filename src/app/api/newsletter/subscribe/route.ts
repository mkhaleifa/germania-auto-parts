import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { db } from "@/lib/db";

const subscribeSchema = z.object({
  email: z.string().email("Valid email is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Valid email is required" } },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Check for existing subscriber
    const existing = await db.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      if (!existing.unsubscribedAt) {
        // Already subscribed
        return NextResponse.json({
          data: { message: "You're already subscribed!" },
        });
      }

      // Re-subscribe: clear the unsubscribedAt
      await db.newsletterSubscriber.update({
        where: { email },
        data: { unsubscribedAt: null, subscribedAt: new Date() },
      });
    } else {
      await db.newsletterSubscriber.create({
        data: { email },
      });
    }

    return NextResponse.json({
      data: { message: "You're subscribed!" },
    });
  } catch (error) {
    console.error("POST /api/newsletter/subscribe error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to subscribe" } },
      { status: 500 }
    );
  }
}