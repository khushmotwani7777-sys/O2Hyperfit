import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { user } = auth;

  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    if (user.role === "MEMBER") {
      // Member-specific dashboard
      const member = await prisma.member.findFirst({
        where: { userId: user.userId },
        include: {
          assignedTrainer: true,
          memberships: {
            include: { plan: true },
            orderBy: { endDate: "desc" },
            take: 1,
          },
          workoutPlans: {
            where: { status: "ACTIVE" },
            include: { exercises: { include: { exercise: true } } },
            take: 1,
          },
          bodyAssessments: {
            orderBy: { assessmentDate: "desc" },
            take: 3,
          },
          progressRecords: {
            orderBy: { date: "desc" },
            take: 5,
          },
        },
      });

      if (!member) {
        return NextResponse.json({ success: false, error: "Member profile not found" }, { status: 404 });
      }

      const attendanceCount = await prisma.attendance.count({
        where: {
          memberId: member.id,
          date: { gte: startOfMonth },
        },
      });

      return NextResponse.json({
        success: true,
        role: "MEMBER",
        data: {
          member,
          activeMembership: member.memberships[0] || null,
          workoutPlan: member.workoutPlans[0] || null,
          attendanceThisMonth: attendanceCount,
          recentAssessments: member.bodyAssessments,
          recentProgress: member.progressRecords,
        },
      });
    }

    // Admin & Trainer Dashboard
    const [
      totalMembers,
      activeMembers,
      expiredMemberships,
      todayAttendanceCount,
      monthlyPayments,
      expiringSoon,
      recentPayments,
      recentAssessments,
    ] = await Promise.all([
      prisma.member.count(),
      prisma.member.count({ where: { status: "ACTIVE" } }),
      prisma.membership.count({
        where: {
          OR: [
            { status: "EXPIRED" },
            { endDate: { lt: now }, status: "ACTIVE" },
          ],
        },
      }),
      prisma.attendance.count({
        where: {
          date: { gte: startOfToday, lte: endOfToday },
        },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          paymentDate: { gte: startOfMonth },
          status: "COMPLETED",
        },
      }),
      prisma.membership.findMany({
        where: {
          endDate: { gte: now, lte: sevenDaysFromNow },
          status: { in: ["ACTIVE", "EXPIRING_SOON"] },
        },
        include: {
          member: { select: { id: true, memberId: true, fullName: true, phone: true, email: true } },
          plan: { select: { name: true, durationMonths: true, price: true } },
        },
        orderBy: { endDate: "asc" },
        take: 10,
      }),
      prisma.payment.findMany({
        take: 5,
        orderBy: { paymentDate: "desc" },
        include: {
          member: { select: { memberId: true, fullName: true } },
        },
      }),
      prisma.bodyAssessment.findMany({
        take: 5,
        orderBy: { assessmentDate: "desc" },
        include: {
          member: { select: { memberId: true, fullName: true } },
          uploadedBy: { select: { name: true, role: true } },
        },
      }),
    ]);

    const monthlyRevenue = monthlyPayments._sum.amount || 0;

    return NextResponse.json({
      success: true,
      role: user.role,
      data: {
        totalMembers,
        activeMembers,
        expiredMemberships,
        todayAttendanceCount,
        monthlyRevenue,
        expiringSoon,
        recentPayments,
        recentAssessments,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load dashboard statistics" },
      { status: 500 }
    );
  }
}
