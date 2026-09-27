export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { defaultHomepageConfig } from "@/lib/homepageConfig";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, [Role.ADMIN]);
  if (auth instanceof NextResponse) return auth;

  try {
    const page = await prisma.homePage.findUnique({
      where: { id: "default" },
    });

    const testimonials = await prisma.testimonial.findMany({
      orderBy: { order: "asc" },
    });

    const activeTrainers = await prisma.trainer.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        trainerId: true,
        name: true,
        specialization: true,
        experienceYears: true,
      },
    });

    return NextResponse.json({
      success: true,
      isPublished: page ? page.isPublished : true,
      data: page?.sections ? page.sections : defaultHomepageConfig,
      testimonials,
      trainers: activeTrainers,
    });
  } catch (error) {
    console.error("Admin fetch homepage error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch homepage configuration" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuth(req, [Role.ADMIN]);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { sections, isDraft } = body;

    if (!sections) {
      return NextResponse.json({ success: false, error: "Sections payload required" }, { status: 400 });
    }

    const updated = await prisma.homePage.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        isPublished: isDraft === false,
        sections,
      },
      update: {
        isPublished: isDraft === false,
        sections,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated.sections,
      isPublished: updated.isPublished,
      message: isDraft ? "Draft saved successfully." : "Changes saved.",
    });
  } catch (error) {
    console.error("Admin save homepage error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save homepage changes" },
      { status: 500 }
    );
  }
}
