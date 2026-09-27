export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(req, [Role.ADMIN]);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { name, content, rating, photoUrl, order, isActive } = body;

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (content !== undefined) data.content = content;
    if (rating !== undefined) data.rating = parseInt(rating);
    if (photoUrl !== undefined) data.photoUrl = photoUrl;
    if (order !== undefined) data.order = parseInt(order);
    if (isActive !== undefined) data.isActive = isActive;

    const updated = await prisma.testimonial.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update testimonial" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(req, [Role.ADMIN]);
  if (auth instanceof NextResponse) return auth;

  try {
    await prisma.testimonial.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true, message: "Testimonial deleted successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete testimonial" }, { status: 500 });
  }
}
