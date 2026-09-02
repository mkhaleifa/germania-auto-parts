import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { OrderLookupContent } from "@/components/checkout/order-lookup-content";

export const metadata: Metadata = {
  title: "Order Lookup",
  description: "Look up your order status using your email and order number.",
};

export default function OrderLookupPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <Breadcrumbs items={[{ label: "Order Lookup" }]} />
      <div className="mt-6">
        <OrderLookupContent />
      </div>
    </div>
  );
}