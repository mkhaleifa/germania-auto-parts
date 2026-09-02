import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductGridSkeleton } from "@/components/ui/product-skeleton";
import { ProductListingWrapper } from "./product-listing-wrapper";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse our complete catalog of GDM auto parts. Filter by category, condition, vehicle, and price.",
};

export default function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <Breadcrumbs items={[{ label: "Products" }]} />
      <div className="mt-6">
        <Suspense fallback={<ProductGridSkeleton count={12} />}>
          <ProductListingWrapper searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}