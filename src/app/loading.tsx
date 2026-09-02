import { ProductGridSkeleton } from "@/components/ui/product-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <ProductGridSkeleton count={8} />
    </div>
  );
}