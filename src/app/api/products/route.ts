import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { productFilterSchema } from "@/lib/validators/product";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = productFilterSchema.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid filter parameters", details: parsed.error.format() } },
        { status: 400 }
      );
    }

    const {
      page,
      pageSize,
      sort,
      category,
      condition,
      minPrice,
      maxPrice,
      brand,
      search,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      isFeatured,
    } = parsed.data;

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      status: "ACTIVE",
    };

    if (category) {
      where.category = { slug: category };
    }

    if (condition) {
      where.condition = condition;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (brand) {
      where.brand = { equals: brand, mode: "insensitive" };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { partNumbers: { some: { number: { contains: search, mode: "insensitive" } } } },
      ];
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    // Vehicle filter
    if (vehicleMake || vehicleModel || vehicleYear) {
      const vehicleWhere: Prisma.VehicleWhereInput = {};
      if (vehicleMake) vehicleWhere.make = { equals: vehicleMake, mode: "insensitive" };
      if (vehicleModel) vehicleWhere.model = { equals: vehicleModel, mode: "insensitive" };
      if (vehicleYear) {
        vehicleWhere.yearStart = { lte: vehicleYear };
        vehicleWhere.yearEnd = { gte: vehicleYear };
      }
      where.vehicles = { some: { vehicle: vehicleWhere } };
    }

    // Sort
    let orderBy: Prisma.ProductOrderByWithRelationInput;
    switch (sort) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "title":
        orderBy = { title: "asc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    const [products, totalCount] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
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

    // Convert Decimal to number for JSON serialization
    const data = products.map((p) => ({
      ...p,
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
    }));

    return NextResponse.json({
      data,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch products" } },
      { status: 500 }
    );
  }
}