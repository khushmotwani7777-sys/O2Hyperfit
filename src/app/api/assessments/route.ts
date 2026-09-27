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
  const auth = await requireAuth(req, [Role.ADMIN, Role.TRAINER]);
  if (auth instanceof NextResponse) return auth;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const memberId = formData.get("memberId") as string | null;
    const assessmentDate = formData.get("assessmentDate") as string | null;
    const notes = formData.get("notes") as string | null;

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
      },
      include: {
        member: true,
        uploadedBy: { select: { name: true, role: true } },
      },
    });

    return NextResponse.json({ success: true, data: assessment }, { status: 201 });
  } catch (error) {
    console.error("Upload assessment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload body assessment PDF" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req, [Role.ADMIN, Role.TRAINER]);
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
