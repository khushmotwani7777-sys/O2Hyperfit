import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { progressRecordSchema } from "@/lib/validations";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { user } = auth;
  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get("memberId");

  const whereClause: any = {};

  if (user.role === Role.MEMBER) {
    const member = await prisma.member.findFirst({ where: { userId: user.userId } });
    if (!member) return NextResponse.json({ success: true, data: [] });
    whereClause.memberId = member.id;
  } else if (memberId) {
    whereClause.memberId = memberId;
  }

  try {
    const records = await prisma.progressRecord.findMany({
      where: whereClause,
      include: {
        member: { select: { id: true, memberId: true, fullName: true } },
        recordedBy: { select: { name: true, role: true } },
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ success: true, data: records });
  } catch (error) {
    console.error("Get progress error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch progress records" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, [Role.ADMIN, Role.TRAINER]);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const validation = progressRecordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const data = validation.data;

    const member = await prisma.member.findFirst({
      where: { OR: [{ id: data.memberId }, { memberId: data.memberId }] },
    });

    if (!member) {
      return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
    }

    const record = await prisma.progressRecord.create({
      data: {
        memberId: member.id,
        date: data.date ? new Date(data.date) : new Date(),
        weightKg: data.weightKg,
        bodyFatPercentage: data.bodyFatPercentage ?? null,
        chestCm: data.chestCm ?? null,
        waistCm: data.waistCm ?? null,
        armsCm: data.armsCm ?? null,
        thighsCm: data.thighsCm ?? null,
        notes: data.notes ?? null,
        recordedById: auth.user.userId,
      },
      include: {
        member: true,
      },
    });

    // Optionally update member's current weight in their profile
    await prisma.member.update({
      where: { id: member.id },
      data: { weight: data.weightKg },
    });

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error) {
    console.error("Create progress error:", error);
    return NextResponse.json({ success: false, error: "Failed to record progress" }, { status: 500 });
  }
}
