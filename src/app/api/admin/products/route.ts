import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bulkProductUpdateSchema } from "@/lib/validators/admin";
import { productCreateSchema } from "@/lib/validators/product";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Admin access required" } },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const perPage = Math.min(100, Number(searchParams.get("perPage")) || 20);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const status = searchParams.get("status") || "";
  const condition = searchParams.get("condition") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
    ];
  }

  if (category) where.categoryId = category;
  if (status) where.status = status;
  if (condition) where.condition = condition;

  const [products, totalCount] = await Promise.all([
    db.product.findMany({
      where: where as never,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        category: { select: { name: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
      },
    }),
    db.product.count({ where: where as never }),
  ]);

  return NextResponse.json({
    data: products.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      sku: p.sku,
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
      stock: p.stock,
      status: p.status,
      condition: p.condition,
      category: p.category?.name || "Uncategorized",
      categoryId: p.categoryId,
      image: p.images[0]?.url || null,
      brand: p.brand,
      featured: p.isFeatured,
      createdAt: p.createdAt,
    })),
    pagination: {
      page,
      perPage,
      totalCount,
      totalPages: Math.ceil(totalCount / perPage),
    },
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
  const parsed = productCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid data", details: parsed.error.format() } },
      { status: 400 }
    );
  }

  const { vehicleIds, partNumbers, tags, images: _images, ...productData } = parsed.data;

  // Check slug uniqueness
  const slugExists = await db.product.findFirst({
    where: { slug: productData.slug },
  });
  if (slugExists) {
    return NextResponse.json(
      { error: { code: "SLUG_EXISTS", message: "A product with this slug already exists" } },
      { status: 409 }
    );
  }

  // Auto-generate SKU if not provided
  if (!productData.sku) {
    const count = await db.product.count();
    productData.sku = `AHF-${String(count + 1).padStart(5, "0")}`;
  }

  const product = await db.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: {
        ...productData,
        tags,
      },
    });

    if (partNumbers.length > 0) {
      await tx.partNumber.createMany({
        data: partNumbers.map((pn) => ({
          productId: created.id,
          number: pn.number,
          type: pn.type,
        })),
      });
    }

    if (vehicleIds.length > 0) {
      await tx.productVehicle.createMany({
        data: vehicleIds.map((vehicleId) => ({
          productId: created.id,
          vehicleId,
        })),
      });
    }

    return created;
  });

  return NextResponse.json({ data: { id: product.id, slug: product.slug } }, { status: 201 });
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
  const parsed = bulkProductUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid data" } },
      { status: 400 }
    );
  }

  const { productIds, status } = parsed.data;

  await db.product.updateMany({
    where: { id: { in: productIds } },
    data: { status: status as never },
  });

  return NextResponse.json({
    data: { message: `${productIds.length} products updated to ${status}` },
  });
}