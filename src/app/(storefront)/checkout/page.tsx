import type { Metadata } from "next";
import { CheckoutContent } from "@/components/checkout/checkout-content";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order — secure checkout.",
};

export default function CheckoutPage() {
  return <CheckoutContent />;
}