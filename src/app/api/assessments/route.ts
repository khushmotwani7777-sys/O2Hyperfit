export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getStorageService } from "@/lib/storage";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { user } = auth;
  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get("memberId");

  const whereClause: any = {};

  if (user.role === Role.MEMBER) {
    const member = await prisma.member.findFirst({ where: { userId: user.userId } });
    if (!member) return NextResponse.json({ success: true, data: [] });
    whereClause.memberId = member.id;
  } else if (memberId) {
    whereClause.memberId = memberId;
  }

  try {
    const assessments = await prisma.bodyAssessment.findMany({
      where: whereClause,
      include: {
        member: { select: { id: true, memberId: true, fullName: true, email: true } },
        uploadedBy: { select: { id: true, name: true, role: true } },
      },
      orderBy: { assessmentDate: "desc" },
    });

    return NextResponse.json({ success: true, data: assessments });
  } catch (error) {
    console.error("Get assessments error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch assessments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  // Requirement 1 & 11: Admins cannot upload reports on behalf of members
  if (auth.user.role === Role.ADMIN) {
    return NextResponse.json(
      {
        success: false,
        error: "Admins are not permitted to upload BMI reports on behalf of members. Members must upload their own reports.",
      },
      { status: 403 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    let memberId = formData.get("memberId") as string | null;
    const assessmentDate = formData.get("assessmentDate") as string | null;
    const notes = formData.get("notes") as string | null;

    // If caller is MEMBER, ensure they can only upload for their own member profile
    if (auth.user.role === Role.MEMBER) {
      const currentMember = await prisma.member.findFirst({
        where: { userId: auth.user.userId },
      });
      if (!currentMember) {
        return NextResponse.json(
          { success: false, error: "Member profile not found." },
          { status: 404 }
        );
      }
      memberId = currentMember.id;
    }

    if (!file || !memberId) {
      return NextResponse.json(
        { success: false, error: "Member and PDF report file are required" },
        { status: 400 }
      );
    }

    // Verify it is a PDF
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Only PDF assessment reports are supported." },
        { status: 400 }
      );
    }

    const member = await prisma.member.findFirst({
      where: { OR: [{ id: memberId }, { memberId }] },
    });

    if (!member) {
      return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate magic bytes
    if (!buffer.slice(0, 5).toString("ascii").startsWith("%PDF")) {
      return NextResponse.json(
        { success: false, error: "The uploaded file is not a valid PDF document." },
        { status: 400 }
      );
    }

    // Parse verifiable metrics from PDF
    const { parseAssessmentPdf } = await import("@/lib/pdfParser");
    const extracted = await parseAssessmentPdf(buffer);

    // Save using storage service abstraction
    const storageService = getStorageService();
    const uploadResult = await storageService.uploadFile(
      buffer,
      file.name,
      file.type || "application/pdf",
      "assessments"
    );

    const assessment = await prisma.bodyAssessment.create({
      data: {
        memberId: member.id,
        assessmentDate: assessmentDate ? new Date(assessmentDate) : new Date(),
        pdfFileName: file.name,
        pdfPath: uploadResult.path,
        pdfUrl: uploadResult.url,
        notes: notes || null,
        uploadedById: auth.user.userId,
        weightKg: extracted.weightKg,
        bmi: extracted.bmi,
        bodyFatPercentage: extracted.bodyFatPercentage,
        muscleMassKg: extracted.muscleMassKg,
        bodyWaterPercentage: extracted.bodyWaterPercentage,
        visceralFat: extracted.visceralFat,
        boneMassKg: extracted.boneMassKg,
        bmrKcal: extracted.bmrKcal,
        bodyAge: extracted.bodyAge,
        skeletalMusclePercentage: extracted.skeletalMusclePercentage,
        metrics: extracted.metrics,
      },
      include: {
        member: true,
        uploadedBy: { select: { name: true, role: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: assessment,
        extractedMetrics: extracted.metrics,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload assessment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload body assessment PDF" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, error: "Assessment ID required" }, { status: 400 });
  }

  try {
    const assessment = await prisma.bodyAssessment.findUnique({ where: { id } });
    if (!assessment) {
      return NextResponse.json({ success: false, error: "Assessment not found" }, { status: 404 });
    }

    // Ownership check for Member
    if (auth.user.role === Role.MEMBER) {
      const currentMember = await prisma.member.findFirst({ where: { userId: auth.user.userId } });
      if (!currentMember || currentMember.id !== assessment.memberId) {
        return NextResponse.json(
          { success: false, error: "Unauthorized. You can only delete your own reports." },
          { status: 403 }
        );
      }
    }

    // Delete file from storage
    const storage = getStorageService();
    await storage.deleteFile(assessment.pdfPath);

    // Delete database record
    await prisma.bodyAssessment.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Assessment report deleted successfully" });
  } catch (error) {
    console.error("Delete assessment error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete assessment" }, { status: 500 });
  }
}
