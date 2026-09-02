import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod/v4";

const searchParamsSchema = z.object({
  q: z.string().min(1, "Search query is required"),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  page: z.coerce.number().int().min(1).default(1),
});

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = searchParamsSchema.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid search parameters" } },
        { status: 400 }
      );
    }

    const { q, limit, page } = parsed.data;

    // Search in part numbers (exact-ish match — highest priority)
    const partNumberMatches = await db.product.findMany({
      where: {
        status: "ACTIVE",
        partNumbers: {
          some: { number: { contains: q, mode: "insensitive" } },
        },
      },
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

    const partNumberIds = new Set(partNumberMatches.map((p) => p.id));

    // Full-text keyword search (title, description, brand)
    const keywordMatches = await db.product.findMany({
      where: {
        status: "ACTIVE",
        id: { notIn: Array.from(partNumberIds) },
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { brand: { contains: q, mode: "insensitive" } },
          { tags: { has: q.toLowerCase() } },
        ],
      },
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

    // Merge: part number matches first, then keyword matches
    const allResults = [...partNumberMatches, ...keywordMatches];
    const totalCount = allResults.length;
    const paginatedResults = allResults.slice((page - 1) * limit, page * limit);

    const data = paginatedResults.map((p) => ({
      ...p,
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
    }));

    return NextResponse.json({
      data,
      query: q,
      pagination: {
        page,
        pageSize: limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/products/search error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to search products" } },
      { status: 500 }
    );
  }
}