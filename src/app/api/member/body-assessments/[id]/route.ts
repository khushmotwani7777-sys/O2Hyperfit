export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const member = await prisma.member.findFirst({
      where: { userId: auth.user.userId },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, error: "Member profile not found" },
        { status: 404 }
      );
    }

    const assessment = await prisma.bodyAssessment.findUnique({
      where: { id: params.id },
      include: {
        member: { select: { id: true, memberId: true, fullName: true } },
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: "Assessment report not found" },
        { status: 404 }
      );
    }

    // Strict ownership verification
    if (assessment.memberId !== member.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized access: You can only view your own assessment reports.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: assessment });
  } catch (error) {
    console.error("GET /api/member/body-assessments/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch assessment" },
      { status: 500 }
    );
  }
}
