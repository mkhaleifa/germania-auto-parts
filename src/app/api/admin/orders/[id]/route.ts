import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: { code: "NOT_IMPLEMENTED", message: "Use the admin orders page API instead." } }, { status: 501 });
}
