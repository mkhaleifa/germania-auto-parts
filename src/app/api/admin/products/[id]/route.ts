import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { productUpdateSchema } from "@/lib/validators/product";

export async function GET(
  _request: NextRequest,
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

  const product = await db.product.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
      partNumbers: true,
      images: { orderBy: { sortOrder: "asc" } },
      vehicles: {
        include: {
          vehicle: { select: { id: true, make: true, model: true, yearStart: true, yearEnd: true } },
        },
      },
    },
  });

  if (!product) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Product not found" } },
      { status: 404 }
    );
  }

  return NextResponse.json({
    data: {
      ...product,
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      weight: product.weight ? Number(product.weight) : null,
      isFeatured: product.isFeatured,
      featured: product.isFeatured,
      metaDescription: product.description || "",
      images: product.images.map((img) => img.url),
      vehicles: product.vehicles.map((pv) => pv.vehicle),
    },
  });
}

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
  const parsed = productUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid data", details: parsed.error.format() } },
      { status: 400 }
    );
  }

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Product not found" } },
      { status: 404 }
    );
  }

  const { vehicleIds, partNumbers, tags, images, ...productData } = parsed.data;

  // Check slug uniqueness if changed
  if (productData.slug && productData.slug !== existing.slug) {
    const slugExists = await db.product.findFirst({
      where: { slug: productData.slug, id: { not: id } },
    });
    if (slugExists) {
      return NextResponse.json(
        { error: { code: "SLUG_EXISTS", message: "A product with this slug already exists" } },
        { status: 409 }
      );
    }
  }

  await db.$transaction(async (tx) => {
    // Update product
    await tx.product.update({
      where: { id },
      data: {
        ...productData,
        ...(tags !== undefined ? { tags } : {}),
      },
    });

    // Update images if provided
    if (images !== undefined) {
      await tx.productImage.deleteMany({ where: { productId: id } });
      if (images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((url: string, index: number) => ({
            productId: id,
            url,
            alt: productData.title || "Product image",
            sortOrder: index,
          })),
        });
      }
    }

    // Update part numbers if provided
    if (partNumbers !== undefined) {
      await tx.partNumber.deleteMany({ where: { productId: id } });
      if (partNumbers.length > 0) {
        await tx.partNumber.createMany({
          data: partNumbers.map((pn) => ({
            productId: id,
            number: pn.number,
            type: pn.type,
          })),
        });
      }
    }

    // Update vehicle compatibility if provided
    if (vehicleIds !== undefined) {
      await tx.productVehicle.deleteMany({ where: { productId: id } });
      if (vehicleIds.length > 0) {
        await tx.productVehicle.createMany({
          data: vehicleIds.map((vehicleId) => ({
            productId: id,
            vehicleId,
          })),
        });
      }
    }
  });

  // Revalidate product and category pages
  const updated = await db.product.findUnique({
    where: { id },
    select: { slug: true, category: { select: { slug: true } } },
  });
  if (updated) {
    revalidatePath(`/products/${updated.slug}`);
    revalidatePath(`/categories/${updated.category.slug}`);
    revalidatePath("/products");
  }

  return NextResponse.json({ data: { message: "Product updated" } });
}

export async function DELETE(
  _request: NextRequest,
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

  // Soft delete - set to ARCHIVED
  await db.product.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });

  return NextResponse.json({ data: { message: "Product archived" } });
}