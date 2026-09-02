import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ make: string }> }
) {
  try {
    const { make } = await params;
    const decodedMake = decodeURIComponent(make);

    const vehicles = await db.vehicle.findMany({
      where: { make: { equals: decodedMake, mode: "insensitive" } },
      select: {
        model: true,
        yearStart: true,
        yearEnd: true,
        generation: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: { model: "asc" },
    });

    // Aggregate by model
    const modelMap = new Map<
      string,
      { model: string; yearStart: number; yearEnd: number; generation: string | null; count: number }
    >();

    for (const v of vehicles) {
      const existing = modelMap.get(v.model);
      if (existing) {
        existing.yearStart = Math.min(existing.yearStart, v.yearStart);
        existing.yearEnd = Math.max(existing.yearEnd, v.yearEnd);
        existing.count += v._count.products;
      } else {
        modelMap.set(v.model, {
          model: v.model,
          yearStart: v.yearStart,
          yearEnd: v.yearEnd,
          generation: v.generation,
          count: v._count.products,
        });
      }
    }

    const data = Array.from(modelMap.values()).sort((a, b) => b.count - a.count);

    return NextResponse.json({ data, make: decodedMake });
  } catch (error) {
    console.error("GET /api/vehicles/[make] error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch vehicle models" } },
      { status: 500 }
    );
  }
}