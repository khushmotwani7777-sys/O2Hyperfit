export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, hashPassword, comparePassword, signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { user: sessionUser } = auth;

  try {
    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.userId },
      include: {
        memberProfile: true,
        trainerProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // If currentPassword is provided, verify it
    if (currentPassword) {
      const match = await comparePassword(currentPassword, user.passwordHash);
      if (!match) {
        return NextResponse.json(
          { success: false, error: "Current password does not match." },
          { status: 400 }
        );
      }
    }

    // Hash the new password
    const newPasswordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        mustChangePassword: false,
      },
    });

    // Re-issue updated token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      mustChangePassword: false,
      memberId: user.memberProfile?.id,
      trainerId: user.trainerProfile?.id,
    };

    const token = await signToken(tokenPayload);

    const response = NextResponse.json({
      success: true,
      message: "Password changed successfully. You may now access your account.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: false,
      },
      token,
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update password." },
      { status: 500 }
    );
  }
}
