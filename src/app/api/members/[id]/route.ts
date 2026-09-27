export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { memberUpdateSchema } from "@/lib/validations";
import { Role } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { user } = auth;
  const memberIdOrDbId = params.id;

  try {
    const member = await prisma.member.findFirst({
      where: {
        OR: [{ id: memberIdOrDbId }, { memberId: memberIdOrDbId }],
      },
      include: {
        user: { select: { id: true, email: true, name: true, phone: true } },
        assignedTrainer: true,
        memberships: {
          include: { plan: true },
          orderBy: { endDate: "desc" },
        },
        payments: {
          orderBy: { paymentDate: "desc" },
        },
        attendance: {
          orderBy: { date: "desc" },
          take: 30,
        },
        workoutPlans: {
          include: {
            exercises: {
              include: { exercise: true },
              orderBy: { order: "asc" },
            },
            trainer: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        progressRecords: {
          orderBy: { date: "desc" },
        },
        bodyAssessments: {
          include: { uploadedBy: { select: { name: true, role: true } } },
          orderBy: { assessmentDate: "desc" },
        },
      },
    });

    if (!member) {
      return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
    }

    // Role-based access restriction: Member can only view their own profile
    if (user.role === Role.MEMBER && member.userId !== user.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access to another member profile" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: member });
  } catch (error) {
    console.error("Get member profile error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch member details" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { user } = auth;
  const memberIdOrDbId = params.id;

  try {
    const existing = await prisma.member.findFirst({
      where: {
        OR: [{ id: memberIdOrDbId }, { memberId: memberIdOrDbId }],
      },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
    }

    // Role check: If member, must be their own record
    if (user.role === Role.MEMBER && existing.userId !== user.userId) {
      return NextResponse.json(
        { success: false, error: "Cannot modify another member" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = memberUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    const data = validation.data;

    const updatePayload: any = {
      fullName: data.fullName,
      phone: data.phone,
      address: data.address,
      gender: data.gender,
      height: data.height,
      weight: data.weight,
      emergencyContact: data.emergencyContact,
    };

    if (data.dateOfBirth) {
      updatePayload.dateOfBirth = new Date(data.dateOfBirth);
    }

    // Only Admin can change trainer or status
    if (user.role === Role.ADMIN) {
      if (data.status) updatePayload.status = data.status;
      if (data.assignedTrainerId !== undefined) {
        updatePayload.assignedTrainerId = data.assignedTrainerId || null;
      }
    }

    const updated = await prisma.member.update({
      where: { id: existing.id },
      data: updatePayload,
      include: {
        assignedTrainer: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update member error:", error);
    return NextResponse.json({ success: false, error: "Failed to update member" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(req, [Role.ADMIN]);
  if (auth instanceof NextResponse) return auth;

  const memberIdOrDbId = params.id;

  try {
    const existing = await prisma.member.findFirst({
      where: {
        OR: [{ id: memberIdOrDbId }, { memberId: memberIdOrDbId }],
      },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
    }

    // Soft-deactivate member or delete
    const updated = await prisma.member.update({
      where: { id: existing.id },
      data: { status: "INACTIVE" },
    });

    return NextResponse.json({
      success: true,
      message: "Member deactivated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Delete member error:", error);
    return NextResponse.json({ success: false, error: "Failed to deactivate member" }, { status: 500 });
  }
}
