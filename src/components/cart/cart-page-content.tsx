'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Lock,
  Truck,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
// NOTE: rename the file to "separator.tsx" and fix this path when you can
import { Separator } from '@/components/ui/seperator'
import { EmptyState } from '@/components/ui/empty-state'
import { useCartStore } from '@/stores/cart-store'
import { formatPrice } from '@/lib/utils'

const COUNTRIES = [
  'Germany',
  'United Kingdom',
  'United States',
  'Canada',
  'Australia',
  'United Arab Emirates',
  'Saudi Arabia',
  'Japan',
  'Pakistan',
  'Other',
]

const DEFAULT_COUNTRY = 'Germany'

interface CartWarning {
  productId: string
  message: string
  /** blocking warnings disable the checkout button */
  blocking: boolean
}

export function CartPageContent() {
  const {
    items,
    removeItem,
    updateQuantity,
    getTotal,
    getItemCount,
    clearCart,
  } = useCartStore()
  const [shippingCountry, setShippingCountry] = useState(DEFAULT_COUNTRY)
  const [shippingCost, setShippingCost] = useState(0)
  const [freeShipping, setFreeShipping] = useState(false)
  const [shippingError, setShippingError] = useState(false)
  const [tax, setTax] = useState(0)
  const [warnings, setWarnings] = useState<CartWarning[]>([])
  const [validating, setValidating] = useState(false)

  const subtotal = getTotal()
  const itemCount = getItemCount()
  const total = subtotal + shippingCost + tax
  const checkoutBlocked = warnings.some((w) => w.blocking)

  // Validate cart whenever it changes (debounced, cancels stale requests)
  useEffect(() => {
    if (items.length === 0) {
      setWarnings([])
      setValidating(false)
      return
    }

    const controller = new AbortController()

    const timer = setTimeout(async () => {
      setValidating(true)
      try {
        const res = await fetch('/api/cart/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            items: items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
            })),
          }),
        })
        if (!res.ok) return
        const data = await res.json()

        // Always rebuild warnings so old ones disappear once fixed
        const next: CartWarning[] = []
        for (const v of data.items ?? []) {
          const stored = items.find((i) => i.productId === v.productId)
          const name = stored?.title ?? 'Item'

          if (!v.available) {
            next.push({
              productId: v.productId,
              message: `${name} is no longer available`,
              blocking: true,
            })
          } else if (v.stockInsufficient) {
            next.push({
              productId: v.productId,
              message: `${name}: only ${v.currentStock} left in stock`,
              blocking: true,
            })
          } else if (
            stored &&
            Math.abs(stored.price - v.currentPrice) > 0.001
          ) {
            next.push({
              productId: v.productId,
              message: `${name}: price updated to ${formatPrice(v.currentPrice)}`,
              blocking: false,
            })
          }
        }
        if (!controller.signal.aborted) setWarnings(next)
      } catch {
        // Aborted or network error: keep the current warnings
      } finally {
        if (!controller.signal.aborted) setValidating(false)
      }
    }, 300)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [items])

  // Estimate shipping when country or subtotal changes
  useEffect(() => {
    if (items.length === 0) return

    const controller = new AbortController()

    async function estimateShipping() {
      try {
        // TODO: calculate weight from the cart items if your schema has it
        const res = await fetch(
          `/api/shipping/estimate?country=${encodeURIComponent(shippingCountry)}&subtotal=${subtotal}&weight=2`,
          { signal: controller.signal },
        )
        if (!res.ok) throw new Error('Shipping estimate failed')
        const data = await res.json()
        if (data.data) {
          setShippingCost(data.data.shippingCost)
          setFreeShipping(data.data.freeShipping)
          setTax(data.data.tax)
          setShippingError(false)
        }
      } catch (e) {
        if ((e as Error).name === 'AbortError') return
        setShippingError(true)
        setShippingCost(0)
        setFreeShipping(false)
        setTax(0)
      }
    }

    estimateShipping()
    return () => controller.abort()
  }, [shippingCountry, subtotal, items.length])

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Looks like you haven't added any parts yet. Browse our catalog to find the right parts for your vehicle."
        actionLabel="Start Shopping"
        actionHref="/products"
      />
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold md:text-3xl">
        Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
      </h1>

      {/* Validation warnings */}
      {warnings.length > 0 && (
        <div className="mt-4 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>
            <p className="font-medium">Some items in your cart have changed</p>
            <ul className="mt-1 list-inside list-disc">
              {warnings.map((w) => (
                <li key={`${w.productId}-${w.message}`}>{w.message}</li>
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
                    {item.condition === 'NEW'
                      ? 'New'
                      : `Used — ${item.condition.replaceAll('_', ' ')}`}
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
                        aria-label={`Decrease quantity of ${item.title}`}
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
                        aria-label={`Increase quantity of ${item.title}`}
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
                        aria-label={`Remove ${item.title}`}
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
            <Button variant="outline" render={<Link href="/products" />} nativeButton={false}>
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
                    setShippingCountry(val || DEFAULT_COUNTRY)
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
                    {shippingError ? (
                      <span className="text-muted-foreground">
                        Calculated at checkout
                      </span>
                    ) : freeShipping ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">{formatPrice(tax)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {freeShipping && !shippingError && (
                <div className="mt-3 flex items-center gap-2 text-xs text-green-600">
                  <Truck className="h-3.5 w-3.5" />
                  Your order qualifies for free shipping!
                </div>
              )}

              {checkoutBlocked ? (
                <Button className="mt-6 w-full" size="lg" disabled>
                  Fix cart issues to continue
                </Button>
              ) : (
                <Button
                  className="mt-6 w-full"
                  size="lg"
                  disabled={validating}
                  nativeButton={false}
                  render={<Link href="/checkout" />}
                >
                  Proceed to Checkout
                </Button>
              )}

              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                Secure checkout via Stripe
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
