import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { QuoteForm } from "@/components/checkout/quote-form";

export const metadata: Metadata = {
  title: "Request a Quote",
  description:
    "Request a bulk quote for GDM auto parts. We'll respond within 24 hours with pricing and availability.",
};

export default function QuotePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <Breadcrumbs items={[{ label: "Request a Quote" }]} />
      <div className="mx-auto mt-6 max-w-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold md:text-3xl">Request a Bulk Quote</h1>
          <p className="mt-2 text-muted-foreground">
            Need parts in quantity? Fill out the form below and we&apos;ll get back to
            you within 24 hours.
          </p>
        </div>
        <div className="mt-8">
          <QuoteForm />
        </div>
      </div>
    </div>
  );
}