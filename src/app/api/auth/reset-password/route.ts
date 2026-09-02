import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { resetPasswordSchema } from "@/lib/validators/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid request", details: parsed.error.format() } },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;

    // Find the token
    const verificationToken = await db.verificationToken.findFirst({
      where: {
        token,
        expires: { gt: new Date() },
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: { code: "INVALID_TOKEN", message: "This reset link has expired or is invalid" } },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    if (!user) {
      return NextResponse.json(
        { error: { code: "USER_NOT_FOUND", message: "Account not found" } },
        { status: 404 }
      );
    }

    // Update password and delete token (single-use)
    const passwordHash = await hash(password, 12);

    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      db.verificationToken.deleteMany({
        where: { identifier: verificationToken.identifier },
      }),
    ]);

    return NextResponse.json({
      data: { message: "Password updated successfully" },
    });
  } catch (error) {
    console.error("POST /api/auth/reset-password error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to reset password" } },
      { status: 500 }
    );
  }
}