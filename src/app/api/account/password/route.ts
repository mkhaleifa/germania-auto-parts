import { NextRequest, NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { changePasswordSchema } from "@/lib/validators/auth";

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 }
    );
  }

  const body = await request.json();
  const parsed = changePasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid data", details: parsed.error.format() } },
      { status: 400 }
    );
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });

  if (!user?.passwordHash) {
    return NextResponse.json(
      { error: { code: "NO_PASSWORD", message: "Your account uses Google sign-in. Password cannot be changed." } },
      { status: 400 }
    );
  }

  const isValid = await compare(parsed.data.currentPassword, user.passwordHash);
  if (!isValid) {
    return NextResponse.json(
      { error: { code: "INVALID_PASSWORD", message: "Current password is incorrect" } },
      { status: 400 }
    );
  }

  const passwordHash = await hash(parsed.data.newPassword, 12);

  await db.user.update({
    where: { id: session.user.id },
    data: { passwordHash },
  });

  return NextResponse.json({ data: { message: "Password updated successfully" } });
}