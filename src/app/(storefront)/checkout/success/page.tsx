import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderConfirmationContent } from "@/components/checkout/order-confirmation";
import { CartClearer } from "@/components/checkout/cart-clearer";

export const metadata: Metadata = {
  title: "Order Confirmation",
  description: "Your order has been placed successfully.",
};

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <>
      <CartClearer />
      <Suspense
        fallback={
          <div className="flex min-h-[60vh] items-center justify-center">
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        }
      >
        <OrderConfirmationContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}