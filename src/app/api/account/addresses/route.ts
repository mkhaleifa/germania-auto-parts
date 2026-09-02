import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { addressSchema } from "@/lib/validators/address";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 }
    );
  }

  const addresses = await db.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ data: addresses });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 }
    );
  }

  const body = await request.json();
  const parsed = addressSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid address", details: parsed.error.format() } },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // If setting as default, unset other defaults first
  if (data.isDefault) {
    await db.address.updateMany({
      where: { userId: session.user.id, isDefault: true },
      data: { isDefault: false },
    });
  }

  const address = await db.address.create({
    data: {
      ...data,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ data: address }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { id, ...rest } = body;

  if (!id) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Address ID required" } },
      { status: 400 }
    );
  }

  const parsed = addressSchema.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid address", details: parsed.error.format() } },
      { status: 400 }
    );
  }

  // Verify ownership
  const existing = await db.address.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Address not found" } },
      { status: 404 }
    );
  }

  const data = parsed.data;

  if (data.isDefault) {
    await db.address.updateMany({
      where: { userId: session.user.id, isDefault: true, id: { not: id } },
      data: { isDefault: false },
    });
  }

  const address = await db.address.update({
    where: { id },
    data,
  });

  return NextResponse.json({ data: address });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Address ID required" } },
      { status: 400 }
    );
  }

  const existing = await db.address.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Address not found" } },
      { status: 404 }
    );
  }

  await db.address.delete({ where: { id } });

  return NextResponse.json({ data: { message: "Address deleted" } });
}