export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { workoutPlanSchema } from "@/lib/validations";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { user } = auth;
  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get("memberId");
  const trainerId = searchParams.get("trainerId");

  const whereClause: any = {};

  if (user.role === Role.MEMBER) {
    const member = await prisma.member.findFirst({ where: { userId: user.userId } });
    if (!member) return NextResponse.json({ success: true, data: [] });
    whereClause.memberId = member.id;
  } else if (memberId) {
    whereClause.memberId = memberId;
  }

  if (trainerId) whereClause.trainerId = trainerId;

  try {
    const plans = await prisma.workoutPlan.findMany({
      where: whereClause,
      include: {
        member: { select: { id: true, memberId: true, fullName: true } },
        trainer: { select: { id: true, name: true, specialization: true } },
        exercises: {
          include: { exercise: true },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: plans });
  } catch (error) {
    console.error("Get workout plans error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch workout plans" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, [Role.ADMIN, Role.TRAINER]);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const validation = workoutPlanSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { planName, memberId, trainerId, startDate, endDate, notes, exercises } = validation.data;

    const member = await prisma.member.findFirst({
      where: { OR: [{ id: memberId }, { memberId }] },
    });

    if (!member) {
      return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
    }

    // Determine trainerId: if trainer creating, use their trainer profile id unless specified
    let finalTrainerId = trainerId;
    if (!finalTrainerId && auth.user.role === Role.TRAINER) {
      finalTrainerId = auth.user.trainerId || member.assignedTrainerId || null;
    }

    const plan = await prisma.workoutPlan.create({
      data: {
        planName,
        memberId: member.id,
        trainerId: finalTrainerId,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        notes: notes || null,
        exercises: {
          create: (exercises || []).map((ex, idx) => ({
            exerciseId: ex.exerciseId,
            dayOfWeek: ex.dayOfWeek,
            sets: ex.sets,
            reps: ex.reps,
            weightKg: ex.weightKg || null,
            restSeconds: ex.restSeconds,
            trainerNotes: ex.trainerNotes || null,
            order: ex.order || idx + 1,
          })),
        },
      },
      include: {
        member: true,
        trainer: true,
        exercises: { include: { exercise: true } },
      },
    });

    return NextResponse.json({ success: true, data: plan }, { status: 201 });
  } catch (error) {
    console.error("Create workout plan error:", error);
    return NextResponse.json({ success: false, error: "Failed to create workout plan" }, { status: 500 });
  }
}
