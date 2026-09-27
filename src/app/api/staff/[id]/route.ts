export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { Role, SalaryType, EmploymentStatus } from "@prisma/client";

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
      include: {
        history: {
          orderBy: { effectiveDate: "desc" },
        },
      },
    });

    if (!staff) {
      return NextResponse.json({ success: false, error: "Staff salary record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: staff });
  } catch (error) {
    console.error("Fetch staff salary error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch staff salary record" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(req, [Role.ADMIN]);
  if (auth instanceof NextResponse) return auth;

  const { user } = auth;

  try {
    const body = await req.json();
    const {
      name,
      role,
      salaryType,
      salaryAmount,
      paymentFrequency,
      employmentStatus,
      notes,
      changeReason,
      effectiveDate,
    } = body;

    const existing = await prisma.staffSalary.findFirst({
      where: {
        OR: [{ id: params.id }, { employeeId: params.id }],
      },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Staff salary record not found" }, { status: 404 });
    }

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (role !== undefined) data.role = role;
    if (paymentFrequency !== undefined) data.paymentFrequency = paymentFrequency;
    if (employmentStatus !== undefined) data.employmentStatus = employmentStatus as EmploymentStatus;
    if (notes !== undefined) data.notes = notes;

    const newAmount = salaryAmount !== undefined ? parseFloat(salaryAmount) : existing.salaryAmount;
    const newType = salaryType !== undefined ? (salaryType as SalaryType) : existing.salaryType;

    const hasSalaryChanged = newAmount !== existing.salaryAmount || newType !== existing.salaryType;

    data.salaryAmount = newAmount;
    data.salaryType = newType;

    const updated = await prisma.staffSalary.update({
      where: { id: existing.id },
      data,
    });

    // If salary amount or type changed, log to SalaryHistory
    if (hasSalaryChanged) {
      await prisma.salaryHistory.create({
        data: {
          staffSalaryId: existing.id,
          effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
          salaryAmount: newAmount,
          salaryType: newType,
          notes: changeReason || `Salary adjusted from ₹${existing.salaryAmount} (${existing.salaryType}) to ₹${newAmount} (${newType}).`,
          changedById: user.userId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Staff salary record updated successfully",
    });
  } catch (error) {
    console.error("Update staff salary error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update staff salary record" },
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
    const existing = await prisma.staffSalary.findFirst({
      where: {
        OR: [{ id: params.id }, { employeeId: params.id }],
      },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Record not found" }, { status: 404 });
    }

    await prisma.staffSalary.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ success: true, message: "Staff salary record deleted successfully" });
  } catch (error) {
    console.error("Delete staff salary error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete staff salary record" },
      { status: 500 }
    );
  }
}
