"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, Lock, Truck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/seperator";
import { EmptyState } from "@/components/ui/empty-state";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";

const COUNTRIES = [
  "Japan",
  "Pakistan",
  "United States",
  "United Kingdom",
  "Australia",
  "Canada",
  "Germany",
  "United Arab Emirates",
  "Saudi Arabia",
  "Other",
];

interface ValidationWarning {
  productId: string;
  message: string;
}

export function CartPageContent() {
  const { items, removeItem, updateQuantity, getTotal, getItemCount, clearCart } =
    useCartStore();
  const [shippingCountry, setShippingCountry] = useState("Japan");
  const [shippingCost, setShippingCost] = useState(0);
  const [freeShipping, setFreeShipping] = useState(false);
  const [tax, setTax] = useState(0);
  const [warnings, setWarnings] = useState<ValidationWarning[]>([]);
  const [validating, setValidating] = useState(false);

  const subtotal = getTotal();
  const itemCount = getItemCount();
  const total = subtotal + shippingCost + tax;

  // Validate cart on mount
  useEffect(() => {
    if (items.length === 0) return;

    async function validateCart() {
      setValidating(true);
      try {
        const res = await fetch("/api/cart/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
            })),
          }),
        });
        const data = await res.json();
        if (!data.valid && data.items) {
          const newWarnings: ValidationWarning[] = [];
          for (const item of data.items) {
            if (!item.available) {
              newWarnings.push({
                productId: item.productId,
                message: "This item is no longer available",
              });
            } else if (item.stockInsufficient) {
              newWarnings.push({
                productId: item.productId,
                message: `Only ${item.currentStock} left in stock`,
              });
            }
          }
          setWarnings(newWarnings);
        }
      } catch {
        // Silently fail validation
      } finally {
        setValidating(false);
      }
    }

    validateCart();
  }, [items]);

  // Estimate shipping when country or subtotal changes
  useEffect(() => {
    async function estimateShipping() {
      try {
        const res = await fetch(
          `/api/shipping/estimate?country=${encodeURIComponent(shippingCountry)}&subtotal=${subtotal}&weight=2`
        );
        const data = await res.json();
        if (data.data) {
          setShippingCost(data.data.shippingCost);
          setFreeShipping(data.data.freeShipping);
          setTax(data.data.tax);
        }
      } catch {
        // Use default
      }
    }

    if (items.length > 0) {
      estimateShipping();
    }
  }, [shippingCountry, subtotal, items.length]);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Looks like you haven't added any parts yet. Browse our catalog to find the right parts for your vehicle."
        actionLabel="Start Shopping"
        actionHref="/products"
      />
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold md:text-3xl">
        Shopping Cart ({itemCount} {itemCount === 1 ? "item" : "items"})
      </h1>

      {/* Validation warnings */}
      {warnings.length > 0 && (
        <div className="mt-4 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>
            <p className="font-medium">Some items in your cart have changed</p>
            <ul className="mt-1 list-inside list-disc">
              {warnings.map((w) => (
                <li key={w.productId}>{w.message}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Cart Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.productId}>
              <CardContent className="flex gap-4 p-4">
                {/* Image */}
                <Link
                  href={`/products/${item.slug}`}
                  className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted"
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="flex flex-1 flex-col">
                  <Link
                    href={`/products/${item.slug}`}
                    className="text-sm font-semibold hover:text-primary"
                  >
                    {item.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.condition === "NEW" ? "New" : `Used — ${item.condition.replace("_", " ")}`}
                  </p>
                  <p className="mt-1 text-sm font-bold text-primary">
                    {formatPrice(item.price)}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-2">
                    {/* Quantity */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={item.quantity >= item.maxStock}
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Line total + remove */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(item.productId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" render={<Link href="/products" />}>
              Continue Shopping
            </Button>
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-destructive"
              onClick={clearCart}
            >
              Clear Cart
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-24">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold">Order Summary</h2>

              {/* Shipping estimator */}
              <div className="mt-4">
                <label className="text-sm font-medium">Estimate Shipping</label>
                <Select
                  value={shippingCountry}
                  onValueChange={(val: string | null) =>
                    setShippingCountry(val || "Japan")
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator className="my-4" />

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    {freeShipping ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span className="font-medium">{formatPrice(tax)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {freeShipping && (
                <div className="mt-3 flex items-center gap-2 text-xs text-green-600">
                  <Truck className="h-3.5 w-3.5" />
                  Your order qualifies for free shipping!
                </div>
              )}

              <Button
                className="mt-6 w-full"
                size="lg"
                render={<Link href="/checkout" />}
              >
                Proceed to Checkout
              </Button>

              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                Secure checkout via Stripe
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}