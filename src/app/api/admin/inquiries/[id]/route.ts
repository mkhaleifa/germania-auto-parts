import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { inquiryUpdateSchema } from "@/lib/validators/admin";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Admin access required" } },
      { status: 403 }
    );
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = inquiryUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid data" } },
      { status: 400 }
    );
  }

  const inquiry = await db.contactInquiry.update({
    where: { id }, 
    data: parsed.data,
  });

  return NextResponse.json({ data: inquiry });
}