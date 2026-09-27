export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { exerciseSchema } from "@/lib/validations";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const muscleGroup = searchParams.get("muscleGroup");
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const whereClause: any = {};
  if (muscleGroup) whereClause.muscleGroup = muscleGroup;
  if (category) whereClause.category = category;
  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { muscleGroup: { contains: search, mode: "insensitive" } },
      { equipment: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const exercises = await prisma.exercise.findMany({
      where: whereClause,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: exercises });
  } catch (error) {
    console.error("Get exercises error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch exercises" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, [Role.ADMIN, Role.TRAINER]);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const validation = exerciseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const existing = await prisma.exercise.findUnique({
      where: { name: validation.data.name },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "An exercise with this name already exists" },
        { status: 409 }
      );
    }

    const exercise = await prisma.exercise.create({
      data: validation.data,
    });

    return NextResponse.json({ success: true, data: exercise }, { status: 201 });
  } catch (error) {
    console.error("Create exercise error:", error);
    return NextResponse.json({ success: false, error: "Failed to create exercise" }, { status: 500 });
  }
}
