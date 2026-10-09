export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getStorageService } from "@/lib/storage";

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
          error: "Unauthorized access: You can only download your own assessment reports.",
        },
        { status: 403 }
      );
    }

    const storage = getStorageService();
    const fileBuffer = await storage.getFileBuffer(assessment.pdfPath);

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${encodeURIComponent(assessment.pdfFileName)}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("GET /api/member/body-assessments/[id]/download error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to download assessment file" },
      { status: 500 }
    );
  }
}
