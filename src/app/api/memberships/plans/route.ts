export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { membershipPlanSchema } from "@/lib/validations";
import { Role } from "@prisma/client";

export async function GET() {
  try {
    const plans = await prisma.membershipPlan.findMany({
      include: {
        _count: {
          select: { memberships: true },
        },
      },
      orderBy: { price: "asc" },
    });

    return NextResponse.json({ success: true, data: plans });
  } catch (error) {
    console.error("Get plans error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch plans" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, [Role.ADMIN]);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const validation = membershipPlanSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const plan = await prisma.membershipPlan.create({
      data: validation.data,
    });

    return NextResponse.json({ success: true, data: plan }, { status: 201 });
  } catch (error) {
    console.error("Create plan error:", error);
    return NextResponse.json({ success: false, error: "Failed to create plan" }, { status: 500 });
  }
}
