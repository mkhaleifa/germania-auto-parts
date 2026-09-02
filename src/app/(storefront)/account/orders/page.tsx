import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export const metadata = {
  title: "Orders",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  AWAITING_PAYMENT: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  PROCESSING: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  SHIPPED: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  DELIVERED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  REFUNDED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

interface OrdersPageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const user = await requireAuth();
  const params = await searchParams;
  const statusFilter = params.status;
  const page = Math.max(1, Number(params.page) || 1);
  const perPage = 10;

  const where = {
    userId: user.id,
    ...(statusFilter ? { status: statusFilter as never } : {}),
  };

  const [orders, totalCount] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: { _count: { select: { items: true } } },
    }),
    db.order.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / perPage);

  const statuses = [
    "PENDING", "AWAITING_PAYMENT", "CONFIRMED", "PROCESSING",
    "SHIPPED", "DELIVERED", "CANCELLED",
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Orders</h1>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        <Link href="/account/orders">
          <Badge
            variant={!statusFilter ? "default" : "outline"}
            className="cursor-pointer"
          >
            All
          </Badge>
        </Link>
        {statuses.map((s) => (
          <Link key={s} href={`/account/orders?status=${s}`}>
            <Badge
              variant={statusFilter === s ? "default" : "outline"}
              className="cursor-pointer"
            >
              {s.replace(/_/g, " ")}
            </Badge>
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No orders found.</p>
            <Link href="/products">
              <Button variant="outline" className="mt-3">
                Browse Products
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="p-3 font-medium">Order #</th>
                      <th className="p-3 font-medium">Date</th>
                      <th className="p-3 font-medium">Items</th>
                      <th className="p-3 font-medium">Total</th>
                      <th className="p-3 font-medium">Status</th>
                      <th className="p-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b last:border-0">
                        <td className="p-3 font-mono text-sm">{order.orderNumber}</td>
                        <td className="p-3 text-sm">
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="p-3 text-sm">{order._count.items}</td>
                        <td className="p-3 text-sm font-medium">
                          {formatPrice(Number(order.total))}
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              statusColors[order.status] || ""
                            }`}
                          >
                            {order.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="p-3">
                          <Link href={`/account/orders/${order.id}`}>
                            <Button variant="ghost" size="sm">
                              View
                              <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* Mobile cards */}
          <div className="space-y-2 md:hidden">
            {orders.map((order) => (
              <Link key={order.id} href={`/account/orders/${order.id}`}>
                <Card className="transition-colors hover:bg-accent/50">
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-sm font-medium">
                        {order.orderNumber}
                      </p>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          statusColors[order.status] || ""
                        }`}
                      >
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span>{formatPrice(Number(order.total))}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/account/orders?${statusFilter ? `status=${statusFilter}&` : ""}page=${p}`}
                >
                  <Button
                    variant={p === page ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    {p}
                  </Button>
                </Link>
              ))}
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, totalCount)} of {totalCount} orders
          </p>
        </>
      )}
    </div>
  );
}