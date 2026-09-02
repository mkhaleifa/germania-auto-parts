import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { STOCK_LOW_THRESHOLD } from "@/lib/constant";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Admin access required" } },
      { status: 403 }
    );
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    todayOrders,
    todayRevenue,
    monthOrders,
    monthRevenue,
    pendingOrders,
    lowStockProducts,
    recentOrders,
    pendingBankTransfers,
    activeProducts,
    revenueByDay,
  ] = await Promise.all([
    // Today's orders
    db.order.count({
      where: { createdAt: { gte: todayStart } },
    }),
    // Today's revenue
    db.order.aggregate({
      where: {
        createdAt: { gte: todayStart },
        status: { notIn: ["CANCELLED", "REFUNDED"] },
      },
      _sum: { total: true },
    }),
    // This month's orders
    db.order.count({
      where: { createdAt: { gte: monthStart } },
    }),
    // This month's revenue
    db.order.aggregate({
      where: {
        createdAt: { gte: monthStart },
        status: { notIn: ["CANCELLED", "REFUNDED"] },
      },
      _sum: { total: true },
    }),
    // Pending orders count
    db.order.count({
      where: { status: { in: ["PENDING", "AWAITING_PAYMENT", "CONFIRMED"] } },
    }),
    // Low stock products
    db.product.findMany({
      where: {
        stock: { lte: STOCK_LOW_THRESHOLD },
        status: "ACTIVE",
      },
      select: { id: true, title: true, stock: true, slug: true },
      orderBy: { stock: "asc" },
      take: 10,
    }),
    // Recent orders
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { items: true } },
      },
    }),
    // Pending bank transfers
    db.order.findMany({
      where: {
        paymentMethod: "BANK_TRANSFER",
        status: "AWAITING_PAYMENT",
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        total: true,
        guestEmail: true,
        paymentExpiresAt: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
    // Active products count
    db.product.count({ where: { status: "ACTIVE" } }),
    // Revenue by day (last 30 days)
    db.$queryRaw<Array<{ date: string; total: string }>>`
      SELECT
        TO_CHAR("createdAt", 'YYYY-MM-DD') as date,
        COALESCE(SUM("total"), 0)::text as total
      FROM "Order"
      WHERE "createdAt" >= ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
        AND "status" NOT IN ('CANCELLED', 'REFUNDED')
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM-DD')
      ORDER BY date
    `,
  ]);

  return NextResponse.json({
    data: {
      stats: {
        todayOrders,
        todayRevenue: Number(todayRevenue._sum.total) || 0,
        monthOrders,
        monthRevenue: Number(monthRevenue._sum.total) || 0,
        pendingOrders,
        lowStockCount: lowStockProducts.length,
        activeProducts,
      },
      lowStockProducts,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.user?.name || o.guestEmail || "Guest",
        status: o.status,
        total: Number(o.total),
        itemCount: o._count.items,
        paymentMethod: o.paymentMethod,
        createdAt: o.createdAt,
      })),
      pendingBankTransfers: pendingBankTransfers.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.user?.name || o.guestEmail || "Guest",
        total: Number(o.total),
        expiresAt: o.paymentExpiresAt,
        createdAt: o.createdAt,
      })),
      revenueByDay: revenueByDay.map((d) => ({
        date: d.date,
        total: Number(d.total),
      })),
    },
  });
}