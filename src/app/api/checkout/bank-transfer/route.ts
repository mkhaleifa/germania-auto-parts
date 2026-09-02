import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkoutSchema } from "@/lib/validators/checkout";
import { auth } from "@/lib/auth";
import { sendOrderConfirmationEmail, sendAdminNotification } from "@/lib/email";
import { BANK_TRANSFER_EXPIRY_HOURS } from "@/lib/constant";
import { siteConfig } from "@/config/site";
import { formatPrice } from "@/lib/utils";

async function generateOrderNumber() {
  const today = new Date().toISOString().split("T")[0]!.replace(/-/g, "");
  const counter = await db.orderCounter.upsert({
    where: { date: today },
    create: { date: today, counter: 1 },
    update: { counter: { increment: 1 } },
  });
  return `Germania-${today}-${String(counter.counter).padStart(3, "0")}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid checkout data" } },
        { status: 400 }
      );
    }

    const { cartItems, shippingAddress, customerNote, guestEmail } = parsed.data;
    const session = await auth();
    const userId = session?.user?.id;
    const email = guestEmail || session?.user?.email;

    // Validate products and stock
    const productIds = cartItems.map((i) => i.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds }, status: "ACTIVE" },
      select: {
        id: true,
        title: true,
        price: true,
        stock: true,
        images: { take: 1, select: { url: true } },
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    let subtotal = 0;
    const orderItems: { productId: string; title: string; image: string | null; price: number; quantity: number }[] = [];

    for (const item of cartItems) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: { code: "NOT_FOUND", message: "Product not found" } },
          { status: 400 }
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: { code: "OUT_OF_STOCK", message: `${product.title} — only ${product.stock} left` } },
          { status: 400 }
        );
      }

      const price = Number(product.price);
      subtotal += price * item.quantity;
      orderItems.push({
        productId: product.id,
        title: product.title,
        image: product.images[0]?.url || null,
        price,
        quantity: item.quantity,
      });
    }

    const orderNumber = await generateOrderNumber();
    const expiresAt = new Date(Date.now() + BANK_TRANSFER_EXPIRY_HOURS * 60 * 60 * 1000);

    // Create order and decrement stock in a transaction
    const order = await db.$transaction(async (tx) => {
      // Decrement stock
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Create order
      return tx.order.create({
        data: {
          orderNumber,
          userId: userId || undefined,
          status: "AWAITING_PAYMENT",
          subtotal: subtotal,
          total: subtotal,
          shippingName: shippingAddress.fullName,
          shippingPhone: shippingAddress.phone,
          shippingAddress: shippingAddress.addressLine1 + (shippingAddress.addressLine2 ? `, ${shippingAddress.addressLine2}` : ""),
          shippingCity: shippingAddress.city,
          shippingState: shippingAddress.state || undefined,
          shippingZip: shippingAddress.postalCode,
          shippingCountry: shippingAddress.country,
          paymentMethod: "BANK_TRANSFER",
          paymentExpiresAt: expiresAt,
          customerNote: customerNote || undefined,
          guestEmail: !userId ? email : undefined,
          items: {
            create: orderItems.map((item) => ({
              productId: item.productId,
              title: item.title,
              image: item.image,
              price: item.price,
              quantity: item.quantity,
            })),
          },
        },
      });
    });

    // Send confirmation email with bank details
    if (email) {
      try {
        await sendOrderConfirmationEmail({
          to: email,
          orderNumber,
          customerName: shippingAddress.fullName,
          items: orderItems.map((i) => ({ title: i.title, quantity: i.quantity, price: i.price })),
          subtotal,
          shipping: 0,
          total: subtotal,
          shippingAddress: {
            name: shippingAddress.fullName,
            address: shippingAddress.addressLine1 + (shippingAddress.addressLine2 ? `, ${shippingAddress.addressLine2}` : ""),
            city: shippingAddress.city,
            state: shippingAddress.state || undefined,
            zip: shippingAddress.postalCode,
            country: shippingAddress.country,
          },
          paymentMethod: "BANK_TRANSFER",
          bankDetails: {
            bankName: siteConfig.bank.name,
            accountNumber: siteConfig.bank.accountNumber,
            accountHolder: siteConfig.bank.holder,
          },
        });
      } catch {
        console.error("Failed to send bank transfer email");
      }
    }

    // Notify admin
    try {
      await sendAdminNotification(
        `New Bank Transfer Order: ${orderNumber}`,
        `<p>New bank transfer order from ${shippingAddress.fullName}.</p>
         <p>Total: ${formatPrice(subtotal)}</p>
         <p>Payment due by: ${expiresAt.toISOString()}</p>`
      );
    } catch {
      console.error("Failed to send admin notification");
    }

    return NextResponse.json({
      data: {
        orderId: order.id,
        orderNumber,
        total: subtotal,
        bankDetails: {
          bankName: siteConfig.bank.name,
          accountHolder: siteConfig.bank.holder,
          accountNumber: siteConfig.bank.accountNumber,
          reference: orderNumber,
        },
        expiresAt: expiresAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("POST /api/checkout/bank-transfer error:", error);
    return NextResponse.json(
      { error: { code: "CHECKOUT_ERROR", message: "Failed to create order" } },
      { status: 500 }
    );
  }
}