export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { attendanceCheckInSchema } from "@/lib/validations";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { user } = auth;
  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get("memberId");
  const dateStr = searchParams.get("date"); // YYYY-MM-DD

  const whereClause: any = {};

  if (user.role === Role.MEMBER) {
    const member = await prisma.member.findFirst({ where: { userId: user.userId } });
    if (!member) return NextResponse.json({ success: true, data: [] });
    whereClause.memberId = member.id;
  } else if (memberId) {
    whereClause.memberId = memberId;
  }

  if (dateStr) {
    const targetDate = new Date(dateStr);
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);
    whereClause.date = { gte: startOfDay, lte: endOfDay };
  }

  try {
    const records = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        member: {
          select: {
            id: true,
            memberId: true,
            fullName: true,
            email: true,
            status: true,
          },
        },
      },
      orderBy: { checkInTime: "desc" },
    });

    return NextResponse.json({ success: true, data: records });
  } catch (error) {
    console.error("Get attendance error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch attendance records" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, [Role.ADMIN, Role.TRAINER]);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const validation = attendanceCheckInSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { memberId, status, notes } = validation.data;

    const member = await prisma.member.findFirst({
      where: { OR: [{ id: memberId }, { memberId }] },
    });

    if (!member) {
      return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
    }

    // Check if member already checked in today and hasn't checked out
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const activeSession = await prisma.attendance.findFirst({
      where: {
        memberId: member.id,
        checkInTime: { gte: startOfToday },
        checkOutTime: null,
      },
    });

    if (activeSession) {
      return NextResponse.json(
        { success: false, error: "Member is already checked in. Check out first before checking in again." },
        { status: 400 }
      );
    }

    const attendance = await prisma.attendance.create({
      data: {
        memberId: member.id,
        date: today,
        checkInTime: today,
        status: status || "PRESENT",
        notes: notes || null,
      },
      include: {
        member: true,
      },
    });

    return NextResponse.json({ success: true, data: attendance }, { status: 201 });
  } catch (error) {
    console.error("Attendance check-in error:", error);
    return NextResponse.json({ success: false, error: "Failed to check in" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuth(req, [Role.ADMIN, Role.TRAINER]);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { attendanceId, memberId } = body;

    let targetRecord;
    if (attendanceId) {
      targetRecord = await prisma.attendance.findUnique({ where: { id: attendanceId } });
    } else if (memberId) {
      // Find latest open check-in for member
      const member = await prisma.member.findFirst({
        where: { OR: [{ id: memberId }, { memberId }] },
      });
      if (member) {
        targetRecord = await prisma.attendance.findFirst({
          where: { memberId: member.id, checkOutTime: null },
          orderBy: { checkInTime: "desc" },
        });
      }
    }

    if (!targetRecord) {
      return NextResponse.json(
        { success: false, error: "No active check-in session found to check out" },
        { status: 404 }
      );
    }

    const updated = await prisma.attendance.update({
      where: { id: targetRecord.id },
      data: {
        checkOutTime: new Date(),
      },
      include: {
        member: true,
      },
    });

    return NextResponse.json({ success: true, data: updated, message: "Member checked out successfully" });
  } catch (error) {
    console.error("Attendance check-out error:", error);
    return NextResponse.json({ success: false, error: "Failed to check out" }, { status: 500 });
  }
}
