import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { CartPageContent } from "@/components/cart/cart-page-content";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Review your cart and proceed to checkout.",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <Breadcrumbs items={[{ label: "Cart" }]} />
      <div className="mt-6">
        <CartPageContent />
      </div>
    </div>
  );
}