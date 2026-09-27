import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const trainer = await prisma.trainer.findFirst({
      where: {
        OR: [{ id: params.id }, { trainerId: params.id }],
      },
      include: {
        members: {
          select: {
            id: true,
            memberId: true,
            fullName: true,
            email: true,
            phone: true,
            status: true,
          },
        },
        workoutPlans: {
          include: {
            member: { select: { fullName: true } },
          },
        },
      },
    });

    if (!trainer) {
      return NextResponse.json({ success: false, error: "Trainer not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: trainer });
  } catch (error) {
    console.error("Get trainer error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch trainer" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(req, [Role.ADMIN]);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const trainer = await prisma.trainer.update({
      where: { id: params.id },
      data: {
        name: body.name,
        phone: body.phone,
        specialization: body.specialization,
        experienceYears: body.experienceYears !== undefined ? Number(body.experienceYears) : undefined,
        status: body.status,
      },
    });

    return NextResponse.json({ success: true, data: trainer });
  } catch (error) {
    console.error("Update trainer error:", error);
    return NextResponse.json({ success: false, error: "Failed to update trainer" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(req, [Role.ADMIN]);
  if (auth instanceof NextResponse) return auth;

  try {
    const trainer = await prisma.trainer.update({
      where: { id: params.id },
      data: { status: "INACTIVE" },
    });

    return NextResponse.json({ success: true, data: trainer, message: "Trainer deactivated" });
  } catch (error) {
    console.error("Delete trainer error:", error);
    return NextResponse.json({ success: false, error: "Failed to deactivate trainer" }, { status: 500 });
  }
}
