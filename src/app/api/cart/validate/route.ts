import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cartValidateSchema } from "@/lib/validators/checkout";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = cartValidateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid cart data", details: parsed.error.format() } },
        { status: 400 }
      );
    }

    const { items } = parsed.data;
    const productIds = items.map((item) => item.productId);

    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        stock: true,
        status: true,
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1,
          select: { url: true },
        },
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    let hasChanges = false;
    const validatedItems = items.map((item) => {
      const product = productMap.get(item.productId);

      if (!product || product.status !== "ACTIVE") {
        hasChanges = true;
        return {
          productId: item.productId,
          currentPrice: 0,
          currentStock: 0,
          available: false,
          priceChanged: false,
          stockInsufficient: true,
        };
      }

      const currentPrice = Number(product.price);
      const stockInsufficient = product.stock < item.quantity;
      if (stockInsufficient) hasChanges = true;

      return {
        productId: item.productId,
        title: product.title,
        slug: product.slug,
        image: product.images[0]?.url || null,
        currentPrice,
        currentStock: product.stock,
        available: true,
        priceChanged: false, // Client doesn't send price, so we always report current
        stockInsufficient,
      };
    });

    return NextResponse.json({
      valid: !hasChanges,
      items: validatedItems,
      message: hasChanges ? "Some items in your cart have changed" : undefined,
    });
  } catch (error) {
    console.error("POST /api/cart/validate error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to validate cart" } },
      { status: 500 }
    );
  }
}
