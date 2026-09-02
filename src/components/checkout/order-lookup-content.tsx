"use client";

import { useState } from "react";
import { Search, Package, Loader2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/seperator";
import { formatPrice } from "@/lib/utils";

interface OrderResult {
  orderNumber: string;
  status: string;
  total: number;
  currency: string;
  paymentMethod: string;
  trackingNumber: string | null;
  trackingCarrier: string | null;
  shippingName: string;
  shippingCountry: string;
  createdAt: string;
  items: { title: string; quantity: number; price: number }[];
}

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: { label: "Pending", variant: "secondary" },
  AWAITING_PAYMENT: { label: "Awaiting Payment", variant: "outline" },
  CONFIRMED: { label: "Confirmed", variant: "default" },
  PROCESSING: { label: "Processing", variant: "default" },
  SHIPPED: { label: "Shipped", variant: "default" },
  DELIVERED: { label: "Delivered", variant: "default" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
  REFUNDED: { label: "Refunded", variant: "secondary" },
};

export function OrderLookupContent() {
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [result, setResult] = useState<OrderResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !orderNumber) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(
        `/api/orders/lookup?email=${encodeURIComponent(email)}&order=${encodeURIComponent(orderNumber)}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || "Order not found");
        return;
      }

      setResult(data.data);
    } catch {
      setError("Failed to look up order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="text-center">
        <h1 className="text-2xl font-bold md:text-3xl">Order Lookup</h1>
        <p className="mt-2 text-muted-foreground">
          Enter your email and order number to check your order status.
        </p>
      </div>

      <Card className="mt-8">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="lookup-email">Email address</Label>
              <Input
                id="lookup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="lookup-order">Order number</Label>
              <Input
                id="lookup-order"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="AHF-20260413-001"
                className="font-mono"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Look Up Order
            </Button>
          </form>

          {error && (
            <p className="mt-4 text-center text-sm text-red-600">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-lg font-bold">{result.orderNumber}</h2>
              <Badge variant={STATUS_LABELS[result.status]?.variant || "secondary"}>
                {STATUS_LABELS[result.status]?.label || result.status}
              </Badge>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Placed on {new Date(result.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            {/* Tracking */}
            {result.trackingNumber && (
              <div className="mt-4 flex items-center gap-2 rounded-md border p-3 text-sm">
                <Truck className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">
                    {result.trackingCarrier || "Shipping"}: {result.trackingNumber}
                  </p>
                </div>
              </div>
            )}

            <Separator className="my-4" />

            {/* Items */}
            <div className="space-y-2">
              {result.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Package className="h-3.5 w-3.5 text-muted-foreground" />
                    {item.title} x{item.quantity}
                  </span>
                  <span className="font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatPrice(result.total)}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}