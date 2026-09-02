import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { checkoutSchema } from "@/lib/validators/checkout";
import { auth } from "@/lib/auth";
import { STOCK_RESERVATION_TTL_MINUTES } from "@/lib/constant";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid checkout data", details: parsed.error.format() } },
        { status: 400 }
      );
    }
        const { cartItems, shippingAddress, customerNote, guestEmail } = parsed.data;
    const session = await auth();
    const userId = session?.user?.id;

    // Validate stock and get current prices
    const productIds = cartItems.map((i) => i.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds }, status: "ACTIVE" },
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        stock: true,
        images: { take: 1, select: { url: true } },
      },
    });
        const productMap = new Map(products.map((p) => [p.id, p]));

    // Verify all items are available
    const lineItems = [];
    let subtotal = 0;

    for (const item of cartItems) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: { code: "NOT_FOUND", message: `Product not found` } },
          { status: 400 }
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: { code: "OUT_OF_STOCK", message: `${product.title} — only ${product.stock} left in stock` } },
          { status: 400 }
        );
      }
        const price = Number(product.price);
      subtotal += price * item.quantity;

      lineItems.push({
        price_data: {
          currency: "USD",
          product_data: {
            name: product.title,
            images: product.images[0]?.url ? [product.images[0].url] : [],
          },
          unit_amount: price, // USD has no decimals
        },
        quantity: item.quantity,
      });
    }
       // Create Stripe Checkout Session
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: guestEmail || session?.user?.email || undefined,
      metadata: {
        userId: userId || "",
        items: JSON.stringify(cartItems),
        shippingName: shippingAddress.fullName,
        shippingPhone: shippingAddress.phone,
        shippingAddress: shippingAddress.addressLine1,
        shippingAddress2: shippingAddress.addressLine2 || "",
        shippingCity: shippingAddress.city,
        shippingState: shippingAddress.state || "",
        shippingZip: shippingAddress.postalCode,
        shippingCountry: shippingAddress.country,
        customerNote: customerNote || "",
        guestEmail: guestEmail || "",
      },
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout?cancelled=true`,
      expires_at: Math.floor(Date.now() / 1000) + STOCK_RESERVATION_TTL_MINUTES * 60,
    });

        for (const item of cartItems) {
      await db.$transaction(async (tx) => {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true },
        });

        if (!product || product.stock < item.quantity) {
          throw new Error("Insufficient stock");
        }

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });

        await tx.stockReservation.create({
          data: {
            productId: item.productId,
            stripeSessionId: stripeSession.id,
            quantity: item.quantity,
            expiresAt: new Date(
              Date.now() + STOCK_RESERVATION_TTL_MINUTES * 60 * 1000
            ),
          },
        });
      });
    }

    return NextResponse.json({ data: { url: stripeSession.url } });
  } catch (error) {
    console.error("POST /api/checkout error:", error);
    const message = error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json(
      { error: { code: "CHECKOUT_ERROR", message } },
      { status: 500 }
    );
  }
}
  