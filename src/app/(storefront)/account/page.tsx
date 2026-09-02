import Link from "next/link";
import { ArrowRight, Package, Heart } from "lucide-react";
import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export const metadata = {
  title: "Overview",
};

export default async function AccountOverviewPage() {
  const user = await requireAuth();

  const [recentOrders, wishlistItems] = await Promise.all([
    db.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { _count: { select: { items: true } } },
    }),
    db.wishlist.findMany({
      where: { userId: user.id },
      take: 3,
      include: {
        product: {
          select: { title: true, slug: true, price: true, images: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">My Account</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name || "there"}!
        </p>
      </div>

      {/* Recent Orders */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Package className="h-5 w-5" />
            Recent Orders
          </h2>
          <Link href="/account/orders" className="text-sm text-primary hover:underline">
            View All Orders
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <Card className="mt-3">
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>No orders yet.</p>
              <Link href="/products">
                <Button variant="outline" className="mt-3">
                  Browse Products
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-3 space-y-2">
            {recentOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-mono text-sm font-medium">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {order.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatPrice(Number(order.total))}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order._count.items} {order._count.items === 1 ? "item" : "items"}
                      </p>
                    </div>
                    <Link href={`/account/orders/${order.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Wishlist Preview */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Heart className="h-5 w-5" />
            Wishlist
            {wishlistItems.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({wishlistItems.length} items)
              </span>
            )}
          </h2>
          <Link href="/account/wishlist" className="text-sm text-primary hover:underline">
            View Wishlist
          </Link>
        </div>

        {wishlistItems.length === 0 ? (
          <Card className="mt-3">
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>Your wishlist is empty.</p>
              <Link href="/products">
                <Button variant="outline" className="mt-3">
                  Browse Products
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {wishlistItems.map((item) => (
              <Link
                key={item.id}
                href={`/products/${item.product.slug}`}
              >
                <Card className="transition-colors hover:bg-accent/50">
                  <CardContent className="py-3">
                    <p className="truncate text-sm font-medium">
                      {item.product.title}
                    </p>
                    <p className="text-sm font-semibold text-primary">
                      {formatPrice(Number(item.product.price))}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}