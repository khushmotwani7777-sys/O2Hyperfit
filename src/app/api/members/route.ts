export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, hashPassword } from "@/lib/auth";
import { memberCreateSchema } from "@/lib/validations";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { user } = auth;
  const { searchParams } = new URL(req.url);

  // If role is MEMBER, only return themselves
  if (user.role === Role.MEMBER) {
    const member = await prisma.member.findFirst({
      where: { userId: user.userId },
      include: {
        assignedTrainer: { select: { id: true, name: true, email: true, phone: true } },
        memberships: { include: { plan: true }, orderBy: { endDate: "desc" } },
      },
    });
    return NextResponse.json({ success: true, data: member ? [member] : [] });
  }

  const query = searchParams.get("search") || "";
  const status = searchParams.get("status");
  const trainerId = searchParams.get("trainerId");

  const whereClause: any = {};

  // If Trainer, can be filtered to their assigned members or gym-wide
  if (trainerId) {
    whereClause.assignedTrainerId = trainerId;
  } else if (user.role === Role.TRAINER && user.trainerId && searchParams.get("assignedOnly") === "true") {
    whereClause.assignedTrainerId = user.trainerId;
  }

  if (status) {
    whereClause.status = status;
  }

  if (query) {
    whereClause.OR = [
      { fullName: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
      { phone: { contains: query, mode: "insensitive" } },
      { memberId: { contains: query, mode: "insensitive" } },
    ];
  }

  try {
    const members = await prisma.member.findMany({
      where: whereClause,
      include: {
        assignedTrainer: { select: { id: true, name: true, specialization: true } },
        memberships: {
          include: { plan: true },
          orderBy: { endDate: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: members });
  } catch (error) {
    console.error("Fetch members error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch members" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, [Role.ADMIN]);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const validation = memberCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if email already exists
    const existing = await prisma.member.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A member with this email already exists" },
        { status: 409 }
      );
    }

    // Generate unique Member ID: MEM-XXX
    const memberCount = await prisma.member.count();
    const memberId = `MEM-${String(memberCount + 1).padStart(3, "0")}`;

    // Create user account for member login
    const defaultPassword = data.password || "Member@123";
    const passwordHash = await hashPassword(defaultPassword);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        name: data.fullName,
        phone: data.phone,
        role: Role.MEMBER,
      },
    });

    const newMember = await prisma.member.create({
      data: {
        userId: user.id,
        memberId,
        fullName: data.fullName,
        email: data.email.toLowerCase(),
        phone: data.phone,
        address: data.address,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender,
        height: data.height,
        weight: data.weight,
        emergencyContact: data.emergencyContact,
        assignedTrainerId: data.assignedTrainerId || null,
        status: data.status,
      },
      include: {
        assignedTrainer: true,
      },
    });

    return NextResponse.json({ success: true, data: newMember }, { status: 201 });
  } catch (error) {
    console.error("Create member error:", error);
    return NextResponse.json({ success: false, error: "Failed to create member" }, { status: 500 });
  }
}
