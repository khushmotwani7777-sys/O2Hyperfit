export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, hashPassword } from "@/lib/auth";
import { trainerCreateSchema } from "@/lib/validations";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const trainers = await prisma.trainer.findMany({
      include: {
        _count: {
          select: { members: true, workoutPlans: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: trainers });
  } catch (error) {
    console.error("Get trainers error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch trainers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, [Role.ADMIN]);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const validation = trainerCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const data = validation.data;

    const existing = await prisma.trainer.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A trainer with this email already exists" },
        { status: 409 }
      );
    }

    const trainerCount = await prisma.trainer.count();
    const trainerId = `TR-${String(trainerCount + 1).padStart(3, "0")}`;

    const defaultPassword = data.password || "Trainer@123";
    const passwordHash = await hashPassword(defaultPassword);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        name: data.name,
        phone: data.phone,
        role: Role.TRAINER,
      },
    });

    const trainer = await prisma.trainer.create({
      data: {
        userId: user.id,
        trainerId,
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone,
        specialization: data.specialization,
        experienceYears: data.experienceYears,
        status: data.status,
      },
    });

    return NextResponse.json({ success: true, data: trainer }, { status: 201 });
  } catch (error) {
    console.error("Create trainer error:", error);
    return NextResponse.json({ success: false, error: "Failed to create trainer" }, { status: 500 });
  }
}
