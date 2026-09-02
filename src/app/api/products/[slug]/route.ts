import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await db.product.findUnique({
      where: { slug, status: "ACTIVE" },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        partNumbers: true,
        category: { select: { id: true, name: true, slug: true } },
        vehicles: {
          include: {
            vehicle: true,
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

    // Get related products (same category, excluding current)
    const relatedProducts = await db.product.findMany({
      where: {
        status: "ACTIVE",
        categoryId: product.categoryId,
        id: { not: product.id },
      },
      take: 4,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        comparePrice: true,
        condition: true,
        status: true,
        stock: true,
        brand: true,
        isFeatured: true,
        images: {
          orderBy: { sortOrder: "asc" },
          take: 2,
          select: { url: true, alt: true },
        },
        category: {
          select: { name: true, slug: true },
        },
      },
    });

    return NextResponse.json({
      data: {
        ...product,
        price: Number(product.price),
        comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
        weight: product.weight ? Number(product.weight) : null,
      },
      relatedProducts: relatedProducts.map((p) => ({
        ...p,
        price: Number(p.price),
        comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
      })),
    });
  } catch (error) {
    console.error("GET /api/products/[slug] error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch product" } },
      { status: 500 }
    );
  }
}