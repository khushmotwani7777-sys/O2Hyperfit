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
    const plan = await prisma.workoutPlan.findUnique({
      where: { id: params.id },
      include: {
        member: { select: { id: true, memberId: true, fullName: true } },
        trainer: { select: { id: true, name: true, specialization: true } },
        exercises: {
          include: { exercise: true },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ success: false, error: "Workout plan not found" }, { status: 404 });
    }

    if (auth.user.role === Role.MEMBER && plan.memberId !== auth.user.memberId) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: plan });
  } catch (error) {
    console.error("Get workout plan error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch workout plan" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(req, [Role.ADMIN, Role.TRAINER]);
  if (auth instanceof NextResponse) return auth;

  try {
    await prisma.workoutExercise.deleteMany({ where: { workoutPlanId: params.id } });
    await prisma.workoutPlan.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true, message: "Workout plan deleted successfully" });
  } catch (error) {
    console.error("Delete workout plan error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete workout plan" }, { status: 500 });
  }
}
