"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/seperator";
import { VehicleSelector } from "@/components/vehicle/vehicle-selector";
import { CONDITION_LABELS, type ProductCondition } from "@/types/product";

const CONDITIONS: ProductCondition[] = [
  "NEW",
  "GRADE_A",
  "GRADE_B",
  "GRADE_C",
  "GRADE_D",
];

interface ProductFiltersProps {
  className?: string;
}

export function ProductFilters({ className }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCondition = searchParams.get("condition") || "";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentBrand = searchParams.get("brand") || "";

  const updateParams = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page"); // Reset to page 1 on filter change
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearAllFilters = useCallback(() => {
    const params = new URLSearchParams();
    const sort = searchParams.get("sort");
    if (sort) params.set("sort", sort);
    const category = searchParams.get("category");
    if (category) params.set("category", category);
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  const hasFilters =
    currentCondition || currentMinPrice || currentMaxPrice || currentBrand;

  return (
    <div className={className}>
      {/* Active filters */}
      {hasFilters && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            {currentCondition && (
              <Badge variant="secondary" className="gap-1">
                {CONDITION_LABELS[currentCondition as ProductCondition] || currentCondition}
                <button onClick={() => updateParams("condition", null)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {currentBrand && (
              <Badge variant="secondary" className="gap-1">
                {currentBrand}
                <button onClick={() => updateParams("brand", null)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {(currentMinPrice || currentMaxPrice) && (
              <Badge variant="secondary" className="gap-1">
                {currentMinPrice ? `¥${Number(currentMinPrice).toLocaleString()}` : "¥0"}
                {" - "}
                {currentMaxPrice ? `¥${Number(currentMaxPrice).toLocaleString()}` : "∞"}
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("minPrice");
                    params.delete("maxPrice");
                    params.delete("page");
                    router.push(`?${params.toString()}`);
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
          <button
            className="mt-2 text-xs text-muted-foreground underline hover:text-foreground"
            onClick={clearAllFilters}
          >
            Clear All
          </button>
        </div>
      )}

      {/* Condition */}
      <div>
        <h3 className="mb-3 text-sm font-semibold">Condition</h3>
        <div className="space-y-2">
          {CONDITIONS.map((cond) => (
            <div key={cond} className="flex items-center gap-2">
              <Checkbox
                id={`cond-${cond}`}
                checked={currentCondition === cond}
                onCheckedChange={(checked) =>
                  updateParams("condition", checked ? cond : null)
                }
              />
              <Label htmlFor={`cond-${cond}`} className="text-sm">
                {CONDITION_LABELS[cond]}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-4" />

      {/* Price Range */}
      <div>
        <h3 className="mb-3 text-sm font-semibold">Price Range (EUR)</h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            className="h-8 text-sm"
            value={currentMinPrice}
            onChange={(e) =>
              updateParams("minPrice", e.target.value || null)
            }
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            placeholder="Max"
            className="h-8 text-sm"
            value={currentMaxPrice}
            onChange={(e) =>
              updateParams("maxPrice", e.target.value || null)
            }
          />
        </div>
      </div>

      <Separator className="my-4" />

      {/* Brand */}
      <div>
        <h3 className="mb-3 text-sm font-semibold">Brand</h3>
        <Input
          type="text"
          placeholder="Filter by brand..."
          className="h-8 text-sm"
          value={currentBrand}
          onChange={(e) => updateParams("brand", e.target.value || null)}
        />
      </div>

      <Separator className="my-4" />

      {/* Vehicle Filter */}
      <div>
        <h3 className="mb-3 text-sm font-semibold">Vehicle</h3>
        <VehicleSelector variant="sidebar" />
      </div>
    </div>
  );
}