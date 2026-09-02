"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cart-store";
import type { CartItem } from "@/types/cart";
import { formatPrice } from "@/lib/utils";

interface WishlistProduct {
  id: string;
  title: string;
  slug: string;
  price: string | number;
  comparePrice: string | number | null;
  stock: number;
  condition: string;
  images: string[];
}

interface WishlistItem {
  id: string;
  productId: string;
  product: WishlistProduct;
}

interface WishlistGridProps {
  initialItems: WishlistItem[];
}

const conditionLabels: Record<string, string> = {
  NEW: "New",
  GRADE_A: "Grade A",
  GRADE_B: "Grade B",
  GRADE_C: "Grade C",
  GRADE_D: "Grade D",
};

export function WishlistGrid({ initialItems }: WishlistGridProps) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const [items, setItems] = useState(initialItems);
  const [removing, setRemoving] = useState<string | null>(null);

  async function handleRemove(productId: string) {
    setRemoving(productId);
    try {
      const res = await fetch(`/api/account/wishlist?productId=${productId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.product.id !== productId));
        router.refresh();
      }
    } finally {
      setRemoving(null);
    }
  }

  function handleAddToCart(product: WishlistProduct) {
    addItem({
      productId: product.id,
      title: product.title,
      price: Number(product.price),
      image: product.images[0] || "",
      slug: product.slug,
      condition: product.condition as CartItem["condition"],
      maxStock: product.stock,
      quantity: 1,
    });
  }

  if (items.length === 0) {
    return (
      <>
        <h1 className="text-2xl font-bold">My Wishlist</h1>
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center text-muted-foreground">
            <Heart className="h-12 w-12" />
            <p className="mt-3 text-lg font-medium">No saved items yet</p>
            <p className="mt-1 text-sm">
              Save parts you&apos;re interested in to buy them later.
            </p>
            <Link href="/products">
              <Button className="mt-4">Browse Products</Button>
            </Link>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold">
        My Wishlist{" "}
        <span className="text-base font-normal text-muted-foreground">
          ({items.length} {items.length === 1 ? "item" : "items"})
        </span>
      </h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => {
          const product = item.product;
          const inStock = product.stock > 0;
          const image = product.images[0];

          return (
            <Card key={item.id} className="group relative overflow-hidden">
              <button
                className="absolute right-2 top-2 z-10 rounded-full bg-background/80 p-1.5 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => handleRemove(product.id)}
                disabled={removing === product.id}
                aria-label="Remove from wishlist"
              >
                <X className="h-4 w-4" />
              </button>
              <Link href={`/products/${product.slug}`}>
                <div className="relative aspect-square bg-muted">
                  {image ? (
                    <Image
                      src={image}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>
              </Link>
              
              <CardContent className="p-3">
                <Badge variant="outline" className="mb-1 text-[10px]">
                  {conditionLabels[product.condition] || product.condition}
                </Badge>
                <Link href={`/products/${product.slug}`}>
                  <h3 className="line-clamp-2 text-sm font-medium leading-tight hover:text-primary">
                    {product.title}
                  </h3>
                </Link>
                <div className="mt-1">
                  <p className="text-sm font-bold text-primary">
                    {formatPrice(Number(product.price))}
                  </p>
                  {product.comparePrice && Number(product.comparePrice) > Number(product.price) && (
                    <p className="text-xs text-muted-foreground line-through">
                      {formatPrice(Number(product.comparePrice))}
                    </p>
                  )}
                </div>
                <Button
                  variant={inStock ? "default" : "outline"}
                  size="sm"
                  className="mt-2 w-full"
                  disabled={!inStock}
                  onClick={() => handleAddToCart(product)}
                >
                  {inStock ? (
                    <>
                      <ShoppingCart className="mr-1 h-3 w-3" />
                      Add to Cart
                    </>
                  ) : (
                    "Sold Out"
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}