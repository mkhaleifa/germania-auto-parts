import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { forgotPasswordSchema } from "@/lib/validators/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid email" } },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Always return success to prevent email enumeration
    const user = await db.user.findUnique({ where: { email } });

    if (user) {
      const token = randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Delete any existing tokens for this email  , Delete old tokens
      await db.verificationToken.deleteMany({
        where: { identifier: email },
      });

      // Create new token , save toke 
      await db.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires,
        },
      });

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const resetUrl = `${siteUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

      try {
        await sendEmail({
          to: email,
          subject: "Reset Your Password — AHF Auto Parts",
          html: `
            <h2>Password Reset Request</h2>
            <p>Hi ${user.name || "there"},</p>
            <p>We received a request to reset your password. Click the link below to set a new password:</p>
            <p><a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#DC2626;color:white;text-decoration:none;border-radius:6px;">Reset Password</a></p>
            <p>This link expires in 1 hour.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <p>Best regards,<br/>AHF Auto Parts Team</p>
          `,
        });
      } catch {
        console.error("Failed to send password reset email");
      }
    }

    return NextResponse.json({
      data: { message: "If an account exists with this email, we've sent a reset link." },
    });
  } catch (error) {
    console.error("POST /api/auth/forgot-password error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to process request" } },
      { status: 500 }
    );
  }
}