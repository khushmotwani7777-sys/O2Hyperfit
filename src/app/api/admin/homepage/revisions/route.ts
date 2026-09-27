export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, [Role.ADMIN]);
  if (auth instanceof NextResponse) return auth;

  try {
    const revisions = await prisma.homePageRevision.findMany({
      orderBy: { publishedAt: "desc" },
    });

    return NextResponse.json({ success: true, data: revisions });
  } catch (error) {
    console.error("Fetch revisions error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch revision history" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, [Role.ADMIN]);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { revisionId } = body;

    if (!revisionId) {
      return NextResponse.json({ success: false, error: "Revision ID required" }, { status: 400 });
    }

    const revision = await prisma.homePageRevision.findUnique({
      where: { id: revisionId },
    });

    if (!revision) {
      return NextResponse.json({ success: false, error: "Revision not found" }, { status: 404 });
    }

    // Restore to HomePage as draft
    const updated = await prisma.homePage.update({
      where: { id: "default" },
      data: {
        sections: revision.data as any,
        isPublished: false,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated.sections,
      message: `Restored ${revision.versionId} as draft. Review and click Publish to make it live.`,
    });
  } catch (error) {
    console.error("Restore revision error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to restore revision" },
      { status: 500 }
    );
  }
}
