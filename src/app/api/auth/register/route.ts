import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validators/auth";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid registration data", details: parsed.error.format() } },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: { code: "EMAIL_EXISTS", message: "An account with this email already exists" } },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);

    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    // Send welcome email (non-blocking)
    sendWelcomeEmail({ to: email, name: name || email }).catch(() => {
      console.error("Failed to send welcome email");
    });

    // Link any guest orders to this new account
    await db.order.updateMany({
      where: {
        guestEmail: email,
        userId: null,
      },
      data: {
        userId: user.id,
      },
    });

    return NextResponse.json({
      data: { message: "Account created successfully", userId: user.id },
    });
  } catch (error) {
    console.error("POST /api/auth/register error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create account" } },
      { status: 500 }
    );
  }
}