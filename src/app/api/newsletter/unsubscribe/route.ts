import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: { code: "MISSING_TOKEN", message: "Unsubscribe token is required" } },
      { status: 400 }
    );
  }

  const subscriber = await db.newsletterSubscriber.findUnique({
    where: { token },
  });

  if (!subscriber) {
    return NextResponse.json(
      { error: { code: "INVALID_TOKEN", message: "Invalid unsubscribe token" } },
      { status: 404 }
    );
  }

  if (subscriber.unsubscribedAt) {
    return NextResponse.json({
      data: { message: "You are already unsubscribed." },
    });
  }

  await db.newsletterSubscriber.update({
    where: { token },
    data: { unsubscribedAt: new Date() },
  });

  return NextResponse.json({
    data: { message: "You have been successfully unsubscribed." },
  });
}