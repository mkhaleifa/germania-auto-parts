import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { db } from "@/lib/db";

const lookupSchema = z.object({
  email: z.string().min(1, "Email is required"),
  order: z.string().min(1, "Order number is required"),
});

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = lookupSchema.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Email and order number are required" } },
        { status: 400 }
      );
    }

    const { email, order: orderNumber } = parsed.data;

    const foundOrder = await db.order.findFirst({
      where: {
        orderNumber: { equals: orderNumber, mode: "insensitive" },
        OR: [
          { guestEmail: { equals: email, mode: "insensitive" } },
          { user: { email: { equals: email, mode: "insensitive" } } },
        ],
      },
      select: {
        orderNumber: true,
        status: true,
        total: true,
        currency: true,
        paymentMethod: true,
        trackingNumber: true,
        trackingCarrier: true,
        shippingName: true,
        shippingCountry: true,
        createdAt: true,
        items: {
          select: {
            title: true,
            quantity: true,
            price: true,
          },
        },
      },
    });

    if (!foundOrder) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Order not found. Please check your email and order number." } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        ...foundOrder,
        total: Number(foundOrder.total),
        items: foundOrder.items.map((i) => ({
          ...i,
          price: Number(i.price),
        })),
      },
    });
  } catch (error) {
    console.error("GET /api/orders/lookup error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to look up order" } },
      { status: 500 }
    );
  }
}