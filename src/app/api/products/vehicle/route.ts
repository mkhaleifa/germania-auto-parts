import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod/v4";

const vehicleFilterSchema = z.object({
  make: z.string().min(1),
  model: z.string().optional(),
  year: z.coerce.number().int().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = vehicleFilterSchema.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Make is required" } },
        { status: 400 }
      );
    }

    const { make, model, year, page, pageSize } = parsed.data;

    const vehicleWhere: Record<string, unknown> = {
      make: { equals: make, mode: "insensitive" },
    };
    if (model) vehicleWhere.model = { equals: model, mode: "insensitive" };
    if (year) {
      vehicleWhere.yearStart = { lte: year };
      vehicleWhere.yearEnd = { gte: year };
    }

    const where = {
      status: "ACTIVE" as const,
      vehicles: { some: { vehicle: vehicleWhere } },
    };

    const [products, totalCount] = await Promise.all([
      db.product.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
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
      }),
      db.product.count({ where }),
    ]);

    const data = products.map((p) => ({
      ...p,
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
    }));

    return NextResponse.json({
      data,
      vehicle: { make, model, year },
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    console.error("GET /api/products/vehicle error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch vehicle products" } },
      { status: 500 }
    );
  }
}