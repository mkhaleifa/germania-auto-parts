import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 }
    );
  }

  const items = await db.wishlist.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          comparePrice: true,
          stock: true,
          condition: true,
          images: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: items });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 }
    );
  }

  const { productId } = await request.json();

  if (!productId) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Product ID required" } },
      { status: 400 }
    );
  }

  // Upsert to prevent duplicates
  const item = await db.wishlist.upsert({
    where: {
      userId_productId: {
        userId: session.user.id,
        productId,
      },
    },
    create: {
      userId: session.user.id,
      productId,
    },
    update: {},
  });

  return NextResponse.json({ data: item }, { status: 201 });
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
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Product ID required" } },
      { status: 400 }
    );
  }

  await db.wishlist.deleteMany({
    where: {
      userId: session.user.id,
      productId,
    },
  });

  return NextResponse.json({ data: { message: "Removed from wishlist" } });
}