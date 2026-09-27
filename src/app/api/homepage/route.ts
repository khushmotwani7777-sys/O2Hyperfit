export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { defaultHomepageConfig } from "@/lib/homepageConfig";

export async function GET() {
  try {
    const page = await prisma.homePage.findUnique({
      where: { id: "default" },
    });

    const testimonials = await prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });

    const activeTrainers = await prisma.trainer.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        specialization: true,
        experienceYears: true,
      },
    });

    const sections = page?.sections ? (page.sections as any) : defaultHomepageConfig;

    return NextResponse.json({
      success: true,
      data: sections,
      testimonials,
      trainers: activeTrainers,
    });
  } catch (error) {
    console.error("Fetch homepage public error:", error);
    return NextResponse.json({
      success: true,
      data: defaultHomepageConfig,
      testimonials: [],
      trainers: [],
    });
  }
}
