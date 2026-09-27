export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(req, [Role.ADMIN]);
  if (auth instanceof NextResponse) return auth;

  try {
    const staff = await prisma.staffSalary.findFirst({
      where: {
        OR: [{ id: params.id }, { employeeId: params.id }],
      },
    });

    if (!staff) {
      return NextResponse.json({ success: false, error: "Staff member not found" }, { status: 404 });
    }

    const history = await prisma.salaryHistory.findMany({
      where: { staffSalaryId: staff.id },
      include: {
        changedBy: {
          select: { name: true, email: true, role: true },
        },
      },
      orderBy: { effectiveDate: "desc" },
    });

    return NextResponse.json({
      success: true,
      staff: {
        id: staff.id,
        employeeId: staff.employeeId,
        name: staff.name,
        role: staff.role,
        currentSalary: staff.salaryAmount,
        salaryType: staff.salaryType,
      },
      data: history,
    });
  } catch (error) {
    console.error("Fetch salary history error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch salary history" },
      { status: 500 }
    );
  }
}
