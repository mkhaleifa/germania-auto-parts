"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWishlistStore } from "@/stores/wishlist-store";


export function useWishlist(productId: string, slug: string) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setCount, increment, decrement } = useWishlistStore();

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/account/wishlist")
      .then((r) => r.json())
      .then((json) => {
        if (Array.isArray(json.data)) {
          setIsWishlisted(json.data.some((item: { productId: string }) => item.productId === productId));
          setCount(json.data.length);
        }
      })
      .catch(() => {});
  }, [session, productId, setCount]);

  const toggle = useCallback(async () => {
    if (!session?.user) {
      router.push(`/login?callbackUrl=/products/${slug}`);
      return;
    }

    setLoading(true);
    try {
      if (isWishlisted) {
        const res = await fetch(`/api/account/wishlist?productId=${productId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setIsWishlisted(false);
          decrement();
          toast.success("Removed from wishlist");
        }
      } else {
        const res = await fetch("/api/account/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        if (res.ok) {
          setIsWishlisted(true);
          increment();
          toast.success("Saved to wishlist");
        }
      }
    } catch {
      toast.error("Could not update wishlist");
    } finally {
      setLoading(false);
    }
  }, [session, isWishlisted, productId, slug, router, increment, decrement]);

  return { isWishlisted, loading, toggle };
}