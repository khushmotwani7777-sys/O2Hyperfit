export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ success: true, data: testimonials });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch testimonials" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, [Role.ADMIN]);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { name, content, rating, photoUrl, order, isActive } = body;

    if (!name || !content) {
      return NextResponse.json({ success: false, error: "Name and content are required" }, { status: 400 });
    }

    const count = await prisma.testimonial.count();

    const t = await prisma.testimonial.create({
      data: {
        name,
        content,
        rating: rating !== undefined ? parseInt(rating) : 5,
        photoUrl: photoUrl || null,
        order: order !== undefined ? parseInt(order) : count + 1,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ success: true, data: t }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create testimonial" }, { status: 500 });
  }
}
