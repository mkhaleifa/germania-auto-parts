import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { categorySchema } from "@/lib/validators/admin";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Admin access required" } },
      { status: 403 }
    );
  }

  const categories = await db.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { products: true } },
      parent: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({
    data: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.image,
      parentId: c.parentId,
      parentName: c.parent?.name || null,
      sortOrder: c.sortOrder,
      productCount: c._count.products,
    })),
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Admin access required" } },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = categorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid data", details: parsed.error.format() } },
      { status: 400 }
    );
  }

  // Check slug uniqueness
  const existing = await db.category.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return NextResponse.json(
      { error: { code: "DUPLICATE_SLUG", message: "A category with this slug already exists" } },
      { status: 409 }
    );
  }

  const category = await db.category.create({ data: parsed.data });
  return NextResponse.json({ data: category }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Admin access required" } },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { id, ...rest } = body;

  if (!id) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Category ID required" } },
      { status: 400 }
    );
  }

  const parsed = categorySchema.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid data" } },
      { status: 400 }
    );
  }

  // Check slug uniqueness (exclude current)
  const existing = await db.category.findUnique({ where: { slug: parsed.data.slug } });
  if (existing && existing.id !== id) {
    return NextResponse.json(
      { error: { code: "DUPLICATE_SLUG", message: "A category with this slug already exists" } },
      { status: 409 }
    );
  }

  const category = await db.category.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ data: category });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Admin access required" } },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Category ID required" } },
      { status: 400 }
    );
  }

  const productCount = await db.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    return NextResponse.json(
      { error: { code: "HAS_PRODUCTS", message: `Cannot delete: ${productCount} products are in this category` } },
      { status: 409 }
    );
  }

  await db.category.delete({ where: { id } });
  return NextResponse.json({ data: { message: "Category deleted" } });
}