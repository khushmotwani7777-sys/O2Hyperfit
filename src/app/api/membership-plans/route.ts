export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { Role, PlanStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as PlanStatus | null;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const plans = await prisma.membershipPlan.findMany({
      where,
      include: {
        _count: {
          select: { memberships: true },
        },
      },
      orderBy: [{ status: "asc" }, { price: "asc" }],
    });

    return NextResponse.json({ success: true, data: plans });
  } catch (error) {
    console.error("Get membership plans error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, [Role.ADMIN]);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { name, durationMonths, price, description, features, status } = body;

    if (!name || !durationMonths || price === undefined) {
      return NextResponse.json(
        { success: false, error: "Name, duration, and price are required." },
        { status: 400 }
      );
    }

    const plan = await prisma.membershipPlan.create({
      data: {
        name,
        durationMonths: parseInt(durationMonths),
        price: parseFloat(price),
        description: description || null,
        features: features ? (Array.isArray(features) ? features.join(", ") : features) : null,
        status: status || PlanStatus.ACTIVE,
      },
    });

    return NextResponse.json({ success: true, data: plan }, { status: 201 });
  } catch (error) {
    console.error("Create plan error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create membership plan" },
      { status: 500 }
    );
  }
}
