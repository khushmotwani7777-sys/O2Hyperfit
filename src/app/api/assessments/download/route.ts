import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getStorageService } from "@/lib/storage";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const relativePath = searchParams.get("path");
  const assessmentId = searchParams.get("id");

  try {
    let assessment;
    if (assessmentId) {
      assessment = await prisma.bodyAssessment.findUnique({
        where: { id: assessmentId },
        include: { member: true },
      });
    } else if (relativePath) {
      assessment = await prisma.bodyAssessment.findFirst({
        where: { pdfPath: relativePath },
        include: { member: true },
      });
    }

    if (!assessment) {
      return NextResponse.json({ success: false, error: "Assessment file not found" }, { status: 404 });
    }

    // Role verification: Member can only download their own assessment
    if (auth.user.role === Role.MEMBER) {
      const currentMember = await prisma.member.findFirst({ where: { userId: auth.user.userId } });
      if (!currentMember || currentMember.id !== assessment.memberId) {
        return NextResponse.json(
          { success: false, error: "Unauthorized access to this assessment document" },
          { status: 403 }
        );
      }
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
    console.error("Download assessment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load assessment document" },
      { status: 500 }
    );
  }
}
