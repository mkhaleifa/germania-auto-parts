"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/stores/cart-store";
import { useWishlist } from "@/hooks/use-wishlist";
import { formatPrice, getStockStatus, cn } from "@/lib/utils";
import {
  CONDITION_LABELS,
  type ProductCondition,
} from "@/types/product";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  title: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  condition: ProductCondition;
  stock: number;
  brand?: string | null;
  images: { url: string; alt: string | null }[];
  category: { name: string; slug: string };
}

const conditionBadgeVariants: Record<
  ProductCondition,
  "default" | "secondary" | "destructive" | "outline"
> = {
  NEW: "default",
  GRADE_A: "secondary",
  GRADE_B: "secondary",
  GRADE_C: "outline",
  GRADE_D: "outline",
};

export function ProductCard({
  id,
  title,
  slug,
  price,
  comparePrice,
  condition,
  stock,
  brand,
  images,
  category,
}: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { isWishlisted, loading: wishlistLoading, toggle: toggleWishlist } = useWishlist(id, slug);
  const stockStatus = getStockStatus(stock);
  const isOutOfStock = stock <= 0;
  const hasDiscount = comparePrice && comparePrice > price;
  const primaryImage = images[0]?.url;
  const hoverImage = images[1]?.url;

  function handleAddToCart() {
    addItem({
      productId: id,
      title,
      slug,
      price,
      image: primaryImage || "",
      condition,
      maxStock: stock,
    });
    toast.success(`${title} added to cart`);
  }

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-md">
      {/* Image */}
      <Link href={`/products/${slug}`} className="relative block aspect-[4/3] overflow-hidden bg-muted">
        {primaryImage ? (
          <>
            <Image
              src={primaryImage}
              alt={images[0]?.alt || title}
              fill
              className={cn(
                "object-cover transition-opacity duration-300",
                hoverImage && "group-hover:opacity-0"
              )}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            {hoverImage && (
              <Image
                src={hoverImage}
                alt={images[1]?.alt || title}
                fill
                className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Wishlist button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          disabled={wishlistLoading}
          onClick={(e) => { e.preventDefault(); toggleWishlist(); }}
        >
          <Heart className={cn("h-4 w-4", isWishlisted && "fill-red-600 text-red-600")} />
        </Button>

        {/* Sale badge */}
        {hasDiscount && (
          <Badge variant="destructive" className="absolute left-2 top-2">
            Sale
          </Badge>
        )}
      </Link>

      <CardContent className="p-4">
        {/* Badges */}
        <div className="mb-2 flex flex-wrap gap-1.5">
          <Badge variant={conditionBadgeVariants[condition]} className="text-xs">
            {CONDITION_LABELS[condition]}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {category.name}
          </Badge>
        </div>

        {/* Title */}
        <Link href={`/products/${slug}`}>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug transition-colors hover:text-primary">
            {title}
          </h3>
        </Link>

        {/* Brand */}
        {brand && (
          <p className="mt-1 text-xs text-muted-foreground">{brand}</p>
        )}

        {/* Stock */}
        <p className={cn("mt-1 text-xs font-medium", stockStatus.color)}>
          {stockStatus.label}
        </p>

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl font-bold text-primary">
            {formatPrice(price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(comparePrice)}
            </span>
          )}
        </div>

        {/* Add to cart */}
        <Button
          className="mt-3 w-full"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
      </CardContent>
    </Card>
  );
}