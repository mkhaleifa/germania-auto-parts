"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

interface DashboardData {
  stats: {
    todayOrders: number;
    todayRevenue: number;
    monthOrders: number;
    monthRevenue: number;
    pendingOrders: number;
    lowStockCount: number;
    activeProducts: number;
  };
  lowStockProducts: Array<{
    id: string;
    title: string;
    stock: number;
    slug: string;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    status: string;
    total: number;
    itemCount: number;
    paymentMethod: string;
    createdAt: string;
  }>;
  pendingBankTransfers: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    expiresAt: string | null;
    createdAt: string;
  }>;
  revenueByDay: Array<{ date: string; total: number }>;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  AWAITING_PAYMENT: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  PROCESSING: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  SHIPPED: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  DELIVERED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export function DashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((result) => setData(result.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="py-4">
                <div className="h-16 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { stats } = data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="mt-1 text-2xl font-bold">{formatPrice(stats.monthRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Today: {formatPrice(stats.todayRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Orders (Month)</p>
                <p className="mt-1 text-2xl font-bold">{stats.monthOrders}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Today: {stats.todayOrders}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Products</p>
                <p className="mt-1 text-2xl font-bold">{stats.activeProducts}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {stats.pendingOrders} pending orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="mt-1 text-2xl font-bold">{stats.lowStockCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500/50" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Items need restock
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart + Recent Orders */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Revenue (Last 30 Days)</h2>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-4 h-64">
              {data.revenueByDay.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.revenueByDay}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(v) => {
                        const d = new Date(v);
                        return `${d.getMonth() + 1}/${d.getDate()}`;
                      }}
                      className="text-xs"
                    />
                    <YAxis
                      tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`}
                      className="text-xs"
                    />
                    <Tooltip
                      formatter={(value) => [formatPrice(Number(value)), "Revenue"]}
                      labelFormatter={(label) =>
                        new Date(label).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#DC2626"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No revenue data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Recent Orders</h2>
              <Link href="/admin/orders" className="text-xs text-primary hover:underline">
                View All
              </Link>
            </div>
            <div className="mt-3 space-y-3">
              {data.recentOrders.slice(0, 6).map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-accent"
                >
                  <div>
                    <p className="font-mono text-xs">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatPrice(order.total)}</p>
                    <span
                      className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium ${statusColors[order.status] || ""}`}
                    >
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock + Pending Bank Transfers */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Low Stock Alerts
              </h2>
            </div>
            {data.lowStockProducts.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">All products are well stocked.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {data.lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-accent"
                  >
                    <p className="text-sm">{product.title}</p>
                    <Badge
                      variant={product.stock === 0 ? "destructive" : "outline"}
                      className="text-xs"
                    >
                      {product.stock === 0 ? "Out of stock" : `${product.stock} left`}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold">
                <Banknote className="h-4 w-4 text-amber-500" />
                Pending Bank Transfers
              </h2>
            </div>
            {data.pendingBankTransfers.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No pending bank transfers.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {data.pendingBankTransfers.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-accent"
                  >
                    <div>
                      <p className="font-mono text-xs">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{order.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatPrice(order.total)}</p>
                      {order.expiresAt && (
                        <p className="text-[10px] text-muted-foreground">
                          Expires {new Date(order.expiresAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}