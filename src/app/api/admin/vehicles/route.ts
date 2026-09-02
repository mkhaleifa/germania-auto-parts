import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { vehicleSchema } from "@/lib/validators/admin";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Admin access required" } },
      { status: 403 }
    );
  }

  const vehicles = await db.vehicle.findMany({
    orderBy: [{ make: "asc" }, { model: "asc" }, { yearStart: "desc" }],
    include: {
      _count: { select: { products: true } },
    },
  });

  return NextResponse.json({
    data: vehicles.map((v) => ({
      id: v.id,
      make: v.make,
      model: v.model,
      yearStart: v.yearStart,
      yearEnd: v.yearEnd,
      generation: v.generation,
      productCount: v._count.products,
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
  const parsed = vehicleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid data", details: parsed.error.format() } },
      { status: 400 }
    );
  }

  const vehicle = await db.vehicle.create({ data: parsed.data });
  return NextResponse.json({ data: vehicle }, { status: 201 });
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
      { error: { code: "VALIDATION_ERROR", message: "Vehicle ID required" } },
      { status: 400 }
    );
  }

  const parsed = vehicleSchema.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid data" } },
      { status: 400 }
    );
  }

  const vehicle = await db.vehicle.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ data: vehicle });
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
      { error: { code: "VALIDATION_ERROR", message: "Vehicle ID required" } },
      { status: 400 }
    );
  }

  // Check if any products are assigned
  const productCount = await db.productVehicle.count({
    where: { vehicleId: id },
  });

  if (productCount > 0) {
    return NextResponse.json(
      { error: { code: "HAS_PRODUCTS", message: `Cannot delete: ${productCount} products are assigned to this vehicle` } },
      { status: 409 }
    );
  }

  await db.vehicle.delete({ where: { id } });
  return NextResponse.json({ data: { message: "Vehicle deleted" } });
}