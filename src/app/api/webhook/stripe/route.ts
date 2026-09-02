import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: { code: "NOT_CONFIGURED", message: "Stripe webhook handling is not configured." } }, { status: 503 });
}
