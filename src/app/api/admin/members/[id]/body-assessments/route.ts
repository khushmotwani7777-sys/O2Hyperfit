export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { Role } from "@prisma/client";

/**
 * GET /api/admin/members/[id]/body-assessments
 * Allows authorized admins/trainers to view a specific member's complete assessment history,
 * extracted metrics, and file references. Admins CANNOT upload via this endpoint.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(req, [Role.ADMIN, Role.TRAINER]);
  if (auth instanceof NextResponse) return auth;

  try {
    const memberId = params.id;

    // Support lookup by UUID id or alphanumeric memberId
    const member = await prisma.member.findFirst({
      where: {
        OR: [{ id: memberId }, { memberId: memberId }],
      },
      select: {
        id: true,
        memberId: true,
        fullName: true,
        email: true,
        phone: true,
        height: true,
        weight: true,
        gender: true,
        status: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, error: "Member not found" },
        { status: 404 }
      );
    }

    const assessments = await prisma.bodyAssessment.findMany({
      where: { memberId: member.id },
      include: {
        uploadedBy: { select: { id: true, name: true, role: true } },
      },
      orderBy: { assessmentDate: "desc" },
    });

    return NextResponse.json({
      success: true,
      member,
      data: assessments,
    });
  } catch (error) {
    console.error("GET /api/admin/members/[id]/body-assessments error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch member body assessments" },
      { status: 500 }
    );
  }
}

/**
 * Explicitly reject POST to prevent any upload attempts via admin member assessment route
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: "Admins cannot upload BMI reports on behalf of members. Members must upload their own reports.",
    },
    { status: 405 }
  );
}
