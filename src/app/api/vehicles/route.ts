import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Get all unique makes with product counts
    const vehicles = await db.vehicle.findMany({
      select: {
        make: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    // Aggregate by make
    const makeMap = new Map<string, number>();
    for (const v of vehicles) {
      const current = makeMap.get(v.make) || 0;
      makeMap.set(v.make, current + v._count.products);
    }

    const data = Array.from(makeMap.entries())
      .map(([make, count]) => ({ make, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/vehicles error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch vehicle makes" } },
      { status: 500 }
    );
  }
}