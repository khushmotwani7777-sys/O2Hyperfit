export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, hashPassword } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(req, [Role.ADMIN]);
  if (auth instanceof NextResponse) return auth;

  try {
    const memberIdOrId = params.id;

    // Find member by ID or memberId
    const member = await prisma.member.findFirst({
      where: {
        OR: [{ id: memberIdOrId }, { memberId: memberIdOrId }],
      },
      include: {
        user: true,
      },
    });

    if (!member) {
      return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
    }

    if (!member.userId || !member.user) {
      return NextResponse.json(
        { success: false, error: "Member has no linked user account" },
        { status: 400 }
      );
    }

    const initialPassword = member.phone.replace(/[^0-9]/g, "").slice(-10) || member.phone;
    const newPasswordHash = await hashPassword(initialPassword);

    await prisma.user.update({
      where: { id: member.userId },
      data: {
        passwordHash: newPasswordHash,
        mustChangePassword: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Temporary password has been reset to the member's mobile number (${member.phone}). The member will be required to set a new password on their next login.`,
    });
  } catch (error) {
    console.error("Admin reset password error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset member password" },
      { status: 500 }
    );
  }
}
