export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, [Role.ADMIN]);
  if (auth instanceof NextResponse) return auth;

  const { user } = auth;

  try {
    const body = await req.json().catch(() => ({}));
    const { changeSummary, sections } = body;

    const page = await prisma.homePage.findUnique({
      where: { id: "default" },
    });

    const finalSections = sections || page?.sections;

    if (!finalSections) {
      return NextResponse.json(
        { success: false, error: "No homepage configuration to publish" },
        { status: 400 }
      );
    }

    // 1. Mark HomePage as published
    const updated = await prisma.homePage.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        isPublished: true,
        sections: finalSections,
      },
      update: {
        isPublished: true,
        sections: finalSections,
      },
    });

    // 2. Count revisions to generate REV-XXX
    const revCount = await prisma.homePageRevision.count();
    const versionId = `REV-${String(revCount + 1).padStart(3, "0")}`;

    // 3. Create Revision record
    const revision = await prisma.homePageRevision.create({
      data: {
        versionId,
        publishedBy: `${user.name} (${user.role})`,
        changeSummary: changeSummary || "Routine updates to public website content",
        data: finalSections,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated.sections,
      revision,
      message: `Homepage successfully published to live as ${versionId}!`,
    });
  } catch (error) {
    console.error("Publish homepage error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to publish homepage" },
      { status: 500 }
    );
  }
}
