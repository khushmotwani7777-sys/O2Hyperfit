import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { assignMembershipSchema } from "@/lib/validations";
import { Role, MembershipStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { user } = auth;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as MembershipStatus | null;
  const memberId = searchParams.get("memberId");

  const whereClause: any = {};

  if (user.role === Role.MEMBER) {
    const member = await prisma.member.findFirst({ where: { userId: user.userId } });
    if (!member) return NextResponse.json({ success: true, data: [] });
    whereClause.memberId = member.id;
  } else if (memberId) {
    whereClause.memberId = memberId;
  }

  if (status) {
    whereClause.status = status;
  }

  try {
    const now = new Date();
    const memberships = await prisma.membership.findMany({
      where: whereClause,
      include: {
        member: {
          select: {
            id: true,
            memberId: true,
            fullName: true,
            email: true,
            phone: true,
            status: true,
          },
        },
        plan: true,
      },
      orderBy: { endDate: "desc" },
    });

    // Dynamically update status if expired
    const updatedMemberships = await Promise.all(
      memberships.map(async (m) => {
        let currentStatus = m.status;
        const sevenDaysAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        if (m.endDate < now && m.status !== MembershipStatus.EXPIRED && m.status !== MembershipStatus.CANCELLED) {
          currentStatus = MembershipStatus.EXPIRED;
          await prisma.membership.update({
            where: { id: m.id },
            data: { status: MembershipStatus.EXPIRED },
          });
        } else if (
          m.endDate >= now &&
          m.endDate <= sevenDaysAhead &&
          m.status === MembershipStatus.ACTIVE
        ) {
          currentStatus = MembershipStatus.EXPIRING_SOON;
          await prisma.membership.update({
            where: { id: m.id },
            data: { status: MembershipStatus.EXPIRING_SOON },
          });
        }

        return { ...m, status: currentStatus };
      })
    );

    return NextResponse.json({ success: true, data: updatedMemberships });
  } catch (error) {
    console.error("Get memberships error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch memberships" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, [Role.ADMIN]);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const validation = assignMembershipSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { memberId, planId, startDate, autoRenew, notes } = validation.data;

    const plan = await prisma.membershipPlan.findUnique({ where: { id: planId } });
    if (!plan) {
      return NextResponse.json({ success: false, error: "Membership plan not found" }, { status: 404 });
    }

    const member = await prisma.member.findFirst({
      where: { OR: [{ id: memberId }, { memberId: memberId }] },
    });
    if (!member) {
      return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
    }

    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    end.setMonth(end.getMonth() + plan.durationMonths);

    const membership = await prisma.membership.create({
      data: {
        memberId: member.id,
        planId: plan.id,
        startDate: start,
        endDate: end,
        status: MembershipStatus.ACTIVE,
        autoRenew: autoRenew || false,
        notes: notes || null,
      },
      include: {
        member: true,
        plan: true,
      },
    });

    return NextResponse.json({ success: true, data: membership }, { status: 201 });
  } catch (error) {
    console.error("Assign membership error:", error);
    return NextResponse.json({ success: false, error: "Failed to assign membership" }, { status: 500 });
  }
}
