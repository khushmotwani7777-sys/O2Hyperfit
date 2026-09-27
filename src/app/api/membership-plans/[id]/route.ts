export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { Role, PlanStatus } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const plan = await prisma.membershipPlan.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { memberships: true },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ success: false, error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: plan });
  } catch (error) {
    console.error("Get plan error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch plan" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(req, [Role.ADMIN]);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { name, durationMonths, price, description, features, status } = body;

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (durationMonths !== undefined) data.durationMonths = parseInt(durationMonths);
    if (price !== undefined) data.price = parseFloat(price);
    if (description !== undefined) data.description = description;
    if (features !== undefined) {
      data.features = Array.isArray(features) ? features.join(", ") : features;
    }
    if (status !== undefined) data.status = status as PlanStatus;

    const updated = await prisma.membershipPlan.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Plan updated successfully",
    });
  } catch (error) {
    console.error("Update plan error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update membership plan" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(req, [Role.ADMIN]);
  if (auth instanceof NextResponse) return auth;

  try {
    // Check if memberships are linked to this plan
    const count = await prisma.membership.count({
      where: { planId: params.id },
    });

    if (count > 0) {
      // Archive plan to preserve integrity of existing subscriptions
      const archived = await prisma.membershipPlan.update({
        where: { id: params.id },
        data: { status: PlanStatus.ARCHIVED },
      });

      return NextResponse.json({
        success: true,
        message: "Plan has active or historical subscriptions, archived successfully.",
        data: archived,
      });
    }

    // If completely unused, delete permanently
    await prisma.membershipPlan.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Plan deleted successfully",
    });
  } catch (error) {
    console.error("Delete plan error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to archive or delete plan" },
      { status: 500 }
    );
  }
}
