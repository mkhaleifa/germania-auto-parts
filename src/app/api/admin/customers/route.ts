import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

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
  const perPage = 20;
  const search = searchParams.get("search") || "";

  const where: Record<string, unknown> = {
    role: "CUSTOMER",
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [customers, totalCount] = await Promise.all([
    db.user.findMany({
      where: where as never,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: { select: { orders: true } },
        orders: {
          select: { total: true },
          where: { status: { notIn: ["CANCELLED", "REFUNDED"] } },
        },
      },
    }),
    db.user.count({ where: where as never }),
  ]);

  return NextResponse.json({
    data: customers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      orderCount: c._count.orders,
      totalSpent: c.orders.reduce((sum, o) => sum + Number(o.total), 0),
      createdAt: c.createdAt,
    })),
    pagination: {
      page,
      perPage,
      totalCount,
      totalPages: Math.ceil(totalCount / perPage),
    },
  });
}