import Link from "next/link";
import { CheckCircle, Clock, Copy, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/seperator";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { formatPrice } from "@/lib/utils";
import { siteConfig } from "@/config/site";

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getString(val: string | string[] | undefined): string | undefined {
  return typeof val === "string" ? val : undefined;
}

export async function OrderConfirmationContent({ searchParams }: Props) {
  const params = await searchParams;
  const sessionId = getString(params.session_id);
  const orderId = getString(params.orderId);
  const method = getString(params.method);

  let order: Awaited<ReturnType<typeof findOrder>> = null;

  if (orderId) {
    // Bank transfer — find by order ID
    order = await findOrder({ id: orderId });
  } else if (sessionId) {
    // Stripe — find by session ID, or wait for webhook
    order = await findOrder({ stripeSessionId: sessionId });

    // Backup: if webhook hasn't fired yet, check Stripe session
    if (!order) {
      try {
        const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
        if (stripeSession.payment_status === "paid") {
          // Wait a moment and retry (webhook might be in flight)
          await new Promise((resolve) => setTimeout(resolve, 2000));
          order = await findOrder({ stripeSessionId: sessionId });
        }
      } catch {
        // Stripe session not found
      }
    }
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <Clock className="mx-auto h-16 w-16 text-amber-500" />
        <h1 className="mt-4 text-2xl font-bold">Processing Your Order</h1>
        <p className="mt-2 text-muted-foreground">
          Your payment was received. We&apos;re finalizing your order — this
          usually takes a few seconds. Please refresh this page in a moment.
        </p>
        <Button className="mt-6" render={<Link href="/products" />}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  const isBankTransfer = order.paymentMethod === "BANK_TRANSFER";
  const total = Number(order.total);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:px-6">
      {/* Success header */}
      <div className="text-center">
        {isBankTransfer ? (
          <Clock className="mx-auto h-16 w-16 text-amber-500" />
        ) : (
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        )}
        <h1 className="mt-4 text-2xl font-bold md:text-3xl">
          {isBankTransfer ? "Order Placed — Awaiting Payment" : "Thank you for your order!"}
        </h1>
        <p className="mt-2 text-lg font-medium">
          Order <span className="font-mono text-primary">{order.orderNumber}</span>
        </p>
        {(order.guestEmail || order.user?.email) && (
          <p className="mt-1 text-sm text-muted-foreground">
            Confirmation sent to {order.guestEmail || order.user?.email}
          </p>
        )}
      </div>

      {/* Bank transfer details */}
      {isBankTransfer && (
        <Card className="mt-8 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold">Bank Transfer Details</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Please complete the transfer within 72 hours.
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Bank</span>
                <span className="font-medium">{siteConfig.bank.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Account Holder</span>
                <span className="font-medium">{siteConfig.bank.iban}</span>
              </div>
              <div className="flex justify-between">
                <span>Account Number</span>
                <span className="font-mono font-medium">{siteConfig.bank.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount</span>
                <span className="font-bold text-primary">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Reference</span>
                <span className="font-mono font-medium">{order.orderNumber}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order details */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Order Details</h2>
            <Badge variant={isBankTransfer ? "secondary" : "default"}>
              {isBankTransfer ? "Awaiting Payment" : "Confirmed"}
            </Badge>
          </div>

          {/* Items */}
          <div className="mt-4 space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {item.title} x{item.quantity}
                  </span>
                </div>
                <span className="font-medium">
                  {formatPrice(Number(item.price) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(Number(order.subtotal))}</span>
            </div>
            {Number(order.shippingCost) > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatPrice(Number(order.shippingCost))}</span>
              </div>
            )}
            {Number(order.tax) > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatPrice(Number(order.tax))}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Shipping */}
          <div className="text-sm">
            <p className="font-medium">Shipping to</p>
            <p className="mt-1 text-muted-foreground">
              {order.shippingName}<br />
              {order.shippingAddress}<br />
              {order.shippingCity}{order.shippingState ? `, ${order.shippingState}` : ""} {order.shippingZip}<br />
              {order.shippingCountry}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {!isBankTransfer && order.userId && (
          <Button render={<Link href="/account/orders" />}>
            Track Your Order
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
        <Button variant="outline" render={<Link href="/products" />}>
          Continue Shopping
        </Button>
      </div>

      {/* Guest account prompt */}
      {!order.userId && (
        <div className="mt-8 rounded-md border p-4 text-center">
          <p className="text-sm font-medium">
            Create an account to track this order
          </p>
          <Button className="mt-3" variant="outline" render={<Link href="/register" />}>
            Create Account
          </Button>
        </div>
      )}
    </div>
  );
}

async function findOrder(where: { id?: string; stripeSessionId?: string }) {
  try {
    return await db.order.findFirst({
      where,
      include: {
        items: true,
        user: { select: { email: true } },
      },
    });
  } catch {
    return null;
  }
}