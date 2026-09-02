import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Truck } from "lucide-react";
import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/seperator";
import { formatPrice } from "@/lib/utils";

export const metadata = {
  title: "Order Detail",
};

const ORDER_STEPS = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

const stepLabels: Record<string, string> = {
  PENDING: "Placed",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
};

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const user = await requireAuth();
  const { id } = await params;

  const order = await db.order.findFirst({
    where: { id, userId: user.id },
    include: {
      items: {
        include: {
          product: { select: { slug: true } },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const isCancelled = order.status === "CANCELLED" || order.status === "REFUNDED";
  const currentStepIndex = ORDER_STEPS.indexOf(order.status as typeof ORDER_STEPS[number]);

  return (
    <div className="space-y-6">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to Orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold">
            Order <span className="font-mono">{order.orderNumber}</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Placed{" "}
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <Badge variant={isCancelled ? "destructive" : "outline"} className="text-sm">
          {order.status.replace(/_/g, " ")}
        </Badge>
      </div>

      {/* Status Timeline */}
      {!isCancelled && currentStepIndex >= 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              {ORDER_STEPS.map((step, i) => {
                const isCompleted = i <= currentStepIndex;
                const isCurrent = i === currentStepIndex;
                return (
                  <div key={step} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                          isCompleted
                            ? "bg-primary text-primary-foreground"
                            : "border-2 border-muted-foreground/30 text-muted-foreground/30"
                        } ${isCurrent ? "ring-2 ring-primary/30" : ""}`}
                      >
                        {isCompleted ? "\u2713" : i + 1}
                      </div>
                      <span
                        className={`mt-1 text-[10px] sm:text-xs ${
                          isCompleted ? "font-medium" : "text-muted-foreground"
                        }`}
                      >
                        {stepLabels[step]}
                      </span>
                    </div>
                    {i < ORDER_STEPS.length - 1 && (
                      <div
                        className={`mx-1 h-0.5 flex-1 ${
                          i < currentStepIndex ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Items */}
      <Card>
        <CardContent className="p-0">
          <div className="p-4">
            <h2 className="font-semibold">Items</h2>
          </div>
          <Separator />
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 border-b p-4 last:border-0">
              {item.image && (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                {item.product?.slug ? (
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="text-sm font-medium hover:text-primary"
                  >
                    {item.title}
                  </Link>
                ) : (
                  <p className="text-sm font-medium">{item.title}</p>
                )}
                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-medium">
                {formatPrice(Number(item.price) * item.quantity)}
              </p>
            </div>
          ))}

          <Separator />
          <div className="space-y-1 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{formatPrice(Number(order.shippingCost))}</span>
            </div>
            {Number(order.tax) > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatPrice(Number(order.tax))}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatPrice(Number(order.total))}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping & Payment Info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="py-4">
            <h3 className="mb-2 font-semibold">Shipping To</h3>
            <p className="text-sm">{order.shippingName}</p>
            <p className="text-sm text-muted-foreground">{order.shippingAddress}</p>
            <p className="text-sm text-muted-foreground">
              {order.shippingCity}
              {order.shippingState ? `, ${order.shippingState}` : ""}{" "}
              {order.shippingZip}
            </p>
            <p className="text-sm text-muted-foreground">{order.shippingCountry}</p>
            {order.shippingPhone && (
              <p className="mt-1 text-sm text-muted-foreground">{order.shippingPhone}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <h3 className="mb-2 font-semibold">Payment</h3>
            <p className="text-sm">
              {order.paymentMethod === "STRIPE" ? "Credit Card (Stripe)" : "Bank Transfer"}
            </p>

            {order.trackingNumber && (
              <div className="mt-4">
                <h3 className="mb-1 flex items-center gap-1 font-semibold">
                  <Truck className="h-4 w-4" />
                  Tracking
                </h3>
                <p className="font-mono text-sm">
                  {order.trackingCarrier && (
                    <span className="text-muted-foreground">{order.trackingCarrier}: </span>
                  )}
                  {order.trackingNumber}
                </p>
              </div>
            )}

            {!order.trackingNumber && order.status === "SHIPPED" && (
              <p className="mt-2 text-xs text-muted-foreground italic">
                Tracking info will be available soon.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link href="/contact">
          <Button variant="outline">Contact Support</Button>
        </Link>
      </div>
    </div>
  );
}