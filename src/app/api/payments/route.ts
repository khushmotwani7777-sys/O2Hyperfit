export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { paymentCreateSchema } from "@/lib/validations";
import { Role, PaymentMethod, PaymentStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { user } = auth;
  const { searchParams } = new URL(req.url);
  const method = searchParams.get("method") as PaymentMethod | null;
  const status = searchParams.get("status") as PaymentStatus | null;
  const memberId = searchParams.get("memberId");

  const whereClause: any = {};

  if (user.role === Role.MEMBER) {
    const member = await prisma.member.findFirst({ where: { userId: user.userId } });
    if (!member) return NextResponse.json({ success: true, data: [], stats: { total: 0 } });
    whereClause.memberId = member.id;
  } else if (memberId) {
    whereClause.memberId = memberId;
  }

  if (method) whereClause.paymentMethod = method;
  if (status) whereClause.status = status;

  try {
    const [payments, aggregate] = await Promise.all([
      prisma.payment.findMany({
        where: whereClause,
        include: {
          member: {
            select: {
              id: true,
              memberId: true,
              fullName: true,
              email: true,
            },
          },
          membership: {
            include: { plan: { select: { name: true } } },
          },
        },
        orderBy: { paymentDate: "desc" },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { ...whereClause, status: "COMPLETED" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: payments,
      stats: {
        totalRevenue: aggregate._sum.amount || 0,
        totalCount: payments.length,
      },
    });
  } catch (error) {
    console.error("Get payments error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch payments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, [Role.ADMIN]);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const validation = paymentCreateSchema.safeParse(body);

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

    const paymentCount = await prisma.payment.count();
    const year = new Date().getFullYear();
    const paymentId = `PAY-${year}-${String(paymentCount + 1).padStart(4, "0")}`;

    const payment = await prisma.payment.create({
      data: {
        paymentId,
        memberId: member.id,
        membershipId: data.membershipId || null,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        transactionRef: data.transactionRef || null,
        status: data.status,
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
        notes: data.notes || null,
      },
      include: {
        member: true,
        membership: { include: { plan: true } },
      },
    });

    return NextResponse.json({ success: true, data: payment }, { status: 201 });
  } catch (error) {
    console.error("Create payment error:", error);
    return NextResponse.json({ success: false, error: "Failed to create payment" }, { status: 500 });
  }
}
