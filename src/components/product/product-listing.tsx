"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ProductCard } from "@/components/product/product-card";
import { ProductFilters } from "@/components/product/product-filters";
import { ProductGridSkeleton } from "@/components/ui/product-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Package } from "lucide-react";
import type { ProductCondition } from "@/types/product";

interface ProductData {
  id: string;
  title: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  condition: string;
  stock: number;
  brand: string | null;
  images: { url: string; alt: string | null }[];
  category: { name: string; slug: string };
}

interface ProductListingProps {
  products: ProductData[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  title: string;
  description?: string;
}

export function ProductListing({
  products,
  totalCount,
  page,
  pageSize,
  totalPages,
  title,
  description,
}: ProductListingProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "newest";

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, value);
      if (key === "sort") params.delete("page");
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const goToPage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newPage <= 1) {
        params.delete("page");
      } else {
        params.set("page", newPage.toString());
      }
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex gap-8">
      {/* Desktop Sidebar */}
      <aside className="hidden w-[250px] flex-shrink-0 lg:block">
        <ProductFilters />
      </aside>

      {/* Main content */}
      <div className="flex-1">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {totalCount} {totalCount === 1 ? "part" : "parts"}
            </span>

            {/* Mobile filter button */}
            <Sheet>
              <SheetTrigger className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm lg:hidden">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <ProductFilters />
                </div>
              </SheetContent>
            </Sheet>

            {/* Sort */}
            <Select
              value={currentSort}
              onValueChange={(value: string | null) => updateParams("sort", value || "newest")}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="title">Name: A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon={Package}
              title="No products found"
              description="Try adjusting your filters or browse all products."
              actionLabel="Browse All Products"
              actionHref="/products"
            />
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  {...product}
                  condition={product.condition as ProductCondition}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => goToPage(page - 1)}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? "default" : "outline"}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => goToPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => goToPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}